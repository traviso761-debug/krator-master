# core/charactermodels in Godot: kchar.gd against the JS golden, and a MakeHuman figure built from the pieces.
#   python3 godot/tools/sync_core.py && godot --headless --path godot --script res://tests/character/kchar_test.gd
# exits 0 when everything matches. The golden is core/charactermodels/tests/golden-mpfb.json (make-golden.js).
extends SceneTree

const DIR := "res://data/characters"
var fails := 0


func ok(c: bool, msg: String) -> void:
	if not c:
		fails += 1
		print("FAIL ", msg)


func j(path: String):
	return JSON.parse_string(FileAccess.get_file_as_string(DIR + "/" + path))


func near_v(a: Vector3, b: Array, e := 1e-5) -> bool:
	return absf(a.x - b[0]) <= e and absf(a.y - b[1]) <= e and absf(a.z - b[2]) <= e


# a record from JS against one from GDScript: same keys, same values (floats to 1e-9)
func same(a, b) -> bool:
	if a is Dictionary and b is Dictionary:
		if a.size() != b.size():
			return false
		for k in a:
			if not b.has(k) or not same(a[k], b[k]):
				return false
		return true
	if (a is float or a is int) and (b is float or b is int):
		return absf(float(a) - float(b)) < 1e-9
	return a == b


# a bone's pose in skeleton space from the local poses (Skeleton3D's own global cache only refreshes on a frame,
# and this test runs inside _init)
func glob(sk: Skeleton3D, b: int) -> Transform3D:
	var t := sk.get_bone_pose(b)
	var p := sk.get_bone_parent(b)
	while p >= 0:
		t = sk.get_bone_pose(p) * t
		p = sk.get_bone_parent(p)
	return t


func _init() -> void:
	var golden = j("golden-mpfb.json")
	var peoples := {}
	for p in j("peoples.json")["peoples"]:
		peoples[p["id"]] = p
	for body in golden["bodies"]:
		var skel = j(body + "/skeleton.json")
		var kit = j(body + "/kit.json")
		var g: Dictionary = golden["bodies"][body]
		# 1. morph weights and the morphed joints
		for m in g["morphs"]:
			var w := KChar.morph_weights(m["record"], kit)
			var tag: String = body + " " + JSON.stringify(m["record"]).left(50)
			var wok: bool = w.size() == m["w"].size()
			for i in w.size():
				wok = wok and absf(w[i] - float(m["w"][i])) < 1e-6   # the JS keeps them in a Float32Array
			ok(wok, "weights " + tag)
			var cr := KChar.colliders(skel, w)
			var crok: bool = cr.size() == m.get("cr", []).size()
			for i in cr.size():
				crok = crok and absf(float(cr[i]["r"]) - float(m["cr"][i])) < 1e-6
			ok(crok, "collider radii " + tag)
			var mj := KChar.morph_joints(skel, kit, w)
			for i in mj["t"].size():
				if not near_v(mj["t"][i], m["t"][i]) or not near_v(mj["d"][i], m["d"][i]):
					ok(false, "joint %d %s" % [i, tag])
					break
		# 2. strangers: the same KRand stream, the same draws and rounding
		for s in g["strangers"]:
			var r := KChar.stranger(int(s["seed"]), kit, peoples.get(s["people"]) if s["people"] != null else null)
			ok(same(JSON.parse_string(JSON.stringify(r)), s["record"]), "stranger %s seed %d: %s" % [s["people"], s["seed"], JSON.stringify(r).left(160)])
		# 3. parts and hidden skin
		for pl in g["parts"]:
			var got := []
			for p in KChar.parts(pl["record"], kit):
				got.append("%s:%s:%s" % [p["key"], p["role"], p["slot"]])
			ok(got == pl["parts"], "parts " + str(got))
			var hid := KChar.hidden(pl["record"], kit)
			var n := 0
			for x in hid:
				n += x
			ok(n == int(pl["hidden"]), "hidden %d vs %d" % [n, pl["hidden"]])

	# 4. a figure from the pieces
	if not DirAccess.dir_exists_absolute(DIR + "/pieces/mpfb_male"):
		print("kchar_test: no pieces (run godot/tools/sync_core.py after make_mpfb.py): figure checks skipped")
	else:
		var t0 := Time.get_ticks_msec()
		var fig := KCharFigure.new()
		fig.load_body(DIR, "mpfb_male")
		root.add_child(fig)
		var people = j("peoples.json")["peoples"][0]
		var rec := KChar.stranger(11, fig.kit, people)
		rec["armour"] = {"torso": "toigo_fisherman_sweater", "legs": "cortu_cargo_pants", "feet": "culturalibre_hero_boots_1"}
		rec["morph"]["height"] = 0.8
		rec["morph"]["weight"] = -0.5
		fig.apply(rec)
		print("kchar_test: built and dressed in %d ms" % (Time.get_ticks_msec() - t0))
		var shown := {}
		for mi in fig.skeleton.get_children():
			if mi is MeshInstance3D and mi.visible:
				shown[mi.get_meta("part")["key"]] = true
		var want := {}
		for p in KChar.parts(rec, fig.kit):
			want[p["key"]] = true
		ok(shown.keys().size() == want.keys().size(), "figure shows %s, want %s" % [shown.keys(), want.keys()])
		ok(fig.player.has_animation("walk") and fig.player.has_animation("idle"), "clips: %s" % fig.player.get_animation_list())
		ok(fig.player.get_animation_list().size() >= 100 and fig.player.has_animation("thrust") and fig.player.has_animation("ual_harvest"),
			"the action clips (data/clips.json): %d" % fig.player.get_animation_list().size())
		# the morph reaches the meshes: blend shapes exist and carry the record's weights
		var base: MeshInstance3D = null
		for mi in fig.skeleton.get_children():
			if mi is MeshInstance3D and mi.visible and mi.get_meta("part")["role"] == "base" and mi.mesh.get_blend_shape_count() > 50:
				base = mi
		ok(base != null, "a base mesh with the body's blend shapes")
		if base:
			var w := KChar.morph_weights(rec, fig.kit)
			var shapes: PackedInt32Array = base.get_meta("built")["shapes"]
			var wok := true
			for s in shapes.size():
				wok = wok and absf(base.get_blend_shape_value(s) - w[shapes[s]]) < 1e-6
			ok(wok, "blend shape weights are the record's")
			# the sweater hides skin: the skin is one surface, some of its regions drawn as nothing, and not all of them
			var hid := 0
			var nreg: int = base.get_meta("built")["cover"].size()
			var joined := 0
			for s in base.mesh.get_surface_count():
				if base.get_meta("built")["regions"][s]:
					joined += 1
					var h: Image = (base.get_surface_override_material(s).get_shader_parameter("hide_tex") as ImageTexture).get_image()
					for r in nreg:
						hid += int(h.get_pixel(r, 0).r > 0.5)
			ok(joined == 1 and nreg > 8, "the skin is one surface of %d regions" % nreg)
			ok(hid > 0 and hid < nreg - 3, "worn items hide %d of %d skin regions" % [hid, nreg])
		# at rest every bone's global pose times its (moved) bind is the identity: the skinned rest is the morphed mesh
		fig.rest_pose()
		var worst := 0.0
		var worst_at := ""
		for mi in fig.skeleton.get_children():
			if not (mi is MeshInstance3D and mi.visible and mi.skin):
				continue
			for k in mi.skin.get_bind_count():
				var b: int = mi.skin.get_bind_bone(k)
				var m: Transform3D = glob(fig.skeleton, b) * mi.skin.get_bind_pose(k)
				var e := m.origin.length() + (m.basis.x - Vector3.RIGHT).length() + (m.basis.y - Vector3.UP).length()
				if e > worst:
					worst = e
					worst_at = "%s %s" % [mi.name, fig.skeleton.get_bone_name(b)]
		ok(worst < 1e-3, "rest pose x bind = identity (worst %f at %s)" % [worst, worst_at])
		# taller: the hips rise, the skeleton is lifted or lowered to keep the soles on the ground
		var hips0 := glob(fig.skeleton, fig._hips).origin.y
		rec["morph"]["height"] = -0.8
		fig.apply(rec)
		var hips1 := glob(fig.skeleton, fig._hips).origin.y
		ok(hips1 < hips0 - 0.03, "height -0.8 lowers the hips: %f -> %f" % [hips0, hips1])
		# props: a sword in the right hand under its bone, and that hand's fingers closed
		fig.hold({"R": "sword", "L": "shield"})
		ok(fig._holders.has("R") and fig._holders["R"].get_child_count() == 1 and fig._holders["L"].get_child_count() == 1, "sword and shield held")
		var idx2 := fig.skeleton.find_bone("RightHandIndex2")
		var rest_q := KChar._q(fig.skel["joints"][idx2]["r"])
		ok(fig.skeleton.get_bone_pose_rotation(idx2).angle_to(rest_q) > 0.5, "the right index finger curls round the grip")
		# a pistol: the trigger finger stays straighter than the others
		fig.hold({"R": "pistol", "L": null})
		var mid2 := fig.skeleton.find_bone("RightHandMiddle2")
		ok(fig.skeleton.get_bone_pose_rotation(idx2).angle_to(rest_q) < 0.6 * fig.skeleton.get_bone_pose_rotation(mid2).angle_to(KChar._q(fig.skel["joints"][mid2]["r"])),
			"the pistol's trigger finger stays out of the fist")
		# two hands: in the hoe chop and the long-gun shot the left hand holds the right's prop at its support
		for c in [["ual_chop", "hoe"], ["gun_shot", "rifle"], ["spear_walk", "spear"]]:
			fig.hold({"R": c[1], "L": null, "both": true})
			fig.play(c[0])
			var worst2 := 0.0
			for k in 8:
				fig._process(0.11)
				worst2 = maxf(worst2, fig.reach)
			var hl: Vector3 = glob(fig.skeleton, fig.skeleton.find_bone("LeftHand")).origin
			var hr: Vector3 = glob(fig.skeleton, fig.skeleton.find_bone("RightHand")).origin
			ok(worst2 < 0.03 and hl.distance_to(hr) > 0.08, "%s: the left hand holds the %s (short by %.3f m, hands %.2f m apart)" % [c[0], c[1], worst2, hl.distance_to(hr)])
		# the bow: drawn in the aim-and-scan loop, its arrow shown
		fig.hold({"R": null, "L": "bow"})
		fig.play("bow_scan")
		# frames, not one step: the arms ease back from the spear's two-hand hold over a few of them
		for k in 3:
			fig._process(0.1)
		ok(fig.drawn and fig._bow["arrow"] != null and fig._bow["arrow"].visible, "bow_scan draws the string and nocks an arrow")
		fig.hold({"R": null, "L": null})
		# cloth: the court skirt's chains are bones of the skeleton, hang at rest, and swing in a walk
		var rec2 := rec.duplicate(true)
		rec2["armour"] = {"torso": "voth_m_noble_robe", "legs": "voth_m_noble_skirt", "feet": "voth_m_noble_sandals"}
		fig.apply(rec2)
		var cb := -1
		for i in fig.skeleton.get_bone_count():
			if fig.skeleton.get_bone_name(i).begins_with("cloth_voth_m_noble_skirt"):
				cb = i
		ok(cb >= 0, "the court skirt's cloth chains are in the skeleton")
		if cb >= 0:
			fig.play("walk")
			# how far the chains turn from one frame to the next, on average (their turn from rest is no measure: some
			# robe chains fold near half a turn from it whether they swing or not, KNOWN_ISSUES)
			var finite := true
			var motion := func(frames: int) -> float:
				var prev := {}
				var tot := 0.0
				var n := 0
				for k in frames:
					fig._process(1.0 / 30.0)
					for i in fig.skeleton.get_bone_count():
						if fig.skeleton.get_bone_name(i).begins_with("cloth_"):
							var q := fig.skeleton.get_bone_pose_rotation(i)
							finite = finite and q.is_finite()
							if prev.has(i):
								tot += q.angle_to(prev[i])
								n += 1
							prev[i] = q
				return tot / maxi(n, 1)
			var moved: float = motion.call(40)
			ok(finite and moved > 0.01, "cloth swings in a walk (%.3f rad a frame, finite %s)" % [moved, finite])
			# the drape, which the swing misses (a mantle lifted whole turns a few root bones only): each chain's last
			# point from its rest, and the bones that pass 1.5 rad from their rest pose (the fold, KNOWN_ISSUES); with
			# the chains' rest following the body (kit bw) and, for comparison, held rigid by their parent joints
			var drape := func(frames: int) -> Array:
				var tot := 0.0
				var mx := 0.0
				var n := 0
				var folded := {}
				for k in frames:
					fig._process(1.0 / 30.0)
					for key in fig._cloth:
						var c: Dictionary = fig._cloth[key]
						if not c["on"]:
							continue
						for ch in c["chains"]:
							if ch["x"].size() and ch["tw"].size():
								var d: float = ((ch["x"][-1] as Vector3) - (ch["tw"][-1] as Vector3)).length()
								tot += d
								mx = maxf(mx, d)
								n += 1
					for i in fig.skeleton.get_bone_count():
						if fig.skeleton.get_bone_name(i).begins_with("cloth_"):
							var r := fig.skeleton.get_bone_rest(i).basis.get_rotation_quaternion()
							if fig.skeleton.get_bone_pose_rotation(i).angle_to(r) > 1.5:
								folded[i] = true
				return [tot / maxi(n, 1), mx, folded.size()]
			var dr: Array = drape.call(40)
			var saved_bw := []
			for key in fig._cloth:
				for ch in fig._cloth[key]["chains"]:
					saved_bw.append([ch, ch.get("bw")])
					ch["bw"] = null
			var dr0: Array = drape.call(40)
			for pair in saved_bw:
				pair[0]["bw"] = pair[1]
			print("kchar_test: court robe in a walk, last point off rest mean %.3f max %.3f m, %d bones past 1.5 rad; rigid rests %.3f / %.3f m, %d bones" % [dr[0], dr[1], dr[2], dr0[0], dr0[1], dr0[2]])
			ok(dr[0] < 0.25, "cloth drapes near its rest in a walk (last point %.3f m off on average)" % dr[0])
			# cloth off: no swing, only the legs' push; with no clip the chains hang at rest
			fig.cloth = false
			var off: float = motion.call(30)
			ok(finite and off < moved, "cloth off: the legs push the chains but they do not swing (%.3f < %.3f rad a frame)" % [off, moved])
			fig.play("")
			ok(fig.skeleton.get_bone_pose_rotation(cb).is_equal_approx(fig.skeleton.get_bone_rest(cb).basis.get_rotation_quaternion()), "cloth off: with no clip the chains hang at rest")
			fig.cloth = true
		fig.apply(rec)
		# a clip moves the bones
		fig.play("walk")
		var q0 := fig.skeleton.get_bone_pose_rotation(fig.skeleton.find_bone("LeftUpLeg"))
		fig._process(0.4)
		ok(not q0.is_equal_approx(fig.skeleton.get_bone_pose_rotation(fig.skeleton.find_bone("LeftUpLeg"))), "walk moves the thigh")

	# a Giant of Dalab (core/charactermodels/tools/giant.py): the man's body made big, a second pair of arms that no clip
	# moves but the figure drives from the upper pair; two arms leaves them out
	if FileAccess.file_exists(DIR + "/mpfb_giant/kit.json") and not DirAccess.dir_exists_absolute(DIR + "/pieces/mpfb_giant"):
		print("kchar_test: no giant pieces: the giant checks skipped")
	elif FileAccess.file_exists(DIR + "/mpfb_giant/kit.json"):
		var g := KCharFigure.new()
		g.load_body(DIR, "mpfb_giant")
		root.add_child(g)
		ok(g.skeleton.find_bone("Left2Arm") >= 0 and g.skeleton.find_bone("Right2HandIndex3") >= 0 and g.size > 1.5,
			"giant: the lower pair's joints, scale %.2f" % g.size)
		ok(g.player.has_animation("walk") and is_equal_approx(g.cadence, 1.0 / sqrt(g.size)), "giant: the man's clips, at %.2f pace" % g.cadence)
		var grec := KChar.blank(g.kit)
		grec["armour"]["legs"] = "voth_m_peasant_maxtlatl"
		grec["mods"] = ["mod_arms_flesh"]
		g.apply(grec)
		ok(g.four_arms, "giant: the flesh pair (a mod) gives four arms")
		var la := g.skeleton.find_bone("Left2Arm")
		var lf := g.skeleton.find_bone("Left2ForeArm")
		g.play("idle")
		for k in 30:
			g._process(1.0 / 30.0)
		var bent := g.skeleton.get_bone_pose_rotation(lf).angle_to(KChar._q(g.skel["joints"][lf]["r"]))
		ok(bent > 0.6, "giant: in the idle the lower elbows bend into the guard (%.2f rad)" % bent)
		var a0 := g.skeleton.get_bone_pose_rotation(la)
		g.play("ladder")
		for k in 30:
			g._process(1.0 / 30.0)
		var up := g.skeleton.find_bone("LeftArm")
		var d_up := KChar._q(g.skel["joints"][up]["r"]).inverse() * g.skeleton.get_bone_pose_rotation(up)
		var d_lo := KChar._q(g.skel["joints"][la]["r"]).inverse() * g.skeleton.get_bone_pose_rotation(la)
		ok(d_up.angle_to(d_lo) < 0.25 and not a0.is_equal_approx(g.skeleton.get_bone_pose_rotation(la)),
			"giant: on the ladder the lower arms copy the upper (%.2f rad apart)" % d_up.angle_to(d_lo))
		var shown := func(prefix: String) -> bool:
			for mi in g._live.values():
				if mi.visible and String(mi.get_meta("part")["key"]).contains(prefix):
					return true
			return false
		ok(shown.call("mod_arms_flesh"), "giant: the flesh pair's piece is drawn")
		grec["mods"] = ["mod_arms_cyber", "mod_gills"]
		g.apply(grec)
		ok(g.four_arms and shown.call("mod_arms_cyber") and shown.call("mod_gills") and not shown.call("mod_arms_flesh"), "giant: cybernetic arms and gills instead")
		grec["mods"] = []
		g.apply(grec)
		ok(not g.four_arms and not shown.call("mod_arms"), "giant: no mod, two arms")
		# a four-armed top's lower sleeves: over flesh arms, not over a cybernetic pair
		grec["armour"]["torso"] = "giant_free_m_tunic4"
		grec["mods"] = ["mod_arms_flesh"]
		g.apply(grec)
		var over_flesh: bool = shown.call("giant_free_m_tunic4.sleeves2")
		grec["mods"] = ["mod_arms_loader"]
		g.apply(grec)
		ok(over_flesh and shown.call("giant_free_m_tunic4") and not shown.call("giant_free_m_tunic4.sleeves2"),
			"giant: lower sleeves over flesh arms, left off the loader arms")
		var p_h = null
		for pp in j("peoples.json")["peoples"]:
			if pp["id"] == "hykkousoi":
				p_h = pp
		ok(KChar.stranger(3, g.kit, p_h).get("mods", []).has("mod_gills"), "the Hykkousoi's strangers have rib gills")
		# the cybernetic designs on the normal-size bodies: each makes a man or a woman four-armed and is drawn
		for body in ["mpfb_male", "mpfb_female"]:
			var nf := KCharFigure.new()
			nf.load_body(DIR, body)
			root.add_child(nf)
			var nrec := KChar.blank(nf.kit)
			var good := true
			for mid in ["mod_arms_cyber", "mod_arms_loader", "mod_arms_surgical"]:
				nrec["mods"] = [mid]
				nf.apply(nrec)
				var drawn := false
				for mi in nf._live.values():
					if mi.visible and String(mi.get_meta("part")["key"]).contains(mid):
						drawn = true
				good = good and nf.four_arms and drawn
			ok(good, "%s: the three cybernetic pairs, four-armed and drawn" % body)
			nf.queue_free()
		print("kchar_test: the giant checked (%d bones, %d clips)" % [g.skeleton.get_bone_count(), g.player.get_animation_list().size()])

	print("kchar_test: %s" % ("all passed" if fails == 0 else "%d failed" % fails))
	quit(1 if fails else 0)
