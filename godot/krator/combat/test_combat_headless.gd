# Headless Godot 4 verification suite for Phase 2 Krator Combat Architecture (godot/krator/combat/).
# Run with:
#   Godot_v4*_console.exe --headless --path C:\Users\travi\Documents\krator-garments\godot -s res://krator/combat/test_combat_headless.gd
extends SceneTree

const KCombatAudioScript = preload("res://krator/combat/kcombat_audio.gd")
const KCombatFourArmsScript = preload("res://krator/combat/kcombat_fourarms.gd")
const KCombatArthropodScript = preload("res://krator/combat/kcombat_arthropod.gd")

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
	_test_7_combat_audio_cues_and_streams()
	_test_8_four_arm_thorax_and_dorsal_moves()
	_test_9_giant_arthropod_combat_anims()

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

	var subset_clips := {"attack": true, "block": true, "ual_hit_head": true, "idle": true, "ual_throw": true, "slash_charged": true}
	check(KCombatLinks.resolve_clip(subset_clips, "jab_l") == "attack"
		and KCombatLinks.resolve_clip(subset_clips, "guard_block_1") == "block"
		and KCombatLinks.resolve_clip(subset_clips, "hit_face") == "ual_hit_head",
		"resolve_clip matches Web CLIP_FALLBACKS for subset animation libraries")

	# Extraplanar / Arcane Special Links parity check
	check(links.has_link("lightning_blast") and links.has_link("energy_burst")
		and links.has_link("astral_lance") and links.has_link("rift_claw"),
		"Loaded all 4 Extraplanar arcane links (lightning_blast, energy_burst, astral_lance, rift_claw)")
	var lb := links.get_link("lightning_blast")
	var eb := links.get_link("energy_burst")
	check(String(lb.get("clip", "")) == "spell_cast"
		and String(lb.get("vfx", "")) == "lightning_blast"
		and String(lb.get("dmg_type", "")) == "arcane"
		and KCombatLinks.resolve_clip(subset_clips, String(lb["clip"])) == "ual_throw",
		"lightning_blast maps clip='spell_cast' (-> fallback 'ual_throw'), dmg_type='arcane', vfx='lightning_blast'")
	check(String(eb.get("clip", "")) == "taunt_chest"
		and bool(eb.get("aoe", false)) == true
		and String(eb.get("vfx", "")) == "energy_burst"
		and KCombatLinks.resolve_clip(subset_clips, String(eb["clip"])) == "slash_charged",
		"energy_burst maps clip='taunt_chest' (-> fallback 'slash_charged'), aoe=true, vfx='energy_burst'")
	check(links.links_for_style("arcane").size() >= 4 and links.extraplanar_choreography.size() >= 8,
		"Arcane style links (%d) and extraplanar_choreography (%d steps) loaded cleanly" % [links.links_for_style("arcane").size(), links.extraplanar_choreography.size()])

	# Cultural Meshy Arms Fighter Panoply check
	var f_by_id := {}
	for f_entry in links.fighters:
		if f_entry is Dictionary and f_entry.has("id"):
			f_by_id[String(f_entry["id"])] = f_entry
	check(links.fighters.size() >= 37
		and f_by_id.has("xanadu_askari") and String(f_by_id["xanadu_askari"]["hold"].get("R", "")) == "msh_xanadu_shamshir"
		and f_by_id.has("khaayken_skirmisher") and String(f_by_id["khaayken_skirmisher"]["hold"].get("R", "")) == "msh_khaayken_axe"
		and f_by_id.has("scyvoi_outrider") and String(f_by_id["scyvoi_outrider"]["hold"].get("L", "")) == "msh_scyvoi_round_shield"
		and f_by_id.has("iziz_legionary") and String(f_by_id["iziz_legionary"]["hold"].get("R", "")) == "msh_izani_legion_gladius",
		"Loaded %d fighter presets with cultural Meshy arms (Xanadu, Khaayken, Scyvoi, Izani, Voth, Lizardmen)" % links.fighters.size())


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


# 7. KCombatAudio CC0 combat-cues.json + AudioStreamMP3 loader & KCombatDirector signal wiring
func _test_7_combat_audio_cues_and_streams() -> void:
	print("\n[Suite 7] KCombatAudio CC0 combat-cues.json + MP3 stream pool & KCombatDirector signal cues")
	var links := KCombatLinks.new()
	var dir := KCombatDirector.new(links)
	root.add_child(dir)

	var audio = KCombatAudioScript.new(dir)
	dir.add_child(audio)

	check(audio.source_path != "" and audio.cues.size() == 14,
		"Loaded all 14 combat cues from combat-cues.json (%s)" % audio.source_path)
	check(audio.streams.size() == 24 and audio.get_pool_size() == 8,
		"Loaded all 24 CC0 AudioStreamMP3 clips (%d) & initialized 8-voice 3D player pool (%d)" % [audio.streams.size(), audio.get_pool_size()])

	var archon := KCombatBrain.new().setup("archon", KCombatStats.new("seraph"), links, dir)
	var monk := KCombatBrain.new().setup("monk", KCombatStats.new("human"), links, dir)
	var n_a := Node3D.new()
	var n_b := Node3D.new()
	n_a.position = Vector3(-1.6, 0.0, 0.0)
	n_b.position = Vector3(1.6, 0.0, 0.0)
	dir.add_child(n_a)
	dir.add_child(n_b)
	archon.actor_3d = n_a
	monk.actor_3d = n_b
	dir.add_child(archon)
	dir.add_child(monk)

	# 7a. Arcane lightning_blast exchange -> windup & contact fire 'lightning_blast'
	audio.cue_history.clear()
	var ex_lb := dir.begin_exchange(archon, monk, "lightning_blast", "hit")
	check(bool(ex_lb.get("ok", false)) and audio.last_played_cue == "lightning_blast" and bool(audio.last_played_info.get("has_stream", false)),
		"Exchange windup for lightning_blast fired 'lightning_blast' stream")
	for i in 20:
		dir.tick(0.05)
	check(audio.last_played_cue == "lightning_blast" and audio.cue_history.count("lightning_blast") >= 2,
		"Exchange contact for lightning_blast fired 'lightning_blast' (%d total)" % audio.cue_history.count("lightning_blast"))

	# Settle fighters back to IDLE
	for i in 20:
		dir.tick(0.05)

	# 7b. Singularity energy_burst exchange -> windup fires 'energy_burst_charge', contact fires 'energy_burst_boom'
	audio.cue_history.clear()
	var ex_eb := dir.begin_exchange(archon, monk, "energy_burst", "hit")
	var charge_cue: String = audio.last_played_cue
	check(bool(ex_eb.get("ok", false)) and charge_cue == "energy_burst_charge",
		"Exchange windup for energy_burst fired 'energy_burst_charge'")
	for i in 24:
		dir.tick(0.05)
	check(audio.last_played_cue == "energy_burst_boom"
		and audio.cue_history.has("energy_burst_charge")
		and audio.cue_history.has("energy_burst_boom"),
		"Exchange contact for energy_burst transitioned 'energy_burst_charge' -> 'energy_burst_boom'")

	# Settle fighters back to IDLE
	for i in 25:
		dir.tick(0.05)

	# 7c. Sword parry exchange -> windup fires 'windup_whoosh', contact fires 'parry_ring'
	audio.cue_history.clear()
	var ex_parry := dir.begin_exchange(monk, archon, "slash_left", "parry")
	var whoosh_cue: String = audio.last_played_cue
	for i in 16:
		dir.tick(0.05)
	check(bool(ex_parry.get("ok", false)) and whoosh_cue == "windup_whoosh" and audio.last_played_cue == "parry_ring",
		"Sword parry exchange fired 'windup_whoosh' -> 'parry_ring' (pitch=%.3f, vol=%.2f dB)" % [
			float(audio.last_played_info.get("pitch_scale", 1.0)),
			float(audio.last_played_info.get("volume_db", 0.0)),
		])

	dir.free()


# 8. 4-Limb Combat Animations (Thorax Left2*/Right2* + Dorsal Spine2 Scapula Rig) parity & trajectory uniqueness
func _test_8_four_arm_thorax_and_dorsal_moves() -> void:
	print("\n[Suite 8] 4-Limb Combat Animations: Thorax (Left2*/Right2*) & Dorsal (Spine2 Scapula) parity")
	var links := KCombatLinks.new()

	var thorax_links := links.links_for_style("thorax_4arm")
	var dorsal_links := links.links_for_style("dorsal_4arm")
	check(thorax_links.size() == 4 and dorsal_links.size() == 4,
		"Loaded 4 thorax_4arm links (%d) and 4 dorsal_4arm links (%d) from combat-links.json" % [thorax_links.size(), dorsal_links.size()])
	check(String(links.style_idles.get("thorax_4arm", "")) == "combat_idle"
		and String(links.style_idles.get("dorsal_4arm", "")) == "combat_idle"
		and links.fourarm_choreography.size() == 8,
		"Loaded style_idles for thorax_4arm/dorsal_4arm and 8-step fourarm_choreography (%d steps)" % links.fourarm_choreography.size())

	var fighter_ids: Array[String] = []
	for f in links.fighters:
		if f is Dictionary:
			fighter_ids.append(String(f.get("id", "")))
	check(fighter_ids.has("dalab_giant")
		and fighter_ids.has("loader_enforcer")
		and fighter_ids.has("surgical_monk")
		and fighter_ids.has("reliquary_lich")
		and fighter_ids.has("mantis_stalker"),
		"All 5 Thorax & Dorsal 4-limb fighter presets registered in combat-links.json")

	# 8a. Verify all 4 Thorax moves produce non-identity & mutually distinct joint trajectories at peak contact u = 0.52
	var thorax_keys := ["thorax_quad_flurry", "thorax_pin_cleave", "thorax_aegis_viper", "thorax_x_crusher"]
	var thorax_samples: Array[Dictionary] = []
	var all_thorax_valid := true
	for mk in thorax_keys:
		var lnk := links.get_link(mk)
		var p0 := KCombatFourArmsScript.sample_thorax_pose(mk, 0.0)
		var pk := KCombatFourArmsScript.sample_thorax_pose(mk, 0.52)
		var p1 := KCombatFourArmsScript.sample_thorax_pose(mk, 1.0)
		var q_la: Quaternion = pk["Left2Arm"]
		var q_ra: Quaternion = pk["Right2Arm"]
		var q_lf: Quaternion = pk["Left2ForeArm"]
		var ok_mk: bool = (String(lnk.get("four_arm_move", "")) == mk
			and is_zero_approx(float(p0["blend"]))
			and is_zero_approx(float(p1["blend"]))
			and is_equal_approx(float(pk["blend"]), 1.0)
			and q_la.angle_to(Quaternion.IDENTITY) > 0.35
			and q_ra.angle_to(Quaternion.IDENTITY) > 0.25
			and q_lf.angle_to(Quaternion.IDENTITY) > 0.15)
		if not ok_mk:
			all_thorax_valid = false
		thorax_samples.append(pk)
	check(all_thorax_valid,
		"All 4 Thorax moves map four_arm_move, blend 0->1->0 cleanly, and drive non-identity Left2*/Right2* rotations at u=0.52")

	var min_thorax_dist := 1e9
	for i in range(thorax_samples.size()):
		for j in range(i + 1, thorax_samples.size()):
			var d: float = KCombatFourArmsScript.channel_distance(thorax_samples[i]["channels"], thorax_samples[j]["channels"])
			if d < min_thorax_dist:
				min_thorax_dist = d
	check(min_thorax_dist >= 18.0,
		"All 4 Thorax moves produce distinct joint trajectories at u=0.52 (min pairwise L2 delta = %.1f deg)" % min_thorax_dist)

	var mid_parry := KCombatFourArmsScript.sample_thorax_pose("thorax_mid_parry", 0.52)
	check((mid_parry["Left2Arm"] as Quaternion).angle_to(Quaternion.IDENTITY) > 0.50
		and (mid_parry["Right2Arm"] as Quaternion).angle_to(Quaternion.IDENTITY) > 0.45,
		"Reactive thorax_mid_parry drives crossed lower-arm guard lock at u=0.52")

	# 8b. Verify all 4 Dorsal moves produce non-identity & mutually distinct Turret/Elbow trajectories at peak contact u = 0.52
	var dorsal_keys := ["dorsal_mantis_impale", "dorsal_scissor_shear", "dorsal_canopy_parry", "dorsal_tri_beam"]
	var dorsal_samples: Array[Dictionary] = []
	var all_dorsal_valid := true
	var d_guard := KCombatFourArmsScript.sample_dorsal_pose("dorsal_mantis_impale", 0.0)
	for mk in dorsal_keys:
		var lnk := links.get_link(mk)
		var pk := KCombatFourArmsScript.sample_dorsal_pose(mk, 0.52)
		var q_tl: Quaternion = pk["TurretL"]
		var q_tr: Quaternion = pk["TurretR"]
		var q_el: Quaternion = pk["ElbowL"]
		var ok_mk: bool = (String(lnk.get("four_arm_move", "")) == mk
			and is_equal_approx(float(pk["blend"]), 1.0)
			and q_tl.angle_to(Quaternion.IDENTITY) > 0.45
			and q_tr.angle_to(Quaternion.IDENTITY) > 0.45
			and q_el.angle_to(Quaternion.IDENTITY) > 0.35
			and (q_tl.angle_to(d_guard["TurretL"]) > 0.30 or q_tr.angle_to(d_guard["TurretR"]) > 0.30))
		if not ok_mk:
			all_dorsal_valid = false
		dorsal_samples.append(pk)
	check(all_dorsal_valid,
		"All 4 Dorsal moves map four_arm_move and drive non-identity Spine2 TurretL/R & ElbowL/R strikes at u=0.52")

	var min_dorsal_dist := 1e9
	for i in range(dorsal_samples.size()):
		for j in range(i + 1, dorsal_samples.size()):
			var d: float = KCombatFourArmsScript.channel_distance(dorsal_samples[i]["channels"], dorsal_samples[j]["channels"])
			if d < min_dorsal_dist:
				min_dorsal_dist = d
	check(min_dorsal_dist >= 14.0,
		"All 4 Dorsal moves produce distinct Turret/Elbow trajectories at u=0.52 (min pairwise L2 delta = %.1f deg)" % min_dorsal_dist)

	# 8c. Live Skeleton3D (Left2*/Right2*) & Dorsal Node3D articulation driver check
	var skel := Skeleton3D.new()
	for bn in ["Hips", "Spine2", "Left2Arm", "Left2ForeArm", "Left2Hand", "Right2Arm", "Right2ForeArm", "Right2Hand"]:
		skel.add_bone(bn)
	var fa := KCombatFourArmsScript.new()
	check(fa.play_move("thorax_x_crusher", 1.0), "Started thorax_x_crusher on KCombatFourArms instance")
	fa.tick(0.52)
	var applied_skel := fa.apply_to_skeleton(skel, 1.0)
	check(applied_skel and skel.get_bone_pose_rotation(skel.find_bone("Left2Arm")).angle_to(Quaternion.IDENTITY) > 0.40,
		"apply_to_skeleton posed Left2Arm/Right2Arm on Skeleton3D at u=0.52")

	var tl := Node3D.new()
	var el := Node3D.new()
	var tr := Node3D.new()
	var er := Node3D.new()
	check(fa.play_move("dorsal_scissor_shear", 1.0), "Started dorsal_scissor_shear on KCombatFourArms instance")
	fa.tick(0.52)
	var applied_dorsal := fa.apply_to_dorsal_nodes(tl, el, tr, er)
	check(applied_dorsal and tl.quaternion.angle_to(Quaternion.IDENTITY) > 0.50 and tr.quaternion.angle_to(Quaternion.IDENTITY) > 0.50,
		"apply_to_dorsal_nodes posed TurretL/R & ElbowL/R Node3D hierarchy at u=0.52")

	skel.free()
	tl.free()
	el.free()
	tr.free()
	er.free()


# 9. Giant Arthropod Combat Animations (Spider, Staghorn Beetle, Bowl Mantis, Emperor Hornet) parity & exchanges
func _test_9_giant_arthropod_combat_anims() -> void:
	print("\n[Suite 9] Giant Arthropod Combat Animations: Spider, Beetle, Mantis & Hornet parity")
	var links := KCombatLinks.new()

	var arthro_links := links.links_for_style("arthropod")
	check(arthro_links.size() == 8,
		"Loaded all 8 arthropod combat links (%d) from combat-links.json" % arthro_links.size())
	check(String(links.style_idles.get("arthropod", "")) == "arthro_idle"
		and links.arthropod_choreography.size() == 8,
		"Loaded style_idles['arthropod']=='arthro_idle' and 8-step arthropod_choreography (%d steps)" % links.arthropod_choreography.size())

	var presets_by_id := {}
	for f in links.fighters:
		if f is Dictionary:
			presets_by_id[String(f.get("id", ""))] = f
	check(presets_by_id.has("spider_matriarch")
		and presets_by_id.has("staghorn_beetle")
		and presets_by_id.has("bowl_mantis")
		and presets_by_id.has("emperor_hornet"),
		"All 4 rigged giant arthropod fighter presets registered in combat-links.json")
	check(links.links_for_archetype("spider").size() == 2
		and links.links_for_archetype("beetle").size() == 2
		and links.links_for_archetype("mantis").size() == 2
		and links.links_for_archetype("hornet").size() == 2,
		"links_for_archetype partitions the 8 arthropod links cleanly (2 per species archetype)")

	# 9a. Verify all 8 offensive moves blend 0 -> 1 -> 0 cleanly, drive species-authentic nodes, and are pairwise distinct
	var move_specs := [
		["spider_rear_bite", "spider"],
		["spider_venom_spit", "spider"],
		["beetle_horn_gore", "beetle"],
		["beetle_ram_charge", "beetle"],
		["mantis_scythe_snap", "mantis"],
		["mantis_flurry_reap", "mantis"],
		["hornet_dive_sting", "hornet"],
		["hornet_mandible_maul", "hornet"],
	]
	var peak_samples: Array[Dictionary] = []
	var all_blends_ok := true
	for pair in move_specs:
		var mk: String = pair[0]
		var arch: String = pair[1]
		var p0: Dictionary = KCombatArthropodScript.sample_arthropod_pose(mk, 0.0, arch)
		var pk: Dictionary = KCombatArthropodScript.sample_arthropod_pose(mk, 0.50, arch)
		var p1: Dictionary = KCombatArthropodScript.sample_arthropod_pose(mk, 1.0, arch)
		var q0_thx: Quaternion = p0["quats"]["thorax"]
		var q1_thx: Quaternion = p1["quats"]["thorax"]
		if not (links.has_link(mk)
				and is_zero_approx(float(p0["blend"]))
				and is_zero_approx(float(p1["blend"]))
				and is_equal_approx(float(pk["blend"]), 1.0)
				and q0_thx.is_equal_approx(Quaternion.IDENTITY)
				and q1_thx.is_equal_approx(Quaternion.IDENTITY)):
			all_blends_ok = false
		peak_samples.append(pk)
	check(all_blends_ok,
		"All 8 arthropod offensive moves exist in KCombatLinks and blend 0 -> 1 -> 0 cleanly")

	# Species-specific biomechanical signature checks at peak contact u = 0.50
	var sp_bite: Dictionary = peak_samples[0]
	var bt_gore: Dictionary = peak_samples[2]
	var bt_ram: Dictionary = peak_samples[3]
	var mn_snap: Dictionary = peak_samples[4]
	var hn_sting: Dictionary = peak_samples[6]
	check((sp_bite["nodes"]["jaw"] as Vector3).x > 0.65 and (sp_bite["quats"]["leg0L"] as Quaternion).angle_to(Quaternion.IDENTITY) > 0.45,
		"Spider spider_rear_bite drives downward fang-slam on jaw (rx=%.2f) & foreleg leg0L sweep" % (sp_bite["nodes"]["jaw"] as Vector3).x)
	check((bt_gore["nodes"]["head"] as Vector3).x < -0.70 and (bt_gore["nodes"]["thorax"] as Vector3).x < -0.50
		and (bt_ram["nodes"]["head"] as Vector3).x > 0.40,
		"Staghorn Beetle pitches horns/thorax skyward on beetle_horn_gore (head.rx=%.2f) vs down-forward on beetle_ram_charge (%.2f)" % [
			(bt_gore["nodes"]["head"] as Vector3).x,
			(bt_ram["nodes"]["head"] as Vector3).x,
		])
	check((mn_snap["nodes"]["armL"] as Vector3).x > 1.05 and (mn_snap["nodes"]["armR"] as Vector3).x > 1.05
		and (mn_snap["quats"]["armLt"] as Quaternion).angle_to(Quaternion.IDENTITY) > 0.70,
		"Bowl Mantis mantis_scythe_snap drives twin raptorial armL/armLt & armR/armRt strike (armL.rx=%.2f rad)" % (mn_snap["nodes"]["armL"] as Vector3).x)
	check((hn_sting["nodes"]["abd"] as Vector3).x < -1.25 and String(hn_sting["base_mode"]) == "fly",
		"Emperor Hornet hornet_dive_sting curls abdomen stinger forward under thorax (abd.rx=%.2f rad, mode='fly')" % (hn_sting["nodes"]["abd"] as Vector3).x)

	var min_arthro_dist := 1e9
	for i in range(peak_samples.size()):
		for j in range(i + 1, peak_samples.size()):
			var d: float = KCombatArthropodScript.channel_distance(peak_samples[i]["channels"], peak_samples[j]["channels"])
			if d < min_arthro_dist:
				min_arthro_dist = d
	check(min_arthro_dist >= 0.90,
		"All 8 arthropod offensive moves have mutually distinct 16-channel trajectories at u=0.50 (min L2 delta = %.2f rad)" % min_arthro_dist)

	# Reaction & species counterstrike alias mapping check
	check(KCombatArthropodScript.resolve_arthropod_clip("parry", "mantis") == "arthro_claw_parry"
		and KCombatArthropodScript.resolve_arthropod_clip("dodge_step", "spider") == "arthro_skitter_dodge"
		and KCombatArthropodScript.resolve_arthropod_clip("ual_shield_up", "beetle") == "arthro_hunker_block"
		and KCombatArthropodScript.resolve_arthropod_clip("knock_down", "spider") == "arthro_death_curl"
		and KCombatArthropodScript.resolve_arthropod_clip("ual_get_up", "spider") == "arthro_uncurl_rise"
		and KCombatArthropodScript.resolve_arthropod_clip("counterstrike", "mantis") == "mantis_scythe_snap"
		and KCombatArthropodScript.resolve_arthropod_clip("counterstrike", "hornet") == "hornet_dive_sting",
		"Human defense/knockdown/counter clip names map cleanly to species-authentic arthropod clips")

	# 9b. Live Node3D arthropod hierarchy driver + crippled leg trauma curl
	var root_wrap := Node3D.new()
	var nodes_map := {}
	for nm in ["thorax", "head", "jaw", "abd", "armL", "armLt", "armR", "armRt"]:
		nodes_map[nm] = Node3D.new()
	for p in range(4):
		for suf in ["L", "R"]:
			var bn := "leg%d%s" % [p, suf]
			nodes_map[bn] = Node3D.new()
			nodes_map[bn + "t"] = Node3D.new()
			nodes_map[bn + "f"] = Node3D.new()

	var spider_rig := KCombatArthropodScript.new("spider")
	check(spider_rig.play_clip("spider_rear_bite") == "spider_rear_bite", "Started spider_rear_bite on KCombatArthropod instance")
	spider_rig.tick(0.52)
	var posed_ok := spider_rig.apply_to_nodes(nodes_map, root_wrap)
	check(posed_ok
		and root_wrap.position.z > 0.30
		and (nodes_map["jaw"] as Node3D).quaternion.angle_to(Quaternion.IDENTITY) > 0.65
		and (nodes_map["leg0L"] as Node3D).quaternion.angle_to(Quaternion.IDENTITY) > 0.45,
		"apply_to_nodes() posed live Node3D arthropod hierarchy & root_wrap lunge (z=+%.2fm)" % root_wrap.position.z)

	# Return to idle and apply crippled/severed Fore-Left ('left_arm') trauma -> curls leg0L/leg1L while leg0R stays uncurled!
	spider_rig.play_clip("arthro_idle")
	var sp_stats := KCombatStats.new("human")
	sp_stats.toughness = 0.0
	sp_stats.apply_limb_damage("left_arm", 210.0, "cut", true)
	spider_rig.set_limb_state(sp_stats.limbs)
	spider_rig.apply_to_nodes(nodes_map, root_wrap)
	check((nodes_map["leg0L"] as Node3D).quaternion.angle_to(Quaternion.IDENTITY) > 0.70
		and (nodes_map["leg0Lt"] as Node3D).quaternion.angle_to(Quaternion.IDENTITY) > 0.60
		and (nodes_map["leg0R"] as Node3D).quaternion.is_equal_approx(Quaternion.IDENTITY)
		and (nodes_map["thorax"] as Node3D).quaternion.angle_to(Quaternion.IDENTITY) > 0.05,
		"Severed Fore-Left ('left_arm') curls leg0L/leg0Lt/leg1L under body, tilts thorax, and leaves leg0R uncurled")

	root_wrap.free()
	for k in nodes_map:
		(nodes_map[k] as Node3D).free()

	# 9c. Live KCombatDirector exchanges: Staghorn Beetle horn_gore knockdown & Emperor Hornet hover sweep immunity
	var dir := KCombatDirector.new(links)
	root.add_child(dir)

	var beetle_stats := KCombatStats.new("giant")
	beetle_stats.configure_from_kchar(presets_by_id["staghorn_beetle"])
	beetle_stats.strength = 96.0
	var legionary_stats := KCombatStats.new("human")
	var beetle_brain := KCombatBrain.new().setup("staghorn_beetle", beetle_stats, links, dir)
	var legionary_brain := KCombatBrain.new().setup("iziz_legionary", legionary_stats, links, dir)
	dir.add_child(beetle_brain)
	dir.add_child(legionary_brain)

	var gore_ex := dir.begin_exchange(beetle_brain, legionary_brain, "beetle_horn_gore", "hit")
	for i in 14:
		dir.tick(0.05)
	check(bool(gore_ex["hit_report"].get("knocked_down", false))
		and legionary_brain.state == KCombatBrain.State.DOWNED
		and legionary_brain.current_clip == "knock_down",
		"Staghorn Beetle 'beetle_horn_gore' skyward toss knocks down human defender ('knock_down')")
	for i in 16:
		dir.tick(0.05)
	check(legionary_brain.state == KCombatBrain.State.DOWNED and legionary_brain.current_clip == "ual_get_up",
		"Gored defender transitions cleanly from 'knock_down' -> 'ual_get_up'")

	var hornet_stats := KCombatStats.new("human")
	hornet_stats.configure_from_kchar(presets_by_id["emperor_hornet"])
	var hornet_brain := KCombatBrain.new().setup("emperor_hornet", hornet_stats, links, dir)
	var monk_brain := KCombatBrain.new().setup("crimson_monk", KCombatStats.new("human"), links, dir)
	dir.add_child(hornet_brain)
	dir.add_child(monk_brain)
	check(hornet_brain.stats.is_hover_entity and hornet_brain.stats.is_immune_to_trip(),
		"Emperor Hornet preset ('hover': true) configures KCombatStats as hover trip-immune entity")

	var hornet_poise_before := hornet_brain.stats.poise
	var sweep_hornet_ex := dir.begin_exchange(monk_brain, hornet_brain, "leg_sweep", "hit")
	for i in 15:
		dir.tick(0.05)
	check(bool(sweep_hornet_ex["hit_report"].get("trip_immune_converted", false))
		and not bool(sweep_hornet_ex["hit_report"].get("knocked_down", true))
		and hornet_brain.state != KCombatBrain.State.DOWNED
		and hornet_brain.stats.poise < hornet_poise_before,
		"Hovering Emperor Hornet resists 'leg_sweep' knockdown and takes Poise chip instead (%.1f -> %.1f)" % [
			hornet_poise_before,
			hornet_brain.stats.poise,
		])

	dir.free()



