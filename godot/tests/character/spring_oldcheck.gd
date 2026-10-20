# The spike's control: kchar_test.gd's own cloth measurement (inside _init, no engine frames, 40 frames from the
# start of the walk, then 30 with cloth off) on the spike's data, to compare its numbers with spring_spike.gd's.
#   godot --headless --path godot --script res://tests/character/spring_oldcheck.gd
extends SceneTree

const DIR := "res://data/spike"


func _init() -> void:
	var fig := KCharFigure.new()
	fig.load_body(DIR, "mpfb_male")
	root.add_child(fig)
	var rec := KChar.blank(fig.kit)
	rec["armour"] = {"torso": "voth_m_noble_robe", "legs": "voth_m_noble_skirt", "feet": "voth_m_noble_sandals"}
	fig.apply(rec)
	fig.play("walk")
	var motion := func(frames: int) -> Array:
		var prev := {}
		var tot := 0.0
		var n := 0
		var worst := 0.0
		var folded := {}
		for k in frames:
			fig._process(1.0 / 30.0)
			for i in fig.skeleton.get_bone_count():
				if fig.skeleton.get_bone_name(i).begins_with("cloth_"):
					var q := fig.skeleton.get_bone_pose_rotation(i)
					if prev.has(i):
						tot += q.angle_to(prev[i])
						n += 1
					prev[i] = q
					var a := q.angle_to(fig.skeleton.get_bone_rest(i).basis.get_rotation_quaternion())
					worst = maxf(worst, a)
					if a > 1.5:
						folded[i] = true
		return [tot / maxi(n, 1), worst, folded.size()]
	var on: Array = motion.call(40)
	print("oldcheck: walk, cloth on, 40 frames from the start: swing %.4f rad/frame, max from rest %.3f, %d bones past 1.5 rad" % on)
	var on2: Array = motion.call(60)
	print("oldcheck: walk, cloth on, the next 60 frames: swing %.4f rad/frame, max from rest %.3f, %d bones past 1.5 rad" % on2)
	fig.cloth = false
	var off: Array = motion.call(30)
	print("oldcheck: walk, cloth off, 30 frames: swing %.4f rad/frame, max from rest %.3f, %d bones past 1.5 rad" % off)
	fig.cloth = true
	fig.play("idle")
	var idle: Array = motion.call(70)
	print("oldcheck: idle, cloth on, 70 frames: swing %.4f rad/frame, max from rest %.3f, %d bones past 1.5 rad" % idle)
	quit(0)
