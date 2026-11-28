# core/atmos/wx/89-atmos-wx-cells.js in GDScript: the weather cells (W5, STAGE-8/G-weather.md), line for line. The same
# numbers: every draw is KRand.hash_ints on integers, the rest +, -, *, /, sqrt and floor in the JavaScript's order, so
# the cells, the local weather, the coverage map, the strikes and the shafts match the page's (godot/tests/atmos/cells_test.gd
# against core/atmos/wx/golden-cells.json).
#   var C = load("res://krator/atmos_cells.gd").new(presets_wxcells, wind_base)   # PRESETS.wxcells, PRESETS.wind.base
#   var S: Dictionary = C.system({"seed": s, "climate": {...}, "axes": {...}})
#   C.weather_at(x, z, t, S) -> {mode, rain, fog, snow, dust, ash, storm, wet, wind, cover, dark, flash}: the Atmos autoload's
#        W in mode "live" (atmos.gd weather_step takes it as S["live"]); C.cover_map(S, t, cx, cz, n, span) -> PackedFloat64Array
#        (cover, dark, precipitation, fog): the sky's atm_wx_map; C.strikes(S, t0, t1, x, z, range): the bolts (KBolt) and thunder
extends RefCounted

const KRand := preload("res://tests/rand/krand.gd")
const KINDS := ["rain", "storm", "fog", "snow", "dust", "ash"]

var P: Dictionary
var wind_base: Array


func _init(presets: Dictionary = {}, wind: Array = [0.8, 0.35]) -> void:
	P = presets
	wind_base = wind


static func _def(d: Dictionary, k: String, dflt):
	return d[k] if d.has(k) and d[k] != null else dflt


static func _ss(a: float, b: float, x: float) -> float:
	var t := (x - a) / (b - a)
	t = 0.0 if t < 0.0 else (1.0 if t > 1.0 else t)
	return t * t * (3.0 - 2.0 * t)


static func _lerp(r: Array, u: float) -> float:
	return float(r[0]) + (float(r[1]) - float(r[0])) * u


static func _H(sd: int, vals: Array) -> int:
	return KRand.hash_ints(sd, vals)


static func _U(u: int) -> float:
	return KRand.unit(u)


func weights(C: Dictionary, ax: Dictionary) -> Dictionary:
	var w: float = _def(ax, "warmth", 0.5)
	var p: float = _def(ax, "pressure", 1.0)
	var dry: bool = C.get("dry", false) == true
	var a: float = _def(ax, "aridity", 0.85 if dry else (0.7 if C.has("wet") and C["wet"] == false else 0.4))
	if dry and a < 0.75:
		a = 0.75
	var sf: float = 1.0 if C.get("frozen", false) == true else (maxf(0.5, 1.0 - _ss(0.1, 0.45, w)) if C.get("cold", false) == true else 1.0 - _ss(0.08, 0.3, w))
	var wet := 1.0 - a
	var pre := 0.46 * wet * (1.0 - 0.4 * a)
	var st := 0.12 + 0.4 * w
	var o := {"rain": pre * (1.0 - sf) * (1.0 - st), "storm": pre * (1.0 - sf) * st, "fog": 0.2 * wet * (1.0 - 0.45 * w) + (0.06 if p > 1.3 else 0.0),
		"snow": pre * sf, "dust": 0.32 * a * a * (1.0 if dry else 0.45), "ash": 0.28 if C.get("ash", false) == true else 0.0}
	var s := 0.0
	for k in KINDS:
		s += o[k]
	o["clear"] = maxf(0.3, 1.0 - s)
	s += o["clear"]
	for k in KINDS:
		o[k] = o[k] / s
	o["clear"] = o["clear"] / s
	o["aridity"] = a
	return o


func system(o: Dictionary) -> Dictionary:
	var b: Array = _def(o, "wind", wind_base)
	var l := sqrt(float(b[0]) * float(b[0]) + float(b[1]) * float(b[1]))
	if l == 0.0:
		l = 1.0
	var sp: float = _def(o, "speed", P["speed"])
	var wt: Dictionary = o["weights"] if o.has("weights") and o["weights"] != null else weights(_def(o, "climate", {}), _def(o, "axes", {}))
	var cum := []
	var c := 0.0
	for k in KINDS:
		c += float(_def(wt, k, 0.0))
		cum.append(c)
	var rm := 0.0
	for k in KINDS:
		rm = maxf(rm, float(P["kinds"][k]["r"][1]))
	return {"seed": int(_def(o, "seed", 1)) & 0xFFFFFFFF, "dx": float(b[0]) / l, "dz": float(b[1]) / l, "vx": float(b[0]) / l * sp, "vz": float(b[1]) / l * sp,
		"weights": wt, "cum": cum, "virga": float(_def(o, "virga", 0.1 + 0.7 * float(_def(wt, "aridity", 0.4)))),
		"reach": rm * float(P["elong"][1]) + float(P["jitter"]) * float(P["period"][1]) * float(P["life"][1])}


func cell(S: Dictionary, ix: int, iz: int, k: int, t: float):
	var hs := _H(S["seed"], [ix, iz, k])
	var per := _lerp(P["period"], _U(_H(hs, [1])))
	var ph := _U(_H(hs, [2]))
	var g := floorf(t / per + ph)
	var hg := _H(hs, [g])
	var u := _U(_H(hg, [1]))
	var ki := -1
	for i in S["cum"].size():
		if u < S["cum"][i]:
			ki = i
			break
	if ki < 0:
		return null
	var born := (g - ph) * per
	var life := per * _lerp(P["life"], _U(_H(hg, [2])))
	var a := (t - born) / life
	if a < 0.0 or a >= 1.0:
		return null
	var kind: String = KINDS[ki]
	var K: Dictionary = P["kinds"][kind]
	var tile: float = P["tile"]
	var cx := (ix + _U(_H(hg, [3]))) * tile
	var cz := (iz + _U(_H(hg, [4]))) * tile
	var jx := (_U(_H(hg, [5])) * 2.0 - 1.0) * float(P["jitter"])
	var jz := (_U(_H(hg, [6])) * 2.0 - 1.0) * float(P["jitter"])
	return {"id": hg, "kind": kind, "ki": ki, "ix": ix, "iz": iz, "k": k, "cx": cx, "cz": cz, "jx": jx, "jz": jz, "born": born, "life": life, "age": a,
		"x": cx + S["vx"] * t + jx * (t - born), "z": cz + S["vz"] * t + jz * (t - born), "r": _lerp(K["r"], _U(_H(hg, [7]))),
		"el": _lerp(P["elong"], _U(_H(hg, [8]))), "s": 0.6 + 0.4 * _U(_H(hg, [9])), "env": _ss(0.0, P["grow"], a) * (1.0 - _ss(1.0 - float(P["fade"]), 1.0, a))}


func _env_at(c: Dictionary, t: float) -> float:
	var a: float = (t - c["born"]) / c["life"]
	return 0.0 if a < 0.0 or a >= 1.0 else _ss(0.0, P["grow"], a) * (1.0 - _ss(1.0 - float(P["fade"]), 1.0, a))


func cells(S: Dictionary, x: float, z: float, t: float, reach: float = 0.0) -> Array:
	var tile: float = P["tile"]
	var u: float = x - S["vx"] * t
	var w: float = z - S["vz"] * t
	var R: float = reach + S["reach"]
	var out := []
	var i0 := floori((u - R) / tile)
	var i1 := floori((u + R) / tile)
	var j0 := floori((w - R) / tile)
	var j1 := floori((w + R) / tile)
	for iz in range(j0, j1 + 1):
		for ix in range(i0, i1 + 1):
			for k in int(P["slots"]):
				var c = cell(S, ix, iz, k, t)
				if c == null:
					continue
				var dx: float = c["x"] - x
				var dz: float = c["z"] - z
				var e: float = c["r"] * c["el"] + reach
				if dx * dx + dz * dz <= e * e:
					out.append(c)
	return out


func cell_at(S: Dictionary, c: Dictionary, x: float, z: float) -> float:
	var dx: float = x - c["x"]
	var dz: float = z - c["z"]
	var al: float = (dx * S["dx"] + dz * S["dz"]) / c["el"]
	var ac: float = dz * S["dx"] - dx * S["dz"]
	var d := sqrt(al * al + ac * ac)
	if d >= c["r"]:
		return 0.0
	return c["s"] * c["env"] * (1.0 - _ss(float(P["core"]) * c["r"], c["r"], d))


func sample(S: Dictionary, cl: Array, x: float, z: float) -> Dictionary:
	var K: Dictionary = P["kinds"]
	var q := [1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
	var cov := 1.0
	var dk := 1.0
	for c in cl:
		var v := cell_at(S, c, x, z)
		if v <= 0.0:
			continue
		q[c["ki"]] = q[c["ki"]] * (1.0 - v)
		var kk: Dictionary = K[c["kind"]]
		cov = cov * (1.0 - v * float(kk["cover"]))
		dk = dk * (1.0 - v * float(kk["dark"]))
	var ch := {}
	for i in 6:
		ch[KINDS[i]] = 1.0 - q[i]
	ch["cover"] = 1.0 - cov
	ch["dark"] = 1.0 - dk
	return ch


func _field(ch: Dictionary, f: String) -> float:
	var q := 1.0
	for k in KINDS:
		q = q * (1.0 - float(P["kinds"][k][f]) * ch[k])
	return 1.0 - q


func _rain_at(S: Dictionary, x: float, z: float, t: float) -> float:
	return _field(sample(S, cells(S, x, z, t, 0.0), x, z), "rain")


func weather_at(x: float, z: float, t: float, S: Dictionary) -> Dictionary:
	var ch := sample(S, cells(S, x, z, t, 0.0), x, z)
	var rain := _field(ch, "rain")
	var wet := rain
	for L in P["lag"]:
		wet = maxf(wet, float(L[1]) * _rain_at(S, x, z, t - float(L[0])))
	var wind := 1.0
	for k in KINDS:
		wind = wind + float(P["kinds"][k]["wind"]) * ch[k]
	return {"mode": "live", "rain": rain, "fog": _field(ch, "fog"), "snow": _field(ch, "snow"), "dust": _field(ch, "dust"), "ash": _field(ch, "ash"),
		"storm": ch["storm"], "wet": minf(1.0, wet), "wind": minf(2.8, wind), "cover": ch["cover"], "dark": ch["dark"], "flash": 0.0}


func cover_map(S: Dictionary, t: float, cx: float, cz: float, n: int, sp: float) -> PackedFloat64Array:
	var N := n * n
	var out := PackedFloat64Array()
	out.resize(N * 4)
	var q := PackedFloat64Array()
	q.resize(N * 6)
	q.fill(1.0)
	var cov := PackedFloat64Array()
	cov.resize(N)
	cov.fill(1.0)
	var dk := PackedFloat64Array()
	dk.resize(N)
	dk.fill(1.0)
	var px := sp / n
	for c in cells(S, cx, cz, t, sp * 0.7072):
		var e: float = c["r"] * c["el"]
		var i0 := maxi(0, floori((c["x"] - e - cx) / px + n / 2.0))
		var i1 := mini(n - 1, floori((c["x"] + e - cx) / px + n / 2.0))
		var j0 := maxi(0, floori((c["z"] - e - cz) / px + n / 2.0))
		var j1 := mini(n - 1, floori((c["z"] + e - cz) / px + n / 2.0))
		var kk: Dictionary = P["kinds"][c["kind"]]
		for j in range(j0, j1 + 1):
			for i in range(i0, i1 + 1):
				var v := cell_at(S, c, cx + ((i + 0.5) / n - 0.5) * sp, cz + ((j + 0.5) / n - 0.5) * sp)
				if v <= 0.0:
					continue
				var p := j * n + i
				q[p * 6 + c["ki"]] = q[p * 6 + c["ki"]] * (1.0 - v)
				cov[p] = cov[p] * (1.0 - v * float(kk["cover"]))
				dk[p] = dk[p] * (1.0 - v * float(kk["dark"]))
	for p in N:
		var ch := {}
		for i in 6:
			ch[KINDS[i]] = 1.0 - q[p * 6 + i]
		out[p * 4] = 1.0 - cov[p]
		out[p * 4 + 1] = 1.0 - dk[p]
		out[p * 4 + 2] = maxf(_field(ch, "rain"), maxf(_field(ch, "snow"), _field(ch, "ash")))
		out[p * 4 + 3] = _field(ch, "fog")
	return out


func mean(S: Dictionary) -> Array:
	var c := 0.0
	var d := 0.0
	var f := 0.0
	for k in KINDS:
		var w: float = _def(S["weights"], k, 0.0)
		c += w * float(P["kinds"][k]["cover"])
		d += w * float(P["kinds"][k]["dark"])
		f += w * float(P["kinds"][k]["fog"])
	return [0.3 * c, 0.3 * d, 0.0, 0.3 * f]


func strikes(S: Dictionary, t0: float, t1: float, x: float, z: float, rng: float) -> Array:
	var B: float = P["strikeBin"]
	var out := []
	for c in cells(S, x, z, t1, rng):
		var K: Dictionary = P["kinds"][c["kind"]]
		if float(K["strike"]) == 0.0:
			continue
		for b in range(floori(t0 / B), floori(t1 / B) + 1):
			var hb := _H(c["id"], [0x57, b])
			var e := _env_at(c, b * B)
			if e <= 0.0 or _U(hb) >= float(K["strike"]) * B * e * c["s"]:
				continue
			var ts := (b + _U(_H(hb, [1]))) * B
			if ts <= t0 or ts > t1:
				continue
			var ox: float = (_U(_H(hb, [2])) * 2.0 - 1.0) * c["r"] * float(P["core"])
			var oz: float = (_U(_H(hb, [3])) * 2.0 - 1.0) * c["r"] * float(P["core"])
			var sx: float = c["cx"] + S["vx"] * ts + c["jx"] * (ts - c["born"]) + ox
			var sz: float = c["cz"] + S["vz"] * ts + c["jz"] * (ts - c["born"]) + oz
			var dx := sx - x
			var dz := sz - z
			if dx * dx + dz * dz > rng * rng:
				continue
			out.append({"t": ts, "x": sx, "z": sz, "seed": _H(hb, [4]), "ash": c["kind"] == "ash", "power": e * c["s"], "cell": c["id"]})
	out.sort_custom(func(a, b): return a["t"] < b["t"] or (a["t"] == b["t"] and a["seed"] < b["seed"]))
	return out


func shafts(S: Dictionary, x: float, z: float, t: float, mx: int = -1) -> Array:
	var Q: Dictionary = P["shafts"]
	if mx < 0:
		mx = int(Q["max"])
	var out := []
	for c in cells(S, x, z, t, Q["far"]):
		var K: Dictionary = P["kinds"][c["kind"]]
		var pr := maxf(float(K["rain"]), maxf(float(K["snow"]), float(K["ash"])))
		if pr <= 0.0:
			continue
		var d := sqrt((c["x"] - x) * (c["x"] - x) + (c["z"] - z) * (c["z"] - z))
		var k: float = pr * c["s"] * c["env"]
		if d > float(Q["far"]) + c["r"] or k < 0.05:
			continue
		out.append({"x": c["x"], "z": c["z"], "r": c["r"] * float(P["core"]) * 1.25, "el": c["el"], "k": k, "kind": c["kind"], "d": d,
			"virga": 1 if c["kind"] == "rain" and _U(_H(c["id"], [0x56])) < S["virga"] else 0, "id": c["id"]})
	out.sort_custom(func(a, b):
		var ka: float = a["k"] / (1.0 + a["d"] / 8000.0)
		var kb: float = b["k"] / (1.0 + b["d"] / 8000.0)
		return ka > kb or (ka == kb and a["id"] < b["id"]))
	return out.slice(0, mx)
