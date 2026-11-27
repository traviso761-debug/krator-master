# KCombatStats: 7-Limb Health, Bleed, Dismemberment & Prosthetics, Poise/Focus gauges,
# Kenshi Stronger-Opponent XP (with Martial Arts 25%/100% fix), and Krator Species/Mod hooks.
class_name KCombatStats
extends RefCounted

const LIMBS := ["head", "chest", "stomach", "left_arm", "right_arm", "left_leg", "right_leg"]
const VITAL_LIMBS := ["head", "chest", "stomach"]
const SEVERABLE_LIMBS := ["left_arm", "right_arm", "left_leg", "right_leg"]

const SPECIES_LIMB_MULT := {
	"human": 1.0,
	"shek": 1.25,
	"giant": 1.60,
	"lizardman": 1.10,
	"coyote": 0.95,
	"frog": 0.95,
	"hykkousoi": 1.05,
	"skeleton": 2.0,
	"aidol": 2.0,
	"seraph": 1.35,
	"archon": 1.35,
	"medusa": 1.30,
	"revenant": 1.35,
	"djinn": 1.35,
}

const HOVER_SPECIES := ["seraph", "archon", "medusa", "revenant", "djinn"]
const FOUR_ARM_MODS := [
	"mod_arms_flesh",
	"mod_arms_cyber",
	"mod_arms_cyber_up",
	"mod_arms_loader",
	"mod_arms_loader_up",
	"mod_arms_surgical",
	"mod_arms_surgical_up",
]
const DIGITIGRADE_MODS := ["mod_legs_lizard", "mod_legs_coyote", "mod_legs_frog"]

const PROSTHETIC_HP := {
	"mod_arms_cyber": 150.0,
	"mod_arms_cyber_up": 150.0,
	"mod_arms_loader": 180.0,
	"mod_arms_loader_up": 180.0,
	"mod_arms_surgical": 135.0,
	"mod_arms_surgical_up": 135.0,
}

signal limb_damaged(limb: String, hp: float, max_hp: float, dmg: float)
signal limb_crippled(limb: String)
signal limb_severed(limb: String)
signal prosthetic_installed(limb: String, mod_id: String)
signal guard_broken()
signal xp_gained(skill_name: String, amount: float, new_value: float)

var species := "human"
var sever_mode := "frequent"              # "frequent" | "rare" | "never" (locked in: "frequent" active by default)
var is_hover_entity := false
var armor_weight_kg := 4.0

var char_record: Dictionary = {}
var char_kit: Dictionary = {}
var installed_mods: Array[String] = []
var explicit_arms := 0                    # >0 overrides derived arm count when testing without kit.json

# Core RPG Skills & Attributes (0..100)
var melee_attack := 15.0
var melee_defense := 15.0
var martial_arts := 15.0
var dodge := 15.0
var toughness := 15.0
var strength := 15.0
var dexterity := 15.0
var ranged := 15.0

var skill_xp: Dictionary = {
	"melee_attack": 0.0,
	"melee_defense": 0.0,
	"martial_arts": 0.0,
	"dodge": 0.0,
	"toughness": 0.0,
	"strength": 0.0,
	"dexterity": 0.0,
	"ranged": 0.0,
}

# Poise / Posture & Focus bars
var max_poise := 60.0
var poise := 60.0
var max_focus := 100.0
var focus := 100.0
var blood_pool := 100.0
var max_blood_pool := 100.0

# 7-Limb state dictionary: limb_name -> { hp, max_hp, bleed_rate, crippled, severed, prosthetic_id, armor_cut, armor_blunt, armor_pierce }
var limbs: Dictionary = {}


func _init(p_species: String = "human", base_hp: float = 100.0) -> void:
	species = p_species.to_lower()
	is_hover_entity = HOVER_SPECIES.has(species)
	_init_limbs(base_hp)
	recalculate_derived(true)


func _init_limbs(base_hp: float = 100.0) -> void:
	var mult := float(SPECIES_LIMB_MULT.get(species, 1.0))
	limbs.clear()
	for l in LIMBS:
		var mhp := base_hp * mult
		limbs[l] = {
			"hp": mhp,
			"max_hp": mhp,
			"bleed_rate": 0.0,
			"crippled": false,
			"severed": false,
			"prosthetic_id": "",
			"armor_cut": 0.0,
			"armor_blunt": 0.0,
			"armor_pierce": 0.0,
		}


func configure_from_kchar(rec: Dictionary, kit: Dictionary = {}) -> void:
	char_record = rec
	char_kit = kit
	installed_mods.clear()
	for m in rec.get("mods", []):
		installed_mods.append(String(m))
	var people_id := String(rec.get("people", "") if rec.get("people") != null else "").to_lower()
	var body_id := String(rec.get("body", kit.get("body", ""))).to_lower()
	if body_id.contains("giant"):
		set_species("giant")
	elif people_id != "" and SPECIES_LIMB_MULT.has(people_id):
		set_species(people_id)
	if HOVER_SPECIES.has(people_id):
		is_hover_entity = true


func set_species(new_species: String, base_hp: float = 100.0) -> void:
	species = new_species.to_lower()
	is_hover_entity = is_hover_entity or HOVER_SPECIES.has(species)
	var mult := float(SPECIES_LIMB_MULT.get(species, 1.0))
	for l in LIMBS:
		if not limbs.has(l):
			continue
		var st: Dictionary = limbs[l]
		if String(st["prosthetic_id"]) == "":
			var ratio := float(st["hp"]) / maxf(1.0, float(st["max_hp"]))
			st["max_hp"] = base_hp * mult
			st["hp"] = st["max_hp"] * ratio
	max_blood_pool = 100.0 * mult
	blood_pool = max_blood_pool


func recalculate_derived(fill_bars: bool = false) -> void:
	var old_max := maxf(1.0, max_poise)
	max_poise = 40.0 + toughness * 0.8 + strength * 0.4 + armor_weight_kg * 0.5
	max_focus = 100.0 + martial_arts * 0.25
	if fill_bars:
		poise = max_poise
		focus = max_focus
	else:
		poise = clampf(poise * (max_poise / old_max), 0.0, max_poise)
		focus = clampf(focus, 0.0, max_focus)


# ---- Krator Species & Mod Hooks ----

func get_arms_count() -> int:
	if explicit_arms > 0:
		return explicit_arms
	if not char_record.is_empty() and char_kit.has("items"):
		if KChar.arms(char_record, char_kit) >= 4:
			return 4
	for m in installed_mods:
		if FOUR_ARM_MODS.has(m):
			return 4
	for m in char_record.get("mods", []):
		if FOUR_ARM_MODS.has(String(m)):
			return 4
	# Count severed non-prosthetic arms as lost, unless 4-armed
	var base_arms := 4 if species == "giant" else 2
	return base_arms


func extra_parry_slots() -> int:
	return 1 if get_arms_count() >= 4 else 0


func is_digitigrade() -> bool:
	if not char_record.is_empty() and char_kit.has("items"):
		if KChar.replaces_feet(char_record, char_kit):
			return true
	for m in installed_mods:
		if DIGITIGRADE_MODS.has(m):
			return true
	for m in char_record.get("mods", []):
		if DIGITIGRADE_MODS.has(String(m)):
			return true
	return false


func lunge_multiplier() -> float:
	return 1.15 if is_digitigrade() else 1.0


func dodge_recovery_multiplier() -> float:
	return 0.85 if is_digitigrade() else 1.0


func is_immune_to_trip() -> bool:
	return is_hover_entity or HOVER_SPECIES.has(species)


# ---- 7-Limb Damage, Bleed, Severing & Cybernetic Prosthetics ----

func get_limb_hp(limb: String) -> float:
	return float(limbs.get(limb, {}).get("hp", 0.0))


func is_limb_crippled(limb: String) -> bool:
	return bool(limbs.get(limb, {}).get("crippled", false))


func is_limb_severed(limb: String) -> bool:
	return bool(limbs.get(limb, {}).get("severed", false))


func is_incapacitated() -> bool:
	if blood_pool <= 0.0:
		return true
	for v in VITAL_LIMBS:
		if float(limbs[v]["hp"]) < 0.0:
			return true
	return false


func apply_limb_damage(limb: String, raw_dmg: float, dmg_type: String = "blunt", defining_hit: bool = true) -> Dictionary:
	var zone := limb if limbs.has(limb) else "chest"
	var st: Dictionary = limbs[zone]
	if bool(st["severed"]):
		# Spill hits on an already-severed stump redirect to chest/torso
		zone = "chest"
		st = limbs[zone]

	var mit_key := "armor_" + dmg_type.to_lower()
	var armor_mit := clampf(float(st.get(mit_key, 0.0)), 0.0, 0.90)
	var toughness_mit := clampf(toughness * 0.003, 0.0, 0.30)
	var final_dmg := maxf(0.0, raw_dmg * (1.0 - armor_mit) * (1.0 - toughness_mit))

	var was_crippled := bool(st["crippled"])
	var was_severed := bool(st["severed"])
	st["hp"] = float(st["hp"]) - final_dmg

	# Bleed buildup on biological limbs from cut/pierce strikes
	var is_robotic := String(st["prosthetic_id"]) != "" or species in ["skeleton", "aidol"]
	if not is_robotic and final_dmg > 0.0:
		if dmg_type == "cut":
			st["bleed_rate"] = float(st["bleed_rate"]) + final_dmg * 0.045
		elif dmg_type == "pierce":
			st["bleed_rate"] = float(st["bleed_rate"]) + final_dmg * 0.030

	var now_crippled := float(st["hp"]) < 0.0
	st["crippled"] = now_crippled

	var now_severed := was_severed
	var max_hp := float(st["max_hp"])
	if (not was_severed
			and defining_hit
			and sever_mode != "never"
			and SEVERABLE_LIMBS.has(zone)
			and String(st["prosthetic_id"]) == ""
			and float(st["hp"]) <= -1.0 * max_hp):
		var allow_sever := true
		if sever_mode == "rare":
			allow_sever = (dmg_type == "cut" or final_dmg >= 0.35 * max_hp)
		if allow_sever:
			now_severed = true
			st["severed"] = true
			st["crippled"] = true
			st["hp"] = -1.0 * max_hp
			if not is_robotic:
				st["bleed_rate"] = float(st["bleed_rate"]) + 0.85

	limb_damaged.emit(zone, float(st["hp"]), max_hp, final_dmg)
	if now_crippled and not was_crippled:
		limb_crippled.emit(zone)
	if now_severed and not was_severed:
		limb_severed.emit(zone)

	return {
		"limb": zone,
		"damage": final_dmg,
		"hp": float(st["hp"]),
		"max_hp": max_hp,
		"bleed_rate": float(st["bleed_rate"]),
		"crippled": bool(st["crippled"]),
		"severed": bool(st["severed"]),
		"incapacitated": is_incapacitated(),
	}


func tick_bleed(dt: float) -> void:
	if dt <= 0.0:
		return
	var total_bleed := 0.0
	var clot_rate := 0.035 if species == "lizardman" else 0.020
	for l in LIMBS:
		var st: Dictionary = limbs[l]
		var br := float(st["bleed_rate"])
		if br > 0.0:
			total_bleed += br
			if not bool(st["severed"]):
				st["hp"] = float(st["hp"]) - br * dt * 0.35
				if float(st["hp"]) < 0.0:
					st["crippled"] = true
			st["bleed_rate"] = maxf(0.0, br - clot_rate * dt)
	if total_bleed > 0.0:
		blood_pool = maxf(0.0, blood_pool - total_bleed * dt)
	elif blood_pool < max_blood_pool:
		blood_pool = minf(max_blood_pool, blood_pool + 0.15 * dt)


func install_prosthetic(limb: String, mod_id: String, figure: Variant = null) -> bool:
	if not SEVERABLE_LIMBS.has(limb) or mod_id == "":
		return false
	var st: Dictionary = limbs[limb]
	var new_max := float(PROSTHETIC_HP.get(mod_id, 150.0))
	st["prosthetic_id"] = mod_id
	st["severed"] = false
	st["crippled"] = false
	st["bleed_rate"] = 0.0
	st["max_hp"] = new_max
	st["hp"] = new_max

	if not installed_mods.has(mod_id):
		installed_mods.append(mod_id)
	if not char_record.is_empty():
		var mods_arr: Array = char_record.get("mods", []).duplicate()
		if not mods_arr.has(mod_id):
			mods_arr.append(mod_id)
		char_record["mods"] = mods_arr
		if figure != null and figure is Object and figure.has_method("apply"):
			figure.apply(char_record)

	prosthetic_installed.emit(limb, mod_id)
	return true


# ---- Poise & Focus ----

func regen_poise(dt: float, is_guarding: bool = false, is_staggered: bool = false) -> void:
	if dt <= 0.0:
		return
	if not is_staggered:
		var rate := (4.5 if is_guarding else 14.0) * (1.0 + toughness * 0.005)
		poise = minf(max_poise, poise + rate * dt)
	focus = minf(max_focus, focus + 6.0 * dt)


func apply_block_poise(poise_dmg: float) -> bool:
	poise = maxf(0.0, poise - maxf(0.0, poise_dmg))
	var broken := poise <= 0.0
	if broken:
		guard_broken.emit()
	return broken


func restore_post_guard_break_poise() -> void:
	poise = max_poise * 0.65


func spend_focus(cost: float) -> bool:
	if cost <= 0.0:
		return true
	if focus + 1e-5 < cost:
		return false
	focus = maxf(0.0, focus - cost)
	return true


# ---- Kenshi Stronger-Opponent XP & Martial Arts Fix ----

static func xp_multiplier(my_skill: float, opp_skill: float) -> float:
	var delta := opp_skill - my_skill
	return clampf(1.0 + delta * 0.1, 0.1, 6.0)


func get_skill(skill_name: String) -> float:
	match skill_name:
		"melee_attack": return melee_attack
		"melee_defense": return melee_defense
		"martial_arts": return martial_arts
		"dodge": return dodge
		"toughness": return toughness
		"strength": return strength
		"dexterity": return dexterity
		"ranged": return ranged
	return 0.0


func set_skill(skill_name: String, val: float) -> void:
	var v := clampf(val, 0.0, 100.0)
	match skill_name:
		"melee_attack": melee_attack = v
		"melee_defense": melee_defense = v
		"martial_arts": martial_arts = v
		"dodge": dodge = v
		"toughness":
			toughness = v
			recalculate_derived(false)
		"strength":
			strength = v
			recalculate_derived(false)
		"dexterity": dexterity = v
		"ranged": ranged = v


func grant_combat_xp(skill_name: String, base_xp: float, opp_skill: float, outcome_scale: float = 1.0) -> float:
	if base_xp <= 0.0 or outcome_scale <= 0.0:
		return 0.0
	var cur := get_skill(skill_name)
	var mult := xp_multiplier(cur, opp_skill)
	# Higher levels require progressively more raw XP while respecting Stronger-Opponent multiplier
	var level_damp := 1.0 / (1.0 + cur * 0.04)
	var delta_skill := base_xp * mult * outcome_scale * level_damp
	var next_val := clampf(cur + delta_skill, 0.0, 100.0)
	set_skill(skill_name, next_val)
	skill_xp[skill_name] = float(skill_xp.get(skill_name, 0.0)) + base_xp * mult * outcome_scale
	xp_gained.emit(skill_name, delta_skill, next_val)
	return delta_skill


# Fixes Kenshi's Martial Arts training paradox: grants 25% XP on blocked/dodged strikes and 100% on landed hits.
func record_ma_strike_xp(opp_defense_skill: float, landed: bool, base_xp: float = 1.0) -> float:
	var scale := 1.0 if landed else 0.25
	return grant_combat_xp("martial_arts", base_xp, opp_defense_skill, scale)
