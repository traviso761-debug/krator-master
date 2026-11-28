# KCombatAudio: Godot 4 3D Combat SFX controller driven by data/combat-cues.json and CC0 MP3 clips
# in res://data/sfx/combat/fs-*.mp3. Pools 8 AudioStreamPlayer3D voices, connects to KCombatDirector
# signals (exchange_started, exchange_reaction, exchange_contact), applies deterministic variant
# non-repeating selection + pitch_scale + volume_db + start_offset trimming, and records
# last_played_cue / cue_history for headless verification.
class_name KCombatAudio
extends Node

signal cue_played(cue_key: String, info: Dictionary)

const POOL_SIZE := 8
const SFX_DIR := "res://data/sfx/combat"

@export var enabled: bool = true
@export var seed_value: int = 0x4B524154

var source_path: String = ""
var cues: Dictionary = {}                    # cue_key -> normalized cue Dictionary
var streams: Dictionary = {}                 # short_clip_id ("fs-72191") -> AudioStreamMP3
var director: KCombatDirector = null

var last_played_cue: String = ""
var last_played_info: Dictionary = {}
var cue_history: Array[String] = []

var _cue_states: Dictionary = {}             # cue_key -> {n, recent, last}
var _players: Array[AudioStreamPlayer3D] = []
var _pool_cursor: int = 0
var _clock: float = 0.0
var _watched_brains: Dictionary = {}         # instance_id -> bool


func _init(p_director: KCombatDirector = null, preferred_cues_path: String = "") -> void:
	_ensure_pool()
	load_cues_and_streams(preferred_cues_path)
	if p_director != null:
		bind_director(p_director)


func _ready() -> void:
	_ensure_pool()
	if cues.is_empty():
		load_cues_and_streams()
	if director == null and get_parent() is KCombatDirector:
		bind_director(get_parent() as KCombatDirector)


func _process(dt: float) -> void:
	if dt > 0.0:
		_clock += dt


func _ensure_pool() -> void:
	while _players.size() < POOL_SIZE:
		var p := AudioStreamPlayer3D.new()
		p.name = "CombatVoice_%d" % _players.size()
		p.max_polyphony = 1
		p.attenuation_model = AudioStreamPlayer3D.ATTENUATION_INVERSE_DISTANCE
		add_child(p)
		_players.append(p)


func get_pool_size() -> int:
	return _players.size()


static func candidate_cues_paths(preferred_path: String = "") -> Array[String]:
	var out: Array[String] = []
	if preferred_path != "":
		out.append(preferred_path)
	out.append("res://data/sfx/combat/combat-cues.json")
	out.append("res://data/characters/combat-cues.json")
	out.append("res://data/combat-cues.json")
	var proj_root := ProjectSettings.globalize_path("res://").simplify_path()
	var repo_root := proj_root.get_base_dir()
	out.append(repo_root.path_join("core/charactermodels/data/combat-cues.json"))
	return out


func load_cues_and_streams(preferred_path: String = "") -> bool:
	cues.clear()
	streams.clear()
	_cue_states.clear()
	source_path = ""

	var parsed: Variant = null
	for p in candidate_cues_paths(preferred_path):
		if FileAccess.file_exists(p):
			var txt := FileAccess.get_file_as_string(p)
			var j: Variant = JSON.parse_string(txt)
			if j is Dictionary:
				parsed = j
				source_path = p
				break

	if not (parsed is Dictionary):
		return false

	var raw_dict: Dictionary = parsed
	for cue_key in raw_dict.keys():
		var raw_cue: Variant = raw_dict[cue_key]
		if not (raw_cue is Dictionary):
			continue
		var norm := _normalize_cue(String(cue_key), raw_cue as Dictionary)
		cues[String(cue_key)] = norm
		_cue_states[String(cue_key)] = {"n": 0, "recent": [], "last": -1e9}
		for v in norm["variants"]:
			var short_id := String(v["short_id"])
			if short_id != "" and not streams.has(short_id):
				var strm := _load_mp3_for_short_id(short_id)
				if strm != null:
					streams[short_id] = strm

	return not cues.is_empty()


static func _normalize_cue(cue_key: String, r: Dictionary) -> Dictionary:
	var pitch_arr: Array = r.get("pitch", [-1.0, 1.0]) if r.get("pitch") is Array else [-1.0, 1.0]
	var gain_arr: Array = r.get("gainDb", [-2.0, 0.0]) if r.get("gainDb") is Array else [-2.0, 0.0]
	var p0 := float(pitch_arr[0]) if pitch_arr.size() > 0 else -1.0
	var p1 := float(pitch_arr[1]) if pitch_arr.size() > 1 else p0
	if p0 > p1:
		var tmp := p0; p0 = p1; p1 = tmp
	var g0 := float(gain_arr[0]) if gain_arr.size() > 0 else -2.0
	var g1 := float(gain_arr[1]) if gain_arr.size() > 1 else g0
	if g0 > g1:
		var tmpg := g0; g0 = g1; g1 = tmpg

	var dist_in: Dictionary = r.get("distance", {}) if r.get("distance") is Dictionary else {}
	var d_min := clampf(float(dist_in.get("min", 2.0)), 0.1, 100.0)
	var d_max := maxf(d_min + 1.0, clampf(float(dist_in.get("max", 40.0)), 1.0, 500.0))

	var variants: Array[Dictionary] = []
	var raw_vars: Array = r.get("variants", []) if r.get("variants") is Array else []
	for rv in raw_vars:
		if not (rv is Dictionary):
			continue
		var vd: Dictionary = rv
		var clip_id := String(vd.get("clip", ""))
		var file_field := String(vd.get("file", ""))
		var short_id := ""
		if file_field != "":
			short_id = file_field.get_file().get_basename()
		if short_id == "":
			short_id = clip_id.trim_prefix("lotsofsounds-")
		variants.append({
			"clip": clip_id,
			"short_id": short_id,
			"start": maxf(0.0, float(vd.get("start", 0.0))),
			"end": maxf(0.0, float(vd.get("end", 0.0))),
			"weight": clampf(float(vd.get("weight", 1.0)), 0.1, 10.0),
			"fx": vd.get("fx", {}) if vd.get("fx") is Dictionary else {},
			"name": String(vd.get("name", short_id)),
		})

	return {
		"key": cue_key,
		"id": String(r.get("id", "sfx.combat." + cue_key.replace("_", "-"))).to_lower(),
		"bus": String(r.get("bus", "sfx")),
		"variants": variants,
		"pitch": [clampf(p0, -12.0, 12.0), clampf(p1, -12.0, 12.0)],
		"gain_db": [clampf(g0, -24.0, 6.0), clampf(g1, -24.0, 6.0)],
		"no_repeat": clampi(int(r.get("noRepeat", 1)), 0, 8),
		"cooldown": clampf(float(r.get("cooldown", 0.0)), 0.0, 10.0),
		"max_voices": clampi(int(r.get("maxVoices", 4)), 1, 32),
		"distance_min": d_min,
		"distance_max": d_max,
	}


static func _load_mp3_for_short_id(short_id: String) -> AudioStreamMP3:
	var res_path := "%s/%s.mp3" % [SFX_DIR, short_id]
	var candidates: Array[String] = [
		res_path,
		ProjectSettings.globalize_path(res_path).simplify_path(),
		ProjectSettings.globalize_path("res://").simplify_path().get_base_dir().path_join("core/charactermodels/pieces/sfx_combat/%s.mp3" % short_id),
	]
	for p in candidates:
		if FileAccess.file_exists(p):
			var bytes := FileAccess.get_file_as_bytes(p)
			if not bytes.is_empty():
				var stream := AudioStreamMP3.new()
				stream.data = bytes
				return stream
	if ResourceLoader.exists(res_path):
		var loaded := ResourceLoader.load(res_path)
		if loaded is AudioStreamMP3:
			return loaded as AudioStreamMP3
	return null


# ---- Director Signal Binding ----

func bind_director(p_director: KCombatDirector) -> void:
	if director == p_director:
		return
	unbind_director()
	director = p_director
	if director == null:
		return
	if not director.exchange_started.is_connected(_on_exchange_started):
		director.exchange_started.connect(_on_exchange_started)
	if not director.exchange_reaction.is_connected(_on_exchange_reaction):
		director.exchange_reaction.connect(_on_exchange_reaction)
	if not director.exchange_contact.is_connected(_on_exchange_contact):
		director.exchange_contact.connect(_on_exchange_contact)


func unbind_director() -> void:
	if director == null or not is_instance_valid(director):
		director = null
		return
	if director.exchange_started.is_connected(_on_exchange_started):
		director.exchange_started.disconnect(_on_exchange_started)
	if director.exchange_reaction.is_connected(_on_exchange_reaction):
		director.exchange_reaction.disconnect(_on_exchange_reaction)
	if director.exchange_contact.is_connected(_on_exchange_contact):
		director.exchange_contact.disconnect(_on_exchange_contact)
	director = null


func _watch_brain_reload(brain: Variant) -> void:
	if not (brain is KCombatBrain):
		return
	var b := brain as KCombatBrain
	var iid := b.get_instance_id()
	if _watched_brains.has(iid):
		return
	_watched_brains[iid] = true
	b.clip_triggered.connect(func(clip_name: String) -> void:
		if clip_name == "reload_kneel" or clip_name == "reload":
			_clock += 0.12
			play_cue("gun_reload", _fighter_pos(b))
	)


static func _fighter_pos(brain_var: Variant) -> Variant:
	if brain_var is KCombatBrain:
		var b := brain_var as KCombatBrain
		if b.actor_3d != null and is_instance_valid(b.actor_3d):
			return b.actor_3d.global_position if b.actor_3d.is_inside_tree() else b.actor_3d.position
	return null


func _on_exchange_started(ex: Dictionary) -> void:
	_clock += 0.12
	var atk: Variant = ex.get("attacker")
	_watch_brain_reload(atk)
	var link: Dictionary = ex.get("link", {}) if ex.get("link") is Dictionary else {}
	var atk_key := String(link.get("attack", ""))
	var pos: Variant = _fighter_pos(atk)
	match atk_key:
		"energy_burst":
			play_cue("energy_burst_charge", pos)
		"lightning_blast":
			play_cue("lightning_blast", pos)
		"bow_shot":
			play_cue("bow_shot", pos)
		"gun_shot":
			play_cue("gun_shot", pos)
		_:
			play_cue("windup_whoosh", pos)


func _on_exchange_reaction(ex: Dictionary) -> void:
	_clock += 0.08
	var outcome := String(ex.get("outcome", ""))
	if outcome == "dodge":
		play_cue("dodge_step", _fighter_pos(ex.get("defender")))


func _on_exchange_contact(ex: Dictionary, report: Dictionary) -> void:
	_clock += maxf(0.12, float(ex.get("contact_t", 0.35)))
	var link: Dictionary = ex.get("link", {}) if ex.get("link") is Dictionary else {}
	var atk_key := String(link.get("attack", ""))
	var dmg_type := String(link.get("dmg_type", "blunt"))
	var outcome := String(report.get("outcome", ex.get("outcome", "hit")))
	var pos: Variant = _fighter_pos(ex.get("defender"))

	match outcome:
		"parry", "perfect_parry":
			play_cue("parry_ring", pos)
		"block":
			play_cue("block_shield", pos)
		"guard_break":
			play_cue("block_shield", pos)
			play_cue("guard_break", pos)
		"dodge":
			if not bool(ex.get("reacted", false)):
				play_cue("dodge_step", pos)
		_:
			if atk_key == "energy_burst":
				play_cue("energy_burst_boom", pos)
			elif atk_key == "lightning_blast":
				play_cue("lightning_blast", pos)
			elif dmg_type == "cut" or dmg_type == "pierce":
				play_cue("hit_cut", pos)
			else:
				play_cue("hit_blunt", pos)

	if outcome != "guard_break" and bool(report.get("guard_broken", false)):
		play_cue("guard_break", pos)

	var limb_rep: Variant = report.get("limb_report")
	if limb_rep is Dictionary and bool((limb_rep as Dictionary).get("severed", false)):
		play_cue("sever_limb", pos)
	elif atk_key == "gun_shot" and String(link.get("attacker_followup", "")) == "reload_kneel":
		_clock += 0.12
		play_cue("gun_reload", _fighter_pos(ex.get("attacker")))


# ---- Cue Playback & Deterministic Variant / Pitch / Gain Selection ----

static func _fnv_id_hash(s: String) -> int:
	var h: int = 2166136261
	for i in s.length():
		h = (h ^ s.unicode_at(i)) & 0xFFFFFFFF
		h = (h * 16777619) & 0xFFFFFFFF
	return h


static func _unit_hash(seed_in: int, id_h: int, play_n: int, salt: int) -> float:
	var x: int = (seed_in ^ (id_h * 0x9E3779B1) ^ (play_n * 0x85EBCA6B) ^ (salt * 0xC2B2AE35)) & 0xFFFFFFFF
	x = ((x ^ (x >> 16)) * 0x7FEB352D) & 0xFFFFFFFF
	x = ((x ^ (x >> 15)) * 0x846CA68B) & 0xFFFFFFFF
	x = (x ^ (x >> 16)) & 0xFFFFFFFF
	return float(x) / 4294967296.0


func _acquire_player() -> AudioStreamPlayer3D:
	_ensure_pool()
	for i in _players.size():
		var idx := (_pool_cursor + i) % _players.size()
		if not _players[idx].playing:
			_pool_cursor = (idx + 1) % _players.size()
			return _players[idx]
	var fallback := _players[_pool_cursor % _players.size()]
	_pool_cursor = (_pool_cursor + 1) % _players.size()
	return fallback


func play_cue(cue_key: String, world_pos: Variant = null) -> Dictionary:
	if not enabled or not cues.has(cue_key):
		return {}
	var cue: Dictionary = cues[cue_key]
	var variants: Array = cue["variants"]
	if variants.is_empty():
		return {}

	var st: Dictionary = _cue_states[cue_key]
	var cooldown := float(cue["cooldown"])
	if (_clock - float(st["last"])) < cooldown:
		return {}

	var v_len := variants.size()
	var avoid := mini(int(cue["no_repeat"]), v_len - 1)
	var recent: Array = st["recent"]
	var blocked: Array = recent.slice(maxi(0, recent.size() - avoid)) if avoid > 0 else []

	var id_h := _fnv_id_hash(String(cue["id"]))
	var n_play := int(st["n"])
	var u1 := _unit_hash(seed_value, id_h, n_play, 1)
	var u2 := _unit_hash(seed_value, id_h, n_play, 2)
	var u3 := _unit_hash(seed_value, id_h, n_play, 3)

	var total_weight := 0.0
	for i in v_len:
		if not blocked.has(i):
			total_weight += float(variants[i]["weight"])

	var r := u1 * total_weight
	var pick := -1
	for i in v_len:
		if blocked.has(i):
			continue
		r -= float(variants[i]["weight"])
		if r <= 0.0:
			pick = i
			break
	if pick < 0:
		for i in range(v_len - 1, -1, -1):
			if not blocked.has(i):
				pick = i
				break
	if pick < 0:
		pick = 0

	var v: Dictionary = variants[pick]
	var fx: Dictionary = v["fx"]
	var pitch_range: Array = cue["pitch"]
	var gain_range: Array = cue["gain_db"]
	var semitones := lerpf(float(pitch_range[0]), float(pitch_range[1]), u2) + float(fx.get("pitch", 0.0))
	var fx_speed := float(fx.get("speed", 1.0)) if fx.has("speed") else 1.0
	var pitch_scale := clampf(pow(2.0, semitones / 12.0) * fx_speed, 0.25, 3.0)
	var vol_db := lerpf(float(gain_range[0]), float(gain_range[1]), u3)
	if fx.has("vol") and float(fx["vol"]) > 0.0:
		vol_db += linear_to_db(float(fx["vol"]))
	var start_offset := maxf(0.0, float(v["start"]))
	var short_id := String(v["short_id"])

	st["n"] = n_play + 1
	st["last"] = _clock
	recent.append(pick)
	if recent.size() > 8:
		recent.pop_front()

	var player := _acquire_player()
	var stream: AudioStreamMP3 = streams.get(short_id) as AudioStreamMP3
	if stream != null:
		var bus_name := String(cue["bus"])
		player.bus = bus_name if AudioServer.get_bus_index(bus_name) >= 0 else &"Master"
		player.stream = stream
		player.pitch_scale = pitch_scale
		player.volume_db = vol_db
		player.unit_size = float(cue["distance_min"])
		player.max_distance = float(cue["distance_max"])
		if world_pos is Vector3:
			if player.is_inside_tree():
				player.global_position = world_pos as Vector3
			else:
				player.position = world_pos as Vector3
		if player.is_inside_tree():
			player.play(start_offset)

	var info := {
		"cue": cue_key,
		"id": String(cue["id"]),
		"clip": short_id,
		"variant": pick,
		"pitch_scale": pitch_scale,
		"volume_db": vol_db,
		"start_offset": start_offset,
		"has_stream": stream != null,
	}
	last_played_cue = cue_key
	last_played_info = info
	cue_history.append(cue_key)
	if cue_history.size() > 64:
		cue_history.pop_front()
	cue_played.emit(cue_key, info)
	return info
