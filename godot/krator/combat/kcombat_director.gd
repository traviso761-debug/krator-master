# KCombatDirector: Squad Attack Slot Manager (default 2, configurable 1..3 per defender with priority wait queue),
# Paired Exchange Coordinator (reaction lead_s, contact hit_t, spacing glide to dist_m, 100 ms grapple align),
# and RTWP Tactical Pause controller.
class_name KCombatDirector
extends Node

signal slot_granted(attacker: Node, defender: Node)
signal slot_released(attacker: Node, defender: Node)
signal slot_queued(attacker: Node, defender: Node, queue_index: int)
signal exchange_started(exchange: Dictionary)
signal exchange_reaction(exchange: Dictionary)
signal exchange_contact(exchange: Dictionary, hit_report: Dictionary)
signal exchange_finished(exchange: Dictionary)
signal tactical_pause_changed(paused: bool)

@export_range(1, 3) var default_attack_slots: int = 2
var tactical_paused: bool = false
var links: KCombatLinks = null

var _fighters: Array[KCombatBrain] = []
var _defender_slot_caps: Dictionary = {}       # defender_id -> int (1..3)
var _active_slots: Dictionary = {}             # defender_id -> Array[Node]
var _wait_queues: Dictionary = {}              # defender_id -> Array[Dictionary {attacker, priority, seq}]
var _queue_seq: int = 0

var _exchanges: Array[Dictionary] = []
var _exchange_seq: int = 0
var _clip_cursor: int = 0
var rng := RandomNumberGenerator.new()


func _init(p_links: KCombatLinks = null) -> void:
	links = p_links if p_links != null else KCombatLinks.new()
	default_attack_slots = clampi(int(links.rules.get("default_attack_slots", 2)), 1, 3)
	rng.seed = 0x4B524154


func _process(dt: float) -> void:
	tick(dt)


# ---- Fighter Registration & RTWP Tactical Pause ----

func register_fighter(brain: KCombatBrain) -> void:
	if brain == null:
		return
	if not _fighters.has(brain):
		_fighters.append(brain)
	brain.director = self
	if brain.links == null:
		brain.links = links


func unregister_fighter(brain: KCombatBrain) -> void:
	if brain == null:
		return
	_fighters.erase(brain)
	release_all_slots_for(brain)


func set_tactical_pause(paused: bool) -> void:
	if tactical_paused == paused:
		return
	tactical_paused = paused
	tactical_pause_changed.emit(tactical_paused)
	if not tactical_paused:
		for f in _fighters:
			if is_instance_valid(f):
				f.flush_paused_queue()


func toggle_tactical_pause() -> bool:
	set_tactical_pause(not tactical_paused)
	return tactical_paused


# ---- Attack Slot Management (Default 2, Configurable 1..3 + Priority Queue) ----

func set_defender_max_slots(defender: Node, max_slots: int) -> void:
	if defender == null:
		return
	_defender_slot_caps[defender.get_instance_id()] = clampi(max_slots, 1, 3)
	_promote_waiting_attackers(defender)


func get_defender_max_slots(defender: Node) -> int:
	if defender == null:
		return default_attack_slots
	var did := defender.get_instance_id()
	return int(_defender_slot_caps.get(did, default_attack_slots))


func has_slot(attacker: Node, defender: Node) -> bool:
	if attacker == null or defender == null:
		return false
	var list := _get_active_list(defender)
	return list.has(attacker)


func active_slot_count(defender: Node) -> int:
	return _get_active_list(defender).size() if defender != null else 0


func queued_attacker_count(defender: Node) -> int:
	return _get_wait_queue(defender).size() if defender != null else 0


func get_queued_attackers(defender: Node) -> Array[Node]:
	var out: Array[Node] = []
	for entry in _get_wait_queue(defender):
		if is_instance_valid(entry["attacker"]):
			out.append(entry["attacker"])
	return out


func request_slot(attacker: Node, defender: Node, priority: float = 0.0) -> bool:
	if attacker == null or defender == null or attacker == defender:
		return false
	var active_list := _get_active_list(defender)
	if active_list.has(attacker):
		return true

	var cap := get_defender_max_slots(defender)
	var wq := _get_wait_queue(defender)
	var front_is_me: bool = wq.is_empty() or (wq[0]["attacker"] == attacker)

	if active_list.size() < cap and front_is_me:
		_remove_from_wait_queue(defender, attacker)
		active_list.append(attacker)
		slot_granted.emit(attacker, defender)
		return true

	# Otherwise place/update in priority wait queue
	var found := false
	for entry in wq:
		if entry["attacker"] == attacker:
			entry["priority"] = maxf(float(entry["priority"]), priority)
			found = true
			break
	if not found:
		_queue_seq += 1
		wq.append({"attacker": attacker, "priority": priority, "seq": _queue_seq})
	_sort_wait_queue(wq)
	var q_idx := 0
	for i in wq.size():
		if wq[i]["attacker"] == attacker:
			q_idx = i
			break
	slot_queued.emit(attacker, defender, q_idx)
	return false


func release_slot(attacker: Node, defender: Node) -> void:
	if attacker == null or defender == null:
		return
	var active_list := _get_active_list(defender)
	var removed := active_list.has(attacker)
	active_list.erase(attacker)
	_remove_from_wait_queue(defender, attacker)
	if removed:
		slot_released.emit(attacker, defender)
	_promote_waiting_attackers(defender)


func release_all_slots_for(fighter: Node) -> void:
	if fighter == null:
		return
	var fid := fighter.get_instance_id()
	_active_slots.erase(fid)
	_wait_queues.erase(fid)
	for did in _active_slots.keys():
		var arr: Array = _active_slots[did]
		arr.erase(fighter)
	for did in _wait_queues.keys():
		var wq: Array = _wait_queues[did]
		for i in range(wq.size() - 1, -1, -1):
			if wq[i]["attacker"] == fighter:
				wq.remove_at(i)


func _get_active_list(defender: Node) -> Array:
	var did := defender.get_instance_id()
	if not _active_slots.has(did):
		_active_slots[did] = []
	var arr: Array = _active_slots[did]
	for i in range(arr.size() - 1, -1, -1):
		if not is_instance_valid(arr[i]):
			arr.remove_at(i)
	return arr


func _get_wait_queue(defender: Node) -> Array:
	var did := defender.get_instance_id()
	if not _wait_queues.has(did):
		_wait_queues[did] = []
	var arr: Array = _wait_queues[did]
	for i in range(arr.size() - 1, -1, -1):
		if not is_instance_valid(arr[i]["attacker"]):
			arr.remove_at(i)
	return arr


static func _sort_wait_queue(wq: Array) -> void:
	wq.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
		if not is_equal_approx(float(a["priority"]), float(b["priority"])):
			return float(a["priority"]) > float(b["priority"])
		return int(a["seq"]) < int(b["seq"])
	)


func _remove_from_wait_queue(defender: Node, attacker: Node) -> void:
	var wq := _get_wait_queue(defender)
	for i in range(wq.size() - 1, -1, -1):
		if wq[i]["attacker"] == attacker:
			wq.remove_at(i)


func _promote_waiting_attackers(defender: Node) -> void:
	var active_list := _get_active_list(defender)
	var wq := _get_wait_queue(defender)
	var cap := get_defender_max_slots(defender)
	while active_list.size() < cap and not wq.is_empty():
		var entry: Dictionary = wq.pop_front()
		var atk: Node = entry["attacker"]
		if is_instance_valid(atk) and not active_list.has(atk):
			active_list.append(atk)
			slot_granted.emit(atk, defender)
			if atk.has_method("on_slot_promoted"):
				atk.on_slot_promoted(defender)


# ---- Paired Exchange Coordinator ----

func begin_exchange(attacker: KCombatBrain, defender: KCombatBrain, link_or_key: Variant, forced_outcome: String = "") -> Dictionary:
	if attacker == null or defender == null:
		return {}
	register_fighter(attacker)
	register_fighter(defender)
	attacker.target_brain = defender

	var link: Dictionary
	if link_or_key is Dictionary:
		link = KCombatLinks._normalize_link(link_or_key)
	else:
		link = links.get_link(String(link_or_key))

	# Enforce Attack Slots for melee exchanges
	if not bool(link.get("ranged", false)):
		var prio := attacker.stats.melee_attack + attacker.stats.martial_arts if attacker.stats != null else 0.0
		if not request_slot(attacker, defender, prio):
			return {"ok": false, "queued": true, "attacker": attacker, "defender": defender}

	var used_riposte := attacker.consume_riposte()
	var mid_swing_auto := false
	var outcome := forced_outcome
	if outcome == "":
		var rolled := _evaluate_outcome(attacker, defender, link)
		outcome = String(rolled["outcome"])
		mid_swing_auto = bool(rolled["mid_swing"])

	var out_spec := _outcome_spec(link, outcome)
	var react_clip := _pick_clip(out_spec.get("clips", ["hit_body"]))
	var cadence := attacker.stance_cadence_mult()
	var contact_t := maxf(0.05, float(link.get("hit_t", 0.42)) / cadence)
	var lead_s := float(out_spec.get("lead_s", 0.08))
	var react_t := maxf(0.0, contact_t - lead_s)

	var base_dist := float(link.get("dist_m", 1.08))
	if bool(link.get("lunge", false)) and attacker.stats != null:
		base_dist *= attacker.stats.lunge_multiplier()

	_exchange_seq += 1
	var ex := {
		"ok": true,
		"id": _exchange_seq,
		"attacker": attacker,
		"defender": defender,
		"link": link,
		"outcome": outcome,
		"react_clip": react_clip,
		"followup_clip": out_spec.get("followup"),
		"counter_clip": out_spec.get("counter"),
		"contact_t": contact_t,
		"react_t": react_t,
		"dist_m": base_dist,
		"grapple": bool(link.get("grapple", false)),
		"used_riposte": used_riposte,
		"mid_swing_parry": mid_swing_auto,
		"manual_defense": false,
		"elapsed": 0.0,
		"reacted": false,
		"contacted": false,
		"done": false,
		"hit_report": {},
	}
	_exchanges.append(ex)

	attacker.enter_windup(link)
	exchange_started.emit(ex)
	return ex


func find_incoming_exchange_for(defender: KCombatBrain) -> Dictionary:
	var best := {}
	var best_rem := INF
	for ex in _exchanges:
		if ex["defender"] == defender and not bool(ex["contacted"]) and not bool(ex["done"]):
			var rem := float(ex["contact_t"]) - float(ex["elapsed"])
			if rem < best_rem:
				best_rem = rem
				best = ex
	return best


func upgrade_exchange_defense(exchange_id: int, new_outcome: String, meta: Dictionary = {}) -> bool:
	for ex in _exchanges:
		if int(ex["id"]) == exchange_id and not bool(ex["contacted"]) and not bool(ex["done"]):
			var link: Dictionary = ex["link"]
			var out_spec := _outcome_spec(link, new_outcome)
			ex["outcome"] = new_outcome
			ex["react_clip"] = _pick_clip(out_spec.get("clips", ["parry"]))
			ex["counter_clip"] = out_spec.get("counter")
			ex["followup_clip"] = out_spec.get("followup")
			ex["mid_swing_parry"] = bool(meta.get("mid_swing", false))
			ex["manual_defense"] = bool(meta.get("manual", true))
			var lead_s := float(out_spec.get("lead_s", 0.12))
			ex["react_t"] = maxf(0.0, float(ex["contact_t"]) - lead_s)
			if float(ex["elapsed"]) >= float(ex["react_t"]) and not bool(ex["reacted"]):
				_trigger_reaction(ex)
			return true
	return false


func _evaluate_outcome(attacker: KCombatBrain, defender: KCombatBrain, link: Dictionary) -> Dictionary:
	# Ranged frontal block in GUARD stance
	if bool(link.get("ranged", false)) and defender.blocks_frontal_ranged() and defender.can_defend_now(false):
		return {"outcome": "block", "mid_swing": false}

	var mid_swing := false
	if not defender.can_defend_now(true):
		return {"outcome": "hit", "mid_swing": false}
	if defender.state in [KCombatBrain.State.WINDUP, KCombatBrain.State.RECOVERY]:
		if defender.consume_mid_swing_parry():
			mid_swing = true
		else:
			return {"outcome": "hit", "mid_swing": false}

	var atk_skill := attacker.stats.martial_arts if String(link.get("style")) in ["martial_arts", "arcane"] else attacker.stats.melee_attack
	var def_skill := defender.stats.melee_defense
	var dodge_skill := defender.stats.dodge

	if defender.stance == KCombatBrain.Stance.EVASIVE and not mid_swing:
		var dodge_chance := clampf(0.45 + (dodge_skill - atk_skill) * 0.01, 0.12, 0.88)
		if rng.randf() < dodge_chance:
			return {"outcome": "dodge", "mid_swing": false}

	var defend_chance := clampf(0.45 + (def_skill - atk_skill) * 0.01, 0.10, 0.90)
	if defender.stance == KCombatBrain.Stance.GUARD:
		defend_chance = clampf(defend_chance + 0.20, 0.15, 0.95)
	elif defender.stance == KCombatBrain.Stance.AGGRESSIVE:
		defend_chance *= 0.75

	if mid_swing:
		# 4-armed secondary arm pair deflects incoming strike mid-swing
		if rng.randf() < clampf(defend_chance + 0.15, 0.25, 0.95):
			return {"outcome": "parry", "mid_swing": true}
		return {"outcome": "hit", "mid_swing": false}

	if rng.randf() < defend_chance:
		var parry_share := clampf(def_skill / 120.0, 0.15, 0.65)
		return {"outcome": "parry" if rng.randf() < parry_share else "block", "mid_swing": false}

	return {"outcome": "hit", "mid_swing": false}


static func attacker_stat_for_link(st: KCombatStats, link: Dictionary, is_ma: bool) -> float:
	if st == null:
		return 15.0
	var dmg_type := String(link.get("dmg_type", "blunt"))
	if dmg_type == "arcane" or String(link.get("style", "")) == "arcane":
		return maxf(st.martial_arts, st.dexterity)
	var base := st.dexterity if (dmg_type == "cut" or dmg_type == "pierce") else st.strength
	if is_ma:
		base = maxf(base, st.martial_arts)
	return base


static func _outcome_spec(link: Dictionary, outcome: String) -> Dictionary:
	var outs: Dictionary = link.get("outcomes", {})
	if outs.has(outcome):
		return outs[outcome]
	if outcome == "perfect_parry" and outs.has("parry"):
		return outs["parry"]
	if outs.has("hit"):
		return outs["hit"]
	return {"clips": ["hit_body"], "lead_s": 0.05, "counter": null, "followup": null}


func _pick_clip(list: Array) -> String:
	if list.is_empty():
		return "hit_body"
	var c := String(list[_clip_cursor % list.size()])
	_clip_cursor += 1
	return c


# ---- Per-Frame Simulation & Paired Spacing Sync ----

func tick(dt: float) -> void:
	if dt <= 0.0 or tactical_paused:
		return

	for i in range(_exchanges.size() - 1, -1, -1):
		var ex: Dictionary = _exchanges[i]
		_step_exchange(ex, dt)
		if bool(ex["done"]):
			_exchanges.remove_at(i)

	for f in _fighters:
		if is_instance_valid(f):
			f.tick(dt)


func _step_exchange(ex: Dictionary, dt: float) -> void:
	var atk: KCombatBrain = ex["attacker"]
	var def: KCombatBrain = ex["defender"]
	if not is_instance_valid(atk) or not is_instance_valid(def):
		ex["done"] = true
		return

	# Respect attacker local hitstop on exchange clock prior to completion
	if atk.hitstop_remaining > 0.0 and bool(ex["contacted"]):
		return

	ex["elapsed"] = float(ex["elapsed"]) + dt
	var t := float(ex["elapsed"])

	# Smoothly glide paired spacing toward link.dist_m during windup (100 ms snap for paired grapples)
	if not bool(ex["contacted"]) and not bool(ex["link"].get("ranged", false)):
		_glide_spacing(atk, def, float(ex["dist_m"]), 0.10 if bool(ex["grapple"]) else 0.18, dt)

	# 1. Pre-contact reaction trigger at max(0, hit_t - lead_s)
	if not bool(ex["reacted"]) and t >= float(ex["react_t"]):
		if String(ex["outcome"]) in ["dodge", "block", "parry", "perfect_parry"]:
			_trigger_reaction(ex)

	# 2. Contact resolution at hit_t
	if not bool(ex["contacted"]) and t >= float(ex["contact_t"]):
		_resolve_contact(ex)

	# 3. Exchange lifecycle completion
	if bool(ex["contacted"]) and t >= float(ex["contact_t"]) + 0.12:
		ex["done"] = true
		exchange_finished.emit(ex)


func _glide_spacing(atk: KCombatBrain, def: KCombatBrain, want_dist: float, tau: float, dt: float) -> void:
	if atk.actor_3d == null or def.actor_3d == null:
		return
	var use_global := atk.actor_3d.is_inside_tree() and def.actor_3d.is_inside_tree()
	var pa := atk.actor_3d.global_position if use_global else atk.actor_3d.position
	var pd := def.actor_3d.global_position if use_global else def.actor_3d.position
	var delta := pd - pa
	delta.y = 0.0
	var cur := delta.length()
	var dir := (delta / cur) if cur > 1e-4 else Vector3.RIGHT
	var target_pa := pd - dir * want_dist
	target_pa.y = pa.y
	var alpha := 1.0 - exp(-dt / maxf(0.02, tau))
	if use_global:
		atk.actor_3d.global_position = pa.lerp(target_pa, alpha)
	else:
		atk.actor_3d.position = pa.lerp(target_pa, alpha)


func _trigger_reaction(ex: Dictionary) -> void:
	ex["reacted"] = true
	var def: KCombatBrain = ex["defender"]
	var out := String(ex["outcome"])
	var r_clip := String(ex["react_clip"])
	var dur := def.get_clip_duration(r_clip) * 0.55
	def.enter_defense_reaction(out, r_clip, dur, bool(ex["mid_swing_parry"]))
	exchange_reaction.emit(ex)


func _resolve_contact(ex: Dictionary) -> void:
	ex["contacted"] = true
	var atk: KCombatBrain = ex["attacker"]
	var def: KCombatBrain = ex["defender"]
	var link: Dictionary = ex["link"]
	var out := String(ex["outcome"])
	var is_ma := String(link.get("style", "")) == "martial_arts"
	var opp_def_skill := maxf(def.stats.melee_defense, def.stats.dodge)
	var atk_off_skill := atk.stats.martial_arts if is_ma else atk.stats.melee_attack

	var report := {"outcome": out, "aoe": bool(link.get("aoe", false)), "vfx": String(link.get("vfx", ""))}
	var hitstop_hit := float(links.rules.get("hitstop_hit_s", 0.06))
	var hitstop_block := float(links.rules.get("hitstop_block_s", 0.045))
	var hitstop_gb := float(links.rules.get("hitstop_guard_break_s", 0.07))

	match out:
		"perfect_parry":
			# 0 defender Poise lost! Attacker takes Poise damage + STAGGER, defender unlocks Riposte!
			var counter_poise := maxf(18.0, float(link.get("poise_dmg", 20.0)) * 0.65)
			atk.stats.apply_block_poise(counter_poise)
			atk.enter_stagger("ual_hit_chest", 0.55)
			if not bool(ex["reacted"]):
				def.enter_defense_reaction("perfect_parry", String(ex["react_clip"]), 0.28, bool(ex["mid_swing_parry"]))
			var c_clip := String(ex["counter_clip"]) if ex.get("counter_clip") != null else "counterstrike"
			def.grant_riposte_window(1.25, c_clip)
			atk.apply_local_hitstop(hitstop_block)
			def.apply_local_hitstop(hitstop_block)
			def.stats.grant_combat_xp("melee_defense", 1.2, atk_off_skill, 1.25)
			if is_ma:
				atk.stats.record_ma_strike_xp(opp_def_skill, false)
			report["defender_poise_lost"] = 0.0
			report["attacker_staggered"] = true
			report["riposte_unlocked"] = true
			report["mid_swing_parry"] = bool(ex["mid_swing_parry"])

		"parry":
			var chip := float(link.get("poise_dmg", 16.0)) * 0.15
			def.stats.apply_block_poise(chip)
			atk.enter_active_and_recover(link, 0.36)
			if not bool(ex["reacted"]):
				def.enter_defense_reaction("parry", String(ex["react_clip"]), 0.30, bool(ex["mid_swing_parry"]))
			if bool(ex["mid_swing_parry"]):
				def.mid_swing_parried.emit(int(ex["id"]))
			atk.apply_local_hitstop(hitstop_block)
			def.apply_local_hitstop(hitstop_block)
			def.stats.grant_combat_xp("melee_defense", 1.0, atk_off_skill, 1.0)
			if is_ma:
				atk.stats.record_ma_strike_xp(opp_def_skill, false)
			report["defender_poise_lost"] = chip
			report["mid_swing_parry"] = bool(ex["mid_swing_parry"])

		"block":
			atk.enter_active_and_recover(link)
			var p_dmg := float(link.get("poise_dmg", 18.0)) * atk.stance_poise_dmg_mult() * def.stance_block_poise_taken_mult()
			var guard_broken := def.stats.apply_block_poise(p_dmg)
			if guard_broken:
				ex["outcome"] = "guard_break"
				out = "guard_break"
				var gb_spec := _outcome_spec(link, "guard_break")
				var fall_clip := _pick_clip(gb_spec.get("clips", ["knock_down"]))
				var getup_clip := String(gb_spec.get("followup")) if gb_spec.get("followup") != null else "ual_get_up"
				def.enter_downed(fall_clip, getup_clip, 0.70, 0.65)
				atk.apply_local_hitstop(hitstop_gb)
				def.apply_local_hitstop(hitstop_gb)
				report["outcome"] = "guard_break"
				report["guard_broken"] = true
				report["fall_clip"] = fall_clip
				report["getup_clip"] = getup_clip
			else:
				if not bool(ex["reacted"]):
					def.enter_defense_reaction("block", String(ex["react_clip"]), 0.32, false)
				atk.apply_local_hitstop(hitstop_block)
				def.apply_local_hitstop(hitstop_block)
				report["guard_broken"] = false
			report["defender_poise_lost"] = p_dmg
			def.stats.grant_combat_xp("melee_defense", 0.85, atk_off_skill, 1.0)
			if is_ma:
				atk.stats.record_ma_strike_xp(opp_def_skill, false)

		"dodge":
			atk.enter_active_and_recover(link)
			if not bool(ex["reacted"]):
				def.enter_defense_reaction("dodge", String(ex["react_clip"]), 0.34, false)
			if ex.get("counter_clip") != null or def.stance == KCombatBrain.Stance.EVASIVE:
				var cc := String(ex["counter_clip"]) if ex.get("counter_clip") != null else "counterstrike"
				def.grant_riposte_window(1.10, cc)
			def.stats.grant_combat_xp("dodge", 1.0, atk_off_skill, 1.0)
			if is_ma:
				atk.stats.record_ma_strike_xp(opp_def_skill, false)
			report["defender_poise_lost"] = 0.0

		_:
			# Clean HIT, Sweep, or Knockdown
			atk.enter_active_and_recover(link)
			var is_sweep := bool(link.get("sweep", false)) or String(link.get("attack", "")) == "leg_sweep"
			if is_sweep and def.stats.is_immune_to_trip():
				# Extraplanar hover entity: immune to leg_sweep knockdowns -> converts trip into Poise damage!
				var hover_poise := float(link.get("poise_dmg", 28.0)) * 1.25
				var gb := def.stats.apply_block_poise(hover_poise)
				def.enter_stagger("ual_hit_chest", 0.38)
				atk.apply_local_hitstop(hitstop_block)
				def.apply_local_hitstop(hitstop_block)
				report["trip_immune_converted"] = true
				report["poise_damage"] = hover_poise
				report["knocked_down"] = false
				report["guard_broken"] = gb
			else:
				var dmg_type := String(link.get("dmg_type", "blunt"))
				var stat_driver := attacker_stat_for_link(atk.stats, link, is_ma)
				var raw_dmg := float(link.get("base_dmg", 18.0)) * (1.0 + stat_driver * 0.012)
				if bool(ex["used_riposte"]):
					raw_dmg *= 1.35
				var zone := String(link.get("target_zone", "chest"))
				var limb_rep := def.stats.apply_limb_damage(zone, raw_dmg, dmg_type, true)
				var poise_hit := float(link.get("poise_dmg", 16.0)) * 0.60 * atk.stance_poise_dmg_mult()
				var poise_broken := def.stats.apply_block_poise(poise_hit)

				var hit_spec := _outcome_spec(link, out)
				var r_clip := String(ex["react_clip"])
				var followup: Variant = hit_spec.get("followup")
				var causes_down: bool = (is_sweep or out == "knockdown" or out == "guard_break"
					or r_clip == "knock_down" or followup != null or poise_broken or bool(link.get("grapple", false)))

				if causes_down:
					var fall_c := "knock_down" if (r_clip != "fall_down" and r_clip != "knock_down") else r_clip
					var up_c := String(followup) if followup != null else "ual_get_up"
					def.enter_downed(fall_c, up_c, 0.70, 0.65)
					report["knocked_down"] = true
					report["fall_clip"] = fall_c
					report["getup_clip"] = up_c
				else:
					def.enter_stagger(r_clip, 0.44)
					report["knocked_down"] = false

				atk.apply_local_hitstop(hitstop_hit)
				def.apply_local_hitstop(hitstop_hit)
				report["limb_report"] = limb_rep
				report["used_riposte"] = bool(ex["used_riposte"])

			# Grant 100% attacker XP on landed strike + defender Toughness XP
			if is_ma:
				atk.stats.record_ma_strike_xp(opp_def_skill, true)
			elif bool(link.get("ranged", false)):
				atk.stats.grant_combat_xp("ranged", 1.0, opp_def_skill, 1.0)
			else:
				atk.stats.grant_combat_xp("melee_attack", 1.0, opp_def_skill, 1.0)
			def.stats.grant_combat_xp("toughness", 0.9, atk_off_skill, 1.0)

	ex["hit_report"] = report
	exchange_contact.emit(ex, report)
