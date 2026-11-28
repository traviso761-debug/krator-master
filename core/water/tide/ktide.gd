# Godot 4.7.2 twin of core/water/tide/23-core-water-tide.js (KTIDE)  [G data]
# Pure data and harmonic/phasor tide math: reads a krator-tides v1 record (whole or sliced by tide.py),
# decodes little-endian u16/u8 base64 basin grids into float32 cell phasors, interpolates wet corners
# bilinearly (or searches nearest wet cell within `reach` on land), sums D1 + D2 + inferred lunar
# constituents (Week 6.87 d ratio 0.28, Thirteen 12.55 d ratio 0.17 from D2, Double Dark epoch -0.5 d),
# and answers level(t), rate(t), state(t), day_summary(d), spring_factor(t), next_spring(t), next_neap(t),
# water_tide(), and world_seconds(clock_dict).
# Synced to godot/tests/water/ktide.gd by godot/tools/sync_core.py; verified by ktide_test.gd.
class_name KratorTide
extends RefCounted

const DAY: float = 86400.0
const OMEGA_1: float = TAU / DAY
const OMEGA_2: float = 2.0 * TAU / DAY
const DRY: int = 0xFFFF

var is_valid: bool = false
var last_error: String = ""
var origin: Array[float] = [0.0, 0.0]
var px_m: float = 2000.0
var basins: Array[Dictionary] = []
var inferred: Array[Dictionary] = []
var _active_site: Site = null


class Site extends RefCounted:
	var basin: String = ""
	var mean_level: float = 0.0
	var a: Array[float] = [0.0, 0.0]
	var p: Array[float] = [0.0, 0.0]
	var gain: float = 1.0
	var lag: float = 0.0
	var vmax: float = 0.0
	var depth: float = 0.0
	var coast: int = 0
	var mean_range: float = 0.0
	var high: Array[float] = []
	var low: Array[float] = []
	var springs: bool = false
	var _inf: Array[Dictionary] = []
	var _has_inf: bool = false
	var _dom: int = 0
	var _spring_from: int = 1

	func get_range() -> float:
		return mean_range

	func level(t: float = 0.0) -> float:
		return Site._eta(a, p, _inf, _has_inf, t - lag)

	func rate(t: float = 0.0) -> float:
		return Site._deta(a, p, _inf, _has_inf, t - lag)

	func state(t: float = 0.0, slack: float = -1.0) -> String:
		var r_val: float = Site._deta(a, p, _inf, _has_inf, t - lag)
		var thresh: float = (mean_range / DAY * 0.25) if slack < 0.0 else slack
		if absf(r_val) <= thresh:
			return "slack"
		return "flood" if r_val > 0.0 else "ebb"

	func day_summary(d: float = 0.0) -> Dictionary:
		var ex: Dictionary = Site._day_extremes(a, p, _inf, _has_inf, lag, d * DAY)
		return {
			"high": ex["hi"],
			"low": ex["lo"],
			"range": float(ex["range"]),
			"highest": float(ex["highest"]),
			"lowest": float(ex["lowest"]),
		}

	func spring_factor(t: float = 0.0) -> float:
		if not _has_inf:
			return 1.0
		return Site._spring_of(_inf, _spring_from, t - lag)

	func next_spring(t: float = 0.0) -> Variant:
		return _next_turn(t, 1.0)

	func next_neap(t: float = 0.0) -> Variant:
		return _next_turn(t, -1.0)

	func _next_turn(t: float, want: float) -> Variant:
		if not _has_inf or _inf.is_empty():
			return null
		var step_h: float = 3600.0
		var fa: float = spring_factor(t)
		var fb: float = spring_factor(t + step_h)
		for k_idx in range(2, 24 * 120):
			var fc: float = spring_factor(t + float(k_idx) * step_h)
			if (fb - fa) * want > 0.0 and (fc - fb) * want <= 0.0:
				var lo_t: float = t + float(k_idx - 2) * step_h
				var hi_t: float = t + float(k_idx) * step_h
				for iter_n in range(40):
					var m1: float = lo_t + (hi_t - lo_t) / 3.0
					var m2: float = hi_t - (hi_t - lo_t) / 3.0
					if (spring_factor(m1) - spring_factor(m2)) * want > 0.0:
						hi_t = m2
					else:
						lo_t = m1
				return 0.5 * (lo_t + hi_t)
			fa = fb
			fb = fc
		return null

	func water_tide() -> Dictionary:
		var per: float = (DAY / 2.0) if _dom == 1 else DAY
		var om: float = OMEGA_2 if _dom == 1 else OMEGA_1
		var ph_val: float = PI * 0.5 - p[_dom] - om * lag
		return {
			"amp": a[_dom],
			"period": per,
			"phase": ph_val,
		}

	static func _eta(a_arr: Array[float], p_arr: Array[float], inf_list: Array[Dictionary], use_inf: bool, t: float) -> float:
		var elev: float = a_arr[0] * cos(OMEGA_1 * t - p_arr[0]) + a_arr[1] * cos(OMEGA_2 * t - p_arr[1])
		if use_inf:
			for k_idx in range(inf_list.size()):
				var c_rec: Dictionary = inf_list[k_idx]
				var f_idx: int = int(c_rec["from"]) - 1
				var om_parent: float = OMEGA_2 if f_idx == 1 else OMEGA_1
				var c_ratio: float = float(c_rec["ratio"])
				var c_omega: float = float(c_rec["omega"])
				var c_epoch: float = float(c_rec["epoch"])
				elev += c_ratio * a_arr[f_idx] * cos(c_omega * t + (om_parent - c_omega) * c_epoch - p_arr[f_idx])
		return elev

	static func _deta(a_arr: Array[float], p_arr: Array[float], inf_list: Array[Dictionary], use_inf: bool, t: float) -> float:
		var deriv: float = -a_arr[0] * OMEGA_1 * sin(OMEGA_1 * t - p_arr[0]) - a_arr[1] * OMEGA_2 * sin(OMEGA_2 * t - p_arr[1])
		if use_inf:
			for k_idx in range(inf_list.size()):
				var c_rec: Dictionary = inf_list[k_idx]
				var f_idx: int = int(c_rec["from"]) - 1
				var om_parent: float = OMEGA_2 if f_idx == 1 else OMEGA_1
				var c_ratio: float = float(c_rec["ratio"])
				var c_omega: float = float(c_rec["omega"])
				var c_epoch: float = float(c_rec["epoch"])
				deriv -= c_ratio * a_arr[f_idx] * c_omega * sin(c_omega * t + (om_parent - c_omega) * c_epoch - p_arr[f_idx])
		return deriv

	static func _spring_of(inf_list: Array[Dictionary], from_const: int, t: float) -> float:
		var re_part: float = 1.0
		var im_part: float = 0.0
		var om_parent: float = OMEGA_2 if from_const == 2 else OMEGA_1
		for k_idx in range(inf_list.size()):
			var c_rec: Dictionary = inf_list[k_idx]
			if int(c_rec["from"]) != from_const:
				continue
			var c_omega: float = float(c_rec["omega"])
			var c_epoch: float = float(c_rec["epoch"])
			var c_ratio: float = float(c_rec["ratio"])
			var ang: float = -(om_parent - c_omega) * (t - c_epoch)
			re_part += c_ratio * cos(ang)
			im_part += c_ratio * sin(ang)
		return sqrt(re_part * re_part + im_part * im_part)

	static func _day_extremes(a_arr: Array[float], p_arr: Array[float], inf_list: Array[Dictionary], use_inf: bool, lag: float, t0: float) -> Dictionary:
		var n_steps: int = 288
		var hi_list: Array[float] = []
		var lo_list: Array[float] = []
		var lv: float = INF
		var hv: float = -INF
		for step_i in range(n_steps):
			var ta: float = t0 + float(step_i) * DAY / float(n_steps)
			var tb: float = t0 + float(step_i + 1) * DAY / float(n_steps)
			var r0: float = _deta(a_arr, p_arr, inf_list, use_inf, ta - lag)
			var r1: float = _deta(a_arr, p_arr, inf_list, use_inf, tb - lag)
			if r0 == 0.0 or r0 * r1 < 0.0:
				var left_t: float = ta
				var right_t: float = tb
				for bis_k in range(30):
					var mid_t: float = 0.5 * (left_t + right_t)
					var fa: float = _deta(a_arr, p_arr, inf_list, use_inf, left_t - lag)
					var fm: float = _deta(a_arr, p_arr, inf_list, use_inf, mid_t - lag)
					if fa * fm <= 0.0:
						right_t = mid_t
					else:
						left_t = mid_t
				var tm: float = 0.5 * (left_t + right_t)
				var rounded_tm: float = round(tm * 10.0) / 10.0
				var elev: float = _eta(a_arr, p_arr, inf_list, use_inf, tm - lag)
				if r0 > 0.0 or r1 < 0.0:
					hi_list.append(rounded_tm)
				else:
					lo_list.append(rounded_tm)
				if elev > hv:
					hv = elev
				if elev < lv:
					lv = elev
		if hi_list.is_empty() and lo_list.is_empty():
			hv = 0.0
			lv = 0.0
		return {
			"hi": hi_list,
			"lo": lo_list,
			"range": hv - lv,
			"highest": hv,
			"lowest": lv,
		}


static func omega() -> Array[float]:
	return [OMEGA_1, OMEGA_2]


static func world_seconds(clock_dict: Dictionary) -> float:
	var day_v: float = 0.0
	if clock_dict.has("day") and clock_dict["day"] != null:
		day_v = float(clock_dict["day"])
	var hour_v: float = 0.0
	if clock_dict.has("hour") and clock_dict["hour"] != null:
		hour_v = float(clock_dict["hour"])
	return (day_v * 24.0 + hour_v) * 3600.0


static func decode_base64_checked(s: String) -> Dictionary:
	var n_len: int = s.length()
	while n_len > 0 and s.unicode_at(n_len - 1) == 61:
		n_len -= 1
	var out_len: int = (n_len * 3) >> 2
	var out: PackedByteArray = PackedByteArray()
	out.resize(out_len)
	var out_idx: int = 0
	var acc: int = 0
	var bits: int = 0
	for idx in range(n_len):
		var code: int = s.unicode_at(idx)
		var val: int = -1
		if code >= 65 and code <= 90:
			val = code - 65
		elif code >= 97 and code <= 122:
			val = code - 97 + 26
		elif code >= 48 and code <= 57:
			val = code - 48 + 52
		elif code == 43:
			val = 62
		elif code == 47:
			val = 63
		if val < 0:
			return {"ok": false, "bytes": PackedByteArray(), "error": "KTIDE.decode: not base64 at %d" % idx}
		acc = (acc << 6) | val
		bits += 6
		if bits >= 8:
			bits -= 8
			out[out_idx] = (acc >> bits) & 255
			out_idx += 1
	return {"ok": true, "bytes": out, "error": ""}


static func decode(s: String) -> PackedByteArray:
	var res: Dictionary = decode_base64_checked(s)
	var raw: PackedByteArray = res["bytes"]
	return raw


static func _decode_u16_checked(s: String) -> Dictionary:
	var dec: Dictionary = decode_base64_checked(s)
	if not bool(dec["ok"]):
		return {"ok": false, "values": PackedInt32Array(), "error": str(dec["error"])}
	var raw: PackedByteArray = dec["bytes"]
	if (raw.size() & 1) != 0:
		return {"ok": false, "values": PackedInt32Array(), "error": "KTIDE: odd byte length for u16 grid"}
	var count: int = raw.size() >> 1
	var arr: PackedInt32Array = PackedInt32Array()
	arr.resize(count)
	for idx in range(count):
		arr[idx] = int(raw[2 * idx]) | (int(raw[2 * idx + 1]) << 8)
	return {"ok": true, "values": arr, "error": ""}


static func _parse_basin(raw_b: Dictionary) -> Dictionary:
	for req_key in ["id", "nx", "ny", "x0", "y0", "cell", "amp1", "amp2", "ph1", "ph2", "vmax", "depth"]:
		if not raw_b.has(req_key):
			return {"ok": false, "basin": {}, "error": "KTIDE: basin missing key " + req_key}
	var nx_v: int = int(raw_b["nx"])
	var ny_v: int = int(raw_b["ny"])
	var total_n: int = nx_v * ny_v
	if nx_v <= 0 or ny_v <= 0:
		return {"ok": false, "basin": {}, "error": "KTIDE: non-positive basin dimensions"}
	var a1_dec: Dictionary = _decode_u16_checked(str(raw_b["amp1"]))
	var a2_dec: Dictionary = _decode_u16_checked(str(raw_b["amp2"]))
	var p1_dec: Dictionary = decode_base64_checked(str(raw_b["ph1"]))
	var p2_dec: Dictionary = decode_base64_checked(str(raw_b["ph2"]))
	var vm_dec: Dictionary = decode_base64_checked(str(raw_b["vmax"]))
	var dp_dec: Dictionary = _decode_u16_checked(str(raw_b["depth"]))
	if not (bool(a1_dec["ok"]) and bool(a2_dec["ok"]) and bool(p1_dec["ok"]) and bool(p2_dec["ok"]) and bool(vm_dec["ok"]) and bool(dp_dec["ok"])):
		return {"ok": false, "basin": {}, "error": "KTIDE: base64 grid decode error"}
	var a1_arr: PackedInt32Array = a1_dec["values"]
	var a2_arr: PackedInt32Array = a2_dec["values"]
	var p1_arr: PackedByteArray = p1_dec["bytes"]
	var p2_arr: PackedByteArray = p2_dec["bytes"]
	var vm_arr: PackedByteArray = vm_dec["bytes"]
	var dp_arr: PackedInt32Array = dp_dec["values"]
	if a1_arr.size() != total_n or a2_arr.size() != total_n or p1_arr.size() != total_n or p2_arr.size() != total_n or vm_arr.size() != total_n or dp_arr.size() != total_n:
		return {"ok": false, "basin": {}, "error": "KTIDE: basin %s grids are not %d x %d" % [str(raw_b["id"]), nx_v, ny_v]}

	# Match JS Float32Array(N * 4) phasors per cell: [c1, s1, c2, s2]
	var q_arr: PackedFloat32Array = PackedFloat32Array()
	q_arr.resize(total_n * 4)
	var wet_arr: PackedByteArray = PackedByteArray()
	wet_arr.resize(total_n)
	for cell_k in range(total_n):
		if a1_arr[cell_k] == DRY:
			wet_arr[cell_k] = 0
			continue
		wet_arr[cell_k] = 1
		var amp1_m: float = float(a1_arr[cell_k]) / 1000.0
		var amp2_m: float = float(a2_arr[cell_k]) / 1000.0
		var ph1_rad: float = float(p1_arr[cell_k]) / 256.0 * TAU
		var ph2_rad: float = float(p2_arr[cell_k]) / 256.0 * TAU
		q_arr[4 * cell_k] = amp1_m * cos(ph1_rad)
		q_arr[4 * cell_k + 1] = amp1_m * sin(ph1_rad)
		q_arr[4 * cell_k + 2] = amp2_m * cos(ph2_rad)
		q_arr[4 * cell_k + 3] = amp2_m * sin(ph2_rad)

	var lvl_v: float = 0.0
	if raw_b.has("level") and raw_b["level"] != null:
		lvl_v = float(raw_b["level"])
	var b_out: Dictionary = {
		"id": str(raw_b["id"]),
		"name": str(raw_b.get("name", raw_b["id"])),
		"level": lvl_v,
		"x0": float(raw_b["x0"]),
		"y0": float(raw_b["y0"]),
		"cell": float(raw_b["cell"]),
		"nx": nx_v,
		"ny": ny_v,
		"wet": wet_arr,
		"Q": q_arr,
		"V": vm_arr,
		"D": dp_arr,
		"stats": raw_b.get("stats", null),
	}
	return {"ok": true, "basin": b_out, "error": ""}


static func _parse_inferred(d: Dictionary) -> Dictionary:
	var out_list: Array[Dictionary] = []
	if not d.has("inferred") or d["inferred"] == null:
		return {"ok": true, "list": out_list, "error": ""}
	if not (d["inferred"] is Array):
		return {"ok": false, "list": out_list, "error": "KTIDE.load: inferred is not a list"}
	var raw_list: Array = d["inferred"]
	for idx in range(raw_list.size()):
		var item_v: Variant = raw_list[idx]
		if not (item_v is Dictionary):
			return {"ok": false, "list": out_list, "error": "KTIDE.load: inferred[%d] is not a Dictionary" % idx}
		var item_d: Dictionary = item_v
		if not item_d.has("from") or not item_d.has("ratio") or not item_d.has("omega") or not item_d.has("epoch"):
			return {"ok": false, "list": out_list, "error": "KTIDE.load: inferred[%d] missing required keys" % idx}
		var from_v: Variant = item_d["from"]
		if not (from_v is int or from_v is float):
			return {"ok": false, "list": out_list, "error": "KTIDE.load: inferred[%d] non-numeric from" % idx}
		var from_i: int = int(from_v)
		if float(from_v) != float(from_i) or (from_i != 1 and from_i != 2):
			return {"ok": false, "list": out_list, "error": "KTIDE.load: inferred[%d] needs from 1|2" % idx}
		var ratio_f: float = float(item_d["ratio"])
		var omega_f: float = float(item_d["omega"])
		var epoch_f: float = float(item_d["epoch"])
		if not (is_finite(ratio_f) and is_finite(omega_f) and is_finite(epoch_f)):
			return {"ok": false, "list": out_list, "error": "KTIDE.load: inferred[%d] non-finite parameter" % idx}
		var cname: String = str(item_d["name"]) if (item_d.has("name") and item_d["name"] != null) else ("c%d" % idx)
		var beat_v: Variant = item_d["beatD"] if item_d.has("beatD") else null
		out_list.append({
			"name": cname,
			"from": from_i,
			"ratio": ratio_f,
			"omega": omega_f,
			"epoch": epoch_f,
			"beatD": beat_v,
		})
	return {"ok": true, "list": out_list, "error": ""}


func load_data(d: Dictionary, opts: Dictionary = {}) -> bool:
	is_valid = false
	last_error = ""
	basins.clear()
	inferred.clear()
	_active_site = null

	if str(d.get("kind", "")) != "krator-tides":
		last_error = "KTIDE.load: not a tides record"
		return false
	var ver_v: Variant = d.get("version", null)
	if not (ver_v is int or ver_v is float) or int(ver_v) != 1 or float(ver_v) != 1.0:
		last_error = "KTIDE.load: unsupported tides record version"
		return false

	if opts.has("origin") and (opts["origin"] is Array) and (opts["origin"] as Array).size() >= 2:
		var org_arr: Array = opts["origin"]
		origin = [float(org_arr[0]), float(org_arr[1])]
	else:
		origin = [0.0, 0.0]

	px_m = float(d["pxM"]) if (d.has("pxM") and d["pxM"] != null) else 2000.0

	var inf_res: Dictionary = _parse_inferred(d)
	if not bool(inf_res["ok"]):
		last_error = str(inf_res["error"])
		return false
	var parsed_inf: Array[Dictionary] = inf_res["list"]
	inferred = parsed_inf

	var raw_basins_v: Variant = d.get("basins", [])
	if not (raw_basins_v is Array):
		last_error = "KTIDE.load: basins is not a list"
		return false
	var raw_basins: Array = raw_basins_v
	for b_idx in range(raw_basins.size()):
		var b_item: Variant = raw_basins[b_idx]
		if not (b_item is Dictionary):
			last_error = "KTIDE.load: basin[%d] is not a Dictionary" % b_idx
			return false
		var b_res: Dictionary = _parse_basin(b_item)
		if not bool(b_res["ok"]):
			last_error = str(b_res["error"])
			return false
		var b_dict: Dictionary = b_res["basin"]
		basins.append(b_dict)

	is_valid = true
	return true


static func _sample_basin(b_dict: Dictionary, px: float, py: float, reach: int) -> Dictionary:
	var b_x0: float = float(b_dict["x0"])
	var b_y0: float = float(b_dict["y0"])
	var b_cell: float = float(b_dict["cell"])
	var b_nx: int = int(b_dict["nx"])
	var b_ny: int = int(b_dict["ny"])
	var fx: float = (px - b_x0) / b_cell - 0.5
	var fy: float = (py - b_y0) / b_cell - 0.5
	var reach_f: float = float(reach)
	if fx < -reach_f - 1.0 or fy < -reach_f - 1.0 or fx > float(b_nx) + reach_f or fy > float(b_ny) + reach_f:
		return {}

	var i0: int = floori(fx)
	var j0: int = floori(fy)
	var tx: float = fx - float(i0)
	var ty: float = fy - float(j0)

	var wet_arr: PackedByteArray = b_dict["wet"]
	var q_arr: PackedFloat32Array = b_dict["Q"]
	var vm_arr: PackedByteArray = b_dict["V"]
	var dp_arr: PackedInt32Array = b_dict["D"]

	var w_sum: float = 0.0
	var q0: float = 0.0
	var q1: float = 0.0
	var q2: float = 0.0
	var q3: float = 0.0
	var v_sum: float = 0.0
	var d_sum: float = 0.0

	for dj in range(2):
		for di in range(2):
			var ci: int = i0 + di
			var cj: int = j0 + dj
			if ci < 0 or cj < 0 or ci >= b_nx or cj >= b_ny:
				continue
			var cell_k: int = cj * b_nx + ci
			if wet_arr[cell_k] == 0:
				continue
			var wx: float = tx if di == 1 else (1.0 - tx)
			var wy: float = ty if dj == 1 else (1.0 - ty)
			var wk: float = wx * wy
			if wk <= 0.0:
				continue
			w_sum += wk
			q0 += wk * float(q_arr[4 * cell_k])
			q1 += wk * float(q_arr[4 * cell_k + 1])
			q2 += wk * float(q_arr[4 * cell_k + 2])
			q3 += wk * float(q_arr[4 * cell_k + 3])
			v_sum += wk * float(vm_arr[cell_k]) * 0.02
			d_sum += wk * float(dp_arr[cell_k])

	var coast_dist: int = 0
	if not (w_sum > 1e-6):
		# Match JS Math.round(x) === Math.floor(x + 0.5)
		var ic: int = floori(fx + 0.5)
		var jc: int = floori(fy + 0.5)
		var best_d2: float = 1e9
		var best_k: int = -1
		for rad in range(1, reach + 1):
			if best_k >= 0:
				break
			for sj in range(jc - rad, jc + rad + 1):
				for si in range(ic - rad, ic + rad + 1):
					if maxi(absi(si - ic), absi(sj - jc)) != rad:
						continue
					if si < 0 or sj < 0 or si >= b_nx or sj >= b_ny:
						continue
					var sk: int = sj * b_nx + si
					if wet_arr[sk] == 0:
						continue
					var dx: float = float(si) - fx
					var dy: float = float(sj) - fy
					var dist2: float = dx * dx + dy * dy
					if dist2 < best_d2:
						best_d2 = dist2
						best_k = sk
						coast_dist = rad
		if best_k < 0:
			return {}
		q0 = float(q_arr[4 * best_k])
		q1 = float(q_arr[4 * best_k + 1])
		q2 = float(q_arr[4 * best_k + 2])
		q3 = float(q_arr[4 * best_k + 3])
		v_sum = float(vm_arr[best_k]) * 0.02
		d_sum = float(dp_arr[best_k])
		w_sum = 1.0

	q0 /= w_sum
	q1 /= w_sum
	q2 /= w_sum
	q3 /= w_sum
	var amp_pair: Array[float] = [sqrt(q0 * q0 + q1 * q1), sqrt(q2 * q2 + q3 * q3)]
	var ph_pair: Array[float] = [atan2(q1, q0), atan2(q3, q2)]
	return {
		"basin": str(b_dict["id"]),
		"level": float(b_dict["level"]),
		"a": amp_pair,
		"p": ph_pair,
		"vmax": v_sum / w_sum,
		"depth": d_sum / w_sum,
		"coast": coast_dist,
	}


func at_px(px: float, py: float, reach: int = 3) -> Dictionary:
	if not is_valid:
		return {}
	var best: Dictionary = {}
	for b_idx in range(basins.size()):
		var samp: Dictionary = _sample_basin(basins[b_idx], px, py, reach)
		if not samp.is_empty():
			if best.is_empty() or int(samp["coast"]) < int(best["coast"]):
				best = samp
			if not best.is_empty() and int(best["coast"]) == 0:
				break
	if not best.is_empty():
		best["inf"] = inferred
	return best


func at(x: float, z: float, reach: int = 3) -> Dictionary:
	return at_px(origin[0] + x / px_m, origin[1] + z / px_m, reach)


func level_at(x: float, z: float, t: float = 0.0) -> Variant:
	var samp: Dictionary = at(x, z)
	if samp.is_empty():
		return null
	var a_arr: Array[float] = samp["a"]
	var p_arr: Array[float] = samp["p"]
	return Site._eta(a_arr, p_arr, inferred, not inferred.is_empty(), t)


func range_at(x: float, z: float) -> Variant:
	var samp: Dictionary = at(x, z)
	if samp.is_empty():
		return null
	var a_arr: Array[float] = samp["a"]
	var p_arr: Array[float] = samp["p"]
	var empty_inf: Array[Dictionary] = []
	var ex: Dictionary = Site._day_extremes(a_arr, p_arr, empty_inf, false, 0.0, 0.0)
	return float(ex["range"])


func site(px: float, py: float, opts: Dictionary = {}) -> Site:
	if not is_valid:
		return null
	var reach_v: int = int(opts["reach"]) if (opts.has("reach") and opts["reach"] != null) else 3
	var samp: Dictionary = at_px(px, py, reach_v)
	if samp.is_empty():
		return null

	var lag_v: float = float(opts["lag"]) if (opts.has("lag") and opts["lag"] != null) else 0.0
	var s_a: Array[float] = samp["a"]
	var s_p: Array[float] = samp["p"]
	var empty_inf: Array[Dictionary] = []
	var raw_ex: Dictionary = Site._day_extremes(s_a, s_p, empty_inf, false, 0.0, 0.0)
	var raw_range: float = float(raw_ex["range"])

	var gain_v: float = 1.0
	if opts.has("range") and opts["range"] != null:
		var want_range: float = float(opts["range"])
		gain_v = (want_range / raw_range) if raw_range > 1e-6 else 0.0
	elif opts.has("gain") and opts["gain"] != null:
		gain_v = float(opts["gain"])

	var use_springs: bool = true
	if opts.has("springs") and opts["springs"] != null and bool(opts["springs"]) == false:
		use_springs = false

	var scaled_a: Array[float] = [s_a[0] * gain_v, s_a[1] * gain_v]
	var copied_p: Array[float] = [s_p[0], s_p[1]]
	var mean_ex: Dictionary = Site._day_extremes(scaled_a, copied_p, empty_inf, false, lag_v, 0.0)

	var st: Site = Site.new()
	st.basin = str(samp["basin"])
	st.mean_level = float(samp["level"])
	st.a = scaled_a
	st.p = copied_p
	st.gain = gain_v
	st.lag = lag_v
	st.vmax = float(samp["vmax"]) * gain_v
	st.depth = float(samp["depth"])
	st.coast = int(samp["coast"])
	st.mean_range = float(mean_ex["range"])
	var mean_hi: Array[float] = mean_ex["hi"]
	var mean_lo: Array[float] = mean_ex["lo"]
	st.high = mean_hi
	st.low = mean_lo
	st._inf = inferred if use_springs else empty_inf
	st._has_inf = use_springs and not inferred.is_empty()
	st.springs = st._has_inf
	st._dom = 0 if scaled_a[0] >= scaled_a[1] else 1

	var has_from_2: bool = false
	if st._has_inf:
		for inf_c in inferred:
			if int(inf_c["from"]) == 2:
				has_from_2 = true
				break
	st._spring_from = 2 if has_from_2 else 1

	_active_site = st
	return st


func site_world(x: float, z: float, opts: Dictionary = {}) -> Site:
	return site(origin[0] + x / px_m, origin[1] + z / px_m, opts)


func level(t: float = 0.0) -> float:
	if _active_site == null:
		return 0.0
	return _active_site.level(t)


func rate(t: float = 0.0) -> float:
	if _active_site == null:
		return 0.0
	return _active_site.rate(t)


func state(t: float = 0.0, slack: float = -1.0) -> String:
	if _active_site == null:
		return "slack"
	return _active_site.state(t, slack)


func day_summary(d: float = 0.0) -> Dictionary:
	if _active_site == null:
		return {"high": [], "low": [], "range": 0.0, "highest": 0.0, "lowest": 0.0}
	return _active_site.day_summary(d)


func spring_factor(t: float = 0.0) -> float:
	if _active_site == null:
		return 1.0
	return _active_site.spring_factor(t)


func next_spring(t: float = 0.0) -> Variant:
	if _active_site == null:
		return null
	return _active_site.next_spring(t)


func next_neap(t: float = 0.0) -> Variant:
	if _active_site == null:
		return null
	return _active_site.next_neap(t)
