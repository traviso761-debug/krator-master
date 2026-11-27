# KCombatArthropod: Godot 4 twin of core/charactermodels/src/95-arthropod-combat.js.
# Evaluates deterministic 16-channel Hermite combat poses for rigged giant arthropods:
#   - Silk-Matriarch Giant Spider (spider_rear_bite, spider_venom_spit)
#   - Voth Staghorn War-Beetle (beetle_horn_gore, beetle_ram_charge)
#   - Hyperjungle Bowl Mantis (mantis_scythe_snap, mantis_flurry_reap)
#   - Emperor Giant Hornet (hornet_dive_sting, hornet_mandible_maul)
# Plus reactive/idle clips (arthro_idle, arthro_hunker_block, arthro_claw_parry, arthro_skitter_dodge,
# arthro_hit_flinch, arthro_knockback, arthro_death_curl, arthro_uncurl_rise) and crippled-leg curl.
class_name KCombatArthropod
extends RefCounted

const ZERO16: Array[float] = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

const CLIP_DURATIONS := {
	"arthro_idle": 1.20,
	"arthro_hunker_block": 0.68,
	"arthro_claw_parry": 0.62,
	"arthro_skitter_dodge": 0.64,
	"arthro_hit_flinch": 0.58,
	"arthro_knockback": 0.86,
	"arthro_death_curl": 0.92,
	"arthro_uncurl_rise": 0.88,
	"spider_rear_bite": 1.08,
	"spider_venom_spit": 1.02,
	"beetle_horn_gore": 1.18,
	"beetle_ram_charge": 1.12,
	"mantis_scythe_snap": 0.96,
	"mantis_flurry_reap": 1.06,
	"hornet_dive_sting": 1.04,
	"hornet_mandible_maul": 0.94,
}

const COUNTER_BY_ARCHETYPE := {
	"spider": "spider_rear_bite",
	"beetle": "beetle_horn_gore",
	"mantis": "mantis_scythe_snap",
	"hornet": "hornet_dive_sting",
}

const ARTHRO_KEYFRAMES := {
	"spider_rear_bite": [
		[0.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
		[0.26, [0.00, 0.06, -0.14, 0.18, -0.68, 0.00, -0.58, 0.00, 0.34, -0.45, -0.20, -0.45, -0.20, 0.52, 0.88, -0.18]],
		[0.48, [0.00, 0.02, 0.46, -0.06, 0.46, 0.00, 0.84, 0.00, 0.42, 0.72, 0.28, 0.72, 0.28, 0.68, -0.36, 0.14]],
		[0.60, [0.00, 0.01, 0.38, -0.04, 0.38, 0.00, 0.72, 0.00, 0.36, 0.58, 0.22, 0.58, 0.22, 0.56, -0.28, 0.10]],
		[0.84, [0.00, 0.00, 0.08, 0.00, 0.06, 0.00, 0.12, 0.00, 0.08, 0.08, 0.04, 0.08, 0.04, 0.10, -0.04, 0.00]],
		[1.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
	],
	"spider_venom_spit": [
		[0.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
		[0.24, [0.00, -0.04, -0.18, -0.05, 0.24, 0.00, 0.36, 0.00, 0.66, -0.22, -0.15, -0.22, -0.15, 0.24, 0.28, -0.22]],
		[0.44, [0.00, 0.04, 0.16, 0.08, -0.36, 0.04, -0.74, 0.00, -0.30, 0.25, -0.24, 0.25, -0.24, 0.46, 0.54, 0.12]],
		[0.58, [0.00, 0.02, -0.06, 0.05, -0.28, -0.03, -0.58, 0.00, -0.22, 0.18, -0.18, 0.18, -0.18, 0.36, 0.42, 0.08]],
		[0.84, [0.00, 0.00, -0.02, 0.00, -0.05, 0.00, -0.10, 0.00, 0.04, 0.00, 0.00, 0.00, 0.00, 0.06, 0.08, 0.00]],
		[1.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
	],
	"beetle_horn_gore": [
		[0.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
		[0.28, [0.00, -0.08, -0.16, -0.09, 0.38, 0.00, 0.62, 0.00, 0.18, 0.30, 0.12, 0.30, 0.12, 0.24, -0.34, -0.24]],
		[0.54, [0.00, 0.14, 0.48, 0.16, -0.66, 0.04, -0.92, 0.08, -0.24, -0.52, -0.20, -0.52, -0.20, 0.48, 0.58, -0.20]],
		[0.66, [0.00, 0.10, 0.38, 0.12, -0.54, -0.03, -0.78, -0.05, -0.18, -0.40, -0.15, -0.40, -0.15, 0.38, 0.46, -0.14]],
		[0.85, [0.00, 0.00, 0.08, 0.00, -0.08, 0.00, -0.12, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.06, 0.06, 0.00]],
		[1.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
	],
	"beetle_ram_charge": [
		[0.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
		[0.25, [0.00, -0.05, -0.28, -0.05, 0.30, 0.06, 0.44, 0.05, 0.12, 0.22, 0.15, 0.22, 0.15, -0.32, 0.22, 0.18]],
		[0.50, [0.00, -0.03, 0.68, -0.06, 0.44, -0.08, 0.54, -0.10, 0.22, 0.45, 0.26, 0.45, 0.26, -0.42, -0.26, -0.28]],
		[0.64, [0.00, -0.02, 0.52, -0.04, 0.36, 0.04, 0.42, 0.06, 0.16, 0.34, 0.20, 0.34, 0.20, -0.30, -0.18, -0.20]],
		[0.85, [0.00, 0.00, 0.10, 0.00, 0.08, 0.00, 0.10, 0.00, 0.04, 0.06, 0.04, 0.06, 0.04, -0.06, -0.04, -0.04]],
		[1.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
	],
	"mantis_scythe_snap": [
		[0.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
		[0.22, [0.00, 0.05, -0.12, 0.08, -0.38, 0.00, 0.26, 0.00, 0.20, -0.72, -0.38, -0.72, -0.38, 0.18, 0.22, -0.16]],
		[0.38, [0.00, -0.04, 0.42, -0.06, 0.44, 0.00, -0.22, 0.00, -0.16, 1.18, 0.38, 1.18, 0.38, 0.34, -0.18, 0.14]],
		[0.54, [0.00, -0.03, 0.38, -0.05, 0.40, 0.00, -0.18, 0.00, -0.14, 1.14, 0.36, 1.14, 0.36, 0.30, -0.16, 0.12]],
		[0.84, [0.00, 0.00, 0.06, 0.00, 0.06, 0.00, 0.00, 0.00, 0.00, 0.14, 0.05, 0.14, 0.05, 0.05, 0.00, 0.00]],
		[1.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
	],
	"mantis_flurry_reap": [
		[0.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
		[0.22, [-0.05, 0.02, 0.26, -0.02, 0.26, -0.32, -0.12, -0.22, 0.10, 1.12, 0.46, -0.68, -0.34, 0.28, -0.12, 0.10]],
		[0.46, [0.06, -0.02, 0.38, -0.04, 0.32, 0.36, -0.16, 0.26, -0.12, -0.56, -0.32, 1.22, 0.50, 0.34, -0.16, 0.12]],
		[0.58, [0.04, -0.02, 0.32, -0.03, 0.28, 0.28, -0.14, 0.20, -0.10, -0.44, -0.24, 1.10, 0.44, 0.28, -0.14, 0.10]],
		[0.74, [0.00, 0.01, 0.14, 0.00, 0.12, -0.08, -0.04, -0.06, 0.00, 0.48, 0.20, 0.36, 0.16, 0.12, -0.06, 0.04]],
		[1.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
	],
	"hornet_dive_sting": [
		[0.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
		[0.24, [0.00, 0.36, -0.18, 0.06, -0.42, 0.00, 0.22, 0.00, 0.28, -0.30, 0.10, -0.30, 0.10, -0.22, -0.40, -0.40]],
		[0.42, [0.00, 0.12, 0.54, 0.02, -0.34, 0.00, 0.38, 0.00, -1.48, 0.42, 0.22, 0.42, 0.22, 0.56, 0.38, -0.32]],
		[0.56, [0.00, 0.10, 0.46, 0.02, -0.28, 0.00, 0.32, 0.00, -1.36, 0.36, 0.18, 0.36, 0.18, 0.48, 0.32, -0.28]],
		[0.84, [0.00, 0.04, 0.08, 0.00, -0.06, 0.00, 0.06, 0.00, -0.22, 0.05, 0.02, 0.05, 0.02, 0.08, 0.04, -0.06]],
		[1.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
	],
	"hornet_mandible_maul": [
		[0.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
		[0.20, [0.10, 0.18, -0.14, 0.04, 0.28, 0.18, -0.24, -0.18, 0.42, -0.36, -0.18, -0.36, -0.18, 0.30, 0.26, -0.24]],
		[0.36, [-0.06, 0.06, 0.58, -0.04, 0.52, -0.22, 0.48, 0.28, 0.56, 0.64, 0.30, 0.64, 0.30, 0.64, 0.48, -0.20]],
		[0.54, [0.05, 0.08, 0.50, -0.03, 0.48, 0.20, 0.44, -0.24, 0.52, 0.58, 0.26, 0.58, 0.26, 0.58, 0.44, -0.18]],
		[0.84, [0.00, 0.02, 0.08, 0.00, 0.08, 0.00, 0.08, 0.00, 0.10, 0.08, 0.04, 0.08, 0.04, 0.10, 0.08, -0.04]],
		[1.00, [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]],
	],
	"arthro_hunker_block": [
		[0.00, ZERO16],
		[0.22, [0.00, -0.09, -0.08, -0.07, 0.22, 0.00, 0.42, 0.00, -0.18, 0.38, 0.52, 0.38, 0.52, 0.42, -0.46, -0.28]],
		[0.62, [0.00, -0.09, -0.08, -0.07, 0.20, 0.00, 0.40, 0.00, -0.16, 0.36, 0.50, 0.36, 0.50, 0.40, -0.44, -0.26]],
		[1.00, ZERO16],
	],
	"arthro_claw_parry": [
		[0.00, ZERO16],
		[0.20, [0.00, 0.06, 0.08, 0.07, -0.30, 0.16, -0.44, 0.18, 0.22, -0.48, -0.42, 0.56, 0.34, 0.55, 0.66, -0.14]],
		[0.54, [0.00, 0.05, 0.06, 0.06, -0.24, -0.12, -0.36, -0.14, 0.18, -0.36, -0.32, 0.44, 0.26, 0.46, 0.54, -0.10]],
		[1.00, ZERO16],
	],
	"arthro_skitter_dodge": [
		[0.00, ZERO16],
		[0.32, [0.38, 0.04, -0.34, -0.03, -0.14, -0.22, -0.18, -0.16, 0.16, -0.28, -0.20, -0.28, -0.20, -0.36, 0.32, 0.24]],
		[0.64, [0.30, 0.02, -0.26, -0.02, -0.10, -0.16, -0.12, -0.12, 0.12, -0.20, -0.14, -0.20, -0.14, -0.26, 0.22, 0.16]],
		[1.00, ZERO16],
	],
	"arthro_hit_flinch": [
		[0.00, ZERO16],
		[0.22, [-0.05, -0.04, -0.22, -0.03, -0.34, 0.18, -0.38, 0.16, -0.26, -0.34, -0.22, -0.28, -0.18, 0.22, 0.38, -0.20]],
		[0.56, [-0.03, -0.02, -0.14, -0.02, -0.20, -0.10, -0.22, -0.08, -0.16, -0.20, -0.12, -0.16, -0.10, 0.14, 0.22, -0.12]],
		[1.00, ZERO16],
	],
	"arthro_knockback": [
		[0.00, ZERO16],
		[0.28, [0.00, 0.06, -0.52, 0.04, -0.48, 0.14, -0.52, 0.12, 0.34, -0.56, -0.34, -0.56, -0.34, 0.32, 0.58, 0.26]],
		[0.64, [0.00, -0.03, -0.38, -0.02, -0.26, -0.08, -0.28, -0.08, 0.18, -0.30, -0.18, -0.30, -0.18, 0.18, 0.30, 0.12]],
		[1.00, ZERO16],
	],
	"arthro_death_curl": [
		[0.00, ZERO16],
		[0.45, [0.00, -0.20, -0.26, -0.12, 0.26, 0.08, 0.44, 0.06, -0.46, 0.62, 0.48, 0.62, 0.48, 0.18, -0.82, -0.82]],
		[1.00, [0.00, -0.22, -0.28, -0.14, 0.28, 0.06, 0.46, 0.04, -0.48, 0.66, 0.52, 0.66, 0.52, 0.20, -0.86, -0.86]],
	],
	"arthro_uncurl_rise": [
		[0.00, [0.00, -0.22, -0.28, -0.14, 0.28, 0.06, 0.46, 0.04, -0.48, 0.66, 0.52, 0.66, 0.52, 0.20, -0.86, -0.86]],
		[0.48, [0.00, 0.04, -0.08, 0.05, -0.18, -0.08, -0.22, -0.06, 0.16, -0.24, -0.16, -0.24, -0.16, 0.18, 0.28, 0.18]],
		[1.00, ZERO16],
	],
}

var archetype := "spider"
var active_clip := "arthro_idle"
var is_loop_clip := true
var elapsed := 0.0
var duration := 1.20
var limb_trauma: Dictionary = {}


func _init(p_archetype: String = "spider") -> void:
	setup(p_archetype)


func setup(p_archetype: String = "spider") -> KCombatArthropod:
	archetype = p_archetype if p_archetype != "" else "spider"
	limb_trauma = compute_leg_trauma_state({}, archetype)
	return self


static func counter_for_archetype(arch: String) -> String:
	return String(COUNTER_BY_ARCHETYPE.get(arch, "spider_rear_bite"))


static func resolve_arthropod_clip(clip_name: String, arch: String = "spider") -> String:
	var name := clip_name if clip_name != "" else "arthro_idle"
	if CLIP_DURATIONS.has(name):
		return name
	if name in ["counterstrike", "dodge_counter", "ual_sword_a", "ual_sword_b", "ual_sword_combo", "slash_right", "slash_left", "jab_r", "jab_l", "kick_front", "ual_punch", "attack"]:
		return counter_for_archetype(arch)
	if name == "ual_shield_up" or name == "ual_sword_block" or name.begins_with("guard_block") or name.begins_with("block"):
		return "arthro_hunker_block"
	if name.begins_with("parry"):
		return "arthro_claw_parry"
	if name.begins_with("dodge") or name == "ual_roll":
		return "arthro_skitter_dodge"
	if name == "ual_knockback":
		return "arthro_knockback"
	if name == "knock_down" or name == "fall_down":
		return "arthro_death_curl"
	if name == "ual_get_up" or name == "get_up":
		return "arthro_uncurl_rise"
	if name.begins_with("hit") or name.begins_with("ual_hit"):
		return "arthro_hit_flinch"
	if name in ["combat_idle", "unarmed_guard", "ual_sword_idle", "walk_shoot", "idle"]:
		return "arthro_idle"
	return "arthro_idle"


static func hermite01(x: float) -> float:
	var t := clampf(x, 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)


static func clip_envelope(move_key: String, u: float) -> float:
	var uc := clampf(u, 0.0, 1.0)
	if move_key == "arthro_idle" or not ARTHRO_KEYFRAMES.has(move_key):
		return 0.0
	if move_key == "arthro_death_curl":
		return hermite01(uc / 0.18) if uc < 0.18 else 1.0
	if move_key == "arthro_uncurl_rise":
		return (1.0 - hermite01((uc - 0.82) / 0.18)) if uc > 0.82 else 1.0
	var w_in := hermite01(uc / 0.12) if uc < 0.12 else 1.0
	var w_out := (1.0 - hermite01((uc - 0.84) / 0.16)) if uc > 0.84 else 1.0
	return w_in * w_out


static func _eval_track16(kfs: Array, u: float) -> PackedFloat64Array:
	var out := PackedFloat64Array()
	if kfs.is_empty():
		for v in ZERO16:
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
			for c in range(16):
				out.append(lerpf(float(va[c]), float(vb[c]), s))
			return out
	for v in last_kf[1]:
		out.append(float(v))
	return out


static func base_mode_for(move_key: String, arch: String) -> String:
	if arch == "hornet":
		return "idle" if move_key == "arthro_death_curl" else "fly"
	if move_key in ["beetle_ram_charge", "arthro_skitter_dodge", "mantis_flurry_reap", "spider_rear_bite", "beetle_horn_gore"]:
		return "walk"
	return "idle"


static func base_rate_for(move_key: String, arch: String) -> float:
	if arch == "hornet":
		if move_key in ["hornet_dive_sting", "hornet_mandible_maul"]:
			return 2.3
		if move_key == "arthro_death_curl":
			return 0.3
		return 1.35
	if move_key in ["beetle_ram_charge", "arthro_skitter_dodge"]:
		return 2.2
	if move_key in ["mantis_flurry_reap", "spider_rear_bite", "beetle_horn_gore"]:
		return 1.45
	return 1.0


static func quat_xyz(rx: float, ry: float, rz: float) -> Quaternion:
	var hx := rx * 0.5
	var hy := ry * 0.5
	var hz := rz * 0.5
	var cx := cos(hx)
	var sx := sin(hx)
	var cy := cos(hy)
	var sy := sin(hy)
	var cz := cos(hz)
	var sz := sin(hz)
	return Quaternion(
		sx * cy * cz + cx * sy * sz,
		cx * sy * cz - sx * cy * sz,
		cx * cy * sz + sx * sy * cz,
		cx * cy * cz - sx * sy * sz
	)


static func sample_arthropod_pose(move_key: String, u: float, arch: String = "spider") -> Dictionary:
	var eff_arch := arch if arch != "" else "spider"
	var key := move_key if ARTHRO_KEYFRAMES.has(move_key) else ("arthro_idle" if move_key == "arthro_idle" else resolve_arthropod_clip(move_key, eff_arch))
	var uc := clampf(u, 0.0, 1.0)
	var env := clip_envelope(key, uc)
	var raw := _eval_track16(ARTHRO_KEYFRAMES.get(key, []), uc)
	var ch := PackedFloat64Array()
	for i in range(16):
		ch.append(raw[i] * env)

	var root_dx := ch[0]
	var root_dy := ch[1]
	var root_dz := ch[2]
	var thorax_dy := ch[3]
	var thx_rx := ch[4]
	var thx_ry := ch[5]
	var hd_rx := ch[6]
	var hd_ry := ch[7]
	var abd_rx := ch[8]
	var arm_l_rx := ch[9]
	var arm_l_in := ch[10]
	var arm_r_rx := ch[11]
	var arm_r_in := ch[12]
	var fore_sw := ch[13]
	var fore_lf := ch[14]
	var hind_br := ch[15]

	var root_roll := (0.28 * env) if (key in ["arthro_death_curl", "arthro_uncurl_rise"]) else ((0.14 * env) if key == "arthro_skitter_dodge" else 0.0)

	var nodes := {
		"thorax": Vector3(thx_rx, thx_ry, 0.0),
		"head": Vector3(hd_rx, hd_ry, 0.0),
		"jaw": Vector3(hd_rx, hd_ry, 0.0),
		"abd": Vector3(abd_rx, -thx_ry * 0.45, 0.0),
		"armL": Vector3(arm_l_rx, arm_l_in, -arm_l_in * 0.85),
		"armLt": Vector3(arm_l_rx * 0.78, 0.0, -arm_l_in * 0.35),
		"armR": Vector3(arm_r_rx, -arm_r_in, arm_r_in * 0.85),
		"armRt": Vector3(arm_r_rx * 0.78, 0.0, arm_r_in * 0.35),
	}

	for p in range(4):
		var is_fore := (p == 0) if eff_arch == "mantis" else (p <= 1)
		var w_fore := 1.0 if p == 0 else 0.68
		var sw := (fore_sw * w_fore) if is_fore else (-fore_sw * 0.25)
		var lf := (fore_lf * w_fore) if is_fore else hind_br
		for sg_i in [1, -1]:
			var sg := float(sg_i)
			var suf := "L" if sg_i > 0 else "R"
			var base_name := "leg%d%s" % [p, suf]
			nodes[base_name] = Vector3(0.0, -sg * sw, sg * lf)
			nodes[base_name + "t"] = Vector3(0.0, 0.0, sg * lf * 0.68)
			nodes[base_name + "f"] = Vector3(0.0, 0.0, sg * lf * 0.44)

	var quats := {}
	for k in nodes:
		var e: Vector3 = nodes[k]
		quats[k] = quat_xyz(e.x, e.y, e.z)

	return {
		"move": key,
		"archetype": eff_arch,
		"u": uc,
		"blend": env,
		"base_mode": base_mode_for(key, eff_arch),
		"base_rate": base_rate_for(key, eff_arch),
		"root_offset": Vector3(root_dx, root_dy, root_dz),
		"root_rot": Vector3(0.0, thx_ry * 0.35, root_roll),
		"thorax_pos": Vector3(0.0, thorax_dy, 0.0),
		"channels": ch,
		"nodes": nodes,
		"quats": quats,
	}


static func _limb_damaged_weight(limb_val: Variant) -> float:
	if not (limb_val is Dictionary):
		return 0.0
	var d: Dictionary = limb_val
	if bool(d.get("severed", false)):
		return 1.0
	if bool(d.get("crippled", false)) or (d.has("hp") and float(d["hp"]) < 0.0):
		return 0.68
	return 0.0


static func _curl_leg_into(nodes: Dictionary, prefix: String, sg: float, w: float) -> void:
	if w <= 0.0:
		return
	nodes[prefix] = Vector3(0.14 * w, -sg * 0.22 * w, -sg * 0.82 * w)
	nodes[prefix + "t"] = Vector3(0.0, 0.0, -sg * 0.74 * w)
	nodes[prefix + "f"] = Vector3(0.0, 0.0, -sg * 0.50 * w)


static func compute_leg_trauma_state(limbs: Dictionary, arch: String = "spider") -> Dictionary:
	var eff_arch := arch if arch != "" else "spider"
	var w_fl := _limb_damaged_weight(limbs.get("left_arm"))
	var w_fr := _limb_damaged_weight(limbs.get("right_arm"))
	var w_hl := _limb_damaged_weight(limbs.get("left_leg"))
	var w_hr := _limb_damaged_weight(limbs.get("right_leg"))
	var nodes := {}

	if eff_arch == "mantis":
		if w_fl > 0.0:
			nodes["armL"] = Vector3(0.58 * w_fl, 0.46 * w_fl, -0.44 * w_fl)
			nodes["armLt"] = Vector3(0.68 * w_fl, 0.0, -0.28 * w_fl)
			_curl_leg_into(nodes, "leg0L", 1.0, w_fl)
		if w_fr > 0.0:
			nodes["armR"] = Vector3(0.58 * w_fr, -0.46 * w_fr, 0.44 * w_fr)
			nodes["armRt"] = Vector3(0.68 * w_fr, 0.0, 0.28 * w_fr)
			_curl_leg_into(nodes, "leg0R", -1.0, w_fr)
		_curl_leg_into(nodes, "leg1L", 1.0, w_hl)
		_curl_leg_into(nodes, "leg1R", -1.0, w_hr)
	elif eff_arch == "spider":
		_curl_leg_into(nodes, "leg0L", 1.0, w_fl)
		_curl_leg_into(nodes, "leg1L", 1.0, w_fl)
		_curl_leg_into(nodes, "leg0R", -1.0, w_fr)
		_curl_leg_into(nodes, "leg1R", -1.0, w_fr)
		_curl_leg_into(nodes, "leg2L", 1.0, w_hl)
		_curl_leg_into(nodes, "leg3L", 1.0, w_hl)
		_curl_leg_into(nodes, "leg2R", -1.0, w_hr)
		_curl_leg_into(nodes, "leg3R", -1.0, w_hr)
	else:
		_curl_leg_into(nodes, "leg0L", 1.0, w_fl)
		_curl_leg_into(nodes, "leg0R", -1.0, w_fr)
		_curl_leg_into(nodes, "leg1L", 1.0, w_hl)
		_curl_leg_into(nodes, "leg2L", 1.0, w_hl)
		_curl_leg_into(nodes, "leg3L", 1.0, w_hl)
		_curl_leg_into(nodes, "leg1R", -1.0, w_hr)
		_curl_leg_into(nodes, "leg2R", -1.0, w_hr)
		_curl_leg_into(nodes, "leg3R", -1.0, w_hr)

	var tilt_z := (w_fl + w_hl) * 0.08 - (w_fr + w_hr) * 0.08
	var tilt_x := (w_fl + w_fr) * 0.06 - (w_hl + w_hr) * 0.06
	var drop_y := -(w_fl + w_fr + w_hl + w_hr) * 0.025
	return {
		"any_damaged": (w_fl + w_fr + w_hl + w_hr) > 0.0,
		"thorax_tilt": Vector3(tilt_x, 0.0, tilt_z),
		"root_drop_y": drop_y,
		"nodes": nodes,
	}


static func channel_distance(a: PackedFloat64Array, b: PackedFloat64Array) -> float:
	var n := mini(a.size(), b.size())
	var sum_sq := 0.0
	for i in range(n):
		var d := a[i] - b[i]
		sum_sq += d * d
	return sqrt(sum_sq)


func play_clip(clip_name: String) -> String:
	var actual := resolve_arthropod_clip(clip_name, archetype)
	active_clip = actual
	is_loop_clip = (actual == "arthro_idle")
	elapsed = 0.0
	duration = float(CLIP_DURATIONS.get(actual, 0.90))
	return actual


func set_limb_state(limbs: Dictionary) -> void:
	limb_trauma = compute_leg_trauma_state(limbs, archetype)


func tick(dt: float) -> void:
	if dt <= 0.0 or is_loop_clip:
		return
	elapsed = minf(duration, elapsed + dt)
	if elapsed >= duration and active_clip != "arthro_death_curl":
		active_clip = "arthro_idle"
		is_loop_clip = true
		elapsed = 0.0


func normalized_u() -> float:
	if is_loop_clip or duration <= 1e-6:
		return 0.0
	return clampf(elapsed / duration, 0.0, 1.0)


func apply_to_nodes(nodes_by_name: Dictionary, root_wrap: Node3D = null) -> bool:
	if nodes_by_name.is_empty():
		return false
	var pose := sample_arthropod_pose(active_clip, normalized_u(), archetype)
	var any_damaged := bool(limb_trauma.get("any_damaged", false))
	var drop_y := float(limb_trauma.get("root_drop_y", 0.0)) if any_damaged else 0.0

	if root_wrap != null:
		var ro: Vector3 = pose["root_offset"]
		var rr: Vector3 = pose["root_rot"]
		root_wrap.position = Vector3(ro.x, ro.y + drop_y, ro.z)
		root_wrap.quaternion = quat_xyz(rr.x, rr.y, rr.z)

	for k in nodes_by_name:
		var nd = nodes_by_name[k]
		if nd is Node3D:
			if not nd.has_meta("_arthro_rest_pos"):
				nd.set_meta("_arthro_rest_pos", nd.position)
			nd.position = nd.get_meta("_arthro_rest_pos")
			nd.quaternion = Quaternion.IDENTITY

	var thx: Node3D = nodes_by_name.get("thorax") as Node3D
	if thx != null:
		var tp: Vector3 = pose["thorax_pos"]
		thx.position += tp

	var quats: Dictionary = pose["quats"]
	for nm in quats:
		var target_nd: Node3D = nodes_by_name.get(nm) as Node3D
		if target_nd != null:
			target_nd.quaternion = target_nd.quaternion * (quats[nm] as Quaternion)

	if any_damaged:
		if thx != null:
			var tilt: Vector3 = limb_trauma["thorax_tilt"]
			thx.quaternion = thx.quaternion * quat_xyz(tilt.x, tilt.y, tilt.z)
		var t_nodes: Dictionary = limb_trauma["nodes"]
		for t_name in t_nodes:
			var t_nd: Node3D = nodes_by_name.get(t_name) as Node3D
			if t_nd != null:
				var tr_v: Vector3 = t_nodes[t_name]
				t_nd.quaternion = t_nd.quaternion * quat_xyz(tr_v.x, tr_v.y, tr_v.z)

	return true
