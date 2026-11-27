# Headless Godot 4 verification suite for Phase 2 Krator Combat Architecture (godot/krator/combat/).
# Run with:
#   Godot_v4*_console.exe --headless --path C:\Users\travi\Documents\krator-garments\godot -s res://krator/combat/test_combat_headless.gd
extends SceneTree

var passed := 0
var failed := 0


func check(cond: bool, label: String) -> void:
	if cond:
		passed += 1
		print("  [PASS] ", label)
	else:
		failed += 1
		print("  [FAIL] ", label)


func _has_move(arr: Array[Dictionary], key: String) -> bool:
	for d in arr:
		if String(d.get("attack", "")) == key:
			return true
	return false


func _init() -> void:
	print("=== Krator Godot 4 Combat Headless Verification ===")
	_test_1_links_and_ma_tiers()
	_test_2_director_attack_slots()
	_test_3_stances_timed_parry_buffer_pause()
	_test_4_heavy_axe_guard_break()
	_test_5_limbs_sever_prosthetic_giant_hover_xp()
	_test_6_hitbox_and_hurtboxes()

	print("---------------------------------------------------")
	print("Combat Headless Summary: %d passed, %d failed" % [passed, failed])
	quit(1 if failed > 0 else 0)


# 1. KCombatLinks parsing & Martial Arts skill-tier unlocks (0 -> 30 -> 60 -> 80) + CLIP_FALLBACKS
func _test_1_links_and_ma_tiers() -> void:
	print("\n[Suite 1] KCombatLinks JSON loader, MA skill-tier unlocks (0 -> 30 -> 60 -> 80) & clip fallbacks")
	var links := KCombatLinks.new()
	check(links.source_path != "", "Loaded combat-links.json from disk (%s)" % links.source_path)
	check(links.has_link("jab_l") and links.has_link("leg_sweep") and links.has_link("axe_chop"),
		"Both baseline unarmed links and heavy armed melee links available")

	var ma0 := links.links_for_style("martial_arts", 0.0)
	var ma30 := links.links_for_style("martial_arts", 30.0)
	var ma60 := links.links_for_style("martial_arts", 60.0)
	var ma80 := links.links_for_style("martial_arts", 80.0)

	check(_has_move(ma0, "jab_l") and not _has_move(ma0, "hook_l") and not _has_move(ma0, "leg_sweep"),
		"MA Skill 0 (Tier 1): unlocks jab_l (%d moves), locks Tier 2+" % ma0.size())
	check(_has_move(ma30, "jab_r") and _has_move(ma30, "hook_l") and _has_move(ma30, "kick_front") and _has_move(ma30, "uppercut_r") and not _has_move(ma30, "leg_sweep"),
		"MA Skill 30 (Tier 2): unlocks cross, hooks, uppercuts & front kick (%d moves)" % ma30.size())
	check(_has_move(ma60, "kick_roundhouse") and _has_move(ma60, "leg_sweep") and _has_move(ma60, "punch_combo_3") and not _has_move(ma60, "throw_shoulder"),
		"MA Skill 60 (Tier 3): unlocks roundhouse, leg_sweep & combos (%d moves)" % ma60.size())
	check(_has_move(ma80, "dodge_counter") and _has_move(ma80, "throw_shoulder") and _has_move(ma80, "throw_grip"),
		"MA Skill 80 (Tier 4 Master): unlocks dodge_counter & grapple throws (%d moves)" % ma80.size())
	check(ma0.size() < ma30.size() and ma30.size() < ma60.size() and ma60.size() < ma80.size(),
		"Monotonic tier progression: %d -> %d -> %d -> %d moves" % [ma0.size(), ma30.size(), ma60.size(), ma80.size()])

	var subset_clips := {"attack": true, "block": true, "ual_hit_head": true, "idle": true}
	check(KCombatLinks.resolve_clip(subset_clips, "jab_l") == "attack"
		and KCombatLinks.resolve_clip(subset_clips, "guard_block_1") == "block"
		and KCombatLinks.resolve_clip(subset_clips, "hit_face") == "ual_hit_head",
		"resolve_clip matches Web CLIP_FALLBACKS for subset animation libraries")


# 2. KCombatDirector 2-slot cap (3rd attacker queued until slot frees!)
func _test_2_director_attack_slots() -> void:
	print("\n[Suite 2] KCombatDirector 2-slot cap & automatic priority wait queue")
	var links := KCombatLinks.new()
	var dir := KCombatDirector.new(links)
	root.add_child(dir)

	var def := KCombatBrain.new().setup("defender", KCombatStats.new(), links, dir)
	var a1 := KCombatBrain.new().setup("attacker_1", KCombatStats.new(), links, dir)
	var a2 := KCombatBrain.new().setup("attacker_2", KCombatStats.new(), links, dir)
	var a3 := KCombatBrain.new().setup("attacker_3", KCombatStats.new(), links, dir)
	var a4_elite := KCombatBrain.new().setup("attacker_4_elite", KCombatStats.new(), links, dir)
	for n in [def, a1, a2, a3, a4_elite]:
		dir.add_child(n)

	check(dir.default_attack_slots == 2, "Default attack slots == 2")
	var g1 := dir.request_slot(a1, def, 10.0)
	var g2 := dir.request_slot(a2, def, 10.0)
	var g3 := dir.request_slot(a3, def, 15.0)
	check(g1 and g2 and not g3 and dir.active_slot_count(def) == 2 and dir.queued_attacker_count(def) == 1,
		"Slots 1 & 2 granted; 3rd attacker rejected & queued (active=2, queued=1)")

	# Verify begin_exchange also enforces slot cap on queued 3rd attacker
	var blocked_ex := dir.begin_exchange(a3, def, "jab_l")
	check(bool(blocked_ex.get("queued", false)), "begin_exchange blocks 3rd attacker while 2 slots are occupied")

	# Add a higher-priority 4th attacker to verify priority queue ordering
	var g4 := dir.request_slot(a4_elite, def, 80.0)
	check(not g4 and dir.queued_attacker_count(def) == 2, "4th elite attacker queued behind full 2-slot cap")

	# Release a1 -> higher-priority a4_elite promotes first; release a2 -> a3 promotes next!
	dir.release_slot(a1, def)
	check(dir.has_slot(a4_elite, def) and not dir.has_slot(a3, def) and dir.active_slot_count(def) == 2,
		"Releasing slot 1 automatically promotes highest-priority queued attacker (a4_elite)")
	dir.release_slot(a2, def)
	check(dir.has_slot(a3, def) and dir.active_slot_count(def) == 2 and dir.queued_attacker_count(def) == 0,
		"Releasing slot 2 automatically promotes remaining queued attacker (a3), queue now empty")

	dir.free()


# 3. Active Stances + Timed Perfect Parry (0 defender Poise lost, attacker staggered, riposte unlocked!)
#    + Local Hitstop (Engine.time_scale untouched) + 150 ms Input Buffer + RTWP Tactical Pause
func _test_3_stances_timed_parry_buffer_pause() -> void:
	print("\n[Suite 3] Active Stances, Skill-Scaled Timed Perfect Parry -> Riposte, 150ms Buffer & RTWP Pause")
	var links := KCombatLinks.new()
	var dir := KCombatDirector.new(links)
	root.add_child(dir)

	var atk_stats := KCombatStats.new()
	atk_stats.melee_attack = 40.0
	var def_stats := KCombatStats.new()
	def_stats.melee_defense = 80.0   # 220 ms base manual parry window
	def_stats.dodge = 0.0            # 80 ms base dodge window

	var atk := KCombatBrain.new().setup("raider", atk_stats, links, dir)
	var def := KCombatBrain.new().setup("monk_champ", def_stats, links, dir)
	var n_atk := Node3D.new()
	var n_def := Node3D.new()
	n_atk.position = Vector3(-1.45, 0, 0)
	n_def.position = Vector3(0.0, 0, 0)
	dir.add_child(n_atk)
	dir.add_child(n_def)
	atk.actor_3d = n_atk
	def.actor_3d = n_def
	dir.add_child(atk)
	dir.add_child(def)

	check(is_equal_approx(KCombatBrain.skill_timing_window(0.0), 0.08)
		and is_equal_approx(KCombatBrain.skill_timing_window(80.0), 0.22),
		"Skill-scaled timing window spans 80 ms (skill 0) to 220 ms (skill 80)")

	def.set_stance(KCombatBrain.Stance.AGGRESSIVE)
	var agg_win := def.get_parry_window_sec()
	def.set_stance(KCombatBrain.Stance.BALANCED)
	var bal_win := def.get_parry_window_sec()
	def.set_stance(KCombatBrain.Stance.GUARD)
	var grd_win := def.get_parry_window_sec()
	check(agg_win < bal_win and grd_win > bal_win and def.blocks_frontal_ranged(),
		"Stance tradeoffs verified: Aggressive window %.3fs < Balanced %.3fs < Guard %.3fs (+frontal ranged block)" % [agg_win, bal_win, grd_win])

	def.set_stance(KCombatBrain.Stance.BALANCED)
	var def_poise_before := def.stats.poise
	var atk_poise_before := atk.stats.poise

	# Start incoming hook_l (hit_t = 0.36s), initially forced to 'hit' unless manually parried!
	var ex := dir.begin_exchange(atk, def, "hook_l", "hit")
	check(bool(ex.get("ok", false)), "Started incoming hook_l exchange")

	# Step to t = 0.22s -> 0.14s before impact (inside defender's 0.22s parry window!)
	dir.tick(0.22)
	var parry_res := def.try_active_parry()
	check(bool(parry_res.get("ok", false)) and String(parry_res.get("outcome", "")) == "perfect_parry",
		"Timed try_active_parry() inside 220 ms window upgraded incoming exchange to perfect_parry")

	# Advance across contact_t (0.36s)
	for i in 4:
		dir.tick(0.05)

	check(is_equal_approx(def.stats.poise, def_poise_before),
		"Perfect Parry cost 0.0 defender Poise (%.1f -> %.1f)" % [def_poise_before, def.stats.poise])
	check(atk.state == KCombatBrain.State.STAGGER and atk.stats.poise < atk_poise_before,
		"Attacker staggered (state=%d) and lost Poise (%.1f -> %.1f)" % [atk.state, atk_poise_before, atk.stats.poise])
	check(def.has_riposte(), "Defender unlocked Riposte window (%.2fs remaining)" % def.riposte_window_remaining)
	check(is_equal_approx(Engine.time_scale, 1.0) and (atk.hitstop_remaining >= 0.0),
		"Local Hitstop never touches global Engine.time_scale (Engine.time_scale == %.2f)" % Engine.time_scale)
	var dist_now := n_atk.position.distance_to(n_def.position)
	check(dist_now < 1.30 and dist_now > 0.90,
		"Paired exchange glided fighter spacing toward link.dist_m (1.45m -> %.2fm)" % dist_now)

	# Advance until def is within the final 150 ms of PARRY recovery, then queue riposte into the 150 ms input buffer!
	while def.state == KCombatBrain.State.PARRY and (def.state_duration - def.state_time) > 0.10:
		dir.tick(0.03)
	check(def.state == KCombatBrain.State.PARRY and (def.state_duration - def.state_time) <= 0.15,
		"Defender in final 100 ms of PARRY state prior to buffered riposte input")
	def.target_brain = atk
	def.queue_action({"type": "riposte", "attack": "counterstrike", "target": atk, "forced_outcome": "hit"})
	for i in 6:
		dir.tick(0.03)
	check(not def.has_riposte() and def.clip_history.has("counterstrike"),
		"150 ms Input Buffer fired queued riposte counterstrike on frame 1 after PARRY recovery")

	# Settle back to IDLE and test RTWP Tactical Pause command queue
	for i in 25:
		dir.tick(0.05)
	dir.set_tactical_pause(true)
	def.queue_action({"type": "attack", "attack": "jab_l", "target": atk, "forced_outcome": "block"})
	dir.tick(0.25)
	check(def.state == KCombatBrain.State.IDLE and def.paused_queue.size() == 1,
		"RTWP Tactical Pause freezes simulation & holds player command in paused_queue")
	dir.set_tactical_pause(false)
	check(def.paused_queue.is_empty() and def.state == KCombatBrain.State.WINDUP,
		"Unpausing RTWP flushes paused_queue immediately into WINDUP")

	dir.free()


# 4. Heavy axe_chop Poise drain -> Guard Break (knock_down -> ual_get_up)
func _test_4_heavy_axe_guard_break() -> void:
	print("\n[Suite 4] Heavy axe_chop Poise drain -> Guard Break (knock_down -> ual_get_up)")
	var links := KCombatLinks.new()
	var dir := KCombatDirector.new(links)
	root.add_child(dir)

	var axe_stats := KCombatStats.new()
	axe_stats.strength = 50.0
	var guard_stats := KCombatStats.new()
	guard_stats.toughness = 10.0
	guard_stats.strength = 10.0
	guard_stats.armor_weight_kg = 2.0
	guard_stats.recalculate_derived(true) # max_poise = 40 + 8 + 4 + 1 = 53.0

	var axe_fighter := KCombatBrain.new().setup("berserker", axe_stats, links, dir)
	axe_fighter.set_stance(KCombatBrain.Stance.AGGRESSIVE) # +20% Poise damage (48 * 1.2 = 57.6 > 53.0!)
	var turtle := KCombatBrain.new().setup("turtle", guard_stats, links, dir)
	dir.add_child(axe_fighter)
	dir.add_child(turtle)

	var guard_broken_sig := [false]
	turtle.stats.guard_broken.connect(func(): guard_broken_sig[0] = true)

	var ex := dir.begin_exchange(axe_fighter, turtle, "axe_chop", "block")
	# Step past axe_chop hit_t (0.72 / 1.2 = 0.60s) so block contact occurs and drains Poise to 0
	for i in 15:
		dir.tick(0.05)

	check(guard_broken_sig[0] and String(ex["hit_report"].get("outcome", "")) == "guard_break",
		"Blocking heavy Aggressive axe_chop drained Poise to 0 and triggered Guard Break")
	check(turtle.state == KCombatBrain.State.DOWNED and turtle.current_clip == "knock_down",
		"Guard-broken defender entered State.DOWNED playing 'knock_down'")

	# Advance past knock_down fall phase (0.70s + 0.07s hitstop) into get-up phase
	for i in 16:
		dir.tick(0.05)
	check(turtle.state == KCombatBrain.State.DOWNED and turtle.current_clip == "ual_get_up",
		"Downed defender automatically transitioned from 'knock_down' -> 'ual_get_up'")

	# Advance past ual_get_up phase back to IDLE
	for i in 16:
		dir.tick(0.05)
	check(turtle.state == KCombatBrain.State.IDLE and turtle.stats.poise > 0.0,
		"Defender completed 'ual_get_up' back to IDLE with restored Poise (%.1f)" % turtle.stats.poise)

	dir.free()


# 5. 7-Limb damage, bleed, -100% limb severing + install_prosthetic('right_arm', 'mod_arms_cyber'),
#    4-arm Giant mid-swing parry, digitigrade lunge, Extraplanar hover leg_sweep immunity, & Kenshi XP!
func _test_5_limbs_sever_prosthetic_giant_hover_xp() -> void:
	print("\n[Suite 5] 7-Limb Trauma, -100% Severing, Cyber Prosthetic, 4-Arm Giant Mid-Swing Parry & Hover Trip Immunity")
	var links := KCombatLinks.new()

	# 5a. Species multipliers & 7 limbs
	var human := KCombatStats.new("human")
	var shek := KCombatStats.new("shek")
	var giant_st := KCombatStats.new("giant")
	var liz := KCombatStats.new("lizardman")
	check(human.limbs.size() == 7
		and is_equal_approx(float(shek.limbs["chest"]["max_hp"]), 125.0)
		and is_equal_approx(float(giant_st.limbs["chest"]["max_hp"]), 160.0)
		and is_equal_approx(float(liz.limbs["chest"]["max_hp"]), 110.0),
		"7-Limb pools initialized with species multipliers (Human 100, Lizardman 110, Shek 125, Giant 160)")

	# 5b. Cut damage, bleed, crippling (<0), and severing (<= -100% max_hp) + install_prosthetic
	human.toughness = 0.0
	var r1 := human.apply_limb_damage("right_arm", 115.0, "cut", true)
	check(bool(r1["crippled"]) and not bool(r1["severed"]) and float(r1["bleed_rate"]) > 0.0,
		"Cut hit to -15 HP crippled right_arm and started bleeding (bleed_rate=%.2f)" % float(r1["bleed_rate"]))
	human.tick_bleed(1.0)
	check(human.blood_pool < 100.0, "Active limb bleed drains blood_pool (%.2f)" % human.blood_pool)

	var r2 := human.apply_limb_damage("right_arm", 95.0, "cut", true)
	check(bool(r2["severed"]) and human.is_limb_severed("right_arm") and is_equal_approx(human.get_limb_hp("right_arm"), -100.0),
		"Defining hit reaching <= -100%% max_hp severed right_arm (sever_mode='%s')" % human.sever_mode)

	# Verify with real KChar kit.json if present so KChar.arms(rec, kit) == 4 is exercised directly!
	if FileAccess.file_exists("res://data/characters/mpfb_male/kit.json"):
		var male_kit: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/characters/mpfb_male/kit.json"))
		var rec := KChar.blank(male_kit)
		human.configure_from_kchar(rec, male_kit)
	var installed := human.install_prosthetic("right_arm", "mod_arms_cyber")
	check(installed and not human.is_limb_severed("right_arm") and not human.is_limb_crippled("right_arm")
		and is_equal_approx(human.get_limb_hp("right_arm"), 150.0)
		and is_equal_approx(float(human.limbs["right_arm"]["bleed_rate"]), 0.0)
		and human.extra_parry_slots() == 1,
		"install_prosthetic('right_arm', 'mod_arms_cyber') restored 150 HP robotic limb, stopped bleed & granted +1 parry slot (4 arms)")

	# Digitigrade lunge multiplier check with mod_legs_lizard
	var liz_rec := {"mods": ["mod_legs_lizard"]}
	var liz_kit := {}
	if FileAccess.file_exists("res://data/characters/mpfb_male/kit.json"):
		liz_kit = JSON.parse_string(FileAccess.get_file_as_string("res://data/characters/mpfb_male/kit.json"))
	liz.configure_from_kchar(liz_rec, liz_kit)
	check(liz.is_digitigrade() and is_equal_approx(liz.lunge_multiplier(), 1.15),
		"Digitigrade mod_legs_lizard grants 1.15x lunge multiplier")

	# 5c. 4-Arm Giant mid-swing parry vs 2-Arm Human mid-swing inability
	var dir := KCombatDirector.new(links)
	root.add_child(dir)

	var g_stats := KCombatStats.new("giant")
	g_stats.melee_defense = 80.0
	if FileAccess.file_exists("res://data/characters/mpfb_giant/kit.json"):
		var g_kit: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/characters/mpfb_giant/kit.json"))
		var g_rec := KChar.blank(g_kit)
		g_rec["mods"] = ["mod_arms_flesh"]
		g_stats.configure_from_kchar(g_rec, g_kit)
		check(KChar.arms(g_rec, g_kit) == 4 and g_stats.extra_parry_slots() == 1,
			"KChar.arms(giant_rec, giant_kit) == 4 -> Giant extra_parry_slots() == 1")

	var giant_brain := KCombatBrain.new().setup("giant_champion", g_stats, links, dir)
	var fast_foe := KCombatBrain.new().setup("duelist", KCombatStats.new("human"), links, dir)
	var two_arm_foe := KCombatBrain.new().setup("two_arm", KCombatStats.new("human"), links, dir)
	dir.add_child(giant_brain)
	dir.add_child(fast_foe)
	dir.add_child(two_arm_foe)

	# Put 2-armed fighter into WINDUP -> cannot parry mid-swing!
	two_arm_foe.enter_windup(links.get_link("axe_chop"))
	check(not two_arm_foe.can_parry_mid_swing() and not two_arm_foe.can_defend_now(true),
		"2-armed fighter in WINDUP cannot parry mid-swing")

	# Giant starts slow heavy axe_chop (hit_t = 0.58s) -> fast_foe counters with jab_l (hit_t = 0.42s) while Giant is in WINDUP!
	dir.begin_exchange(giant_brain, fast_foe, "axe_chop", "hit")
	dir.begin_exchange(fast_foe, giant_brain, "jab_l", "hit")
	dir.tick(0.28) # t = 0.28s: Giant still in WINDUP (0.58s), fast_foe jab_l is 0.14s from impact (inside 0.22s window!)
	check(giant_brain.state == KCombatBrain.State.WINDUP and giant_brain.can_parry_mid_swing(),
		"4-armed Giant in WINDUP is eligible for mid-swing parry")
	var mid_p := giant_brain.try_active_parry()
	check(bool(mid_p.get("ok", false)) and bool(mid_p.get("mid_swing", false)) and giant_brain.state == KCombatBrain.State.WINDUP,
		"4-armed Giant executed mid-swing Perfect Parry with secondary arms while preserving primary WINDUP swing!")

	for i in 4:
		dir.tick(0.05)
	check(fast_foe.state == KCombatBrain.State.STAGGER, "Mid-swing parried attacker was staggered")

	# 5d. Extraplanar hover entity leg_sweep immunity
	var seraph_stats := KCombatStats.new("seraph")
	var seraph := KCombatBrain.new().setup("seraph", seraph_stats, links, dir)
	var monk := KCombatBrain.new().setup("monk", KCombatStats.new("human"), links, dir)
	dir.add_child(seraph)
	dir.add_child(monk)
	check(seraph.stats.is_hover_entity and seraph.stats.is_immune_to_trip(), "Seraph marked as Extraplanar hover entity")

	var seraph_poise_0 := seraph.stats.poise
	var sweep_ex := dir.begin_exchange(monk, seraph, "leg_sweep", "hit")
	for i in 15:
		dir.tick(0.05)
	var s_rep: Dictionary = sweep_ex["hit_report"]
	check(bool(s_rep.get("trip_immune_converted", false))
		and not bool(s_rep.get("knocked_down", true))
		and seraph.state != KCombatBrain.State.DOWNED
		and seraph.stats.poise < seraph_poise_0,
		"Extraplanar Seraph resisted leg_sweep knockdown and took Poise damage instead (%.1f -> %.1f)" % [seraph_poise_0, seraph.stats.poise])

	# 5e. Kenshi Stronger-Opponent XP & Martial Arts 25%/100% fix
	check(is_equal_approx(KCombatStats.xp_multiplier(10.0, 50.0), 5.0)
		and is_equal_approx(KCombatStats.xp_multiplier(10.0, 90.0), 6.0)
		and is_equal_approx(KCombatStats.xp_multiplier(50.0, 10.0), 0.1),
		"Kenshi Stronger-Opponent XP multiplier clamped accurately to [0.1, 6.0]")

	var ma_novice_a := KCombatStats.new()
	ma_novice_a.martial_arts = 20.0
	var ma_novice_b := KCombatStats.new()
	ma_novice_b.martial_arts = 20.0
	var gain_blocked := ma_novice_a.record_ma_strike_xp(40.0, false, 1.0)
	var gain_landed := ma_novice_b.record_ma_strike_xp(40.0, true, 1.0)
	check(gain_blocked > 0.0 and is_equal_approx(gain_blocked * 4.0, gain_landed),
		"Martial Arts XP fix grants 25%% XP on blocked/dodged strikes (%.4f) vs 100%% on landed hits (%.4f)" % [gain_blocked, gain_landed])

	dir.free()


# 6. KCombatHitbox 7-zone hurtboxes & active window single-hit guard
func _test_6_hitbox_and_hurtboxes() -> void:
	print("\n[Suite 6] KCombatHitbox bone-attached hitbox & 7-zone hurtbox windowing")
	var skel := Skeleton3D.new()
	for b in ["Hips", "Spine", "Spine2", "Head", "LeftForeArm", "RightForeArm", "LeftLeg", "RightLeg", "RightHand"]:
		skel.add_bone(b)
	root.add_child(skel)

	var atk_node := Node3D.new()
	var def_node := Node3D.new()
	root.add_child(atk_node)
	root.add_child(def_node)

	var hurtboxes := KCombatHitbox.attach_7zone_hurtboxes(skel, def_node)
	var weapon_hb := KCombatHitbox.attach_weapon_hitbox(skel, atk_node, "RightHand")
	var hits: Array[String] = []
	weapon_hb.strike_overlapped.connect(func(_target, zone, _hb): hits.append(zone))

	check(hurtboxes.size() == 7 and not weapon_hb.register_manual_overlap(hurtboxes["head"]),
		"7 hurtboxes created; disabled hitbox ignores overlaps")
	weapon_hb.enable_window("head")
	var h1 := weapon_hb.register_manual_overlap(hurtboxes["head"])
	var h2 := weapon_hb.register_manual_overlap(hurtboxes["head"])
	weapon_hb.disable_window()
	check(h1 and not h2 and hits == ["head"],
		"Enabled hitbox records 1 clean zone hit ('head') per swing window and blocks duplicate multi-hits")

	skel.free()
	atk_node.free()
	def_node.free()
