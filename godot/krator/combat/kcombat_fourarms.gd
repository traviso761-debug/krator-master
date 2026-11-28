# KCombatFourArms: Godot 4 twin of core/charactermodels/src/76-fourarms.js.
# Evaluates normalized [0..1] Hermite keyframe pose curves for BOTH:
#   - Part A: Thorax-Mounted 4-Limb Rigs (Left2Arm/ForeArm/Hand & Right2Arm/ForeArm/Hand)
#   - Part B: Dorsal-Mounted 4-Limb Rigs (Spine2 Scapula Over-Shoulder TurretL/R & ElbowL/R)
class_name KCombatFourArms
extends RefCounted

const THORAX_GUARD: Array[float] = [22.0, 14.0, -6.0, 68.0, 0.0, 22.0, 14.0, -6.0, 68.0, 0.0]
const DORSAL_GUARD: Array[float] = [8.0, 20.0, 6.0, -16.0, 12.0, 8.0, 20.0, 6.0, -16.0, 12.0]

const THORAX_KEYFRAMES := {
	"thorax_quad_flurry": [
		[0.00, [22.0, 14.0, -6.0, 68.0, 0.0, 22.0, 14.0, -6.0, 68.0, 0.0]],
		[0.12, [-24.0, -12.0, 16.0, 86.0, 6.0, 34.0, 18.0, -8.0, 74.0, 0.0]],
		[0.22, [84.0, 14.0, 0.0, -18.0, -10.0, -26.0, -14.0, 18.0, 88.0, 8.0]],
		[0.38, [22.0, -32.0, 28.0, 68.0, 8.0, 86.0, 16.0, -2.0, -20.0, -12.0]],
		[0.54, [72.0, 38.0, -12.0, 42.0, 18.0, -18.0, -10.0, 14.0, 84.0, 6.0]],
		[0.70, [36.0, 16.0, -6.0, 68.0, 4.0, 98.0, 22.0, -10.0, 46.0, 16.0]],
		[0.86, [26.0, 15.0, -6.0, 70.0, 0.0, 28.0, 15.0, -6.0, 70.0, 0.0]],
		[1.00, [22.0, 14.0, -6.0, 68.0, 0.0, 22.0, 14.0, -6.0, 68.0, 0.0]],
	],
	"thorax_pin_cleave": [
		[0.00, [22.0, 14.0, -6.0, 68.0, 0.0, 22.0, 14.0, -6.0, 68.0, 0.0]],
		[0.18, [48.0, -46.0, 34.0, 18.0, -12.0, 48.0, -46.0, 34.0, 18.0, -12.0]],
		[0.35, [66.0, 34.0, -10.0, 28.0, 18.0, 66.0, 34.0, -10.0, 28.0, 18.0]],
		[0.56, [70.0, 38.0, -14.0, 32.0, 24.0, 70.0, 38.0, -14.0, 32.0, 24.0]],
		[0.75, [64.0, 34.0, -10.0, 30.0, 20.0, 64.0, 34.0, -10.0, 30.0, 20.0]],
		[0.88, [30.0, 16.0, -6.0, 62.0, 4.0, 30.0, 16.0, -6.0, 62.0, 4.0]],
		[1.00, [22.0, 14.0, -6.0, 68.0, 0.0, 22.0, 14.0, -6.0, 68.0, 0.0]],
	],
	"thorax_aegis_viper": [
		[0.00, [22.0, 14.0, -6.0, 68.0, 0.0, 22.0, 14.0, -6.0, 68.0, 0.0]],
		[0.20, [-30.0, -14.0, 20.0, 90.0, 10.0, -30.0, -14.0, 20.0, 90.0, 10.0]],
		[0.42, [82.0, 10.0, 2.0, -22.0, -12.0, 82.0, 10.0, 2.0, -22.0, -12.0]],
		[0.56, [86.0, 12.0, 0.0, -24.0, -14.0, 86.0, 12.0, 0.0, -24.0, -14.0]],
		[0.68, [76.0, 10.0, 2.0, -16.0, -10.0, 76.0, 10.0, 2.0, -16.0, -10.0]],
		[0.86, [28.0, 14.0, -4.0, 64.0, 0.0, 28.0, 14.0, -4.0, 64.0, 0.0]],
		[1.00, [22.0, 14.0, -6.0, 68.0, 0.0, 22.0, 14.0, -6.0, 68.0, 0.0]],
	],
	"thorax_x_crusher": [
		[0.00, [22.0, 14.0, -6.0, 68.0, 0.0, 22.0, 14.0, -6.0, 68.0, 0.0]],
		[0.28, [10.0, -38.0, 48.0, -12.0, -14.0, 10.0, -38.0, 48.0, -12.0, -14.0]],
		[0.50, [80.0, 34.0, -16.0, 16.0, 20.0, 80.0, 34.0, -16.0, 16.0, 20.0]],
		[0.64, [84.0, 40.0, -18.0, 22.0, 24.0, 84.0, 40.0, -18.0, 22.0, 24.0]],
		[0.74, [74.0, 32.0, -14.0, 26.0, 18.0, 74.0, 32.0, -14.0, 26.0, 18.0]],
		[0.88, [28.0, 15.0, -6.0, 64.0, 2.0, 28.0, 15.0, -6.0, 64.0, 2.0]],
		[1.00, [22.0, 14.0, -6.0, 68.0, 0.0, 22.0, 14.0, -6.0, 68.0, 0.0]],
	],
	"thorax_mid_parry": [
		[0.00, [22.0, 14.0, -6.0, 68.0, 0.0, 22.0, 14.0, -6.0, 68.0, 0.0]],
		[0.18, [66.0, 44.0, -16.0, 64.0, 18.0, 58.0, 40.0, -14.0, 58.0, 16.0]],
		[0.52, [68.0, 46.0, -18.0, 66.0, 20.0, 60.0, 42.0, -16.0, 60.0, 18.0]],
		[0.78, [54.0, 34.0, -12.0, 64.0, 12.0, 48.0, 30.0, -10.0, 60.0, 10.0]],
		[1.00, [22.0, 14.0, -6.0, 68.0, 0.0, 22.0, 14.0, -6.0, 68.0, 0.0]],
	],
}

const DORSAL_KEYFRAMES := {
	"dorsal_mantis_impale": [
		[0.00, [8.0, 20.0, 6.0, -16.0, 12.0, 8.0, 20.0, 6.0, -16.0, 12.0]],
		[0.26, [-28.0, 24.0, 46.0, -24.0, 16.0, -28.0, 24.0, 46.0, -24.0, 16.0]],
		[0.44, [38.0, 66.0, -4.0, -32.0, 16.0, 38.0, 66.0, -4.0, -32.0, 16.0]],
		[0.56, [42.0, 68.0, -6.0, -34.0, 18.0, 42.0, 68.0, -6.0, -34.0, 18.0]],
		[0.68, [36.0, 62.0, -4.0, -30.0, 16.0, 36.0, 62.0, -4.0, -30.0, 16.0]],
		[0.86, [14.0, 28.0, 4.0, -18.0, 13.0, 14.0, 28.0, 4.0, -18.0, 13.0]],
		[1.00, [8.0, 20.0, 6.0, -16.0, 12.0, 8.0, 20.0, 6.0, -16.0, 12.0]],
	],
	"dorsal_scissor_shear": [
		[0.00, [8.0, 20.0, 6.0, -16.0, 12.0, 8.0, 20.0, 6.0, -16.0, 12.0]],
		[0.25, [8.0, -24.0, -16.0, -28.0, -20.0, 8.0, -24.0, -16.0, -28.0, -20.0]],
		[0.45, [28.0, 76.0, -6.0, -28.0, 38.0, 35.0, 76.0, -18.0, -26.0, 38.0]],
		[0.58, [30.0, 80.0, -8.0, -30.0, 42.0, 37.0, 80.0, -20.0, -28.0, 42.0]],
		[0.68, [26.0, 72.0, -6.0, -26.0, 36.0, 33.0, 72.0, -16.0, -24.0, 36.0]],
		[0.86, [12.0, 26.0, 4.0, -18.0, 14.0, 12.0, 26.0, 4.0, -18.0, 14.0]],
		[1.00, [8.0, 20.0, 6.0, -16.0, 12.0, 8.0, 20.0, 6.0, -16.0, 12.0]],
	],
	"dorsal_canopy_parry": [
		[0.00, [8.0, 20.0, 6.0, -16.0, 12.0, 8.0, 20.0, 6.0, -16.0, 12.0]],
		[0.18, [24.0, 62.0, 14.0, -24.0, 48.0, -22.0, 18.0, 38.0, -18.0, 12.0]],
		[0.38, [26.0, 64.0, 12.0, -26.0, 48.0, 36.0, 68.0, -2.0, -34.0, 20.0]],
		[0.54, [25.0, 62.0, 12.0, -25.0, 46.0, 40.0, 70.0, -4.0, -36.0, 22.0]],
		[0.66, [22.0, 56.0, 10.0, -22.0, 40.0, 34.0, 64.0, -2.0, -32.0, 18.0]],
		[0.86, [12.0, 26.0, 6.0, -17.0, 16.0, 12.0, 26.0, 6.0, -17.0, 14.0]],
		[1.00, [8.0, 20.0, 6.0, -16.0, 12.0, 8.0, 20.0, 6.0, -16.0, 12.0]],
	],
	"dorsal_tri_beam": [
		[0.00, [8.0, 20.0, 6.0, -16.0, 12.0, 8.0, 20.0, 6.0, -16.0, 12.0]],
		[0.20, [24.0, 58.0, 6.0, -36.0, 8.0, 24.0, 58.0, 6.0, -36.0, 8.0]],
		[0.46, [28.0, 62.0, 4.0, -40.0, 10.0, 28.0, 62.0, 4.0, -40.0, 10.0]],
		[0.64, [26.0, 61.0, 5.0, -39.0, 9.0, 26.0, 61.0, 5.0, -39.0, 9.0]],
		[0.78, [25.0, 59.0, 6.0, -37.0, 9.0, 25.0, 59.0, 6.0, -37.0, 9.0]],
		[0.89, [14.0, 30.0, 6.0, -22.0, 11.0, 14.0, 30.0, 6.0, -22.0, 11.0]],
		[1.00, [8.0, 20.0, 6.0, -16.0, 12.0, 8.0, 20.0, 6.0, -16.0, 12.0]],
	],
}

var active_move := ""
var elapsed := 0.0
var duration := 0.85
var idle_clock := 0.0


static func hermite01(x: float) -> float:
	var t := clampf(x, 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)


static func move_envelope(u: float) -> float:
	var uc := clampf(u, 0.0, 1.0)
	var w_in := hermite01(uc / 0.12) if uc < 0.12 else 1.0
	var w_out := (1.0 - hermite01((uc - 0.85) / 0.15)) if uc > 0.85 else 1.0
	return w_in * w_out


static func _eval_track(kfs: Array, fallback: Array[float], u: float) -> PackedFloat64Array:
	var out := PackedFloat64Array()
	if kfs.is_empty():
		for v in fallback:
			out.append(v)
		return out
	var uc := clampf(u, 0.0, 1.0)
	var first_kf: Array = kfs[0]
	var last_kf: Array = kfs[kfs.size() - 1]
	if uc <= float(first_kf[0]):
		for v in first_kf[1]:
			out.append(float(v))
		return out
	if uc >= float(last_kf[0]):
		for v in last_kf[1]:
			out.append(float(v))
		return out
	for i in range(kfs.size() - 1):
		var a: Array = kfs[i]
		var b: Array = kfs[i + 1]
		var ua := float(a[0])
		var ub := float(b[0])
		if uc >= ua and uc <= ub:
			var s := hermite01((uc - ua) / maxf(1e-6, ub - ua))
			var va: Array = a[1]
			var vb: Array = b[1]
			for c in range(va.size()):
				out.append(lerpf(float(va[c]), float(vb[c]), s))
			return out
	for v in last_kf[1]:
		out.append(float(v))
	return out


static func _thorax_side_quats(sx: float, pitch: float, yaw: float, flare: float, elbow: float, wrist: float) -> Dictionary:
	var ax_x := Vector3(1.0, 0.0, 0.0)
	var ax_y := Vector3(0.0, 1.0, 0.0)
	var ax_z := Vector3(0.0, 0.0, 1.0)
	var q_arm := Quaternion(ax_y, deg_to_rad(-sx * yaw)) * Quaternion(ax_x, deg_to_rad(-pitch)) * Quaternion(ax_z, deg_to_rad(sx * flare))
	var hinge := Vector3(-0.96, -sx * 0.28, 0.0).normalized()
	var q_fore := Quaternion(hinge, deg_to_rad(elbow))
	var q_hand := Quaternion(ax_x, deg_to_rad(-wrist))
	return {"arm": q_arm, "fore": q_fore, "hand": q_hand}


static func _dorsal_side_quats(sx: float, sh_pitch: float, sh_yaw: float, sh_roll: float, el_pitch: float, el_yaw: float) -> Dictionary:
	var ax_x := Vector3(1.0, 0.0, 0.0)
	var ax_y := Vector3(0.0, 1.0, 0.0)
	var ax_z := Vector3(0.0, 0.0, 1.0)
	var q_turret := Quaternion(ax_x, deg_to_rad(sh_pitch)) * Quaternion(ax_y, deg_to_rad(-sx * sh_yaw)) * Quaternion(ax_z, deg_to_rad(sx * sh_roll))
	var q_elbow := Quaternion(ax_x, deg_to_rad(el_pitch)) * Quaternion(ax_y, deg_to_rad(-sx * el_yaw))
	return {"turret": q_turret, "elbow": q_elbow}


static func sample_thorax_pose(move_key: String, u: float) -> Dictionary:
	var has_kf := THORAX_KEYFRAMES.has(move_key)
	var kfs: Array = THORAX_KEYFRAMES.get(move_key, [])
	var v := _eval_track(kfs, THORAX_GUARD, u)
	var env := move_envelope(u) if has_kf else 0.0
	var ql := _thorax_side_quats(1.0, v[0], v[1], v[2], v[3], v[4])
	var qr := _thorax_side_quats(-1.0, v[5], v[6], v[7], v[8], v[9])
	return {
		"move": move_key,
		"u": clampf(u, 0.0, 1.0),
		"blend": env,
		"l_pitch": v[0], "l_yaw": v[1], "l_flare": v[2], "l_elbow": v[3], "l_wrist": v[4],
		"r_pitch": v[5], "r_yaw": v[6], "r_flare": v[7], "r_elbow": v[8], "r_wrist": v[9],
		"channels": v,
		"Left2Arm": Quaternion.IDENTITY.slerp(ql["arm"], env),
		"Left2ForeArm": Quaternion.IDENTITY.slerp(ql["fore"], env),
		"Left2Hand": Quaternion.IDENTITY.slerp(ql["hand"], env),
		"Right2Arm": Quaternion.IDENTITY.slerp(qr["arm"], env),
		"Right2ForeArm": Quaternion.IDENTITY.slerp(qr["fore"], env),
		"Right2Hand": Quaternion.IDENTITY.slerp(qr["hand"], env),
	}


static func sample_dorsal_pose(move_key: String, u: float) -> Dictionary:
	var has_kf := DORSAL_KEYFRAMES.has(move_key)
	var kfs: Array = DORSAL_KEYFRAMES.get(move_key, [])
	var v := _eval_track(kfs, DORSAL_GUARD, u)
	var env := move_envelope(u) if has_kf else 0.0
	var gl := _dorsal_side_quats(1.0, DORSAL_GUARD[0], DORSAL_GUARD[1], DORSAL_GUARD[2], DORSAL_GUARD[3], DORSAL_GUARD[4])
	var gr := _dorsal_side_quats(-1.0, DORSAL_GUARD[5], DORSAL_GUARD[6], DORSAL_GUARD[7], DORSAL_GUARD[8], DORSAL_GUARD[9])
	var ql := _dorsal_side_quats(1.0, v[0], v[1], v[2], v[3], v[4])
	var qr := _dorsal_side_quats(-1.0, v[5], v[6], v[7], v[8], v[9])
	return {
		"move": move_key,
		"u": clampf(u, 0.0, 1.0),
		"blend": env,
		"l_sh_pitch": v[0], "l_sh_yaw": v[1], "l_sh_roll": v[2], "l_el_pitch": v[3], "l_el_yaw": v[4],
		"r_sh_pitch": v[5], "r_sh_yaw": v[6], "r_sh_roll": v[7], "r_el_pitch": v[8], "r_el_yaw": v[9],
		"channels": v,
		"TurretL": (gl["turret"] as Quaternion).slerp(ql["turret"], env),
		"ElbowL": (gl["elbow"] as Quaternion).slerp(ql["elbow"], env),
		"TurretR": (gr["turret"] as Quaternion).slerp(qr["turret"], env),
		"ElbowR": (gr["elbow"] as Quaternion).slerp(qr["elbow"], env),
	}


static func channel_distance(a: PackedFloat64Array, b: PackedFloat64Array) -> float:
	var n := mini(a.size(), b.size())
	var sum_sq := 0.0
	for i in range(n):
		var d := a[i] - b[i]
		sum_sq += d * d
	return sqrt(sum_sq)


func play_move(move_key: String, dur_sec: float = 0.85) -> bool:
	if not THORAX_KEYFRAMES.has(move_key) and not DORSAL_KEYFRAMES.has(move_key):
		return false
	active_move = move_key
	elapsed = 0.0
	duration = maxf(0.18, dur_sec)
	return true


func tick(dt: float) -> void:
	if dt > 0.0:
		idle_clock += dt
	if active_move != "":
		elapsed += maxf(0.0, dt)
		if elapsed >= duration:
			active_move = ""
			elapsed = 0.0


func normalized_u() -> float:
	if active_move == "" or duration <= 1e-6:
		return 0.0
	return clampf(elapsed / duration, 0.0, 1.0)


func apply_to_skeleton(skel: Skeleton3D, weight: float = 1.0) -> bool:
	if skel == null or active_move == "" or not THORAX_KEYFRAMES.has(active_move):
		return false
	var pose := sample_thorax_pose(active_move, normalized_u())
	var w := clampf(float(pose["blend"]) * weight, 0.0, 1.0)
	if w <= 0.001:
		return false
	for bone_name in ["Left2Arm", "Left2ForeArm", "Left2Hand", "Right2Arm", "Right2ForeArm", "Right2Hand"]:
		var bi := skel.find_bone(bone_name)
		if bi >= 0:
			var cur := skel.get_bone_pose_rotation(bi)
			skel.set_bone_pose_rotation(bi, cur.slerp(cur * (pose[bone_name] as Quaternion), w))
	return true


func apply_to_dorsal_nodes(turret_l: Node3D, elbow_l: Node3D, turret_r: Node3D, elbow_r: Node3D) -> bool:
	if turret_l == null or elbow_l == null or turret_r == null or elbow_r == null:
		return false
	if active_move != "" and DORSAL_KEYFRAMES.has(active_move):
		var pose := sample_dorsal_pose(active_move, normalized_u())
		turret_l.quaternion = pose["TurretL"]
		elbow_l.quaternion = pose["ElbowL"]
		turret_r.quaternion = pose["TurretR"]
		elbow_r.quaternion = pose["ElbowR"]
		return true
	var ql := _dorsal_side_quats(1.0, 8.0 + 4.2 * sin(idle_clock * 2.1), 20.0 + 5.0 * cos(idle_clock * 1.55), 6.0, -16.0, 12.0)
	var qr := _dorsal_side_quats(-1.0, 8.0 + 4.2 * sin(idle_clock * 2.1 + 0.9), 20.0 + 5.0 * cos(idle_clock * 1.55 + 0.9), 6.0, -16.0, 12.0)
	turret_l.quaternion = ql["turret"]
	elbow_l.quaternion = ql["elbow"]
	turret_r.quaternion = qr["turret"]
	elbow_r.quaternion = qr["elbow"]
	return true
