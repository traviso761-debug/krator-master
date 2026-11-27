# Godot 4.7.2 headless golden test for KratorTide (core/water/tide/ktide.gd vs golden-tide.json):
# Checks Fleetborn Cove (px [236, 242], range 11 m semidiurnal D2 + Week/Thirteen springs) and
# Deep-Ward (px [148, 492], natural ~1.881 m diurnal D1, coast 1 nearest-wet search) across 92 days
# (Double Dark, Double Full, neaps, hourly levels, rates, states, spring_factor, next_spring/next_neap,
# lag, gain, springs: false, origin world metres, and world_seconds), plus negative fault checks.
#   python3 godot/tools/sync_core.py && godot --headless --path godot --script res://tests/water/ktide_test.gd
extends SceneTree

const KTide = preload("ktide.gd")
const TOL: float = 1e-5
const TOL_TIME: float = 1e-2

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


func _check_site(label: String, td: KTide, spec: Dictionary) -> void:
	var px_arr: Array = spec["px"]
	var opts_d: Dictionary = spec["opts"]
	var px_x: float = float(px_arr[0])
	var px_y: float = float(px_arr[1])
	var st: KTide.Site = td.site(px_x, px_y, opts_d)
	ok(st != null, "%s: site(%s, %s) resolves" % [label, str(px_x), str(px_y)])
	if st == null:
		return

	var want_a: Array = spec["a"]
	var want_p: Array = spec["p"]
	var err_hdr: float = maxf(
		maxf(absf(st.a[0] - float(want_a[0])), absf(st.a[1] - float(want_a[1]))),
		maxf(absf(st.p[0] - float(want_p[0])), absf(st.p[1] - float(want_p[1])))
	)
	err_hdr = maxf(err_hdr, absf(st.gain - float(spec["gain"])))
	err_hdr = maxf(err_hdr, absf(st.vmax - float(spec["vmax"])))
	err_hdr = maxf(err_hdr, absf(st.depth - float(spec["depth"])))
	err_hdr = maxf(err_hdr, absf(st.mean_range - float(spec["range"])))
	ok(
		st.basin == str(spec["basin"]) and st.coast == int(spec["coast"])
		and st.springs == bool(spec["springs"]) and err_hdr < TOL,
		"%s: constituents, gain, vmax, depth, coast=%d and mean range %.3f m (max diff %s)" % [label, st.coast, st.mean_range, sci(err_hdr)]
	)

	var wt_got: Dictionary = st.water_tide()
	var wt_want: Dictionary = spec["waterTide"]
	var err_wt: float = maxf(
		absf(float(wt_got["amp"]) - float(wt_want["amp"])),
		maxf(absf(float(wt_got["period"]) - float(wt_want["period"])), absf(float(wt_got["phase"]) - float(wt_want["phase"])))
	)
	ok(err_wt < TOL, "%s: water_tide() dominant constituent matches JS (max diff %s)" % [label, sci(err_wt)])

	var dd: Dictionary = spec["doubleDark"]
	var df: Dictionary = spec["doubleFull"]
	var err_ep: float = maxf(
		maxf(absf(st.level(float(dd["t"])) - float(dd["level"])), absf(st.spring_factor(float(dd["t"])) - float(dd["spring"]))),
		maxf(absf(st.level(float(df["t"])) - float(df["level"])), absf(st.spring_factor(float(df["t"])) - float(df["spring"])))
	)
	ok(err_ep < TOL, "%s: Double Dark (-0.5 d) & Double Full (~+45 d) levels and spring factors match (max diff %s)" % [label, sci(err_ep)])

	var max_day_err: float = 0.0
	var max_ext_t_err: float = 0.0
	var count_mismatch: int = 0
	var days_arr: Array = spec["days"]
	for day_idx in range(days_arr.size()):
		var dw: Dictionary = days_arr[day_idx]
		var dg: Dictionary = st.day_summary(float(dw["d"]))
		max_day_err = maxf(max_day_err, absf(float(dg["range"]) - float(dw["range"])))
		max_day_err = maxf(max_day_err, absf(float(dg["highest"]) - float(dw["highest"])))
		max_day_err = maxf(max_day_err, absf(float(dg["lowest"]) - float(dw["lowest"])))
		var sp_mid: float = st.spring_factor((float(dw["d"]) + 0.5) * KTide.DAY)
		max_day_err = maxf(max_day_err, absf(sp_mid - float(dw["springMid"])))
		var hi_g: Array = dg["high"]
		var hi_w: Array = dw["high"]
		var lo_g: Array = dg["low"]
		var lo_w: Array = dw["low"]
		if hi_g.size() != hi_w.size() or lo_g.size() != lo_w.size():
			count_mismatch += 1
		else:
			for h_i in range(hi_g.size()):
				max_ext_t_err = maxf(max_ext_t_err, absf(float(hi_g[h_i]) - float(hi_w[h_i])))
			for l_i in range(lo_g.size()):
				max_ext_t_err = maxf(max_ext_t_err, absf(float(lo_g[l_i]) - float(lo_w[l_i])))
	ok(
		max_day_err < TOL and max_ext_t_err <= 0.11 and count_mismatch == 0,
		"%s: 92-day summaries (range, highest, lowest, highs/lows) match JS: max level %s m, time %.2f s" % [label, sci(max_day_err), max_ext_t_err]
	)

	var max_lvl_err: float = 0.0
	var max_rate_err: float = 0.0
	var max_sp_err: float = 0.0
	var state_bad: int = 0
	var hourly_arr: Array = spec["hourly"]
	for hr_idx in range(hourly_arr.size()):
		var hs: Dictionary = hourly_arr[hr_idx]
		var ht: float = float(hs["t"])
		max_lvl_err = maxf(max_lvl_err, absf(st.level(ht) - float(hs["level"])))
		max_rate_err = maxf(max_rate_err, absf(st.rate(ht) - float(hs["rate"])))
		max_sp_err = maxf(max_sp_err, absf(st.spring_factor(ht) - float(hs["spring"])))
		if st.state(ht) != str(hs["state"]):
			state_bad += 1
	ok(
		max_lvl_err < TOL and max_rate_err < TOL and max_sp_err < TOL and state_bad == 0,
		"%s: %d hourly/instant samples match level (%s m), rate (%s m/s), spring (%s), and flood/ebb/slack (%d bad)" % [
			label, hourly_arr.size(), sci(max_lvl_err), sci(max_rate_err), sci(max_sp_err), state_bad
		]
	)

	var max_turn_t: float = 0.0
	var max_turn_f: float = 0.0
	var turns_arr: Array = spec["turns"]
	for tr_idx in range(turns_arr.size()):
		var tw: Dictionary = turns_arr[tr_idx]
		var probe_t: float = float(tw["t"])
		var ns_v: Variant = st.next_spring(probe_t)
		var nn_v: Variant = st.next_neap(probe_t)
		if ns_v == null or nn_v == null:
			max_turn_t = 1e9
			continue
		var ns_f: float = float(ns_v)
		var nn_f: float = float(nn_v)
		max_turn_t = maxf(max_turn_t, maxf(absf(ns_f - float(tw["nextSpring"])), absf(nn_f - float(tw["nextNeap"]))))
		max_turn_f = maxf(
			max_turn_f,
			maxf(absf(st.spring_factor(ns_f) - float(tw["springAtNextSpring"])), absf(st.spring_factor(nn_f) - float(tw["springAtNextNeap"])))
		)
	ok(
		max_turn_t < TOL_TIME and max_turn_f < TOL,
		"%s: next_spring/next_neap across 92 days match within %.4f s and %s factor" % [label, max_turn_t, sci(max_turn_f)]
	)


func _initialize() -> void:
	var dir_path: String = get_script().resource_path.get_base_dir()
	var gold: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir_path + "/golden-tide.json"))
	var slices: Dictionary = gold["slices"]
	var cove_slice: Dictionary = slices["cove"]
	var deep_slice: Dictionary = slices["deepWard"]

	var cove_td: KTide = KTide.new()
	var cove_ok: bool = cove_td.load_data(cove_slice, {"origin": [236.0, 242.0]})
	var deep_td: KTide = KTide.new()
	var deep_ok: bool = deep_td.load_data(deep_slice, {"origin": [148.0, 492.0]})
	ok(
		cove_ok and deep_ok and cove_td.inferred.size() == 2
		and str(cove_td.inferred[0]["name"]) == "Week" and str(cove_td.inferred[1]["name"]) == "Thirteen",
		"cove and Deep-Ward slices load with inferred Week & Thirteen constituents"
	)

	var cove_spec: Dictionary = gold["cove"]
	var deep_spec: Dictionary = gold["deepWard"]
	_check_site("cove (px 236,242 range 11 m)", cove_td, cove_spec)
	_check_site("deepWard (px 148,492 natural diurnal)", deep_td, deep_spec)

	# Forwarding active-site methods on KTide instance
	var fwd_site: KTide.Site = cove_td.site(236.0, 242.0, {"range": 11.0})
	ok(
		fwd_site != null and absf(cove_td.level(7200.0) - fwd_site.level(7200.0)) < 1e-12
		and absf(cove_td.rate(7200.0) - fwd_site.rate(7200.0)) < 1e-12
		and cove_td.state(7200.0) == fwd_site.state(7200.0),
		"KTide active-site forwarding matches Site methods"
	)

	# Variants: lag, springs: false, gain, world coordinates, world_seconds
	var vars_d: Dictionary = gold["variants"]
	var lag_spec: Dictionary = vars_d["lag1800"]
	var lag_site: KTide.Site = cove_td.site(236.0, 242.0, {"range": 11.0, "lag": 1800.0})
	var lag_err: float = absf(lag_site.mean_range - float(lag_spec["range"]))
	var lag_samples: Array = lag_spec["samples"]
	for ls_idx in range(lag_samples.size()):
		var ls: Dictionary = lag_samples[ls_idx]
		lag_err = maxf(lag_err, absf(lag_site.level(float(ls["t"])) - float(ls["level"])))
		lag_err = maxf(lag_err, absf(lag_site.rate(float(ls["t"])) - float(ls["rate"])))
	ok(lag_err < TOL, "lag=1800 s delays tide curve identically to JS (max diff %s)" % sci(lag_err))

	var mean_spec: Dictionary = vars_d["springsOff"]
	var mean_site: KTide.Site = cove_td.site(236.0, 242.0, {"range": 11.0, "springs": false})
	var mean_err: float = absf(mean_site.mean_range - float(mean_spec["range"]))
	var mean_samples: Array = mean_spec["samples"]
	for ms_idx in range(mean_samples.size()):
		var ms: Dictionary = mean_samples[ms_idx]
		mean_err = maxf(mean_err, absf(mean_site.level(float(ms["t"])) - float(ms["level"])))
		mean_err = maxf(mean_err, absf(mean_site.rate(float(ms["t"])) - float(ms["rate"])))
	ok(
		mean_site.springs == false and mean_site.next_spring(0.0) == null and mean_site.next_neap(0.0) == null
		and absf(mean_site.spring_factor(5000.0) - 1.0) < 1e-12 and mean_err < TOL,
		"springs=false repeats mean day exactly and returns null for next_spring/next_neap (max diff %s)" % sci(mean_err)
	)

	var gain_spec: Dictionary = vars_d["gain15"]
	var gain_site: KTide.Site = cove_td.site(236.0, 242.0, {"gain": 1.5})
	var gain_err: float = maxf(
		absf(gain_site.mean_range - float(gain_spec["range"])),
		absf(gain_site.level(5000.0) - float(gain_spec["level5000"]))
	)
	ok(gain_err < TOL, "gain=1.5 scales constituent amplitudes and range identically to JS (max diff %s)" % sci(gain_err))

	var wc_err: float = 0.0
	var wc_arr: Array = vars_d["worldCoords"]
	for wc_idx in range(wc_arr.size()):
		var wc: Dictionary = wc_arr[wc_idx]
		var got_l: Variant = cove_td.level_at(float(wc["x"]), float(wc["z"]), float(wc["t"]))
		var got_r: Variant = cove_td.range_at(float(wc["x"]), float(wc["z"]))
		wc_err = maxf(wc_err, maxf(absf(float(got_l) - float(wc["level"])), absf(float(got_r) - float(wc["range"]))))
	ok(wc_err < TOL, "origin world-metre lookup level_at/range_at matches JS (max diff %s)" % sci(wc_err))

	var ws_err: float = 0.0
	var ws_arr: Array = vars_d["worldSeconds"]
	for ws_idx in range(ws_arr.size()):
		var ws: Dictionary = ws_arr[ws_idx]
		var clk: Dictionary = ws["clock"]
		ws_err = maxf(ws_err, absf(KTide.world_seconds(clk) - float(ws["s"])))
	ok(ws_err < 1e-9, "world_seconds(clock_dict) matches JS across positive, zero, and negative days")

	# Negative & fault checks (each must fail / be refused as expected)
	var no_reach: Dictionary = deep_td.at_px(148.0, 492.0, 0)
	var far_inland: Variant = cove_td.site(1500.0, 200.0, {})
	ok(no_reach.is_empty() and far_inland == null, "negative: land point with reach=0 and far-inland point return empty/null")

	var late_diff: float = absf(fwd_site.level(5000.0 + 900.0) - fwd_site.level(5000.0))
	var spring_diff: float = absf(fwd_site.level(5000.0) - mean_site.level(5000.0))
	ok(late_diff > 0.1 and spring_diff > 1e-3, "negative: 15 min shift moves cove tide by %.2f m; removing springs shifts level by %.4f m" % [late_diff, spring_diff])

	var bad_kind: Dictionary = cove_slice.duplicate(true)
	bad_kind["kind"] = "wrong-kind"
	var td_bad_kind: KTide = KTide.new()
	ok(not td_bad_kind.load_data(bad_kind), "negative: wrong record kind is refused")

	var bad_ver: Dictionary = cove_slice.duplicate(true)
	bad_ver["version"] = 2
	var td_bad_ver: KTide = KTide.new()
	ok(not td_bad_ver.load_data(bad_ver), "negative: unsupported record version is refused")

	var bad_grid: Dictionary = cove_slice.duplicate(true)
	var bg_basins: Array = bad_grid["basins"]
	var bg_b0: Dictionary = bg_basins[0]
	var bg_amp: String = str(bg_b0["amp1"])
	bg_b0["amp1"] = bg_amp.substr(0, bg_amp.length() - 8)
	var td_bad_grid: KTide = KTide.new()
	ok(not td_bad_grid.load_data(bad_grid), "negative: truncated base64 grid is refused")

	var bad_b64: Dictionary = cove_slice.duplicate(true)
	var bb_basins: Array = bad_b64["basins"]
	var bb_b0: Dictionary = bb_basins[0]
	bb_b0["ph1"] = "@@@invalid-base64@@@"
	var td_bad_b64: KTide = KTide.new()
	ok(not td_bad_b64.load_data(bad_b64), "negative: invalid base64 characters are refused")

	var bad_inf: Dictionary = cove_slice.duplicate(true)
	bad_inf["inferred"] = [{"name": "bad", "from": 3, "ratio": 0.1, "omega": 1e-4, "epoch": 0.0}]
	var td_bad_inf: KTide = KTide.new()
	ok(not td_bad_inf.load_data(bad_inf), "negative: inferred constituent on invalid parent (from=3) is refused")

	print("ktide: %s" % ("all passed" if fails == 0 else "%d failed" % fails))
	quit(1 if fails > 0 else 0)
