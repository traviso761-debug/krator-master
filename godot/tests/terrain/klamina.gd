# The lamina column, the GDScript twin of core/terrain/35b-core-lamina.js: a krator-lamina export read back and walked with the same
# arithmetic (the years from KRand.hash, the days inside a year), so a Godot inspector or pipe shader reads the page's own days and
# bands. Held to golden-lamina.json by klamina_test.gd. The project's copy is godot/tests/terrain/klamina.gd (godot/tools/sync_core.py).
# Depth in metres from the lip; colours sRGB 0..1.
class_name KLamina
extends RefCounted

const KRand := preload("../rand/krand.gd")
const SALT := 0x1a7
const MAXY := 200000
const COUNTRIES := {"red": {"a": "#6b2a16", "b": "#1d1411", "wet": "#b0623c"}, "white": {"a": "#ece5d3", "b": "#a3a88e", "wet": "#fbf8ef"}}
const MARKS := {"glass": {"th": 0.004, "colour": "#d9771f", "years": 1, "k": 1.0}, "thin": {"k": 0.35, "colour": "#2b2621", "years": 40, "tint": 0.6}}

var H := 0.0
var rate := 0.0003
var year_d := 365
var wa := 0
var wd := 0
var wk := 1.0
var has_wet := false
var half := 0.5
var died := 0.0
var cA: Array = []
var cB: Array = []
var cW: Array = []
var M: Array = []   # markers: {name, colour, tint, ...}
var D: Array = []
var T: Array = []
var TH: Array = []
var MK: Array = []
var MY: Array = []
var years := 0
var days := 0
var first_day := 0
var day_n := 0.0


static func _rgb(h) -> Array:
	if h is Array:
		return [float(h[0]), float(h[1]), float(h[2])]
	var n: int = int(h) if (h is int or h is float) else String(h).replace("#", "").hex_to_int()
	return [float((n >> 16) & 255) / 255.0, float((n >> 8) & 255) / 255.0, float(n & 255) / 255.0]


static func _d(v, x):
	return x if v == null else v


# a krator-lamina object (L.export() on the page); null with an error when it is not one
static func from_export(e: Dictionary) -> KLamina:
	if e.get("format") != "krator-lamina" or int(e.get("version", 0)) != 1:
		push_error("KLamina: not a krator-lamina, version 1")
		return null
	var o: Dictionary = e["opts"]
	var L := KLamina.new()
	var sd: int = int(o["seed"]) & 0xFFFFFFFF
	L.H = float(o["H"])
	L.rate = float(o["rate"])
	L.year_d = int(o["yearD"])
	if o["wet"] is Dictionary:
		L.has_wet = true
		L.wa = int(o["wet"]["at"])
		L.wd = int(o["wet"]["days"])
		L.wk = float(o["wet"]["k"])
	var jit := float(o["jitter"])
	L.half = float(o["half"])
	L.died = float(o["died"])
	var C: Dictionary = o["colours"] if o.get("colours") is Dictionary else COUNTRIES[String(_d(o.get("country"), "red"))]
	L.cA = _rgb(C["a"])
	L.cB = _rgb(C["b"])
	L.cW = _rgb(_d(C.get("wet"), C["a"]))
	var raw: Array = o.get("markers", [])
	for i in raw.size():
		var m: Dictionary = raw[i]
		var P: Dictionary = MARKS[m["kind"]] if m.get("kind") != null else {}
		var q := {"name": String(_d(m.get("name"), ("marker%d" % i) if m.get("kind") == null else m["kind"])),
			"years": maxi(1, roundi(float(_d(m.get("years"), _d(P.get("years"), 1))))), "k": float(_d(m.get("k"), _d(P.get("k"), 1.0))),
			"th": float(_d(m.get("th"), _d(P.get("th"), 0.0))), "colour": _rgb(_d(m.get("colour"), _d(P.get("colour"), "#808080"))),
			"tint": float(_d(m.get("tint"), _d(P.get("tint"), 0.6))), "depth": m.get("depth"), "start": null}
		if m.get("age") != null:
			q["start"] = roundi(float(m["age"]))
		L.M.append(q)
	L.day_n = float(L.year_d - L.wd) + float(L.wd) * L.wk
	var y := 0
	var top := 0.0
	while top < L.H:
		if y >= MAXY:
			push_error("KLamina: over %d years" % MAXY)
			return null
		var u := KRand.unit(KRand.hash_ints(sd, [y, SALT]))
		var base := L.rate * L.day_n * (1.0 + jit * (2.0 * u - 1.0))
		var kk := 1.0
		var th := 0.0
		var mk := -1
		var my := -1
		for j in L.M.size():
			var m: Dictionary = L.M[j]
			if m["start"] == null and float(m["depth"]) <= top + base:
				m["start"] = y
			if m["start"] != null and y >= int(m["start"]) and y < int(m["start"]) + int(m["years"]):
				kk *= m["k"]
				if m["k"] != 1.0:
					my = j
				if y == int(m["start"]) + int(m["years"]) - 1 and m["th"] > 0.0:
					th += m["th"]
					mk = j
		L.D.append(top)
		L.T.append(base * kk + th)
		L.TH.append(th)
		L.MK.append(mk)
		L.MY.append(my)
		top += base * kk + th
		y += 1
	L.years = y
	var cut: float = L.D[y - 1] + L.T[y - 1] - L.H
	L.first_day = 0 if cut <= L.TH[y - 1] else int(L._day_in(y - 1, cut - L.TH[y - 1])["d"])
	L.days = (y - 1) * L.year_d + (L.year_d - L.first_day)
	return L


func _r_of(i: int) -> float:
	return (T[i] - TH[i]) / day_n


func _day_in(i: int, s: float) -> Dictionary:
	var r := _r_of(i)
	var c1 := wa * r
	var c2 := c1 + wd * r * wk
	var dd := 0
	var ph := 0.0
	var t := r
	if s < c1:
		dd = floori(s / r)
		ph = s / r - dd
	elif s < c2:
		t = r * wk
		var q := (s - c1) / t
		dd = wa + floori(q)
		ph = q - floor(q)
	else:
		var q2 := (s - c2) / r
		dd = wa + wd + floori(q2)
		ph = q2 - floor(q2)
	if dd > year_d - 1:
		dd = year_d - 1
		ph = 1.0 - 1e-9
	return {"d": dd, "ph": ph, "t": t, "wet": has_wet and dd >= wa and dd < wa + wd}


func _top_of_day(i: int, dd: int) -> float:
	var r := _r_of(i)
	var s: float = TH[i]
	if dd < wa:
		return s + (dd + 1) * r
	if dd < wa + wd:
		return s + wa * r + (dd - wa + 1) * r * wk
	return s + wa * r + wd * r * wk + (dd - wa - wd + 1) * r


func _find(depth: float) -> int:
	var lo := 0
	var hi := years - 1
	while lo < hi:
		var mid := (lo + hi + 1) >> 1
		if D[mid] <= depth:
			lo = mid
		else:
			hi = mid - 1
	return lo


static func _mix(a: Array, b: Array, t: float) -> Array:
	return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]


# L.at(depth): {} off the column
func at(depth: float) -> Dictionary:
	if not (depth >= 0.0) or depth > H:
		return {}
	var i := _find(depth)
	var s: float = D[i] + T[i] - depth
	var out := {"depth": depth, "h": H - depth, "year": i, "marker": null}
	if s < TH[i]:
		var mm: Dictionary = M[MK[i]]
		out.merge({"layer": "marker", "marker": mm["name"], "yearDay": 0, "phase": s / TH[i], "half": "a", "wet": false, "thick": TH[i],
			"colour": mm["colour"].duplicate(), "daysAgo": died + i * year_d + year_d, "day": days - (i * year_d + year_d)}, true)
		return out
	var q := _day_in(i, s - TH[i])
	var hf := "a" if q["ph"] < half else "b"
	var c: Array = (cW if q["wet"] else cA) if hf == "a" else cB
	if MY[i] >= 0:
		var mz: Dictionary = M[MY[i]]
		out["marker"] = mz["name"]
		c = _mix(c, mz["colour"], mz["tint"])
	var ago: int = i * year_d + (year_d - 1 - int(q["d"]))
	out.merge({"layer": "couplet", "yearDay": q["d"], "phase": q["ph"], "half": hf, "wet": q["wet"], "thick": q["t"], "colour": c.duplicate(),
		"daysAgo": died + ago, "day": days - 1 - ago}, true)
	return out


# where the pipe's day `day` lies: -1.0 off the column
func depth_of(day: int) -> float:
	if day < 0 or day >= days:
		return -1.0
	var ago := days - 1 - day
	var i := ago / year_d
	var dd := year_d - 1 - (ago - i * year_d)
	if i >= years or (i == years - 1 and dd < first_day):
		return -1.0
	return maxf(0.0, D[i] + T[i] - _top_of_day(i, dd))


# the bake's bytes (L.bake({res}) on the page): rows of 256 RGBA8 texels, for the pipe shader's Image
func bake(res: float) -> PackedByteArray:
	var W := 256
	var n := ceili(H / res)
	var rows := maxi(1, ceili(float(n) / W))
	var data := PackedByteArray()
	data.resize(W * rows * 4)
	for k in n:
		var r := 0.0
		var g := 0.0
		var b := 0.0
		var tk := 0.0
		var m := 0
		for j in 4:
			var p := at(minf(H, (k + (j + 0.5) / 4.0) * res))
			if p.is_empty():
				continue
			r += p["colour"][0]
			g += p["colour"][1]
			b += p["colour"][2]
			if j == 2:
				tk = 0.0 if p["layer"] == "marker" else p["thick"]
			m += 1
		if m == 0:
			continue
		data[k * 4] = int(floor(r / m * 255.0 + 0.5))
		data[k * 4 + 1] = int(floor(g / m * 255.0 + 0.5))
		data[k * 4 + 2] = int(floor(b / m * 255.0 + 0.5))
		data[k * 4 + 3] = clampi(int(floor(tk / (rate * 4.0) * 255.0 + 0.5)), 0, 255)
	return data
