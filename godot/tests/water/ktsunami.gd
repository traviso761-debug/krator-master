# Godot 4.7.2 twin of core/water/ext/64-core-water-tsunami.js (WATER.tsunami)  [G data]
# Pure data & wave-train run-up math: models 'seamount' (seismic/eruptive tremor lead) and 'ghost'
# (silent orphan teletsunami arrival betrayed only by rapid ocean drawdown) coastal tsunamis across
# static inspection presets ('calm', 'tremor', 'drawdown', 'bore', 'runup', 'backwash', 'seiche')
# and continuous 'live' progression from trigger(t_now) or periodic repeat.
# Synced to godot/tests/water/ktsunami.gd by godot/tools/sync_core.py; verified by ktsunami_test.gd.
class_name KratorTsunami
extends RefCounted

const VALID_REGIMES: Array[String] = ["seamount", "ghost"]
const VALID_MODES: Array[String] = ["calm", "tremor", "drawdown", "bore", "runup", "backwash", "seiche", "live"]
const TIMING_KEYS: Array[String] = ["tremor", "drawdown", "bore", "hold", "backwash", "seiche"]

var is_valid: bool = false
var last_error: String = ""

var kind: String = "tsunami"
var key: String = "tsunami"
var ts_name: String = "Tsunami wave-train"
var regime: String = "seamount"
var g: float = 7.36
var dir: Array[float] = [1.0, 0.0]
var shore_origin: Array[float] = [0.0, 0.0]
var bounds: Array[float] = [-2600.0, -2600.0, 2600.0, 2600.0]

var sea_level_base: float = 0.0
var sea_level_fn: Callable = Callable()
var shelf_depth: float = 40.0
var offshore_slope: float = 0.03
var inland_slope: float = 0.035
var bed_fn: Callable = Callable()
var shelter_fn: Callable = Callable()

var start_s: float = -650.0
var inland_reach_m: float = 950.0
var front_width_m: float = 28.0
var drawdown_m: float = 7.0
var bore_height_m: float = 14.0
var runup_max_m: float = 28.0
var trimline_m: float = 28.0
var bore_speed: float = 0.0
var has_period: bool = false
var period: float = 0.0
var timings: Dictionary = {}
var seed_u32: int = 0x5453554E

var _cur_mode: String = "calm"
var _has_t0: bool = false
var _t0: float = 0.0
var _t1: float = 0.0
var _t2: float = 0.0
var _t3: float = 0.0
var _t4: float = 0.0
var _t5: float = 0.0
var _t6: float = 0.0
var _p_bore_preset: float = 0.42


static func create(spec: Dictionary = {}) -> KratorTsunami:
	var inst: KratorTsunami = KratorTsunami.new()
	inst.configure(spec)
	return inst


static func _is_num(v: Variant) -> bool:
	if v is bool:
		return false
	if v is int or v is float:
		return is_finite(float(v))
	return false


static func _sm(a: float, b: float, x: float) -> float:
	if b <= a:
		return 0.0 if x < a else 1.0
	var t_val: float = clampf((x - a) / (b - a), 0.0, 1.0)
	return t_val * t_val * (3.0 - 2.0 * t_val)


static func _fmod_pos(x: float, p: float) -> float:
	var u_val: float = x - p * floor(x / p)
	if u_val >= p:
		u_val -= p
	return u_val


func _fail(msg: String) -> bool:
	is_valid = false
	last_error = "KratorTsunami: " + msg
	return false


func configure(spec: Dictionary = {}) -> bool:
	is_valid = false
	last_error = ""

	key = str(spec["key"]) if (spec.has("key") and spec["key"] != null) else "tsunami"
	if key.is_empty():
		return _fail("key must be a non-empty string")
	ts_name = str(spec["name"]) if (spec.has("name") and spec["name"] != null) else "Tsunami wave-train"

	regime = str(spec["regime"]) if (spec.has("regime") and spec["regime"] != null) else "seamount"
	if not VALID_REGIMES.has(regime):
		return _fail("regime must be 'seamount' or 'ghost'")

	var g_v: Variant = spec.get("g", 7.36)
	if g_v == null:
		g_v = 7.36
	if not _is_num(g_v) or float(g_v) <= 0.0:
		return _fail("g must be > 0")
	g = float(g_v)

	var raw_dir_v: Variant = spec.get("dir", [1.0, 0.0])
	if raw_dir_v == null:
		raw_dir_v = [1.0, 0.0]
	if not (raw_dir_v is Array) or (raw_dir_v as Array).size() != 2:
		return _fail("dir must be [dx, dz]")
	var raw_dir: Array = raw_dir_v
	if not (_is_num(raw_dir[0]) and _is_num(raw_dir[1])):
		return _fail("dir entries must be finite numbers")
	var dx: float = float(raw_dir[0])
	var dz: float = float(raw_dir[1])
	var d_len: float = sqrt(dx * dx + dz * dz)
	if not (d_len > 1e-9):
		return _fail("dir [dx, dz] cannot be zero")
	dir = [dx / d_len, dz / d_len]

	var raw_orig_v: Variant = spec.get("shoreOrigin", [0.0, 0.0])
	if raw_orig_v == null:
		raw_orig_v = [0.0, 0.0]
	if not (raw_orig_v is Array) or (raw_orig_v as Array).size() != 2:
		return _fail("shoreOrigin must be [x0, z0]")
	var raw_orig: Array = raw_orig_v
	if not (_is_num(raw_orig[0]) and _is_num(raw_orig[1])):
		return _fail("shoreOrigin entries must be finite numbers")
	shore_origin = [float(raw_orig[0]), float(raw_orig[1])]

	sea_level_fn = Callable()
	sea_level_base = 0.0
	if spec.has("seaLevel") and spec["seaLevel"] != null:
		var sl_v: Variant = spec["seaLevel"]
		if sl_v is Callable:
			var sl_c: Callable = sl_v
			if not sl_c.is_valid():
				return _fail("seaLevel Callable is invalid")
			sea_level_fn = sl_c
		elif _is_num(sl_v):
			sea_level_base = float(sl_v)
		else:
			return _fail("seaLevel must be a finite number or Callable")

	var sd_v: Variant = spec.get("shelfDepth", 40.0)
	if sd_v == null:
		sd_v = 40.0
	if not _is_num(sd_v) or float(sd_v) <= 0.0:
		return _fail("shelfDepth must be > 0")
	shelf_depth = float(sd_v)

	var os_v: Variant = spec.get("offshoreSlope", 0.03)
	if os_v == null:
		os_v = 0.03
	if not _is_num(os_v) or float(os_v) <= 0.0:
		return _fail("offshoreSlope must be > 0")
	offshore_slope = float(os_v)

	var is_v: Variant = spec.get("inlandSlope", 0.035)
	if is_v == null:
		is_v = 0.035
	if not _is_num(is_v) or float(is_v) <= 0.0:
		return _fail("inlandSlope must be > 0")
	inland_slope = float(is_v)

	bed_fn = Callable()
	if spec.has("bed") and spec["bed"] != null:
		var bed_v: Variant = spec["bed"]
		if not (bed_v is Callable) or not (bed_v as Callable).is_valid():
			return _fail("bed must be a valid Callable")
		bed_fn = bed_v

	shelter_fn = Callable()
	if spec.has("shelterFn") and spec["shelterFn"] != null:
		var sh_v: Variant = spec["shelterFn"]
		if not (sh_v is Callable) or not (sh_v as Callable).is_valid():
			return _fail("shelterFn must be a valid Callable")
		shelter_fn = sh_v

	var raw_b_v: Variant = spec.get("bounds", [-2600.0, -2600.0, 2600.0, 2600.0])
	if raw_b_v == null:
		raw_b_v = [-2600.0, -2600.0, 2600.0, 2600.0]
	if not (raw_b_v is Array) or (raw_b_v as Array).size() != 4:
		return _fail("bounds must be [x0, z0, x1, z1]")
	var raw_b: Array = raw_b_v
	if not (_is_num(raw_b[0]) and _is_num(raw_b[1]) and _is_num(raw_b[2]) and _is_num(raw_b[3])):
		return _fail("bounds entries must be finite numbers")
	bounds = [float(raw_b[0]), float(raw_b[1]), float(raw_b[2]), float(raw_b[3])]
	if not (bounds[2] > bounds[0] and bounds[3] > bounds[1]):
		return _fail("bounds require x1 > x0 and z1 > z0")

	var ss_v: Variant = spec.get("startS", -650.0)
	if ss_v == null:
		ss_v = -650.0
	if not _is_num(ss_v) or not (float(ss_v) < 0.0):
		return _fail("startS must be < 0 (offshore)")
	start_s = float(ss_v)

	var ir_v: Variant = spec.get("inlandReachM", 950.0)
	if ir_v == null:
		ir_v = 950.0
	if not _is_num(ir_v) or float(ir_v) <= 0.0:
		return _fail("inlandReachM must be > 0")
	inland_reach_m = float(ir_v)

	var fw_v: Variant = spec.get("frontWidthM", 28.0)
	if fw_v == null:
		fw_v = 28.0
	if not _is_num(fw_v) or float(fw_v) <= 0.0:
		return _fail("frontWidthM must be > 0")
	front_width_m = float(fw_v)

	var dd_v: Variant = spec.get("drawdownM", 7.0)
	if dd_v == null:
		dd_v = 7.0
	if not _is_num(dd_v) or float(dd_v) <= 0.0:
		return _fail("drawdownM must be > 0")
	drawdown_m = float(dd_v)

	var bh_v: Variant = spec.get("boreHeightM", 14.0)
	if bh_v == null:
		bh_v = 14.0
	if not _is_num(bh_v) or float(bh_v) <= 0.0:
		return _fail("boreHeightM must be > 0")
	bore_height_m = float(bh_v)

	var rm_v: Variant = spec.get("runupMaxM", 28.0)
	if rm_v == null:
		rm_v = 28.0
	if not _is_num(rm_v) or float(rm_v) <= 0.0:
		return _fail("runupMaxM must be > 0")
	runup_max_m = float(rm_v)
	trimline_m = runup_max_m

	var def_spd: float = sqrt(g * maxf(4.0, bore_height_m * 1.4))
	var bs_v: Variant = spec.get("boreSpeed", def_spd)
	if bs_v == null:
		bs_v = def_spd
	if not _is_num(bs_v) or float(bs_v) <= 0.0:
		return _fail("boreSpeed must be > 0")
	bore_speed = float(bs_v)

	has_period = false
	period = 0.0
	if spec.has("period") and spec["period"] != null:
		var per_v: Variant = spec["period"]
		if not _is_num(per_v) or float(per_v) <= 0.0:
			return _fail("period must be > 0")
		has_period = true
		period = float(per_v)

	var raw_tm_v: Variant = spec.get("timings", {})
	if raw_tm_v == null:
		raw_tm_v = {}
	if not (raw_tm_v is Dictionary):
		return _fail("timings must be a Dictionary")
	var raw_tm: Dictionary = raw_tm_v
	for tk_v in raw_tm.keys():
		var tk_s: String = str(tk_v)
		if not TIMING_KEYS.has(tk_s):
			return _fail("unknown timing key " + tk_s)

	var defaults_tm: Dictionary = {
		"tremor": 0.0 if regime == "ghost" else 12.0,
		"drawdown": 26.0,
		"bore": 38.0,
		"hold": 14.0,
		"backwash": 42.0,
		"seiche": 24.0,
	}
	timings = {}
	for k_name in TIMING_KEYS:
		var tv: Variant = raw_tm.get(k_name, defaults_tm[k_name])
		if tv == null:
			tv = defaults_tm[k_name]
		if not _is_num(tv) or float(tv) < 0.0:
			return _fail("timings." + k_name + " must be >= 0")
		timings[k_name] = 0.0 if (regime == "ghost" and k_name == "tremor") else float(tv)

	var m_str: String = str(spec["mode"]) if (spec.has("mode") and spec["mode"] != null) else "calm"
	if not VALID_MODES.has(m_str):
		return _fail("invalid mode " + m_str)
	_cur_mode = m_str

	var sd_seed_v: Variant = spec.get("seed", 0x5453554E)
	if sd_seed_v == null:
		sd_seed_v = 0x5453554E
	if not _is_num(sd_seed_v):
		return _fail("seed must be numeric")
	seed_u32 = int(sd_seed_v) & 0xFFFFFFFF

	if spec.has("t0") and spec["t0"] != null:
		if not _is_num(spec["t0"]):
			return _fail("t0 must be finite")
		_has_t0 = true
		_t0 = float(spec["t0"])
	elif _cur_mode == "live" or has_period:
		_has_t0 = true
		_t0 = 0.0
	else:
		_has_t0 = false
		_t0 = 0.0

	_t1 = float(timings["tremor"])
	_t2 = _t1 + float(timings["drawdown"])
	_t3 = _t2 + float(timings["bore"])
	_t4 = _t3 + float(timings["hold"])
	_t5 = _t4 + float(timings["backwash"])
	_t6 = _t5 + float(timings["seiche"])
	_p_bore_preset = clampf((-start_s + 0.6 * front_width_m) / (inland_reach_m - start_s), 0.1, 0.9)

	is_valid = true
	return true


func set_mode(m: String) -> Dictionary:
	if not VALID_MODES.has(m):
		last_error = "KratorTsunami.set_mode: invalid mode " + m
		return {}
	_cur_mode = m
	if m == "live" and not _has_t0:
		_has_t0 = true
		_t0 = 0.0
	return state_at(_t0 if _has_t0 else 0.0)


func get_mode() -> String:
	return _cur_mode


func trigger(t_now: float = 0.0) -> Dictionary:
	_has_t0 = true
	_t0 = t_now
	_cur_mode = "live"
	return state_at(t_now)


func _sea_base_at(t_val: float) -> float:
	if sea_level_fn.is_valid():
		return float(sea_level_fn.call(t_val))
	return sea_level_base


func project(x: float, z: float) -> Dictionary:
	var rx: float = x - shore_origin[0]
	var rz: float = z - shore_origin[1]
	return {
		"s": rx * dir[0] + rz * dir[1],
		"q": -rx * dir[1] + rz * dir[0],
	}


func bed_at(x: float, z: float) -> float:
	if bed_fn.is_valid():
		return float(bed_fn.call(x, z))
	var s_val: float = (x - shore_origin[0]) * dir[0] + (z - shore_origin[1]) * dir[1]
	if s_val < 0.0:
		return maxf(-shelf_depth, s_val * offshore_slope)
	return s_val * inland_slope


func shelter_at(x: float, z: float) -> float:
	if not shelter_fn.is_valid():
		return 1.0
	return clampf(float(shelter_fn.call(x, z)), 0.0, 1.0)


func contains(x: float, z: float) -> bool:
	return x >= bounds[0] and z >= bounds[1] and x <= bounds[2] and z <= bounds[3]


func state_at(t: float = 0.0) -> Dictionary:
	var sea_base_y: float = _sea_base_at(t)
	var phase: String = "calm"
	var p: float = 0.0
	var elapsed: float = 0.0

	var d_tremor: float = float(timings["tremor"])
	var d_draw: float = float(timings["drawdown"])
	var d_bore: float = float(timings["bore"])
	var d_hold: float = float(timings["hold"])
	var d_back: float = float(timings["backwash"])
	var d_seiche: float = float(timings["seiche"])

	if _cur_mode != "live":
		if _cur_mode == "calm":
			phase = "calm"
			p = 0.0
			elapsed = 0.0
		elif _cur_mode == "tremor":
			phase = "tremor"
			p = 0.5
			elapsed = 0.5 * d_tremor
		elif _cur_mode == "drawdown":
			phase = "drawdown"
			p = 0.85
			elapsed = _t1 + 0.85 * d_draw
		elif _cur_mode == "bore":
			phase = "bore"
			p = _p_bore_preset
			elapsed = _t2 + _p_bore_preset * d_bore
		elif _cur_mode == "runup":
			phase = "runup"
			p = 0.5
			elapsed = _t3 + 0.5 * d_hold
		elif _cur_mode == "backwash":
			phase = "backwash"
			p = 0.45
			elapsed = _t4 + 0.45 * d_back
		elif _cur_mode == "seiche":
			phase = "seiche"
			p = 0.18
			elapsed = _t5 + 0.18 * d_seiche
	elif _has_t0 or has_period:
		var orig: float = _t0 if _has_t0 else 0.0
		var raw_el: float = t - orig
		elapsed = _fmod_pos(raw_el, period) if has_period else raw_el
		if elapsed < 0.0 or elapsed >= _t6 or _t6 <= 0.0:
			phase = "calm"
			p = 0.0
		elif d_tremor > 0.0 and elapsed < _t1:
			phase = "tremor"
			p = elapsed / d_tremor
		elif d_draw > 0.0 and elapsed < _t2:
			phase = "drawdown"
			p = (elapsed - _t1) / d_draw
		elif d_bore > 0.0 and elapsed < _t3:
			phase = "bore"
			p = (elapsed - _t2) / d_bore
		elif d_hold > 0.0 and elapsed < _t4:
			phase = "runup"
			p = (elapsed - _t3) / d_hold
		elif d_back > 0.0 and elapsed < _t5:
			phase = "backwash"
			p = (elapsed - _t4) / d_back
		elif d_seiche > 0.0 and elapsed < _t6:
			phase = "seiche"
			p = (elapsed - _t5) / d_seiche

	p = clampf(p, 0.0, 1.0)
	var tremor_amp: float = (0.25 + 0.75 * sin(PI * p)) if (regime == "seamount" and phase == "tremor") else 0.0
	var sea_offset_m: float = 0.0
	var bore_s: float = start_s
	var cur_bore_h: float = 0.0
	var runup_env_y: float = sea_base_y

	if phase == "tremor":
		sea_offset_m = 0.0
		bore_s = start_s
		cur_bore_h = 0.0
		runup_env_y = sea_base_y
	elif phase == "drawdown":
		sea_offset_m = -drawdown_m * _sm(0.0, 0.85, p)
		bore_s = start_s
		cur_bore_h = 0.0
		runup_env_y = sea_base_y + sea_offset_m
	elif phase == "bore":
		sea_offset_m = -drawdown_m * (1.0 - p) + 0.35 * bore_height_m * _sm(0.25, 1.0, p)
		bore_s = start_s + (inland_reach_m - start_s) * p
		cur_bore_h = bore_height_m * (1.0 - 0.25 * _sm(0.75, 1.0, p))
		runup_env_y = sea_base_y + bore_height_m + (runup_max_m - bore_height_m) * _sm(0.0, inland_reach_m, maxf(0.0, bore_s))
	elif phase == "runup":
		sea_offset_m = 0.35 * bore_height_m * (1.0 - 0.35 * p)
		bore_s = inland_reach_m
		cur_bore_h = 0.25 * bore_height_m * (1.0 - _sm(0.0, 1.0, p))
		runup_env_y = sea_base_y + runup_max_m * (1.0 - 0.12 * _sm(0.65, 1.0, p))
	elif phase == "backwash":
		sea_offset_m = 0.2275 * bore_height_m * (1.0 - _sm(0.0, 0.45, p)) - 0.15 * drawdown_m * _sm(0.25, 0.75, p) * (1.0 - _sm(0.75, 1.0, p))
		bore_s = inland_reach_m * (1.0 - _sm(0.0, 1.0, p))
		cur_bore_h = 0.0
		runup_env_y = sea_base_y + runup_max_m * 0.88 * (1.0 - _sm(0.35, 0.98, p))
	elif phase == "seiche":
		var s_decay: float = exp(-3.2 * p) * (1.0 - _sm(0.85, 1.0, p))
		sea_offset_m = 0.18 * bore_height_m * s_decay * sin(3.0 * PI * p)
		bore_s = 0.0
		cur_bore_h = 0.0
		runup_env_y = sea_base_y + maxf(0.0, sea_offset_m)

	var sea_y: float = sea_base_y + sea_offset_m
	var is_warn: bool = phase == "tremor" or phase == "drawdown" or phase == "bore"
	var is_active: bool = phase != "calm"

	return {
		"mode": _cur_mode,
		"phase": phase,
		"elapsed": elapsed,
		"phaseProgress": p,
		"seaBaseY": sea_base_y,
		"seaOffsetM": sea_offset_m,
		"seaY": sea_y,
		"boreS": bore_s,
		"boreHeightM": cur_bore_h,
		"runupEnvelopeY": runup_env_y,
		"tremorAmp": tremor_amp,
		"warn": is_warn,
		"active": is_active,
	}


func sample(x: float, z: float, t: float = 0.0) -> Dictionary:
	var st: Dictionary = state_at(t)
	var phase: String = str(st["phase"])
	var p: float = float(st["phaseProgress"])
	var sea_base_y: float = float(st["seaBaseY"])
	var ux: float = dir[0]
	var uz: float = dir[1]
	var rx: float = x - shore_origin[0]
	var rz: float = z - shore_origin[1]
	var s_val: float = rx * ux + rz * uz
	var q_val: float = -rx * uz + rz * ux
	var ground_y: float = bed_at(x, z)
	var shelter: float = shelter_at(x, z)
	var trim_y: float = sea_base_y + runup_max_m * shelter
	var safe_refuge: bool = ground_y >= trim_y

	var level: float = sea_base_y
	var depth_v: float = 0.0
	var wet: bool = false
	var v_along: float = 0.0
	var v_cross: float = 0.0
	var bore_front: float = 0.0
	var foam: float = 0.0

	if phase == "calm" or phase == "tremor":
		level = sea_base_y
		var d_calm: float = level - ground_y
		wet = (not safe_refuge) and d_calm > 0.0
		depth_v = d_calm if wet else 0.0
		var tr_amp: float = float(st["tremorAmp"])
		v_along = (0.18 * tr_amp * shelter) if (phase == "tremor" and wet) else 0.0
		foam = clampf(0.08 * tr_amp * shelter, 0.0, 1.0) if (phase == "tremor" and wet) else 0.0
	elif phase == "drawdown":
		var dd_k: float = _sm(0.0, 0.85, p)
		level = sea_base_y - drawdown_m * shelter * dd_k
		var d_draw: float = level - ground_y
		wet = (not safe_refuge) and d_draw > 0.0
		depth_v = d_draw if wet else 0.0
		var draw_vel_k: float = 0.45 + 0.55 * _sm(0.0, 0.5, p) * (1.0 - 0.3 * _sm(0.85, 1.0, p))
		var shoal_k: float = clampf(1.15 - 0.35 * clampf(depth_v / 25.0, 0.0, 1.0), 0.5, 1.15)
		v_along = (-sqrt(g * drawdown_m) * 0.65 * shelter * draw_vel_k * shoal_k) if wet else 0.0
		foam = clampf(0.18 * dd_k * _sm(4.0, 0.2, depth_v), 0.0, 1.0) if wet else 0.0
	elif phase == "bore":
		var b_s: float = float(st["boreS"])
		var trough_y: float = sea_base_y - drawdown_m * shelter * (1.0 - p)
		if s_val > b_s:
			level = trough_y
			var d_ahead: float = level - ground_y
			wet = (not safe_refuge) and s_val <= inland_reach_m and d_ahead > 0.0
			depth_v = d_ahead if wet else 0.0
			v_along = (-sqrt(g * drawdown_m) * 0.45 * shelter * (1.0 - p)) if wet else 0.0
			foam = clampf(0.15 * _sm(3.0, 0.2, depth_v), 0.0, 1.0) if wet else 0.0
		else:
			var dist_behind: float = b_s - s_val
			var front_rise: float = 0.25 + 0.75 * _sm(0.0, front_width_m * 0.55, dist_behind)
			var front_shape: float = 1.0 - _sm(front_width_m * 0.35, front_width_m * 1.6, dist_behind)
			var raw_bore_front: float = front_shape * shelter
			if s_val <= 0.0:
				var crest_y: float = sea_base_y + bore_height_m * shelter * (0.82 + 0.18 * front_shape)
				var surf_off: float = minf(trough_y + (crest_y - trough_y) * front_rise, trim_y)
				var d_off: float = surf_off - ground_y
				wet = (not safe_refuge) and d_off > 0.0
				depth_v = d_off if wet else 0.0
				level = surf_off if wet else maxf(ground_y, trough_y)
			else:
				var inland_frac: float = clampf(s_val / inland_reach_m, 0.0, 1.0)
				var elev_frac: float = clampf((ground_y - sea_base_y) / (runup_max_m * shelter), 0.0, 1.0) if shelter > 1e-6 else 1.0
				var climb_frac: float = maxf(_sm(0.0, 0.75, inland_frac), elev_frac)
				var base_crest: float = minf(bore_height_m, runup_max_m)
				var surge_above: float = (base_crest + (runup_max_m - base_crest) * climb_frac) * shelter
				var reach_k: float = (1.0 - _sm(0.88, 1.0, inland_frac)) if s_val <= inland_reach_m else 0.0
				var max_d: float = maxf(0.0, trim_y - ground_y) * reach_k * front_rise
				var env_d: float = maxf(0.0, (sea_base_y + surge_above) - ground_y) * reach_k * front_rise
				var d_in: float = minf(max_d, env_d)
				wet = (not safe_refuge) and s_val < inland_reach_m and d_in > 0.0
				depth_v = d_in if wet else 0.0
				level = (ground_y + depth_v) if wet else maxf(ground_y, sea_base_y)
			bore_front = raw_bore_front if wet else 0.0
			var inland_decay: float = (1.0 - 0.45 * clampf(s_val / inland_reach_m, 0.0, 1.0)) if s_val > 0.0 else 1.0
			var front_boost: float = 0.65 + 0.35 * front_shape
			var depth_scale: float = clampf(_sm(0.0, 0.35, depth_v), 0.25, 1.0)
			v_along = (bore_speed * shelter * front_boost * inland_decay * depth_scale) if wet else 0.0
			foam = clampf(0.25 + 0.75 * bore_front + 0.35 * _sm(2.5, 0.15, depth_v), 0.0, 1.0) if wet else 0.0
	elif phase == "runup":
		var hold_env_k: float = 1.0 - 0.12 * _sm(0.65, 1.0, p)
		var surf_run: float = sea_base_y
		if s_val >= 0.0:
			var in_frac_r: float = clampf(s_val / inland_reach_m, 0.0, 1.0)
			var reach_cut: float = (1.0 - _sm(0.92, 1.0, in_frac_r)) if s_val <= inland_reach_m else 0.0
			surf_run = sea_base_y + runup_max_m * shelter * (1.0 - 0.35 * in_frac_r) * hold_env_k * reach_cut
		else:
			var q_arg: float = (s_val - 0.45 * start_s) / 120.0
			var sec_crest: float = 0.28 * bore_height_m * shelter * exp(-(q_arg * q_arg))
			var off_y: float = sea_base_y + float(st["seaOffsetM"]) * shelter + sec_crest
			var pile_y: float = sea_base_y + runup_max_m * shelter * hold_env_k
			surf_run = off_y + (pile_y - off_y) * _sm(start_s * 0.45, 0.0, s_val)
		surf_run = minf(surf_run, trim_y)
		var d_run: float = surf_run - ground_y
		wet = (not safe_refuge) and s_val <= inland_reach_m and d_run > 0.0
		depth_v = d_run if wet else 0.0
		level = surf_run if wet else maxf(ground_y, sea_base_y)
		v_along = (bore_speed * 0.28 * shelter * (1.0 - 1.15 * p)) if wet else 0.0
		v_cross = (bore_speed * 0.08 * shelter * sin(q_val * 0.025 + p * 3.0)) if wet else 0.0
		foam = clampf(0.32 * (1.0 - 0.3 * p) + 0.4 * _sm(2.0, 0.1, depth_v), 0.0, 1.0) if wet else 0.0
	elif phase == "backwash":
		var retreat_above: float = runup_max_m * shelter * (1.0 - _sm(0.35, 0.98, p))
		var drain_tail: float = 1.0 - _sm(0.82, 1.0, p)
		if s_val >= 0.0:
			var in_frac_b: float = clampf(s_val / inland_reach_m, 0.0, 1.0)
			var sheet_top: float = sea_base_y + retreat_above * (1.0 - 0.25 * in_frac_b)
			var wedge_d: float = maxf(0.0, sheet_top - ground_y) if (s_val <= inland_reach_m and not safe_refuge) else 0.0
			var rem_elev: float = clampf(wedge_d / (runup_max_m * shelter), 0.0, 1.0) if shelter > 1e-6 else 0.0
			var sheet_d: float = (0.45 + 3.85 * pow(rem_elev, 0.75)) * shelter * drain_tail
			var early_d: float = minf(wedge_d, 4.5 * shelter + 0.35 * wedge_d)
			var late_d: float = minf(wedge_d, sheet_d)
			var d_back_v: float = early_d + (late_d - early_d) * _sm(0.0, 0.25, p)
			wet = (not safe_refuge) and s_val <= inland_reach_m and d_back_v > 0.0
			depth_v = d_back_v if wet else 0.0
			level = (ground_y + depth_v) if wet else maxf(ground_y, sea_base_y)
		else:
			var shore_sheet_y: float = sea_base_y + minf(retreat_above, 4.3 * shelter * drain_tail)
			var off_back_y: float = sea_base_y + float(st["seaOffsetM"]) * shelter
			var surf_back: float = minf(off_back_y + (shore_sheet_y - off_back_y) * _sm(-180.0, 0.0, s_val), trim_y)
			var d_back_off: float = surf_back - ground_y
			wet = (not safe_refuge) and d_back_off > 0.0
			depth_v = d_back_off if wet else 0.0
			level = surf_back if wet else maxf(ground_y, off_back_y)
		var v_back: float = bore_speed * 0.78 * shelter * (0.35 + 0.65 * sin(PI * clampf(p, 0.08, 0.92)))
		v_along = -v_back if wet else 0.0
		foam = clampf(0.45 * sin(PI * clampf(p, 0.05, 0.95)) + 0.25 * _sm(2.5, 0.2, depth_v), 0.0, 1.0) if wet else 0.0
	elif phase == "seiche":
		var decay: float = exp(-3.2 * p) * (1.0 - _sm(0.85, 1.0, p))
		var seiche_off: float = 0.18 * bore_height_m * shelter * decay * sin(3.0 * PI * p)
		var surf_seiche: float = minf(sea_base_y + seiche_off, trim_y)
		var d_seiche_v: float = surf_seiche - ground_y
		wet = (not safe_refuge) and s_val <= inland_reach_m and d_seiche_v > 0.0
		depth_v = d_seiche_v if wet else 0.0
		level = surf_seiche
		v_along = (bore_speed * 0.22 * shelter * decay * cos(3.0 * PI * p)) if wet else 0.0
		foam = clampf(0.22 * decay * _sm(2.5, 0.1, depth_v), 0.0, 1.0) if wet else 0.0

	var vx: float = v_along * ux - v_cross * uz
	var vz: float = v_along * uz + v_cross * ux
	var spd: float = sqrt(vx * vx + vz * vz)
	var mom_flux: float = (depth_v * spd * spd) if wet else 0.0
	var exposed_shelf: bool = (ground_y < sea_base_y) and not wet

	return {
		"phase": phase,
		"s": s_val,
		"q": q_val,
		"groundY": ground_y,
		"level": level,
		"depth": depth_v,
		"wet": wet,
		"vx": vx,
		"vz": vz,
		"speed": spd,
		"momentumFlux": mom_flux,
		"boreFront": bore_front,
		"foam": foam,
		"exposedShelf": exposed_shelf,
		"safeRefuge": safe_refuge,
	}


func height_at(x: float, z: float, t: float = 0.0) -> Variant:
	var sp: Dictionary = sample(x, z, t)
	if bool(sp["wet"]):
		return float(sp["level"])
	return null


func flow_at(x: float, z: float, t: float = 0.0) -> Array[float]:
	var sp: Dictionary = sample(x, z, t)
	if bool(sp["wet"]):
		return [float(sp["vx"]), float(sp["vz"]), float(sp["speed"]), 0.0]
	return [0.0, 0.0, 0.0, 0.0]
