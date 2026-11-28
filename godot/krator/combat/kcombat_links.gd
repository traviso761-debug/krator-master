# KCombatLinks: Engine-neutral combat-links.json loader, Martial Arts skill-tier filter, and clip fallback resolver.
# Resilient to both baseline fields (attack, hit_t, hit_y, dist_m, outcomes) and extended Phase 1/2 rule fields
# (rules, style, poise_dmg, base_dmg, dmg_type, target_zone, skill_min, tier, heavy, sweep, grapple).
class_name KCombatLinks
extends RefCounted

const DEFAULT_RULES := {
	"default_attack_slots": 2,
	"min_attack_slots": 1,
	"max_attack_slots": 3,
	"input_buffer_s": 0.15,
	"parry_window_min_s": 0.08,
	"parry_window_max_s": 0.22,
	"hitstop_hit_s": 0.06,
	"hitstop_block_s": 0.045,
	"hitstop_guard_break_s": 0.07,
	"sever_mode": "frequent",
}

# Mirrors Web CLIP_FALLBACKS in core/charactermodels/src/94-combat-duel.js plus armed/defense/knockdown fallbacks
# so both full 102-clip libraries and subset test rigs resolve cleanly.
const CLIP_FALLBACKS := {
	"unarmed_guard": ["combat_idle", "ual_sword_idle", "idle"],
	"jab_l": ["ual_jab", "ual_punch", "attack", "slash_left"],
	"jab_r": ["ual_cross", "ual_punch", "slash_right", "attack"],
	"ual_jab": ["jab_l", "ual_punch", "attack"],
	"ual_cross": ["jab_r", "ual_punch", "attack"],
	"hook_l": ["ual_punch", "slash_left", "attack"],
	"hook_l_short": ["ual_punch", "attack"],
	"uppercut_r": ["slash_charged", "ual_punch", "attack"],
	"uppercut_l": ["slash_left", "ual_punch", "attack"],
	"elbow_strike": ["thrust", "ual_punch", "attack"],
	"knee_strike": ["ual_sword_dash", "thrust", "attack"],
	"kick_front": ["ual_sword_dash", "thrust", "attack"],
	"kick_roundhouse": ["axe_spin", "slash_charged", "combo"],
	"leg_sweep": ["ual_sword_heavy", "axe_spin", "slash_left"],
	"punch_combo_1": ["combo", "ual_sword_combo", "ual_punch"],
	"punch_combo_2": ["ual_sword_combo", "combo", "ual_punch"],
	"punch_combo_3": ["ual_sword_heavy", "combo", "ual_punch"],
	"counterstrike": ["ual_punch", "slash_right", "attack"],
	"dodge_counter": ["counterstrike", "dodge_spin", "ual_punch"],
	"throw_shoulder": ["punch_combo_3", "ual_sword_heavy", "attack"],
	"throw_grip": ["punch_combo_2", "ual_sword_heavy", "attack"],
	"axe_chop": ["ual_chop", "slash_charged", "ual_sword_heavy", "attack"],
	"axe_spin": ["slash_charged", "ual_sword_heavy", "combo"],
	"blunt_swing": ["ual_sword_heavy", "slash_charged", "attack"],
	"slash_left": ["ual_sword_a", "attack"],
	"slash_right": ["ual_sword_b", "attack"],
	"slash_charged": ["ual_sword_heavy", "attack"],
	"spear_thrust": ["thrust", "attack"],
	"ual_shield_bash": ["shield_push", "attack"],
	"guard_block_1": ["block", "parry", "ual_sword_block"],
	"guard_block_2": ["block_2", "parry_2h", "block"],
	"guard_block_3": ["parry", "block_2", "block"],
	"parry": ["parry_2h", "guard_block_3", "block"],
	"parry_2h": ["parry", "block_2", "block"],
	"block": ["guard_block_1", "ual_sword_block", "parry"],
	"dodge_step": ["dodge_back", "ual_roll", "idle"],
	"dodge_back": ["dodge_step", "ual_roll", "idle"],
	"dodge_spin": ["dodge_step", "dodge_back", "ual_roll"],
	"hit_face": ["ual_hit_head", "hit", "hit_2"],
	"hit_face_2": ["ual_hit_head", "hit_2", "hit"],
	"hit_slap": ["ual_hit_head", "hit"],
	"hit_body": ["ual_hit_chest", "hit", "hit_2"],
	"ual_hit_head": ["hit_face", "hit", "hit_2"],
	"ual_hit_chest": ["hit_body", "hit", "hit_2"],
	"ual_knockback": ["knock_down", "hit_2", "hit"],
	"knock_down": ["fall_down", "ual_knockback", "hit_2"],
	"ual_get_up": ["get_up", "unarmed_guard", "idle"],
	"get_up": ["ual_get_up", "unarmed_guard", "idle"],
	"spell_cast": ["ual_throw", "throw", "attack"],
	"taunt_chest": ["slash_charged", "ual_sword_heavy", "combo"],
	"claw_swipe": ["slash_right", "ual_sword_a", "attack"],
	"dodge_roll": ["ual_roll", "dodge_back", "dodge_step"],
	"ual_shield_up": ["guard_block_3", "block_2", "parry"],
	"lightning_blast": ["spell_cast", "ual_throw", "throw"],
	"energy_burst": ["taunt_chest", "slash_charged", "ual_sword_heavy"],
	"astral_lance": ["spear_thrust", "thrust", "attack"],
	"rift_claw": ["claw_swipe", "slash_right", "attack"],
	"thorax_quad_flurry": ["punch_combo_2", "combo", "ual_punch"],
	"thorax_pin_cleave": ["axe_chop", "slash_charged", "ual_sword_heavy"],
	"thorax_aegis_viper": ["block_2", "guard_block_2", "thrust"],
	"thorax_x_crusher": ["slash_charged", "axe_chop", "ual_sword_heavy"],
	"dorsal_mantis_impale": ["spear_thrust", "thrust", "attack"],
	"dorsal_scissor_shear": ["slash_right", "ual_sword_a", "attack"],
	"dorsal_canopy_parry": ["parry", "block_2", "ual_sword_a"],
	"dorsal_tri_beam": ["spell_cast", "ual_throw", "throw"],
	"arthro_idle": ["combat_idle", "unarmed_guard", "idle"],
	"spider_rear_bite": ["thrust", "attack"],
	"spider_venom_spit": ["bow_shot", "ual_throw", "attack"],
	"beetle_horn_gore": ["slash_charged", "ual_sword_heavy", "attack"],
	"beetle_ram_charge": ["ual_shield_bash", "ual_sword_heavy", "attack"],
	"mantis_scythe_snap": ["slash_right", "ual_sword_a", "attack"],
	"mantis_flurry_reap": ["combo", "slash_left", "attack"],
	"hornet_dive_sting": ["spear_thrust", "thrust", "attack"],
	"hornet_mandible_maul": ["claw_swipe", "slash_right", "attack"],
	"crab_pincer_guillotine": ["axe_chop", "slash_charged", "ual_sword_heavy", "attack"],
	"crab_twin_vice_slam": ["ual_shield_bash", "blunt_swing", "ual_sword_heavy", "attack"],
}

# Martial Arts move skill thresholds matching Proposal Section 2:
# Tier 1: 0-25 | Tier 2: 25-50 | Tier 3: 50-75 | Tier 4: 75+
const MA_SKILL_DEFAULTS := {
	# Tier 1 (0..25)
	"jab_l": 0.0,
	"jab_r": 0.0,
	"ual_jab": 0.0,
	"ual_cross": 0.0,
	# Tier 2 (25..50)
	"hook_l": 25.0,
	"hook_l_short": 25.0,
	"uppercut_l": 25.0,
	"uppercut_r": 25.0,
	"elbow_strike": 25.0,
	"knee_strike": 25.0,
	"kick_front": 25.0,
	"punch_combo_1": 25.0,
	# Tier 3 (50..75)
	"kick_roundhouse": 50.0,
	"leg_sweep": 50.0,
	"punch_combo_2": 50.0,
	"punch_combo_3": 50.0,
	"counterstrike": 50.0,
	# Tier 4 (75+ Master)
	"dodge_counter": 75.0,
	"throw_shoulder": 75.0,
	"throw_grip": 75.0,
}

# Per-move default combat stats when omitted in combat-links.json.
const MOVE_STAT_DEFAULTS := {
	"jab_l": {"style": "martial_arts", "base_dmg": 12.0, "poise_dmg": 10.0, "dmg_type": "blunt", "target_zone": "head"},
	"jab_r": {"style": "martial_arts", "base_dmg": 15.0, "poise_dmg": 13.0, "dmg_type": "blunt", "target_zone": "head"},
	"ual_jab": {"style": "martial_arts", "base_dmg": 12.0, "poise_dmg": 10.0, "dmg_type": "blunt", "target_zone": "head"},
	"ual_cross": {"style": "martial_arts", "base_dmg": 15.0, "poise_dmg": 13.0, "dmg_type": "blunt", "target_zone": "head"},
	"hook_l": {"style": "martial_arts", "base_dmg": 18.0, "poise_dmg": 16.0, "dmg_type": "blunt", "target_zone": "head"},
	"hook_l_short": {"style": "martial_arts", "base_dmg": 16.0, "poise_dmg": 14.0, "dmg_type": "blunt", "target_zone": "head"},
	"uppercut_r": {"style": "martial_arts", "base_dmg": 22.0, "poise_dmg": 22.0, "dmg_type": "blunt", "target_zone": "head"},
	"uppercut_l": {"style": "martial_arts", "base_dmg": 20.0, "poise_dmg": 20.0, "dmg_type": "blunt", "target_zone": "head"},
	"elbow_strike": {"style": "martial_arts", "base_dmg": 21.0, "poise_dmg": 19.0, "dmg_type": "blunt", "target_zone": "head"},
	"knee_strike": {"style": "martial_arts", "base_dmg": 23.0, "poise_dmg": 22.0, "dmg_type": "blunt", "target_zone": "stomach"},
	"kick_front": {"style": "martial_arts", "base_dmg": 22.0, "poise_dmg": 25.0, "dmg_type": "blunt", "target_zone": "chest", "lunge": true},
	"kick_roundhouse": {"style": "martial_arts", "base_dmg": 28.0, "poise_dmg": 28.0, "dmg_type": "blunt", "target_zone": "head"},
	"leg_sweep": {"style": "martial_arts", "base_dmg": 16.0, "poise_dmg": 30.0, "dmg_type": "blunt", "target_zone": "left_leg", "sweep": true, "focus_cost": 20.0},
	"punch_combo_1": {"style": "martial_arts", "base_dmg": 24.0, "poise_dmg": 20.0, "dmg_type": "blunt", "target_zone": "chest"},
	"punch_combo_2": {"style": "martial_arts", "base_dmg": 30.0, "poise_dmg": 26.0, "dmg_type": "blunt", "target_zone": "chest"},
	"punch_combo_3": {"style": "martial_arts", "base_dmg": 32.0, "poise_dmg": 28.0, "dmg_type": "blunt", "target_zone": "head"},
	"counterstrike": {"style": "martial_arts", "base_dmg": 26.0, "poise_dmg": 24.0, "dmg_type": "blunt", "target_zone": "chest"},
	"dodge_counter": {"style": "martial_arts", "base_dmg": 32.0, "poise_dmg": 28.0, "dmg_type": "blunt", "target_zone": "chest", "focus_cost": 25.0},
	"throw_shoulder": {"style": "martial_arts", "base_dmg": 36.0, "poise_dmg": 40.0, "dmg_type": "blunt", "target_zone": "chest", "grapple": true, "focus_cost": 30.0},
	"throw_grip": {"style": "martial_arts", "base_dmg": 34.0, "poise_dmg": 38.0, "dmg_type": "blunt", "target_zone": "chest", "grapple": true, "focus_cost": 30.0},
}

# Built-in supplemental links merged ONLY when absent from combat-links.json on disk, ensuring full
# Tier 1-4 Martial Arts + Armed Melee + Ranged coverage regardless of JSON revision.
const SUPPLEMENTAL_LINKS := [
	{
		"attack": "counterstrike",
		"label": "Counterstrike",
		"short": "Counter",
		"style": "martial_arts",
		"skill_min": 50.0,
		"hit_t": 0.34,
		"hit_y": 1.30,
		"dist_m": 1.04,
		"base_dmg": 26.0,
		"poise_dmg": 24.0,
		"dmg_type": "blunt",
		"target_zone": "chest",
	},
	{
		"attack": "dodge_counter",
		"label": "Master Dodge-Counter",
		"short": "Dodge Counter",
		"style": "martial_arts",
		"skill_min": 75.0,
		"hit_t": 0.40,
		"hit_y": 1.28,
		"dist_m": 1.08,
		"base_dmg": 32.0,
		"poise_dmg": 28.0,
		"dmg_type": "blunt",
		"target_zone": "chest",
		"focus_cost": 25.0,
	},
	{
		"attack": "throw_shoulder",
		"label": "Shoulder Throw",
		"short": "Shoulder Throw",
		"style": "martial_arts",
		"skill_min": 75.0,
		"hit_t": 0.50,
		"hit_y": 1.15,
		"dist_m": 0.82,
		"base_dmg": 36.0,
		"poise_dmg": 40.0,
		"dmg_type": "blunt",
		"target_zone": "chest",
		"grapple": true,
		"focus_cost": 30.0,
		"outcomes": {
			"hit": {"clips": ["knock_down"], "lead_s": 0.04, "followup": "ual_get_up"},
		},
	},
	{
		"attack": "throw_grip",
		"label": "Grapple Throw",
		"short": "Grip Throw",
		"style": "martial_arts",
		"skill_min": 75.0,
		"hit_t": 0.52,
		"hit_y": 1.15,
		"dist_m": 0.82,
		"base_dmg": 34.0,
		"poise_dmg": 38.0,
		"dmg_type": "blunt",
		"target_zone": "chest",
		"grapple": true,
		"focus_cost": 30.0,
		"outcomes": {
			"hit": {"clips": ["knock_down"], "lead_s": 0.04, "followup": "ual_get_up"},
		},
	},
	{
		"attack": "slash_left",
		"label": "Left Sword Slash",
		"short": "Slash L",
		"style": "sword",
		"skill_min": 0.0,
		"hit_t": 0.42,
		"hit_y": 1.26,
		"dist_m": 1.38,
		"base_dmg": 26.0,
		"poise_dmg": 18.0,
		"dmg_type": "cut",
		"target_zone": "right_arm",
	},
	{
		"attack": "slash_right",
		"label": "Right Sword Slash",
		"short": "Slash R",
		"style": "sword",
		"skill_min": 0.0,
		"hit_t": 0.44,
		"hit_y": 1.26,
		"dist_m": 1.38,
		"base_dmg": 28.0,
		"poise_dmg": 20.0,
		"dmg_type": "cut",
		"target_zone": "left_arm",
	},
	{
		"attack": "ual_sword_dash",
		"label": "Lunging Dash Slash",
		"short": "Dash Slash",
		"style": "sword",
		"skill_min": 25.0,
		"hit_t": 0.48,
		"hit_y": 1.24,
		"dist_m": 1.75,
		"base_dmg": 32.0,
		"poise_dmg": 24.0,
		"dmg_type": "cut",
		"target_zone": "chest",
		"lunge": true,
	},
	{
		"attack": "axe_chop",
		"label": "Heavy Axe Chop",
		"short": "Axe Chop",
		"style": "axe",
		"skill_min": 0.0,
		"hit_t": 0.58,
		"hit_y": 1.34,
		"dist_m": 1.34,
		"base_dmg": 42.0,
		"poise_dmg": 48.0,
		"dmg_type": "cut",
		"target_zone": "right_arm",
		"heavy": true,
		"outcomes": {
			"block": {"clips": ["parry_2h", "block_2", "block"], "lead_s": 0.14, "counter": null},
			"parry": {"clips": ["parry_2h", "parry"], "lead_s": 0.14, "counter": "slash_right"},
			"hit": {"clips": ["ual_knockback", "hit_body", "ual_hit_chest"], "lead_s": 0.05, "followup": null},
			"guard_break": {"clips": ["knock_down"], "lead_s": 0.05, "followup": "ual_get_up"},
		},
	},
	{
		"attack": "blunt_swing",
		"label": "Heavy Blunt Swing",
		"short": "Blunt Swing",
		"style": "blunt",
		"skill_min": 0.0,
		"hit_t": 0.60,
		"hit_y": 1.28,
		"dist_m": 1.32,
		"base_dmg": 36.0,
		"poise_dmg": 46.0,
		"dmg_type": "blunt",
		"target_zone": "chest",
		"heavy": true,
	},
	{
		"attack": "spear_thrust",
		"label": "Spear Thrust",
		"short": "Spear Thrust",
		"style": "polearm",
		"skill_min": 0.0,
		"hit_t": 0.44,
		"hit_y": 1.22,
		"dist_m": 1.92,
		"base_dmg": 29.0,
		"poise_dmg": 20.0,
		"dmg_type": "pierce",
		"target_zone": "chest",
	},
	{
		"attack": "ual_shield_bash",
		"label": "Shield Bash",
		"short": "Shield Bash",
		"style": "shield",
		"skill_min": 0.0,
		"hit_t": 0.40,
		"hit_y": 1.20,
		"dist_m": 1.05,
		"base_dmg": 14.0,
		"poise_dmg": 40.0,
		"dmg_type": "blunt",
		"target_zone": "chest",
		"heavy": true,
		"focus_cost": 20.0,
	},
	{
		"attack": "bow_shot",
		"label": "Bow Shot",
		"short": "Bow Shot",
		"style": "ranged",
		"skill_min": 0.0,
		"hit_t": 0.46,
		"hit_y": 1.30,
		"dist_m": 12.0,
		"base_dmg": 30.0,
		"poise_dmg": 14.0,
		"dmg_type": "pierce",
		"target_zone": "chest",
		"ranged": true,
	},
	{
		"attack": "gun_shot",
		"label": "Rifle Shot",
		"short": "Rifle Shot",
		"style": "ranged",
		"skill_min": 0.0,
		"hit_t": 0.28,
		"hit_y": 1.28,
		"dist_m": 18.0,
		"base_dmg": 48.0,
		"poise_dmg": 22.0,
		"dmg_type": "pierce",
		"target_zone": "chest",
		"ranged": true,
		"needs_reload": true,
	},
]

var source_path := ""
var idle_clip := "unarmed_guard"
var style_idles := {
	"unarmed": "unarmed_guard",
	"martial_arts": "unarmed_guard",
	"sword": "ual_sword_idle",
	"heavy": "combat_idle",
	"polearm": "combat_idle",
	"shield": "ual_shield_up",
	"ranged": "walk_shoot",
	"arcane": "combat_idle",
	"thorax_4arm": "combat_idle",
	"dorsal_4arm": "combat_idle",
	"arthropod": "arthro_idle",
}
var rules := DEFAULT_RULES.duplicate(true)
var fighters: Array = []
var choreography: Array = []
var extraplanar_choreography: Array = []
var fourarm_choreography: Array = []
var arthropod_choreography: Array = []
var _links: Array[Dictionary] = []
var _by_key: Dictionary = {}


func _init(path: String = "") -> void:
	load_from_file(path)


static func candidate_paths(preferred_path: String = "") -> Array[String]:
	var out: Array[String] = []
	if preferred_path != "":
		out.append(preferred_path)
	out.append("res://data/characters/combat-links.json")
	out.append("res://data/combat-links.json")
	var proj_root := ProjectSettings.globalize_path("res://").simplify_path()
	var repo_root := proj_root.get_base_dir()
	out.append(repo_root.path_join("core/charactermodels/data/combat-links.json"))
	return out


func load_from_file(preferred_path: String = "") -> bool:
	_links.clear()
	_by_key.clear()
	rules = DEFAULT_RULES.duplicate(true)
	fighters = []
	choreography = []
	extraplanar_choreography = []
	fourarm_choreography = []
	arthropod_choreography = []
	source_path = ""

	var parsed = null
	for p in candidate_paths(preferred_path):
		if FileAccess.file_exists(p):
			var txt := FileAccess.get_file_as_string(p)
			var j = JSON.parse_string(txt)
			if j is Dictionary:
				parsed = j
				source_path = p
				break

	if parsed is Dictionary:
		idle_clip = String(parsed.get("idle_clip", "unarmed_guard"))
		if parsed.get("style_idles") is Dictionary:
			for sk in parsed["style_idles"]:
				style_idles[String(sk)] = String(parsed["style_idles"][sk])
		var r_in: Variant = parsed.get("rules", {})
		if r_in is Dictionary:
			for k in r_in:
				rules[k] = r_in[k]
		if parsed.get("fighters") is Array:
			fighters = parsed["fighters"].duplicate(true)
		if parsed.get("choreography") is Array:
			choreography = parsed["choreography"].duplicate(true)
		if parsed.get("extraplanar_choreography") is Array:
			extraplanar_choreography = parsed["extraplanar_choreography"].duplicate(true)
		if parsed.get("fourarm_choreography") is Array:
			fourarm_choreography = parsed["fourarm_choreography"].duplicate(true)
		if parsed.get("arthropod_choreography") is Array:
			arthropod_choreography = parsed["arthropod_choreography"].duplicate(true)
		for raw_link in parsed.get("links", []):
			if raw_link is Dictionary and raw_link.has("attack"):
				_register_link(_normalize_link(raw_link))

	for sup in SUPPLEMENTAL_LINKS:
		var key := String(sup["attack"])
		if not _by_key.has(key):
			_register_link(_normalize_link(sup))

	return source_path != ""


func _register_link(norm: Dictionary) -> void:
	var key := String(norm["attack"])
	if _by_key.has(key):
		var idx := _links.find(_by_key[key])
		if idx >= 0:
			_links[idx] = norm
	else:
		_links.append(norm)
	_by_key[key] = norm


static func ma_tier_for_skill(skill_level: float) -> int:
	if skill_level >= 75.0:
		return 4
	if skill_level >= 50.0:
		return 3
	if skill_level >= 25.0:
		return 2
	return 1


static func _infer_target_zone(attack_key: String, hit_y: float) -> String:
	if attack_key == "leg_sweep" or hit_y < 0.65:
		return "left_leg"
	if hit_y >= 1.31:
		return "head"
	if hit_y < 1.10:
		return "stomach"
	return "chest"


static func _normalize_link(raw: Dictionary) -> Dictionary:
	var key := String(raw.get("attack", "jab_l"))
	var clip := String(raw.get("clip", key))
	var defs: Dictionary = MOVE_STAT_DEFAULTS.get(key, {})
	var style := String(raw.get("style", defs.get("style", "martial_arts")))
	if style == "unarmed":
		style = "martial_arts"

	var hit_t := maxf(0.05, float(raw.get("hit_t", 0.42)))
	var hit_y := float(raw.get("hit_y", 1.25))
	var dist_m := maxf(0.5, float(raw.get("dist_m", 1.08)))
	var default_skill := float(MA_SKILL_DEFAULTS.get(key, 0.0)) if style == "martial_arts" else 0.0
	var skill_min := float(raw.get("skill_min", default_skill))
	var tier := int(raw.get("tier", ma_tier_for_skill(skill_min)))
	var base_dmg := float(raw.get("base_dmg", defs.get("base_dmg", 18.0)))
	var poise_dmg := float(raw.get("poise_dmg", defs.get("poise_dmg", 16.0)))
	var dmg_type := String(raw.get("dmg_type", defs.get("dmg_type", "blunt" if style == "martial_arts" else "cut")))
	var target_zone := String(raw.get("target_zone", defs.get("target_zone", _infer_target_zone(key, hit_y))))

	var is_Armed := style != "martial_arts"
	var raw_out: Dictionary = raw.get("outcomes", {}) if raw.get("outcomes") is Dictionary else {}
	var outcomes := {}

	var def_block_clips := ["block", "parry", "ual_sword_block"] if is_Armed else ["guard_block_1", "guard_block_2", "guard_block_3"]
	var def_parry_clips := ["parry", "parry_2h"] if is_Armed else ["guard_block_3", "parry"]
	var def_dodge_clips := ["dodge_step", "dodge_back", "dodge_spin"]
	var def_hit_clips := ["hit_face", "ual_hit_head"] if target_zone == "head" else ["hit_body", "ual_hit_chest"]

	outcomes["dodge"] = _norm_outcome(raw_out.get("dodge"), def_dodge_clips, 0.14, "counterstrike" if style == "martial_arts" else null, null)
	outcomes["block"] = _norm_outcome(raw_out.get("block"), def_block_clips, 0.12, null, null)
	outcomes["parry"] = _norm_outcome(raw_out.get("parry"), def_parry_clips, 0.12, "counterstrike" if style == "martial_arts" else "slash_right", null)
	outcomes["perfect_parry"] = _norm_outcome(raw_out.get("perfect_parry", raw_out.get("parry")), def_parry_clips, 0.12, "counterstrike" if style == "martial_arts" else "slash_right", null)
	outcomes["hit"] = _norm_outcome(raw_out.get("hit"), def_hit_clips, 0.04, null, null)
	outcomes["guard_break"] = _norm_outcome(raw_out.get("guard_break"), ["knock_down"], 0.05, null, "ual_get_up")
	outcomes["knockdown"] = _norm_outcome(raw_out.get("knockdown"), ["knock_down"], 0.05, null, "ual_get_up")

	return {
		"attack": key,
		"clip": clip,
		"label": String(raw.get("label", key.capitalize())),
		"short": String(raw.get("short", raw.get("label", key))),
		"style": style,
		"archetype": String(raw.get("archetype", defs.get("archetype", ""))),
		"skill_min": skill_min,
		"tier": tier,
		"hit_t": hit_t,
		"hit_y": hit_y,
		"dist_m": dist_m,
		"base_dmg": base_dmg,
		"poise_dmg": poise_dmg,
		"dmg_type": dmg_type,
		"target_zone": target_zone,
		"aoe": bool(raw.get("aoe", defs.get("aoe", false))),
		"vfx": String(raw.get("vfx", defs.get("vfx", ""))),
		"sfx": String(raw.get("sfx", defs.get("sfx", ""))),
		"four_arm_move": String(raw.get("four_arm_move", defs.get("four_arm_move", ""))),
		"sever_bonus": bool(raw.get("sever_bonus", defs.get("sever_bonus", false))),
		"focus_cost": float(raw.get("focus_cost", defs.get("focus_cost", 0.0))),
		"heavy": bool(raw.get("heavy", defs.get("heavy", poise_dmg >= 35.0))),
		"sweep": bool(raw.get("sweep", defs.get("sweep", key == "leg_sweep"))),
		"grapple": bool(raw.get("grapple", defs.get("grapple", false))),
		"lunge": bool(raw.get("lunge", defs.get("lunge", false))),
		"ranged": bool(raw.get("ranged", defs.get("ranged", style == "ranged"))),
		"needs_reload": bool(raw.get("needs_reload", defs.get("needs_reload", raw.get("attacker_followup", "") != ""))),
		"attacker_followup": String(raw.get("attacker_followup", "")),
		"vuln_window_s": float(raw.get("vuln_window_s", 1.35)),
		"outcomes": outcomes,
	}


static func _norm_outcome(raw_entry: Variant, default_clips: Array, default_lead: float, default_counter: Variant, default_followup: Variant) -> Dictionary:
	var e: Dictionary = raw_entry if raw_entry is Dictionary else {}
	var clips: Array = []
	if e.get("clips") is Array and (e["clips"] as Array).size() > 0:
		for c in e["clips"]:
			clips.append(String(c))
	else:
		for c in default_clips:
			clips.append(String(c))
	var ctr: Variant = e.get("counter", e.get("riposte", default_counter))
	return {
		"clips": clips,
		"lead_s": float(e.get("lead_s", default_lead)),
		"counter": ctr,
		"riposte": e.get("riposte", ctr),
		"followup": e.get("followup", default_followup),
	}


func has_link(attack_key: String) -> bool:
	return _by_key.has(attack_key)


func get_link(attack_key: String) -> Dictionary:
	if _by_key.has(attack_key):
		return _by_key[attack_key]
	if _links.size() > 0:
		return _links[0]
	return _normalize_link({"attack": attack_key})


func all_links() -> Array[Dictionary]:
	return _links.duplicate()


func links_for_style(style: String, skill_level: float = 100.0) -> Array[Dictionary]:
	var norm_style := style.to_lower()
	if norm_style == "unarmed" or norm_style == "ma":
		norm_style = "martial_arts"
	var out: Array[Dictionary] = []
	for l in _links:
		var ls := String(l["style"]).to_lower()
		var style_ok := false
		if norm_style == "" or norm_style == "any":
			style_ok = true
		elif norm_style == "armed" or norm_style == "melee":
			style_ok = ls in ["sword", "axe", "blunt", "heavy", "polearm", "shield", "melee"]
		elif norm_style == "axe":
			style_ok = (ls == "axe") or (ls == "heavy" and String(l["attack"]).begins_with("axe"))
		elif norm_style == "blunt":
			style_ok = (ls == "blunt") or (ls == "heavy" and String(l["dmg_type"]) == "blunt")
		else:
			style_ok = (ls == norm_style)
		if style_ok and float(l["skill_min"]) <= skill_level + 1e-5:
			out.append(l)
	return out


func links_for_archetype(archetype: String, skill_level: float = 100.0) -> Array[Dictionary]:
	var norm_arch := archetype.to_lower()
	var out: Array[Dictionary] = []
	for l in _links:
		if String(l["style"]).to_lower() == "arthropod":
			var la := String(l.get("archetype", "")).to_lower()
			if (norm_arch == "" or la == "" or la == norm_arch) and float(l["skill_min"]) <= skill_level + 1e-5:
				out.append(l)
	return out


static func _has_clip_in(available_clips: Variant, clip_name: String) -> bool:
	if available_clips == null or clip_name == "":
		return false
	if available_clips is Dictionary:
		return (available_clips as Dictionary).has(clip_name)
	if available_clips is Array:
		return (available_clips as Array).has(clip_name)
	if available_clips is PackedStringArray:
		return (available_clips as PackedStringArray).has(clip_name)
	if available_clips is AnimationPlayer:
		return (available_clips as AnimationPlayer).has_animation(clip_name)
	if available_clips is Object and available_clips.get("player") is AnimationPlayer:
		return (available_clips.get("player") as AnimationPlayer).has_animation(clip_name)
	return false


static func resolve_clip(available_clips: Variant, preferred: String) -> String:
	if available_clips == null or preferred == "":
		return preferred
	if _has_clip_in(available_clips, preferred):
		return preferred
	if CLIP_FALLBACKS.has(preferred):
		for cand in CLIP_FALLBACKS[preferred]:
			if _has_clip_in(available_clips, cand):
				return cand
	if _has_clip_in(available_clips, "combat_idle"):
		return "combat_idle"
	if _has_clip_in(available_clips, "idle"):
		return "idle"
	return preferred
