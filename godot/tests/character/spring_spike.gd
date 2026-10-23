# The SpringBoneSimulator3D spike (godot/krator/character/REPORT.md): the man in the Voth court robe, skirt and
# sandals, run through the walk and the standing idle with the GDScript Verlet chains and with Godot's simulator
# (KCharFigure.spring_sim), measuring per frame how far the cloth bones turn from one frame to the next, and the
# largest angle any cloth bone reaches from its rest, as kchar_test.gd does. The pieces come from
# res://data/spike (the published Cosmetic Lab's GLBs, no blend shapes: the record is blank, no morph). The frames
# are engine frames, since a SkeletonModifier3D runs at the skeleton's deferred update, after the frame's script.
#   godot --headless --path godot --script res://tests/character/spring_spike.gd -- [--sim] [--json=<path>] [--trace]
#     [--nocol] [--ends] [--noarms] [--stiff_k=<x>] [--gravity=<x>] [--drag=<x>] [--radius=<x>]   (KCharFigure.spring_opts)
extends SceneTree

const DIR := "res://data/spike"
const SETTLE := 10
const FRAMES := 60
const PLAN := ["walk", "idle"]

var fig: KCharFigure
var sim := false
var opts := {}
var out := ""
var report := {}
var phase := 0                            # index into PLAN
var frame := 0                            # frames into the phase
var prev := {}
var tot := 0.0
var n := 0
var worst := 0.0
var worst_at := ""
var fold_seen := {}
var finite := true
var off_tot := 0.0
var off_n := 0
var off_max := 0.0
var us := 0
var wall := 0                             # whole frames, wall clock (the simulator runs in the skeleton's deferred update)
var wall_at := 0


func _init() -> void:
	for a in OS.get_cmdline_user_args():
		if a == "--sim":
			sim = true
		if a == "--trace":
			trace = true
		if a.begins_with("--json="):
			out = a.substr(7)
		if a == "--nocol":
			opts["collide"] = false
		if a == "--ends":
			opts["ends"] = true
		if a == "--noarms":
			opts["noarms"] = true
		for k in ["stiff_k", "gravity", "drag", "radius"]:
			if a.begins_with("--%s=" % k):
				opts[k] = float(a.substr(k.length() + 3))
	# a headless run sleeps 6.9 ms a frame (low processor mode): off, so the whole-frame time is the work
	OS.low_processor_usage_mode = false
	OS.low_processor_usage_mode_sleep_usec = 0
	fig = KCharFigure.new()
	fig.spring_sim = sim
	fig.spring_opts = opts
	fig.load_body(DIR, "mpfb_male")
	root.add_child(fig)
	var rec := KChar.blank(fig.kit)
	rec["armour"] = {"torso": "voth_m_noble_robe", "legs": "voth_m_noble_skirt", "feet": "voth_m_noble_sandals"}
	var t0 := Time.get_ticks_msec()
	fig.apply(rec)
	print("spring_spike: sim=%s %s, dressed in %d ms, %d bones" % [sim, opts, Time.get_ticks_msec() - t0, fig.skeleton.get_bone_count()])
	report = {"sim": sim, "opts": opts, "clips": {}}
	fig.skeleton.skeleton_updated.connect(_updated)
	fig.play(PLAN[0])


# the cloth bones' poses as the skeleton's deferred update leaves them: a modifier's result lives only there (the
# skeleton puts the animation's poses back once the skins are updated), the Verlet's is written directly
var last_q := {}
var last_off := []                        # per chain: how far its last bone's origin is from the rigid rest (m)
var updates := 0
func _updated() -> void:
	updates += 1
	for i in fig.skeleton.get_bone_count():
		var nm := fig.skeleton.get_bone_name(i)
		if nm.begins_with("cloth_") and not nm.ends_with("_tip"):
			last_q[i] = fig.skeleton.get_bone_pose_rotation(i)
	last_off = []
	for key in fig._cloth:
		if not fig._cloth[key]["on"]:
			continue
		for ch in fig._cloth[key]["chains"]:
			fig._rigid(ch)
			var b: int = ch["bones"][ch["bones"].size() - 1]
			last_off.append(fig.skeleton.get_bone_global_pose(b).origin.distance_to(ch["tw"][ch["tw"].size() - 2]))


var trace := false


# where the capsules are and which chain rest points lie inside them: the Verlet's ends (_cap_ends) against the
# collision nodes' head and tail as Godot places them (bone global pose, then the offsets), and per collider the
# number of the robe's and skirt's rigid rest points (ch.tw) within r + C_PAD of its axis
func _collider_check() -> void:
	var sk := fig.skeleton
	var pts := []
	for key in fig._cloth:
		for ch in fig._cloth[key]["chains"]:
			fig._rigid(ch)
			for k in range(1, ch["tw"].size()):
				pts.append([key, ch["tw"][k]])
	for i in fig._caps.size():
		var cp: Dictionary = fig._caps[i]
		var ends := fig._cap_ends(cp)
		var a: Vector3 = ends[0]
		var b: Vector3 = ends[1]
		var inside := {}
		for p in pts:
			var ab := b - a
			var t := clampf(((p[1] as Vector3) - a).dot(ab) / maxf(1e-9, ab.length_squared()), 0.0, 1.0)
			if (p[1] as Vector3).distance_to(a + ab * t) < float(cp["r"]) + fig.C_PAD:
				inside[p[0]] = inside.get(p[0], 0) + 1
		var placed := ""
		if sim and fig._sim != null and i < fig._sim_caps.size():
			var cap: SpringBoneCollisionCapsule3D = fig._sim_caps[i]["cap"]
			var tr := sk.get_bone_global_pose(cap.bone)
			tr.origin += tr.basis.get_rotation_quaternion() * cap.position_offset
			tr.basis *= Basis(cap.rotation_offset)
			var half := cap.height * 0.5 - cap.radius
			var head := tr.origin + tr.basis * Vector3.UP * half
			var tail := tr.origin + tr.basis * Vector3.DOWN * half
			placed = ", node head %.3f m from a and tail %.3f m from b (or swapped %.3f / %.3f)" % [head.distance_to(a), tail.distance_to(b), tail.distance_to(a), head.distance_to(b)]
		print("  collider %d %s->%s r %.3f: rest points inside %s%s" % [i, sk.get_bone_name(cp["a"]), sk.get_bone_name(cp["b"]), cp["r"], inside, placed])


func _measure() -> void:
	var ft := 0.0
	var fn := 0
	var fmax := 0.0
	var fmax_at := ""
	for i in last_q:
		var nm := fig.skeleton.get_bone_name(i)
		var q: Quaternion = last_q[i]
		finite = finite and q.is_finite()
		if prev.has(i):
			var da: float = q.angle_to(prev[i])
			tot += da
			n += 1
			ft += da
			fn += 1
			if da > fmax:
				fmax = da
				fmax_at = nm
		prev[i] = q
		var a := q.angle_to(fig.skeleton.get_bone_rest(i).basis.get_rotation_quaternion())
		if a > worst:
			worst = a
			worst_at = nm
		if a > 1.5:
			fold_seen[i] = true
	for o in last_off:
		off_tot += o
		off_n += 1
		off_max = maxf(off_max, o)
	if trace and fn > 0:
		print("  frame %d: mean swing %.3f, largest %.3f at %s" % [frame, ft / fn, fmax, fmax_at])


func _process(_dt: float) -> bool:
	# stepped from here only. The engine would call the figure's _process too: its _ready (which turns processing
	# on) runs when the tree initialises, after _init, so it is turned off here, before the first node processes
	if frame == 0:
		fig.set_process(false)
	# the poses now are the result of the last frame's step (and, with the simulator, its deferred update)
	if frame == 3 and sim and fig._sim != null:
		var b0: int = fig._sim.get_root_bone(0)
		print("spring_spike: simulator: %d settings, joints in the first %d, root %d (%s) end %d, active %s, in tree %s, modifier mode %d, first root pose %s vs rest %s" % [fig._sim.get_setting_count(), fig._sim.get_joint_count(0), b0, fig.skeleton.get_bone_name(b0), fig._sim.get_end_bone(0), fig._sim.active, fig._sim.is_inside_tree(), fig.skeleton.modifier_callback_mode_process, last_q.get(b0), fig.skeleton.get_bone_rest(b0).basis.get_rotation_quaternion()])
	if trace and frame == 2:
		_collider_check()
	if trace and frame >= 10 and frame <= 13:
		print("  frame %d: clip at %.4f s, %d skeleton updates so far, engine dt %.4f" % [frame, fig.player.current_animation_position, updates, _dt])
	if frame > SETTLE:
		_measure()
	if frame == SETTLE + FRAMES:
		var clip: String = PLAN[phase]
		var r := {"swing": tot / maxi(n, 1), "max_from_rest": worst, "max_at": worst_at, "folded": fold_seen.size(),
			"finite": finite, "ms_per_frame": us / 1000.0 / FRAMES, "ms_per_frame_wall": wall / 1000.0 / FRAMES,
			"last_off_mean": off_tot / maxi(off_n, 1), "last_off_max": off_max}
		report["clips"][clip] = r
		print("spring_spike: %s: swing %.4f rad/frame, max from rest %.3f rad at %s, %d bones past 1.5 rad, last bones %.3f m from the rigid rest on average (max %.3f), finite %s, %.2f ms/frame (script side), %.2f ms/frame (whole frame)" % [clip, r["swing"], worst, worst_at, fold_seen.size(), r["last_off_mean"], off_max, finite, r["ms_per_frame"], r["ms_per_frame_wall"]])
		phase += 1
		if phase == PLAN.size():
			if out != "":
				var f := FileAccess.open(out, FileAccess.WRITE)
				f.store_string(JSON.stringify(report, "  "))
				f.close()
			quit(0)
			return true
		frame = 0
		prev = {}
		tot = 0.0
		n = 0
		worst = 0.0
		worst_at = ""
		fold_seen = {}
		off_tot = 0.0
		off_n = 0
		off_max = 0.0
		us = 0
		wall = 0
		fig.play(PLAN[phase])
	var t1 := Time.get_ticks_usec()
	if frame > SETTLE:
		wall += t1 - wall_at
	wall_at = t1
	fig._process(1.0 / 30.0)
	if frame >= SETTLE:
		us += Time.get_ticks_usec() - t1
	frame += 1
	return false
