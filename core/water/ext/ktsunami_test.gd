# Godot 4.7.2 headless golden test for KratorTsunami (core/water/ext/ktsunami.gd vs golden-tsunami.json):
# Verifies both 'seamount' (seismic tremor lead) and 'ghost' (silent drawdown arrival + periodic repeat)
# regimes across all static presets ('calm', 'tremor', 'drawdown', 'bore', 'runup', 'backwash', 'seiche'),
# live time-series progression from trigger(), callable seaLevel(t) + bed(x, z) + shelterFn(x, z),
# and negative validation guards (< 1e-4 parity; in practice < 1e-6).
#   python3 godot/tools/sync_core.py && godot --headless --path godot --script res://tests/water/ktsunami_test.gd
extends SceneTree

const KTsunami = preload("ktsunami.gd")
const TOL: float = 1e-5
const NUM_STATE_KEYS: Array[String] = [
	"elapsed", "phaseProgress", "seaBaseY", "seaOffsetM", "seaY",
	"boreS", "boreHeightM", "runupEnvelopeY", "tremorAmp"
]
const NUM_SAMPLE_KEYS: Array[String] = [
	"s", "q", "groundY", "level", "depth",
	"vx", "vz", "speed", "momentumFlux", "boreFront", "foam"
]

var fails: int = 0


func ok(cond: bool, msg: String) -> void:
	print(("ok   " if cond else "FAIL ") + msg)
	if not cond:
		fails += 1


static func sci(val: float) -> String:
	if val == 0.0:
		return "0"
	var exp_i: int = floori(log(absf(val)) / log(10.0))
	return "%.1fe%d" % [val / pow(10.0, float(exp_i)), exp_i]


static func _state_err(got: Dictionary, want: Dictionary) -> float:
	if str(got["mode"]) != str(want["mode"]) or str(got["phase"]) != str(want["phase"]):
		return 1e9
	if bool(got["warn"]) != bool(want["warn"]) or bool(got["active"]) != bool(want["active"]):
		return 1e9
	var worst: float = 0.0
	for k in NUM_STATE_KEYS:
		worst = maxf(worst, absf(float(got[k]) - float(want[k])))
	return worst


static func _sample_err(got: Dictionary, want: Dictionary) -> float:
	if str(got["phase"]) != str(want["phase"]):
		return 1e9
	if bool(got["wet"]) != bool(want["wet"]):
		return 1e9
	if bool(got["exposedShelf"]) != bool(want["exposedShelf"]):
		return 1e9
	if bool(got["safeRefuge"]) != bool(want["safeRefuge"]):
		return 1e9
	var worst: float = 0.0
	for k in NUM_SAMPLE_KEYS:
		worst = maxf(worst, absf(float(got[k]) - float(want[k])))
	return worst


func _check_regime_presets(label: String, ts: KTsunami, presets: Dictionary, t_eval: float) -> void:
	var max_st_err: float = 0.0
	var max_sp_err: float = 0.0
	var max_ht_err: float = 0.0
	var ht_null_mismatch: int = 0
	var total_pts: int = 0

	for mode_v in presets.keys():
		var m_name: String = str(mode_v)
		ts.set_mode(m_name)
		var entry: Dictionary = presets[m_name]
		var want_st: Dictionary = entry["state"]
		var got_st: Dictionary = ts.state_at(t_eval)
		max_st_err = maxf(max_st_err, _state_err(got_st, want_st))

		var pts_arr: Array = entry["points"]
		for idx in range(pts_arr.size()):
			var pt: Dictionary = pts_arr[idx]
			var px: float = float(pt["x"])
			var pz: float = float(pt["z"])
			var want_sp: Dictionary = pt["sample"]
			var got_sp: Dictionary = ts.sample(px, pz, t_eval)
			max_sp_err = maxf(max_sp_err, _sample_err(got_sp, want_sp))

			var got_h: Variant = ts.height_at(px, pz, t_eval)
			var want_h: Variant = pt["height"]
			if (got_h == null) != (want_h == null):
				ht_null_mismatch += 1
			elif got_h != null:
				max_ht_err = maxf(max_ht_err, absf(float(got_h) - float(want_h)))
			total_pts += 1

	ok(
		max_st_err < TOL and max_sp_err < TOL and max_ht_err < TOL and ht_null_mismatch == 0,
		"%s: all 7 static presets (%d samples) match JS: state %s, sample %s, height %s (%d null bad)" % [
			label, total_pts, sci(max_st_err), sci(max_sp_err), sci(max_ht_err), ht_null_mismatch
		]
	)


func _cove_sea(t: float) -> float:
	return 2.5 * sin(t * 0.02) + 0.4


func _cove_bed(x: float, z: float) -> float:
	if x < 0.0:
		return maxf(-35.0, x * 0.04)
	return x * 0.045 + 1.5 * sin(z * 0.01)


func _cove_shelter(_x: float, z: float) -> float:
	return maxf(0.25, minf(1.0, 1.0 - 0.55 * absf(z) / 600.0))


func _initialize() -> void:
	var dir_path: String = get_script().resource_path.get_base_dir()
	var parsed_v: Variant = JSON.parse_string(FileAccess.get_file_as_string(dir_path + "/golden-tsunami.json"))
	var gold: Dictionary = parsed_v

	# 1. Seamount regime: presets + live wave-train
	var sea_block: Dictionary = gold["seamount"]
	var sea_spec: Dictionary = sea_block["spec"]
	var sea_ts: KTsunami = KTsunami.new()
	var sea_cfg_ok: bool = sea_ts.configure(sea_spec)
	ok(
		sea_cfg_ok and sea_ts.is_valid and sea_ts.regime == "seamount" and absf(sea_ts.trimline_m - 29.0) < 1e-9,
		"seamount tsunami configures cleanly with trimline_m = 29.0 m"
	)

	var sea_presets: Dictionary = sea_block["presets"]
	_check_regime_presets("seamount", sea_ts, sea_presets, 12.5)

	sea_ts.trigger(float(sea_block["liveTriggerT"]))
	var sea_live: Array = sea_block["live"]
	var max_sea_live_err: float = 0.0
	for i in range(sea_live.size()):
		var row: Dictionary = sea_live[i]
		var t_val: float = float(row["t"])
		var x_in: float = 40.0 + 90.0 * 0.8
		var z_in: float = -25.0 + 90.0 * (-0.6)
		var x_off: float = 40.0 - 150.0 * 0.8
		var z_off: float = -25.0 - 150.0 * (-0.6)
		max_sea_live_err = maxf(max_sea_live_err, _state_err(sea_ts.state_at(t_val), row["state"]))
		max_sea_live_err = maxf(max_sea_live_err, _sample_err(sea_ts.sample(x_in, z_in, t_val), row["inland"]))
		max_sea_live_err = maxf(max_sea_live_err, _sample_err(sea_ts.sample(x_off, z_off, t_val), row["offshore"]))
	ok(
		max_sea_live_err < TOL,
		"seamount: %d live progression samples from trigger(20) match JS (max diff %s)" % [sea_live.size(), sci(max_sea_live_err)]
	)

	# 2. Ghost regime: silent arrival (tremor=0, tremorAmp=0) + periodic repeat
	var ghost_block: Dictionary = gold["ghost"]
	var ghost_spec: Dictionary = ghost_block["spec"]
	var ghost_ts: KTsunami = KTsunami.new()
	var ghost_cfg_ok: bool = ghost_ts.configure(ghost_spec)
	ok(
		ghost_cfg_ok and ghost_ts.regime == "ghost" and float(ghost_ts.timings["tremor"]) == 0.0,
		"ghost tsunami configures with timings.tremor = 0 s"
	)

	var ghost_presets: Dictionary = ghost_block["presets"]
	_check_regime_presets("ghost", ghost_ts, ghost_presets, 7.0)

	ghost_ts.trigger(float(ghost_block["liveTriggerT"]))
	var ghost_live: Array = ghost_block["live"]
	var max_ghost_live_err: float = 0.0
	var max_ghost_tremor: float = 0.0
	for i in range(ghost_live.size()):
		var grow: Dictionary = ghost_live[i]
		var gt: float = float(grow["t"])
		var gst: Dictionary = ghost_ts.state_at(gt)
		max_ghost_tremor = maxf(max_ghost_tremor, float(gst["tremorAmp"]))
		max_ghost_live_err = maxf(max_ghost_live_err, _state_err(gst, grow["state"]))
		max_ghost_live_err = maxf(max_ghost_live_err, _sample_err(ghost_ts.sample(-15.0, 35.0, gt), grow["shore"]))
		max_ghost_live_err = maxf(max_ghost_live_err, _sample_err(ghost_ts.sample(-15.0, -140.0, gt), grow["shoal"]))
	ok(
		max_ghost_live_err < TOL and max_ghost_tremor == 0.0,
		"ghost: %d live & periodic wrap samples match JS with zero tremorAmp (max diff %s)" % [ghost_live.size(), sci(max_ghost_live_err)]
	)

	# 3. Callable seaLevel(t), custom bed(x, z), and shelterFn(x, z)
	var cove_block: Dictionary = gold["coveCallable"]
	var cove_spec: Dictionary = (cove_block["spec"] as Dictionary).duplicate(true)
	cove_spec["seaLevel"] = Callable(self, "_cove_sea")
	cove_spec["bed"] = Callable(self, "_cove_bed")
	cove_spec["shelterFn"] = Callable(self, "_cove_shelter")
	var cove_ts: KTsunami = KTsunami.new()
	var cove_ok: bool = cove_ts.configure(cove_spec)
	cove_ts.trigger(float(cove_block["triggerT"]))
	var cove_samples: Array = cove_block["samples"]
	var max_cove_err: float = 0.0
	for i in range(cove_samples.size()):
		var cs: Dictionary = cove_samples[i]
		var ct: float = float(cs["t"])
		var cx: float = float(cs["x"])
		var cz: float = float(cs["z"])
		max_cove_err = maxf(max_cove_err, _state_err(cove_ts.state_at(ct), cs["state"]))
		max_cove_err = maxf(max_cove_err, _sample_err(cove_ts.sample(cx, cz, ct), cs["sample"]))
	ok(
		cove_ok and max_cove_err < TOL,
		"callable seaLevel(t) + bed(x,z) + shelterFn(x,z): %d samples match JS (max diff %s)" % [cove_samples.size(), sci(max_cove_err)]
	)

	# 4. Negative & fault checks
	var bad_dir: KTsunami = KTsunami.create({"dir": [0.0, 0.0]})
	var bad_reg: KTsunami = KTsunami.create({"regime": "asteroid"})
	var bad_mode: KTsunami = KTsunami.create({"mode": "unknown"})
	var bad_dd: KTsunami = KTsunami.create({"drawdownM": 0.0})
	var bad_ss: KTsunami = KTsunami.create({"startS": 25.0})
	var bad_tm: KTsunami = KTsunami.create({"timings": {"bore": -3.0}})
	ok(
		(not bad_dir.is_valid) and (not bad_reg.is_valid) and (not bad_mode.is_valid)
		and (not bad_dd.is_valid) and (not bad_ss.is_valid) and (not bad_tm.is_valid),
		"negative: zero dir, bad regime/mode, non-positive drawdownM, non-negative startS, and negative timing are refused"
	)

	print("ktsunami: %s" % ("all passed" if fails == 0 else "%d failed" % fails))
	quit(1 if fails > 0 else 0)
