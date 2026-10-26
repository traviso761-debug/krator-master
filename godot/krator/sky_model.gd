# The shared sky's model in Godot: the twin of core/atmos/sky/89-atmos-e-skymodel.js and 89-atmos-f-skypresets.js
# (core/atmos/SKY-PLAN.md). Where everything in Krator's sky is at a site, hour and day count: the sun from latitude,
# tilt and day of year; the giant fixed per site on Krator's celestial equator, with its daily libration; its ring plane;
# the six moons on the ring line, with their phases; the eclipse; the stars' sphere; and the colour script (look()).
# Its constants, presets, bright stars and the moons' epochs come from godot/data/sky/sky.json, written by
# godot/tools/atmos_sky.js from the JavaScript, so there is one source; tests/sky/sky_test.gd holds this file to the
# JavaScript's own numbers (tests/sky/golden.json). Directions are Vector3 in the page's frame: x east, y up, z south.
extends RefCounted

const D := PI / 180.0
var S: Dictionary
var presets: Dictionary


func _init(path := "res://data/sky/sky.json") -> void:
	var j: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(path))
	S = j["sky"]
	presets = j["presets"]


# ---- the hash (lowbias32: the same bits as Math.imul in the JavaScript and uint in the shader)
static func _mul32(a: int, b: int) -> int:
	return (a * (b & 0xFFFF) + (((a * (b >> 16)) & 0xFFFF) << 16)) & 0xFFFFFFFF


static func lowbias(x: int, y: int, s: int) -> int:
	var h := _mul32(x & 0xFFFFFFFF, 1597334677) ^ _mul32(y & 0xFFFFFFFF, 3812015801) ^ _mul32(s & 0xFFFFFFFF, 2654435769)
	h ^= h >> 16
	h = _mul32(h, 2146121005)
	h ^= h >> 15
	h = _mul32(h, 2221713035)
	return h ^ (h >> 16)


# ---- the site, from the scale model's pixel
func site_at(px: float, py: float) -> Dictionary:
	var F: Dictionary = S["frame"]
	var lat: float = F["refLat"] - (py - F["refPx"][1]) * F["mPerPx"] / 1000.0 / F["kmPerDeg"]
	var sub: float = F["refSubLon"] - (px - F["refPx"][0]) * F["mPerPx"] / 1000.0 / (F["kmPerDeg"] * cos(lat * D))
	return {"px": px, "py": py, "latitude": lat, "subGiantLon": sub}


# ---- the frames
static func world_hd(H: float, d: float, phi: float) -> Vector3:
	var sa := sin(phi) * sin(d) + cos(phi) * cos(d) * cos(H)
	var alt := asin(clampf(sa, -1.0, 1.0))
	var az := atan2(-cos(d) * sin(H), cos(phi) * sin(d) - sin(phi) * cos(d) * cos(H))
	return Vector3(sin(az) * cos(alt), sin(alt), -cos(az) * cos(alt))


func _sun_ra_dec(t: float) -> Vector2:
	var l: float = (270.0 + 360.0 * (t - S["solsticeDay"]) / S["yearD"]) * D
	var e: float = S["tilt"] * D
	return Vector2(atan2(cos(e) * sin(l), cos(l)), asin(sin(e) * sin(l)))


static func _eq(ra: float, dec: float) -> Vector3:
	return Vector3(cos(dec) * cos(ra), cos(dec) * sin(ra), sin(dec))


func _krator_at(lst: float, Hg: float) -> Vector2:
	var rag := lst - Hg
	var R: float = S["giant"]["orbitKm"]
	return Vector2(-R * cos(rag), -R * sin(rag))


func ring_normal(st: Dictionary) -> Vector3:
	var i: float = (st["ringOpen"] if st.has("ringOpen") else S["giant"]["ringOpenDeg"]) * D
	var p: Vector3 = st["giantAxis"]
	var g: Vector3 = st["giantDir"]
	return (p * cos(i) - g * sin(i)).normalized()


# ---- the state at a site, an hour and a day count (0 is game start's date)
func sky_state(site: Dictionary, hour: float, day: float) -> Dictionary:
	var t := day + hour / 24.0
	var yd: float = S["startDay"] + t
	var phi: float = site["latitude"] * D
	var Hg: float = -site["subGiantLon"] * D
	var rd := _sun_ra_dec(yd)
	var ra := rd.x
	var dec := rd.y
	var H := 15.0 * (hour - 12.0) * D
	var lst := H + ra
	var c1 := world_hd(0.0, 0.0, phi)
	var c2 := world_hd(-PI / 2.0, 0.0, phi)
	var c3 := world_hd(0.0, PI / 2.0, phi)
	var cl := cos(lst)
	var sl := sin(lst)
	# W = M Rz(-lst): world = W e for an inertial equatorial vector e. Columns as vectors
	var Wx := c1 * cl - c2 * sl
	var Wy := c1 * sl + c2 * cl
	var Wz := c3
	var sun_dir := world_hd(H, dec, phi).normalized()
	var G: Dictionary = S["giant"]
	var giant_dir := world_hd(Hg, float(G["decDeg"]) * D, phi).normalized()
	var pole := c3.normalized()
	# libration: a nod along Krator's meridian at the giant and a swing across it, once a sidereal orbit
	var LB: Dictionary = G["libration"]
	var ph := TAU * t * 1.0027379
	var dN: float = LB["incDeg"] * D * sin(ph + LB["phase"])
	var dE: float = 2.0 * LB["ecc"] * sin(ph)
	var g0 := giant_dir
	var nd := (pole - g0 * pole.dot(g0)).normalized()
	var ew := nd.cross(g0).normalized()
	giant_dir = (g0 + nd * tan(dN) + ew * dE).normalized()
	var ring_open: float = G["ringOpenDeg"] * sin(ph + LB["phase"])
	var gE1 := Vector3(giant_dir.z, 0.0, -giant_dir.x).normalized()
	var gUp := giant_dir.cross(gE1)
	var ta: float = G["axisTiltDeg"] * D
	var giant_axis := (gUp * cos(ta) + gE1 * sin(ta)).normalized()
	# the moons: Krator and each moon in the giant's equatorial plane (km), laid on the sky's ring line
	var K := _krator_at(lst, Hg)
	var sunE := _eq(ra, dec)
	var kr := K.length()
	var xh := -K / kr
	var yh := Vector2(-xh.y, xh.x)
	var rn := ring_normal({"giantAxis": giant_axis, "giantDir": giant_dir, "ringOpen": ring_open})
	var rt := rn.cross(giant_dir).normalized()
	var sx := sunE.x * xh.x + sunE.y * xh.y
	var sy := sunE.x * yh.x + sunE.y * yh.y
	var L := (giant_dir * sx + rt * sy + rn * sunE.z).normalized()
	var moons: Array = []
	for m in S["moons"]:
		var th: float
		var M := Vector2.ZERO
		if m.has("periodD"):
			th = m["theta0"] + TAU * t / m["periodD"]
			M = Vector2(cos(th), sin(th)) * float(m["orbitKm"])
		else:
			th = atan2(K.y, K.x) + m["trojanDeg"] * D
			M = Vector2(cos(th), sin(th)) * kr
		var v := Vector2(-sin(th), cos(th))
		var lx := v.dot(xh)
		var ly := v.dot(yh)
		var md := M - K
		var dist := md.length()
		var b := atan2(md.dot(yh), md.dot(xh))
		var e := Vector3(md.x / dist, md.y / dist, 0.0)
		var cos_psi := -sunE.dot(e)
		var mdir := (giant_dir * cos(b) + rt * sin(b)).normalized()
		# its light: toward the real sun on the sky, at the angle that keeps its phase (the JavaScript's Lm)
		var sp := sun_dir - mdir * sun_dir.dot(mdir)
		var lm := L
		if sp.length() > 1e-6:
			lm = (-mdir * cos_psi + sp.normalized() * sqrt(maxf(0.0, 1.0 - cos_psi * cos_psi))).normalized()
		moons.append({"name": m["name"], "kind": m["kind"], "dir": mdir, "along": b / D, "light": lm,
			"lead": (giant_dir * lx + rt * ly).normalized(), "toGiant": (giant_dir * kr - mdir * dist).normalized(),
			"radiusDeg": atan(float(m["radiusKm"]) / dist) / D, "lump": float(m.get("lump", 0.0)), "distKm": dist, "front": 1 if dist < kr * 0.98 else 0,
			"lit": (1.0 + cos_psi) / 2.0, "albedo": m["albedo"]})
	var sep := acos(clampf(sun_dir.dot(giant_dir), -1.0, 1.0)) / D
	var rg: float = G["diaDeg"] / 2.0
	var rs: float = S["sunDiaDeg"] / 2.0
	var eclipse := 0.0 if sep >= rg + rs else (1.0 if sep <= rg - rs else (rg + rs - sep) / (2.0 * rs))
	var C: Dictionary = S["cluster"]
	var ce := _eq(C["ra"] * D, C["dec"] * D)
	return {"site": site, "hour": hour, "day": day, "t": t, "yearDay": fposmod(yd, S["yearD"]), "lst": lst,
		"sunDir": sun_dir, "giantDir": giant_dir, "giantAxis": giant_axis, "ringOpen": ring_open, "ringLine": rt, "pole": pole,
		"eq": [Wx, Wy, Wz], "moons": moons, "eclipse": eclipse,
		"sunAlt": asin(clampf(sun_dir.y, -1.0, 1.0)) / D, "giantAlt": asin(giant_dir.y) / D,
		"giantLit": (1.0 - sun_dir.dot(giant_dir)) / 2.0, "spin": TAU * fmod(t * 24.0 / G["spinH"], 1.0),
		"clusterDir": (Wx * ce.x + Wy * ce.y + Wz * ce.z).normalized()}


# ---- the date, for display
func sky_date(day: float, hour: float) -> Dictionary:
	var t := day + hour / 24.0
	var yd := int(floor(fposmod(S["startDay"] + t, S["yearD"])))
	var m := 0
	var d := yd
	while d >= int(S["monthDays"][m]):
		d -= int(S["monthDays"][m])
		m += 1
	var dd := int(floor(t - floor(S["doubleDark"])))
	var c := posmod(dd, 91)
	return {"yearDay": yd, "month": S["months"][m], "day": d + 1, "count": c + 1, "week": S["weekdays"][c % 7],
		"thirteen": c % 13 + 1, "name": S["numbers"][c % 13] + " " + S["weekdays"][c % 7], "text": str(d + 1) + " " + S["months"][m]}


# ---- the noise volume (n^3 RGBA bytes). The 64^3 volume is shipped as godot/data/sky/noise64.bin (slow in GDScript);
# this bakes the same bytes at any size, and the test checks it at 8^3
func noise_volume(n: int) -> PackedByteArray:
	var P := 16
	var k := float(n) / P
	var out := PackedByteArray()
	out.resize(n * n * n * 4)
	var G: Array = []
	for c in 4:
		var g := PackedFloat64Array()
		g.resize(P * P * P * 3)
		for z in P:
			for y in P:
				for x in P:
					var h := lowbias(x + P * y, z, 500 + c)
					var j := 3 * (x + P * (y + P * z))
					g[j] = (h & 1023) / 511.5 - 1.0
					g[j + 1] = ((h >> 10) & 1023) / 511.5 - 1.0
					g[j + 2] = ((h >> 20) & 1023) / 511.5 - 1.0
		G.append(g)
	for z in n:
		for y in n:
			for x in n:
				var px := x / k
				var py := y / k
				var pz := z / k
				var ix := int(floor(px))
				var iy := int(floor(py))
				var iz := int(floor(pz))
				var fx := px - ix
				var fy := py - iy
				var fz := pz - iz
				var u := fx * fx * fx * (fx * (fx * 6.0 - 15.0) + 10.0)
				var v := fy * fy * fy * (fy * (fy * 6.0 - 15.0) + 10.0)
				var w := fz * fz * fz * (fz * (fz * 6.0 - 15.0) + 10.0)
				for c in 4:
					var g: PackedFloat64Array = G[c]
					var r := 0.0
					for a in 8:
						var ox := a & 1
						var oy := (a >> 1) & 1
						var oz := a >> 2
						var j := 3 * (((ix + ox) & 15) + P * (((iy + oy) & 15) + P * ((iz + oz) & 15)))
						var dd := g[j] * (fx - ox) + g[j + 1] * (fy - oy) + g[j + 2] * (fz - oz)
						r += dd * (u if ox else 1.0 - u) * (v if oy else 1.0 - v) * (w if oz else 1.0 - w)
					out[4 * (x + n * (y + n * z)) + c] = clampi(int(round((r * 0.5 + 0.5) * 255.0)), 0, 255)
	return out


# ---- the colour script (89-atmos-f-skypresets.js): the keys by sun altitude, the air, the eclipse, the weather
static func _mix(a: Array, b: Array, t: float) -> Array:
	return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]


static func _lum(c: Array) -> float:
	return 0.3 * c[0] + 0.55 * c[1] + 0.15 * c[2]


static func _ss(a: float, b: float, x: float) -> float:
	var t := clampf((x - a) / (b - a), 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)


static func key_at(keys: Array, alt: float) -> Dictionary:
	if alt <= keys[0]["alt"]:
		return keys[0].duplicate(true)
	var n := keys.size()
	if alt >= keys[n - 1]["alt"]:
		return keys[n - 1].duplicate(true)
	var i := 0
	while keys[i + 1]["alt"] < alt:
		i += 1
	var a: Dictionary = keys[i]
	var b: Dictionary = keys[i + 1]
	var t0: float = (alt - a["alt"]) / (b["alt"] - a["alt"])
	var t := t0 * t0 * (3.0 - 2.0 * t0)
	var o := {"alt": alt}
	for k in a:
		if k == "alt":
			continue
		o[k] = _mix(a[k], b[k], t) if a[k] is Array else a[k] + (b[k] - a[k]) * t
	return o


func look(P: Dictionary, s: Dictionary, w = null) -> Dictionary:
	if w == null:
		w = {}
	var p: float = P["air"]["pressure"]
	var L := key_at(P["keys"], s["sunAlt"])
	if s["eclipse"] > 0.0:
		var E := key_at(P["keys"], -6.0)
		var e: float = s["eclipse"] * 0.88
		for k in E:
			if k == "alt" or k == "exp":
				continue
			L[k] = _mix(L[k], E[k], e) if L[k] is Array else L[k] + (E[k] - L[k]) * e
		L["sunI"] *= 1.0 - s["eclipse"]
	var thick := clampf((p - 1.0) * 0.32, 0.0, 0.5)
	var thin := clampf((1.0 - p) / 0.85, 0.0, 1.0)
	var lh := minf(1.0, _lum(L["hor"]) * 1.08)
	L["hor"] = _mix(L["hor"], [lh, lh, lh], thick * 0.6)
	L["zen"] = _mix(L["zen"], L["hor"], thick * 0.45)
	L["zen"] = _mix(L["zen"], [L["zen"][0] * 0.10, L["zen"][1] * 0.16, L["zen"][2] * 0.34], thin * 0.95)
	L["hor"] = _mix(L["hor"], _mix(L["hor"], L["zen"], 0.5), thin * 0.6)
	L["sunHor"] = _mix(L["sunHor"], L["hor"], thin * 0.4)
	if P["air"].get("dustK", 0):
		L["hor"] = _mix(L["hor"], P["air"]["dust"], P["air"]["dustK"] * 0.5)
		L["sunHor"] = _mix(L["sunHor"], P["air"]["dust"], P["air"]["dustK"] * 0.3)
	var g := clampf(w.get("grey", 0.0), 0.0, 1.0)
	if g > 0.0:
		for k in ["zen", "hor", "sunHor"]:
			var c: Array = L[k]
			var l := _lum(c)
			var m := _mix(c, [l, l, l], g * 0.8)
			L[k] = [m[0] * (1.0 - 0.25 * g), m[1] * (1.0 - 0.25 * g), m[2] * (1.0 - 0.25 * g)]
		L["sunI"] *= 1.0 - 0.75 * g
		L["hemiI"] *= 1.0 + 0.15 * g
	var turb: float = P["air"].get("turbidity", 1.0)
	L["ext"] = [0.020 * p * turb * (1.0 + 2.0 * g), 0.042 * p * turb * (1.0 + 2.0 * g), 0.090 * p * turb * (1.0 + 2.0 * g)]
	L["hazeFloor"] = clampf(0.10 * p * (1.0 - thin) + 0.25 * g, 0.0, 0.6)
	L["dayStars"] = _ss(0.62, 0.12, p)
	L["night"] = _ss(-4.0, -14.0, s["sunAlt"])
	var GP: Dictionary = P["giant"]
	L["shineC"] = GP["shine"]
	L["shineI"] = GP["shineI"] * s["giantLit"] * maxf(L["night"], s["eclipse"] * 0.6) * (1.0 - 0.7 * g)
	L["fogC"] = _mix(L["hor"], L["sunHor"], 0.18)
	L["fogD"] = P["fogDensity"] * L["fog"] * (p / 1.6) * (1.0 + 6.0 * w.get("fog", 0.0))
	L["cover"] = clampf(P["clouds"]["cover"] + w.get("cover", 0.0), 0.0, 1.0)
	return L
