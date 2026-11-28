# KCombatBrain: Per-character Dual-Layer Code State Machine, Active Stances, 150 ms Input Buffer,
# RTWP Paused Command Queue, Skill-Scaled Active Parry/Dodge Windows (80..220 ms), and Local Hitstop.
# Strictly separates combat state logic from KCharFigure / AnimationPlayer visual playback.
class_name KCombatBrain
extends Node

enum State {
	IDLE,
	APPROACH,
	WINDUP,
	ACTIVE,
	RECOVERY,
	PARRY,
	BLOCK,
	DODGE,
	STAGGER,
	DOWNED,
	RELOAD,
}

enum Stance {
	AGGRESSIVE,
	BALANCED,
	GUARD,
	EVASIVE,
}

const INPUT_BUFFER_SEC := 0.15
const PARRY_WINDOW_MIN_SEC := 0.08
const PARRY_WINDOW_MAX_SEC := 0.22

signal state_changed(old_state: State, new_state: State)
signal stance_changed(new_stance: Stance)
signal clip_triggered(clip_name: String)
signal action_executed(action: Dictionary)
signal perfect_parry_triggered(exchange_id: int, mid_swing: bool)
signal active_dodge_triggered(exchange_id: int)
signal mid_swing_parried(exchange_id: int)
signal riposte_ready(duration_sec: float, counter_clip: String)

@export var fighter_id: String = "fighter"
var stats: KCombatStats = KCombatStats.new()
var links: KCombatLinks = null
var director: Node = null
var target_brain: KCombatBrain = null

# Visual bridge targets (all optional so headless logic tests and full 3D scenes share identical behavior)
var figure: KCharFigure = null
var anim_player: AnimationPlayer = null
var actor_3d: Node3D = null
var hitboxes: Array[KCombatHitbox] = []
var hurtboxes: Dictionary = {}

# State Machine
var state: State = State.IDLE
var stance: Stance = Stance.BALANCED
var state_time: float = 0.0
var state_duration: float = 0.0
var idle_clip: String = "unarmed_guard"
var current_clip: String = ""
var clip_history: Array[String] = []

# Downed two-stage recovery (e.g. knock_down -> ual_get_up -> IDLE)
var _downed_phase: int = 0
var _getup_clip: String = "ual_get_up"
var _getup_duration: float = 0.65

# Active swing tracking & 4-arm mid-swing parry counter
var active_attack_link: Dictionary = {}
var _swing_active_dur: float = 0.10
var _swing_recovery_dur: float = 0.30
var active_parry_used_in_swing: int = 0

# Local Hitstop (freezes ONLY this fighter's animation advance; NEVER touches Engine.time_scale)
var hitstop_remaining: float = 0.0

# Riposte & timing lockout
var riposte_window_remaining: float = 0.0
var riposte_counter_clip: String = "counterstrike"
var parry_lockout_remaining: float = 0.0
var dodge_lockout_remaining: float = 0.0

# 150 ms Input Buffer + RTWP Paused Queue
var _buffered_action: Dictionary = {}
var _buffer_remaining: float = 0.0
var paused_queue: Array[Dictionary] = []


func setup(p_id: String, p_stats: KCombatStats = null, p_links: KCombatLinks = null, p_director: Node = null, p_figure: KCharFigure = null) -> KCombatBrain:
	fighter_id = p_id
	if p_stats != null:
		stats = p_stats
	links = p_links if p_links != null else KCombatLinks.new()
	idle_clip = links.idle_clip
	director = p_director
	if p_figure != null:
		bind_figure(p_figure)
	return self


func bind_figure(p_figure: KCharFigure, create_boxes: bool = false) -> void:
	figure = p_figure
	if figure != null:
		actor_3d = figure
		anim_player = figure.player
		# Disable automatic KCharFigure._process so KCombatBrain controls local hitstop & RTWP pause cleanly
		figure.set_process(false)
		figure.looping = resolve_clip(idle_clip)
		if not figure.record.is_empty():
			stats.configure_from_kchar(figure.record, figure.kit)
		if create_boxes and figure.skeleton != null:
			hurtboxes = KCombatHitbox.attach_7zone_hurtboxes(figure.skeleton, self)
			var rh := KCombatHitbox.attach_weapon_hitbox(figure.skeleton, self, "RightHand")
			var lh := KCombatHitbox.attach_weapon_hitbox(figure.skeleton, self, "LeftHand")
			hitboxes = [rh, lh]


func _process(dt: float) -> void:
	# If managed by a KCombatDirector in the tree, KCombatDirector drives tick(dt) in deterministic order.
	if director == null:
		tick(dt)


func is_tactical_paused() -> bool:
	return director != null and bool(director.get("tactical_paused"))


# ---- Active Stance Multipliers ----

func set_stance(new_stance: Stance) -> void:
	if stance == new_stance:
		return
	stance = new_stance
	if stance == Stance.GUARD:
		idle_clip = "ual_shield_up" if figure != null and figure.held.get("L") == "shield" else "unarmed_guard"
	else:
		idle_clip = links.idle_clip if links != null else "unarmed_guard"
	if state == State.IDLE:
		play_resolved_clip(idle_clip)
	stance_changed.emit(stance)


func stance_cadence_mult() -> float:
	return 1.20 if stance == Stance.AGGRESSIVE else 1.0


func stance_poise_dmg_mult() -> float:
	return 1.20 if stance == Stance.AGGRESSIVE else 1.0


func stance_move_speed_mult() -> float:
	match stance:
		Stance.GUARD: return 0.60
		Stance.EVASIVE: return 1.10
		Stance.AGGRESSIVE: return 1.05
	return 1.0


func stance_block_poise_taken_mult() -> float:
	return 0.80 if stance == Stance.GUARD else 1.0


func stance_defense_window_mult() -> float:
	match stance:
		Stance.AGGRESSIVE: return 0.75
		Stance.GUARD: return 1.15
	return 1.0


func stance_dodge_window_mult() -> float:
	match stance:
		Stance.AGGRESSIVE: return 0.75
		Stance.EVASIVE: return 1.15
	return 1.0


func blocks_frontal_ranged() -> bool:
	return stance == Stance.GUARD


# ---- Skill-Scaled Timing Windows (80..220 ms) ----

static func skill_timing_window(skill_value: float) -> float:
	return lerpf(PARRY_WINDOW_MIN_SEC, PARRY_WINDOW_MAX_SEC, clampf(skill_value / 80.0, 0.0, 1.0))


func get_parry_window_sec() -> float:
	var base := skill_timing_window(stats.melee_defense if stats != null else 15.0)
	return clampf(base * stance_defense_window_mult(), 0.05, 0.30)


func get_dodge_window_sec() -> float:
	var base := skill_timing_window(stats.dodge if stats != null else 15.0)
	var enc_pen := 1.0
	if stats != null and stats.armor_weight_kg > 12.0:
		enc_pen = clampf(1.0 - (stats.armor_weight_kg - 12.0) * 0.02, 0.50, 1.0)
	return clampf(base * stance_dodge_window_mult() * enc_pen, 0.05, 0.30)


func has_riposte() -> bool:
	return riposte_window_remaining > 0.0


func grant_riposte_window(duration_sec: float = 1.25, counter_clip: String = "counterstrike") -> void:
	riposte_window_remaining = maxf(riposte_window_remaining, duration_sec)
	if counter_clip != "":
		riposte_counter_clip = counter_clip
	riposte_ready.emit(riposte_window_remaining, riposte_counter_clip)


func consume_riposte() -> bool:
	if riposte_window_remaining <= 0.0:
		return false
	riposte_window_remaining = 0.0
	return true


# ---- Defense Eligibility & 4-Arm Mid-Swing Parry ----

func can_act_immediately() -> bool:
	return state in [State.IDLE, State.APPROACH]


func can_parry_mid_swing() -> bool:
	if stats == null:
		return false
	if not (state in [State.WINDUP, State.RECOVERY]):
		return false
	return active_parry_used_in_swing < stats.extra_parry_slots()


func consume_mid_swing_parry() -> bool:
	if not can_parry_mid_swing():
		return false
	active_parry_used_in_swing += 1
	return true


func can_defend_now(is_parry: bool = true) -> bool:
	if state in [State.DOWNED, State.STAGGER, State.RELOAD]:
		return false
	if state in [State.IDLE, State.APPROACH, State.BLOCK, State.PARRY]:
		return true
	if is_parry and can_parry_mid_swing():
		return true
	return false


# ---- Player Agency API: 150 ms Input Buffer, RTWP Queue, Timed Parry & Dodge ----

func queue_action(action_dict: Dictionary) -> bool:
	if action_dict.is_empty():
		return false
	var act := action_dict.duplicate(true)
	if is_tactical_paused():
		paused_queue.append(act)
		return true
	if can_act_immediately():
		return _execute_action(act)
	var type_str := String(act.get("type", "attack"))
	if type_str == "parry" and can_defend_now(true):
		return bool(try_active_parry().get("ok", false))
	if type_str == "dodge" and can_defend_now(false):
		return bool(try_active_dodge().get("ok", false))
	# Store in 150 ms input buffer to fire on frame 1 when recovery completes
	_buffered_action = act
	_buffer_remaining = float(links.rules.get("input_buffer_s", INPUT_BUFFER_SEC)) if links != null else INPUT_BUFFER_SEC
	return true


func flush_paused_queue() -> int:
	if paused_queue.is_empty():
		return 0
	var count := 0
	var pending := paused_queue.duplicate()
	paused_queue.clear()
	for act in pending:
		queue_action(act)
		count += 1
	return count


func try_active_parry() -> Dictionary:
	if is_tactical_paused():
		queue_action({"type": "parry"})
		return {"ok": true, "queued_while_paused": true}
	if parry_lockout_remaining > 0.0:
		return {"ok": false, "reason": "lockout"}
	if not can_defend_now(true):
		# Buffer for 150 ms if currently finishing recovery/stagger
		_buffered_action = {"type": "parry"}
		_buffer_remaining = INPUT_BUFFER_SEC
		return {"ok": false, "reason": "buffered"}

	var ex: Dictionary = director.find_incoming_exchange_for(self) if director != null and director.has_method("find_incoming_exchange_for") else {}
	var window := get_parry_window_sec()
	if ex.is_empty():
		parry_lockout_remaining = 0.16
		return {"ok": false, "reason": "no_incoming_attack", "window_s": window}

	var time_to_hit := float(ex["contact_t"]) - float(ex["elapsed"])
	if time_to_hit >= -0.015 and time_to_hit <= window:
		var mid_swing := state in [State.WINDUP, State.RECOVERY]
		if mid_swing:
			if not consume_mid_swing_parry():
				return {"ok": false, "reason": "no_extra_parry_slot"}
		var ok: bool = director.upgrade_exchange_defense(int(ex["id"]), "perfect_parry", {"mid_swing": mid_swing, "manual": true})
		if ok:
			grant_riposte_window(1.25, "counterstrike")
			if mid_swing:
				mid_swing_parried.emit(int(ex["id"]))
			perfect_parry_triggered.emit(int(ex["id"]), mid_swing)
			return {
				"ok": true,
				"outcome": "perfect_parry",
				"mid_swing": mid_swing,
				"window_s": window,
				"time_to_impact_s": time_to_hit,
			}
	# Mistimed early press incurs brief lockout so parry cannot be spammed
	parry_lockout_remaining = 0.20
	return {
		"ok": false,
		"reason": "outside_window",
		"window_s": window,
		"time_to_impact_s": time_to_hit,
	}


func try_active_dodge() -> Dictionary:
	if is_tactical_paused():
		queue_action({"type": "dodge"})
		return {"ok": true, "queued_while_paused": true}
	if dodge_lockout_remaining > 0.0:
		return {"ok": false, "reason": "lockout"}
	if not can_defend_now(false):
		_buffered_action = {"type": "dodge"}
		_buffer_remaining = INPUT_BUFFER_SEC
		return {"ok": false, "reason": "buffered"}

	var ex: Dictionary = director.find_incoming_exchange_for(self) if director != null and director.has_method("find_incoming_exchange_for") else {}
	var window := get_dodge_window_sec()
	if ex.is_empty():
		enter_defense_reaction("dodge", "dodge_step", 0.36 * stats.dodge_recovery_multiplier(), false)
		return {"ok": true, "outcome": "evasive_step", "window_s": window}

	var time_to_hit := float(ex["contact_t"]) - float(ex["elapsed"])
	if time_to_hit >= -0.015 and time_to_hit <= window:
		var ok: bool = director.upgrade_exchange_defense(int(ex["id"]), "dodge", {"manual": true})
		if ok:
			grant_riposte_window(1.10, "counterstrike")
			active_dodge_triggered.emit(int(ex["id"]))
			return {
				"ok": true,
				"outcome": "dodge",
				"window_s": window,
				"time_to_impact_s": time_to_hit,
			}
	dodge_lockout_remaining = 0.22
	return {
		"ok": false,
		"reason": "outside_window",
		"window_s": window,
		"time_to_impact_s": time_to_hit,
	}


func _execute_action(act: Dictionary) -> bool:
	var kind := String(act.get("type", "attack"))
	match kind:
		"stance":
			set_stance(int(act.get("stance", Stance.BALANCED)) as Stance)
			action_executed.emit(act)
			return true
		"parry":
			var res := try_active_parry()
			action_executed.emit(act)
			return bool(res.get("ok", false))
		"dodge":
			var res := try_active_dodge()
			action_executed.emit(act)
			return bool(res.get("ok", false))
		"reload":
			var kneel := bool(act.get("kneel", false))
			var r_clip := "reload_kneel" if kneel else "reload"
			_set_state(State.RELOAD, float(act.get("duration", 1.35)))
			play_resolved_clip(r_clip)
			action_executed.emit(act)
			return true
		"riposte":
			var atk_key := String(act.get("attack", riposte_counter_clip))
			return _execute_attack_action(atk_key, act)
		"attack", "maneuver":
			var atk_key := String(act.get("attack", "jab_l"))
			return _execute_attack_action(atk_key, act)
	return false


func _execute_attack_action(attack_key: String, act: Dictionary) -> bool:
	var tgt: KCombatBrain = act.get("target", target_brain) as KCombatBrain
	var lnk := links.get_link(attack_key) if links != null else {"attack": attack_key, "hit_t": 0.42, "focus_cost": 0.0}
	var f_cost := float(lnk.get("focus_cost", 0.0))
	if f_cost > 0.0 and stats != null and not stats.spend_focus(f_cost):
		return false
	if director != null and tgt != null and director.has_method("begin_exchange"):
		var forced := String(act.get("forced_outcome", ""))
		var ex: Dictionary = director.begin_exchange(self, tgt, lnk, forced)
		if bool(ex.get("queued", false)):
			_set_state(State.APPROACH, 0.0)
			play_resolved_clip("fight_step_l")
			return false
		action_executed.emit(act)
		return not ex.is_empty()
	enter_windup(lnk)
	action_executed.emit(act)
	return true


# ---- State Transitions Driven by Combat Simulation ----

func enter_windup(link: Dictionary) -> void:
	active_attack_link = link
	active_parry_used_in_swing = 0
	var cadence := stance_cadence_mult()
	var hit_t := maxf(0.05, float(link.get("hit_t", 0.42)) / cadence)
	var anim_clip := String(link.get("clip", link.get("attack", "jab_l")))
	var full_dur := maxf(hit_t + 0.28, get_clip_duration(anim_clip) / cadence)
	_swing_active_dur = minf(0.12, maxf(0.06, (full_dur - hit_t) * 0.30))
	_swing_recovery_dur = maxf(0.16, full_dur - hit_t - _swing_active_dur)
	_set_state(State.WINDUP, hit_t)
	play_resolved_clip(anim_clip)


func enter_active_and_recover(link: Dictionary, custom_recovery: float = -1.0) -> void:
	active_attack_link = link
	if custom_recovery > 0.0:
		_swing_recovery_dur = custom_recovery
	_set_state(State.ACTIVE, _swing_active_dur)
	var zone_hint := String(link.get("target_zone", "chest"))
	for hb in hitboxes:
		hb.enable_window(zone_hint)


func enter_defense_reaction(outcome: String, react_clip: String, dur: float = 0.38, mid_swing_preserve: bool = false) -> void:
	if mid_swing_preserve and state in [State.WINDUP, State.ACTIVE, State.RECOVERY]:
		# 4-armed fighter deflects with secondary arm pair without losing primary swing state!
		return
	_disable_all_hitboxes()
	match outcome:
		"perfect_parry", "parry":
			_set_state(State.PARRY, maxf(0.18, dur))
		"dodge":
			_set_state(State.DODGE, maxf(0.20, dur * (stats.dodge_recovery_multiplier() if stats != null else 1.0)))
		_:
			_set_state(State.BLOCK, maxf(0.20, dur))
	play_resolved_clip(react_clip)


func enter_stagger(clip_name: String = "hit_body", dur: float = 0.46) -> void:
	_disable_all_hitboxes()
	active_attack_link = {}
	_set_state(State.STAGGER, maxf(0.20, dur))
	play_resolved_clip(clip_name)


func enter_downed(fall_clip: String = "knock_down", getup_clip: String = "ual_get_up", fall_dur: float = 0.70, getup_dur: float = 0.65) -> void:
	_disable_all_hitboxes()
	active_attack_link = {}
	_downed_phase = 0
	_getup_clip = getup_clip if getup_clip != "" else "ual_get_up"
	_getup_duration = maxf(0.25, getup_dur)
	_set_state(State.DOWNED, maxf(0.30, fall_dur))
	play_resolved_clip(fall_clip if fall_clip != "" else "knock_down")


func on_slot_promoted(defender: Node) -> void:
	if target_brain == null and defender is KCombatBrain:
		target_brain = defender as KCombatBrain


func _set_state(next_state: State, duration: float = 0.0) -> void:
	var prev := state
	state = next_state
	state_time = 0.0
	state_duration = duration
	if prev != next_state:
		state_changed.emit(prev, next_state)


func _disable_all_hitboxes() -> void:
	for hb in hitboxes:
		hb.disable_window()


# ---- Visual Bridge & Local Hitstop ----

func apply_local_hitstop(duration_sec: float) -> void:
	# Strictly local to this fighter; Engine.time_scale is NEVER modified.
	hitstop_remaining = maxf(hitstop_remaining, maxf(0.0, duration_sec))


func resolve_clip(preferred: String) -> String:
	if figure != null:
		return KCombatLinks.resolve_clip(figure, preferred)
	if anim_player != null:
		return KCombatLinks.resolve_clip(anim_player, preferred)
	return preferred


func get_clip_duration(clip_name: String) -> float:
	var resolved := resolve_clip(clip_name)
	if figure != null and figure.player != null and figure.player.has_animation(resolved):
		return figure.player.get_animation(resolved).length / maxf(0.1, figure.cadence)
	if anim_player != null and anim_player.has_animation(resolved):
		return anim_player.get_animation(resolved).length
	return 0.85


func play_resolved_clip(preferred: String) -> String:
	var resolved := resolve_clip(preferred)
	current_clip = resolved
	clip_history.append(resolved)
	if figure != null:
		figure.play(resolved)
	elif anim_player != null and anim_player.has_animation(resolved):
		anim_player.play(resolved, 0.12)
	clip_triggered.emit(resolved)
	return resolved


# ---- Per-Frame Simulation Tick ----

func tick(dt: float) -> void:
	if dt <= 0.0 or is_tactical_paused():
		return

	if parry_lockout_remaining > 0.0:
		parry_lockout_remaining = maxf(0.0, parry_lockout_remaining - dt)
	if dodge_lockout_remaining > 0.0:
		dodge_lockout_remaining = maxf(0.0, dodge_lockout_remaining - dt)
	if riposte_window_remaining > 0.0:
		riposte_window_remaining = maxf(0.0, riposte_window_remaining - dt)

	if _buffer_remaining > 0.0:
		_buffer_remaining = maxf(0.0, _buffer_remaining - dt)
		if _buffer_remaining <= 0.0:
			_buffered_action.clear()

	# Local Hitstop freezes ONLY this fighter's state timer and animation advance
	var eff_dt := dt
	if hitstop_remaining > 0.0:
		if dt <= hitstop_remaining:
			hitstop_remaining -= dt
			if anim_player != null and figure == null:
				anim_player.speed_scale = 0.0
			return
		eff_dt = dt - hitstop_remaining
		hitstop_remaining = 0.0

	if anim_player != null and figure == null:
		anim_player.speed_scale = stance_cadence_mult() if state in [State.WINDUP, State.ACTIVE, State.RECOVERY] else 1.0

	if stats != null:
		stats.tick_bleed(eff_dt)
		var guarding := (stance == Stance.GUARD and state == State.IDLE) or state == State.BLOCK
		var staggered := state in [State.STAGGER, State.DOWNED]
		stats.regen_poise(eff_dt, guarding, staggered)

	state_time += eff_dt
	match state:
		State.ACTIVE:
			if state_time >= state_duration:
				_disable_all_hitboxes()
				_set_state(State.RECOVERY, _swing_recovery_dur)
		State.RECOVERY, State.PARRY, State.BLOCK, State.DODGE, State.STAGGER, State.RELOAD:
			if state_time >= state_duration:
				active_attack_link = {}
				active_parry_used_in_swing = 0
				_return_to_idle_or_buffer()
		State.DOWNED:
			if state_time >= state_duration:
				if _downed_phase == 0:
					_downed_phase = 1
					if stats != null and stats.poise <= 0.0:
						stats.restore_post_guard_break_poise()
					state_time = 0.0
					state_duration = _getup_duration
					play_resolved_clip(_getup_clip)
				else:
					_return_to_idle_or_buffer()

	if figure != null:
		var anim_scale := stance_cadence_mult() if state in [State.WINDUP, State.ACTIVE, State.RECOVERY] else 1.0
		figure._process(eff_dt * anim_scale)


func _return_to_idle_or_buffer() -> void:
	_set_state(State.IDLE, 0.0)
	if not _buffered_action.is_empty() and _buffer_remaining > 0.0:
		var act := _buffered_action.duplicate(true)
		_buffered_action.clear()
		_buffer_remaining = 0.0
		if _execute_action(act):
			return
	play_resolved_clip(idle_clip)
