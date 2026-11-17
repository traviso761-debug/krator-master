# core/terrain stacks in GDScript: the twin of 37-core-stacks.js's RECORDS and their queries (core/world/PLAN-RELIEF.md P15),
# the part the open world's landforms (core/world/43b-world-landforms.js, wland.gd) take: the footprint function, the bed's
# top, make() for the bedded kinds (mesa, butte: tiers, the shoulder, the weathering, columns) and the stacked ones (spire,
# fin, balanced), dome(), tor(), tower(), and at(), surface(), foot(). In the JS file's order of operations and draws, on
# core/rand's krand.gd. Checked through core/world/golden-relief.json (its records and the land with them) by
# core/world/wrelief_test.gd, to 1e-6.
# Not ported yet: mound, arch, pillar (and a fallen pillar's fall), chimney (and its bore), the strata hook's colours, the
# mesh, ledge(), ring(), wall(), weather(). A record is a Dictionary with the JS record's fields; a bed is one too.
#
#   KStacks.make(o) -> record     o: the JS make()'s options (id, kind, x, z, y0, seed, tiers, shoulder, lobes, weather, H, r, e...)
#   KStacks.tower(o) -> record
#   KStacks.at(list, x, z) / KStacks.surface(list, x, z, drawn = false) / KStacks.foot(list, x, z) -> Dictionary or null
#   KStacks.foot_r(b, ang) / KStacks.top_h(b, x, z)
extends RefCounted

const KRand := preload("../rand/krand.gd")
const TAU := PI * 2.0
const GYN := 24


static func _clamp(v: float, a: float, b: float) -> float:
	return a if v < a else (b if v > b else v)


static func sm(a: float, b: float, v: float) -> float:
	var t := _clamp((v - a) / (b - a), 0.0, 1.0)
	return t * t * (3 - 2 * t)


static func _S(sd: int) -> KRand.Stream:
	return KRand.Stream.new(sd & KRand.M32)


static func _h(sd: int, vals: Array) -> int:
	return KRand.hash_ints(sd, vals)


static func jround(v: float) -> float:
	return floorf(v + 0.5)


# V8's Math.hypot (the max-scaled, compensated sum)
static func hypot(a: float, b: float) -> float:
	a = absf(a)
	b = absf(b)
	var m := maxf(a, b)
	if m == 0.0:
		return 0.0
	var s := 0.0
	var comp := 0.0
	for v in [a, b]:
		var n: float = v / m
		var sv := n * n - comp
		var pre := s + sv
		comp = (pre - s) - sv
		s = pre
	return sqrt(s) * m


static func _f(b: Dictionary, k: String, d := 0.0) -> float:
	var v = b.get(k)
	return d if v == null else float(v)


static func _truthy(b: Dictionary, k: String) -> bool:
	var v = b.get(k)
	if v == null:
		return false
	if v is bool:
		return v
	if v is Array:
		return true
	return float(v) != 0.0


# ---------------------------------------------------------------- the one footprint function
static func foot_r(b: Dictionary, ang: float) -> float:
	var a: float = ang - b.ry
	var c: float = cos(a) / b.rx
	var s: float = sin(a) / b.rz
	var R: float
	if _truthy(b, "sq"):
		var sq: float = b.sq
		R = pow(pow(absf(c), sq) + pow(absf(s), sq), -1.0 / sq)
	else:
		R = 1.0 / sqrt(c * c + s * s)
	var ca := cos(ang)
	var sa := sin(ang)
	var ns: int = b.ns
	var tier: float = b.tier
	var lob: float = b.lob
	var n := KRand.fbm(ca * 1.6 + 40, sa * 1.6 + 40, tier * 3.1, 2, ns) - 0.5
	var f := KRand.fbm(ca * 5.5 + 80, sa * 5.5 + 80, tier * 0.73, 1, ns + 7) - 0.5
	R = R * (1 + lob * 2 * n + lob * 0.35 * f)
	if _truthy(b, "fn"):
		var fn: float = b.fn
		var fa: float = ang - b.ry + (KRand.fbm(ca * 1.3 + 60, sa * 1.3 + 60, tier * 2.3, 1, ns + 31) - 0.5) * 1.4 * TAU / fn
		var g: float = 0.5 - 0.5 * cos(fn * fa + _f(b, "fp"))
		R *= 1 - _f(b, "fd") * pow(g, 1.5)
	if _truthy(b, "wr") or b.get("gu") != null or _truthy(b, "fl"):
		var rec := 0.0
		if _truthy(b, "wr"):
			rec = _f(b, "wr") * (0.5 + 2.2 * (KRand.fbm(ca * 5 + 11, sa * 5 + 11, float(b.k) * 0.9, 1, int(b.wn)) - 0.5))
		if _truthy(b, "fl"):
			var Rf: float = _f(b, "fr") if _truthy(b, "fr") else R / 22
			var u2 := KRand.fbm(ca * Rf + 3, sa * Rf + 3, tier * 1.3, 2, ns + 23)
			rec += _f(b, "fl") * (1 - pow(absf(2 * u2 - 1), 0.6))
		if b.get("gu") != null:
			for g in b.gu:
				var d: float = atan2(sin(ang - g[0]), cos(ang - g[0])) / g[1]
				rec += g[2] * exp(-d * d)
		R = maxf(R * 0.3, R - rec)
	if _truthy(b, "cw"):
		var cw: float = b.cw
		var cd: float = b.cd
		var nc: float = maxf(6.0, jround(TAU * (float(b.rx) + float(b.rz)) / 2 / cw))
		var fc := fmod(fmod((ang - float(b.ry)) / TAU * nc, nc) + nc, nc)
		var ci := floori(fc)
		var cf := fc - ci
		R = maxf(R * 0.3, R - cd * (0.25 + 0.75 * KRand.unit(_h(int(b.cs), [ci, b.tier]))) - cd * 0.45 * (2 * cf - 1) * (2 * cf - 1) - cd * 0.6 * (1 - sm(0, 0.1, minf(cf, 1 - cf))))
	return R


static func top_h(b: Dictionary, x: float, z: float) -> float:
	var ns: int = b.ns
	var rg: float = _f(b, "rg", 0.7)
	return float(b.y) + float(b.h) + rg * (KRand.fbm(x * 0.045 + ns % 97, z * 0.045, float(b.k), 2, ns + 11) - 0.5) + (_jag_at(b, x, z) if _truthy(b, "jag") else 0.0)


static func _jag_at(b: Dictionary, x: float, z: float) -> float:
	var c := c_at(b, 1)
	var a := atan2(z - c[1], x - c[0])
	return -float(b.jag) * KRand.fbm(cos(a) * 2.6 + 9, sin(a) * 2.6 + 9, float(b.k) * 0.7, 2, int(b.ns) + 41)


static func _gy_at(b: Dictionary, a: float) -> float:
	var gy: Array = b.gy
	var N := gy.size()
	var f := fmod(fmod(a / TAU * N, N) + N, N)
	var i := floori(f) % N
	var t := f - floorf(f)
	return gy[i] + (gy[(i + 1) % N] - gy[i]) * t


static func y_at(b: Dictionary, a: float, u: float) -> float:
	if b.get("gy") == null:
		return float(b.y) + u * float(b.h)
	var g := _gy_at(b, a)
	return g + u * (float(b.y) + float(b.h) - g)


static func prof(b: Dictionary, u: float) -> float:
	var n: float = 1 - float(b.nt) * pow(1 - u / 0.2, 2) if u < 0.2 else 1.0
	var c: float = 1 - float(b.ch) * pow((u - 0.78) / 0.22, 1.6) if u > 0.78 else 1.0
	return n * c


static func bed(k: int, y: float, h: float, cx: float, cz: float, rx: float, rz: float, ry: float, ch: float, nt: float, lob: float, ns: int, tier: int) -> Dictionary:
	return {"k": k, "y": y, "h": h, "cx": cx, "cz": cz, "rx": rx, "rz": rz, "ry": ry, "ch": ch, "nt": nt, "lob": lob, "ns": ns & KRand.M32,
		"tier": tier, "tp": 1.0, "tx": 0.0, "tz": 0.0, "wr": 0.0, "wn": 0, "gu": null, "fl": 0.0}


static func c_at(b: Dictionary, u: float) -> Array:
	return [float(b.cx) + _f(b, "tx") * u, float(b.cz) + _f(b, "tz") * u]


static func t_at(b: Dictionary, u: float) -> float:
	return 1 + (_f(b, "tp", 1.0) - 1) * u


static func _opt(o: Dictionary, k: String, d):
	var v = o.get(k)
	return d if v == null else v


# ---------------------------------------------------------------- the bodies
const KINDS := {"mesa": "bedded", "butte": "bedded", "spire": "stack", "fin": "stack", "balanced": "stack", "dome": "dome", "tor": "tor"}


static func make(o: Dictionary) -> Dictionary:
	if not KINDS.has(o.get("kind", "")):
		push_error("KStacks.make: kind must be one of " + str(KINDS.keys()) + " (mound, arch, pillar, chimney are not ported)")
		return {}
	if o.get("id") == null:
		push_error("KStacks.make: a body needs an id")
		return {}
	var seed: int = (KRand.child(1, str(o.id)) if o.get("seed") == null else int(o.seed)) & KRand.M32
	var x: float = _opt(o, "x", 0.0)
	var z: float = _opt(o, "z", 0.0)
	var y0: float = _opt(o, "y0", 0.0)
	var beds := []
	if o.kind == "dome":
		return dome(o, seed)
	if o.kind == "tor":
		return tor(o, seed)
	if o.kind == "mesa" or o.kind == "butte":
		var tiers: Array = o.tiers if o.get("tiers") else [{"h": _opt(o, "H", 120.0), "r": _opt(o, "r", 150.0), "e": _opt(o, "e", 1.3), "ry": _opt(o, "ry", 0.0)}]
		var bl: Array = o.bed if o.get("bed") else [14.0, 34.0]
		var lob: float = _opt(o, "lobes", 0.16)
		var y := y0
		var k := 0
		var W: float = _opt(o, "weather", 0.6)
		for t in tiers.size():
			var T: Dictionary = tiers[t]
			var rs := _S(_h(seed, [t, 101]))
			var ns := _h(seed, [t, 7])
			var top: float = y + float(T.h)
			var e: float = _opt(T, "e", 1.3)
			var cx: float = x + _f(T, "dx")
			var cz: float = z + _f(T, "dz")
			var rx: float = float(T.r) * sqrt(e)
			var rz: float = float(T.r) / sqrt(e)
			var ry: float = float(_opt(o, "ry", 0.0)) if T.get("ry") == null else float(T.ry)
			var SH = o.shoulder if t == tiers.size() - 1 and o.get("shoulder") else null
			var shY: float = top - float(SH.h) if SH else INF
			var sbl: Array = SH.bed if SH and SH.get("bed") else [3.0, 7.0]
			while y < top - 1:
				var inSh := y >= shY - 0.01
				var b0: Array = sbl if inSh else bl
				var h := minf(rs.range_f(b0[0], b0[1]), top - y)
				if top - y - h < float(b0[0]) * 0.6:
					h = top - y
				if not inSh and y + h > shY + float(b0[0]) * 0.4:
					h = maxf(shY - y, 1.0)
				var last := y + h >= top - 0.01
				var j := 1 + rs.range_f(-0.012, 0.012) + (0.012 if last else 0.0)
				var M := maxf(rx, rz)
				var dS := 0.0
				if inSh:
					var sb: float = (y + h - shY) / float(SH.h)
					j = 1 + rs.range_f(-0.002, 0.002)
					dS = minf(M * 0.5, float(SH.back) * sb + rs.range_f(-0.12, 0.12) * float(SH.back) / maxf(2.0, float(SH.h) / 5))
				var ch: float = (rs.range_f(1.5, 3) if last else rs.range_f(0.4, 1.2)) / M
				var nt: float = (rs.range_f(2, 4) if last else rs.range_f(0.5, 1.8)) / M
				beds.append(bed(k, y, h, cx, cz, rx * j - dS, rz * j - dS, ry, ch, nt, lob, ns, t))
				k += 1
				y += h
			if W > 0:
				var t0: float = y - float(T.h)
				var M2 := maxf(rx, rz)
				var per := TAU * sqrt((rx * rx + rz * rz) / 2)
				var ng := int(jround(per / 130 * W))
				var gs := _S(_h(seed, [t, 131]))
				var G := []
				for q in ng:
					var g0 := gs.range_f(0, TAU)
					var g1 := gs.range_f(7, 22) / M2
					var g2 := minf(gs.range_f(18, 55) * W, M2 * 0.3)
					G.append([g0, g1, g2])
				for bb in beds:
					if bb.tier != t:
						continue
					var top2: bool = float(bb.y) + float(bb.h) >= y - 0.01
					bb.wr = minf(W * gs.range_f(0.6, 2.6) * (0.6 if top2 else 1.0), M2 * 0.05)
					bb.wn = _h(seed, [t, bb.k, 137])
					bb.fl = minf(W * 6, M2 * 0.04)
					bb.fr = M2 / 22
					var f := sm(0.1, 0.95, (float(bb.y) + float(bb.h) - t0) / float(T.h))
					if f > 0.02 and G.size():
						bb.gu = G.map(func(g): return [g[0], g[1], g[2] * f])
			if o.get("columns"):
				_colonnade(beds, t, y - float(T.h), float(T.h), seed, o.columns)
	else:
		var r := _S(_h(seed, [0, 202]))
		var H: float = _opt(o, "H", 60.0)
		var r0: float = _opt(o, "r", 12.0)
		var e2: float = float(_opt(o, "e", 4.0)) if o.kind == "fin" else float(_opt(o, "e", 1.15))
		var ry2: float = r.range_f(0, TAU) if o.get("ry") == null else float(o.ry)
		var lean: float = r.range_f(0, 0.06) if o.get("lean") == null else float(o.lean)
		var la: float
		if o.kind == "fin":
			la = ry2 + (0.0 if r.chance(0.5) else PI)
		else:
			la = r.range_f(0, TAU)
		var PL = o.plates if o.get("plates") is Array and o.plates.size() == 2 else null
		var jit: float = (0.3 if PL else 0.0) if o.get("jitter") == null else float(o.jitter)
		var taper: float
		if o.get("taper") == null:
			taper = 0.35 if o.kind == "fin" else (0.3 if PL else 0.45)
		else:
			taper = o.taper
		var n := maxi(3, int(jround(H / (r.range_f(PL[0], PL[1]) if PL else r.range_f(12, 20)))))
		var yy := y0
		var hs := []
		var sum := 0.0
		for i in n:
			var w := r.range_f(0.4 if PL else 0.7, 1.8 if PL else 1.3)
			hs.append(w)
			sum += w
		var neck := n - 2 if o.kind == "balanced" else -1
		var lobS := 0.07 if o.kind == "fin" else (0.16 if PL else 0.1)
		for i in n:
			var hh: float = H * hs[i] / sum
			var u := (yy - y0) / H
			var rr := r0 * (1 - taper * u) * (r.range_f(1 - jit, 1 + jit) if PL else r.range_f(0.97, 1.03))
			var off := tan(lean) * (yy - y0)
			var ccx := x + cos(la) * off
			var ccz := z + sin(la) * off
			var cap := i == n - 1
			if i == neck:
				rr *= r.range_f(0.45, 0.6)
			if cap and o.kind == "balanced":
				rr = r0 * r.range_f(0.95, 1.25)
				hh = maxf(hh, rr * r.range_f(0.7, 1.1))
			var rm := maxf(rr * sqrt(e2), rr / sqrt(e2))
			var fine: bool = i == neck or (cap and o.kind == "balanced")
			var ryb := ry2 + r.range_f(-0.02, 0.02)
			var ch: float = (r.range_f(0.25, 0.7) if PL else (r.range_f(0.6, 1.2) if fine else r.range_f(0.15, 0.4))) / rm
			var nt: float = (r.range_f(1.2, 2.8) if PL else (r.range_f(0.5, 1) if fine else r.range_f(0.1, 0.35))) / rm
			beds.append(bed(i, yy, hh, ccx, ccz, rr * sqrt(e2), rr / sqrt(e2), ryb, ch, nt, lobS, _h(seed, [i + 1 if PL else 0, 9]), 0))
			yy += hh
		for i in n:
			var b0: Dictionary = beds[i]
			var b1 = beds[i + 1] if i + 1 < n else null
			if b1 != null and not (o.kind == "balanced" and i == n - 2):
				b0.tp = 1.0 if PL else minf(float(b1.rx) / float(b0.rx), 1.15)
				b0.tx = float(b1.cx) - float(b0.cx)
				b0.tz = float(b1.cz) - float(b0.cz)
			elif b1 == null:
				if o.get("crown") == null:
					b0.tp = 0.9 if o.kind == "balanced" else (1.0 if PL else 0.8)
				else:
					b0.tp = o.crown
	var R := 0.0
	for b in beds:
		var m: float = maxf(b.rx, b.rz) * (1 + 2.5 * float(b.lob)) + hypot(float(b.cx) - x, float(b.cz) - z)
		if m > R:
			R = m
	var tp: Dictionary = beds[beds.size() - 1]
	var rec := {"id": str(o.id), "kind": o.kind, "x": x, "z": z, "y0": y0, "seed": seed, "beds": beds, "top": float(tp.y) + float(tp.h), "R": R + 2}
	if o.get("plates") is Array and o.plates.size() == 2:
		rec.plates = true
	return rec


static func _colonnade(beds: Array, t: int, t0: float, Th: float, seed: int, CO: Dictionary) -> void:
	var cwr: Array = CO.w if CO.get("w") else [1.2, 2.4]
	var ent: float = _opt(CO, "ent", 0.35)
	var cd: float = _opt(CO, "d", 0.35)
	var cw: float = cwr[0] + (cwr[1] - cwr[0]) * KRand.unit(_h(seed, [t, 151]))
	for b in beds:
		if b.tier != t:
			continue
		var up: bool = (float(b.y) + float(b.h) / 2 - t0) / Th > 1 - ent
		b.cw = cw * 0.45 if up else cw
		b.cd = cd * 1.6 if up else cd
		b.cs = _h(seed, [t, 153 if up else 152])


# the foot on the sampled ground (gr: a Callable (x, z) -> y)
static func _set_foot(b: Dictionary, gr: Callable, sink: float, top) -> float:
	var c := c_at(b, 0)
	var N := maxi(GYN, mini(160, int(jround(TAU * maxf(b.rx, b.rz) / 5))))
	var gy := []
	var gmax := -INF
	var p0 := prof(b, 0)
	for i in N:
		var g := INF
		for j in range(-2, 3):
			var a := (i + j / 4.0) / N * TAU
			var R := foot_r(b, a)
			g = minf(g, minf(gr.call(c[0] + cos(a) * R * maxf(1, p0), c[1] + sin(a) * R * maxf(1, p0)), gr.call(c[0] + cos(a) * R * minf(1, p0), c[1] + sin(a) * R * minf(1, p0))))
		if g > gmax:
			gmax = g
		gy.append(g - sink)
	b.gy = gy
	b.y = gy.min()
	if top != null:
		b.h = maxf(top, float(b.y) + 0.3) - float(b.y)
	return gmax


static func _bound(beds: Array, x: float, z: float) -> Array:
	var R := 0.0
	var top := -INF
	for b in beds:
		for i in 16:
			var a := float(i) / 16 * TAU
			var m := foot_r(b, a) * maxf(1, prof(b, 0)) * maxf(1, t_at(b, 1)) + hypot(float(b.cx) - x, float(b.cz) - z) + hypot(_f(b, "tx"), _f(b, "tz"))
			if m > R:
				R = m
		top = maxf(top, float(b.y) + float(b.h))
	return [R * 1.08 + 0.5, top]


# A DOME (an inselberg): exfoliation sheets piled to H, closing up a superellipse profile
static func dome(o: Dictionary, seed: int) -> Dictionary:
	var x: float = _opt(o, "x", 0.0)
	var z: float = _opt(o, "z", 0.0)
	var r := _S(_h(seed, [0, 801]))
	var H: float = _opt(o, "H", 60.0)
	var R0: float = _opt(o, "r", H * 1.4)
	var gr = o.get("ground")
	var eD := r.range_f(1, 1.35)
	var ryD := r.range_f(0, TAU)
	var kD := r.range_f(2, 3)
	var e: float = _opt(o, "e", eD)
	var ry: float = _opt(o, "ry", ryD)
	var k: float = _opt(o, "k", kD)
	var pg: float = _opt(o, "pagoda", 0.0)
	var sh: Array = o.sheet if o.get("sheet") else [3.0, 8.0]
	var gC: float = gr.call(x, z) if gr is Callable else float(_opt(o, "y0", 0.0))
	var sink: float = _opt(o, "sink", 0.1)
	var ns := _h(seed, [0, 9])
	var ys := [0.0]
	var hd := []
	var yy := 0.0
	var m := 0
	var strata = o.get("strata")
	while yy < H - 1e-6 and m < 60:
		var q = strata.call(x, gC + yy, z) if strata is Callable else null
		var th := maxf(sh[0], H / 40)
		var hh: float
		if q != null and float(q.get("h", 0)) > 0:
			hh = q.h
		else:
			hh = th + (maxf(th, sh[1]) - th) * KRand.unit(_h(seed, [m, 802]))
		hh = maxf(hh, H / 60)
		if H - yy - hh < hh * 0.4:
			hh = H - yy
		yy = minf(H, yy + hh)
		ys.append(yy)
		hd.append(q.hard if q != null and q.get("hard") != null else null)
		m += 1
	var beds := []
	var n := ys.size() - 1
	for i in n:
		var f0: float = _dome_pr(ys[i] / H, k) if i else 1.0
		var f1: float = _dome_pr(ys[i + 1] / H, k)
		var hard = hd[i]
		var b := bed(i, gC + ys[i], ys[i + 1] - ys[i], x, z, R0 * sqrt(e) * f0, R0 / sqrt(e) * f0, ry, 0.3 if i == n - 1 else 0.004, 0.008 if hard == null else 0.01 + 0.05 * (1 - float(hard)), 0.06, ns, 0)
		var tpN := maxf(0.12, f1 / maxf(1e-6, f0))
		if i == n - 1:
			b.tp = tpN
		elif pg > 0:
			b.tp = tpN + (1 - tpN) * pg * 0.6
		else:
			b.tp = tpN
		b.rg = 0.25
		if not (pg > 0):
			b.col = 0
		beds.append(b)
	if gr is Callable:
		_set_foot(beds[0], gr, sink, gC + ys[1])
	var bb := _bound(beds, x, z)
	return {"id": str(o.id), "kind": "dome", "x": x, "z": z, "y0": beds[0].y, "seed": seed, "beds": beds, "top": bb[1], "R": bb[0], "feet": [0], "k": k, "e": e}


static func _dome_pr(t: float, k: float) -> float:
	return pow(maxf(0, 1 - pow(minf(1, t), k)), 1 / k)


# A TOR: columns of joint blocks, a perched logan stone on a quarter of them
static func tor(o: Dictionary, seed: int) -> Dictionary:
	var x: float = _opt(o, "x", 0.0)
	var z: float = _opt(o, "z", 0.0)
	var r := _S(_h(seed, [0, 811]))
	var H: float = _opt(o, "H", 6.0)
	var Rr: float = _opt(o, "r", H * 0.9)
	var gr = o.get("ground")
	var bl: Array = o.block if o.get("block") else [1.0, 2.6]
	var nD := r.int_in(2, 5)
	var ryD := r.range_f(0, TAU)
	var lgD := r.chance(0.25)
	var n: int = nD if o.get("cols") == null else maxi(1, int(jround(o.cols)))
	var ry: float = _opt(o, "ry", ryD)
	var lg: bool = lgD if o.get("logan") == null else bool(o.logan)
	var sink: float = _opt(o, "sink", 0.12)
	var gC: float = gr.call(x, z) if gr is Callable else float(_opt(o, "y0", 0.0))
	var beds := []
	var feet := []
	var cols := 0
	var EMB := 0.04
	for c in n:
		var q := _S(_h(seed, [c, 812]))
		var main := c == 0
		var ang := q.range_f(0, TAU)
		var dist := (q.range_f(0, 0.15) if main else q.range_f(0.45, 0.8)) * Rr
		var hF := 1.0 if main else q.range_f(0.35, 0.8)
		var w := Rr * (q.range_f(0.4, 0.55) if main else q.range_f(0.25, 0.4))
		var cx := x + cos(ang) * dist
		var cz := z + sin(ang) * dist
		var yb: float = gr.call(cx, cz) if gr is Callable else gC
		var top := H * hF
		var yy := 0.0
		var kk := 0
		var col := []
		while yy < top - 0.3 and kk < 8:
			var hb := minf(q.range_f(bl[0], bl[1]), top - yy)
			if top - yy - hb < float(bl[0]) * 0.5:
				hb = top - yy
			var e := q.range_f(0.75, 1.35)
			var bx := cx + q.range_f(-0.08, 0.08) * w
			var bz := cz + q.range_f(-0.08, 0.08) * w
			var bry := ry + q.range_f(-0.12, 0.12)
			var bch := q.range_f(0.18, 0.32)
			var bnt := q.range_f(0.12, 0.25)
			var b := bed(0, yb + yy - (EMB if kk else 0.0), hb + (EMB if kk else 0.0), bx, bz, w * sqrt(e), w / sqrt(e), bry, bch, bnt, 0.04, _h(seed, [c, kk, 813]), c)
			b.sq = q.range_f(2.6, 4)
			b.rg = 0.04
			b.col = c
			b.ot = true
			b.tp = q.range_f(0.9, 1)
			col.append(b)
			yy += hb
			kk += 1
			w *= q.range_f(0.78, 1)
		if not col.size():
			continue
		if main and lg and col.size() > 1:
			var ls: Dictionary = col[col.size() - 1]
			ls.nt = 0.45
			ls.rx *= 1.15
			ls.rz *= 1.15
		if gr is Callable:
			var b0: Dictionary = col[0]
			var t0: float = float(b0.y) + float(b0.h)
			_set_foot(b0, gr, sink, t0)
			var lift: float = float(b0.y) + float(b0.h) - t0
			if lift > 0:
				for i in range(1, col.size()):
					col[i].y += lift
		feet.append(beds.size())
		beds.append_array(col)
		cols += 1
	for i in beds.size():
		beds[i].k = i
	var cl := _S(_h(seed, [0, 814]))
	var nc: int = cl.int_in(3, 9) if o.get("clitter") == null else int(o.clitter)
	var clit := []
	for i in nc:
		var a := cl.range_f(0, TAU)
		var d := Rr * cl.range_f(1.1, 2.2)
		var px := x + cos(a) * d
		var pz := z + sin(a) * d
		clit.append({"x": px, "z": pz, "r": H / 6 * cl.range_f(0.2, 0.6), "y": gr.call(px, pz) if gr is Callable else gC})
	var bb := _bound(beds, x, z)
	var y0 := INF
	for k in feet:
		y0 = minf(y0, beds[k].y)
	return {"id": str(o.id), "kind": "tor", "x": x, "z": z, "y0": y0, "seed": seed, "beds": beds, "top": bb[1], "R": bb[0], "cols": cols, "feet": feet, "clitter": clit}


# A KARST TOWER: a spire's one column, given the tower's profile (a sheer cliff, then a dome closing to a small cap)
static func tower(o: Dictionary) -> Dictionary:
	var s := _S(_h(int(o.seed), [0x70E]))
	var e0 := s.range_f(1.0, 1.3)
	var e: float = _opt(o, "e", e0)
	var x: float = o.x
	var z: float = o.z
	var H: float = o.H
	var R: float = o.R
	var y0: float
	if o.get("y0") != null:
		y0 = o.y0
	elif o.get("foot") is Callable:
		y0 = o.foot.call(x, z, R * sqrt(e))
	else:
		y0 = 0.0
	var ryv := s.range_f(0, TAU)
	var B := make({"id": o.id, "kind": "spire", "x": x, "z": z, "y0": y0, "seed": o.seed, "H": H, "r": R, "e": e,
		"ry": ryv if o.get("ry") == null else o.ry, "lean": s.range_f(0, 0.045), "taper": 0.0, "crown": 1.0})
	var tw := s.range_f(0.45, 0.62)
	var pw := s.range_f(0.84, 0.94)
	var kx := s.range_f(1.7, 2.7)
	var phi := s.range_f(0, TAU)
	var drift := s.range_f(0.04, 0.16) * R
	for b in B.beds:
		var t0: float = (float(b.y) - float(B.y0)) / H
		var t1: float = (float(b.y) + float(b.h) - float(B.y0)) / H
		var f0 := _tw_pr(t0, tw, pw, kx)
		var f1 := _tw_pr(t1, tw, pw, kx)
		b.rx *= f0
		b.rz *= f0
		b.tp = f1 / maxf(0.01, f0)
		b.lob = 0.2
		b.cx += cos(phi) * _tw_sh(t0, tw, drift)
		b.cz += sin(phi) * _tw_sh(t0, tw, drift)
		b.tx += cos(phi) * (_tw_sh(t1, tw, drift) - _tw_sh(t0, tw, drift))
		b.tz += sin(phi) * (_tw_sh(t1, tw, drift) - _tw_sh(t0, tw, drift))
	var RR := 0.0
	for b in B.beds:
		RR = maxf(RR, maxf(b.rx, b.rz) * (1 + 2.5 * float(b.lob)) + hypot(float(b.cx) - x, float(b.cz) - z))
	B.R = RR + 2
	B.tower = true
	return B


static func _tw_pr(t: float, tw: float, pw: float, kx: float) -> float:
	return 1 - (1 - pw) * t / tw if t <= tw else pw * pow(maxf(0, 1 - 0.95 * pow((t - tw) / (1 - tw), kx)), 1 / kx)


static func _tw_sh(t: float, tw: float, drift: float) -> float:
	return 0.0 if t <= tw else drift * pow((t - tw) / (1 - tw), 1.5)


# ---------------------------------------------------------------- queries
static func in_bed(b: Dictionary, x: float, z: float, shrink: float) -> float:
	var dx: float = x - float(b.cx)
	var dz: float = z - float(b.cz)
	var dist := hypot(dx, dz)
	var R := foot_r(b, atan2(dz, dx)) * shrink
	return dist - R


static func in_top(b: Dictionary, x: float, z: float, shrink: float) -> float:
	var c := c_at(b, 1)
	var dx: float = x - c[0]
	var dz: float = z - c[1]
	return hypot(dx, dz) - foot_r(b, atan2(dz, dx)) * t_at(b, 1) * shrink


static func at(list: Array, x: float, z: float):
	var best = null
	for B in list:
		if absf(x - B.x) > B.R or absf(z - B.z) > B.R:
			continue
		var beds: Array = B.beds
		for k in range(beds.size() - 1, -1, -1):
			var b: Dictionary = beds[k]
			var d := in_top(b, x, z, 1 - float(b.ch))
			if d < 0:
				var t := top_h(b, x, z)
				if best == null or t > best.top:
					best = {"S": B, "b": b, "top": t, "d": d}
				if not B.get("cols"):
					break
	return best


# THE SURFACE, walls included: {S, b, top, d, wall, steep} or null
static func surface(list: Array, x: float, z: float, drawn := false):
	var best = null
	for B in list:
		if absf(x - B.x) > B.R or absf(z - B.z) > B.R:
			continue
		var beds: Array = B.beds
		for k in range(beds.size() - 1, -1, -1):
			var b: Dictionary = beds[k]
			var tp := _f(b, "tp", 1.0)
			var cx: float = float(b.cx) + _f(b, "tx")
			var cz: float = float(b.cz) + _f(b, "tz")
			var dx := x - cx
			var dz := z - cz
			var rt := foot_r(b, atan2(dz, dx)) * tp * (1 - float(b.ch))
			var d := hypot(dx, dz) - rt
			if d < 0:
				var t := top_h(b, x, z)
				if best == null or t > best.top:
					best = {"S": B, "b": b, "top": t, "d": d, "wall": false, "steep": 0.0}
				if not B.get("cols"):
					break
				continue
			if tp < 0.995 or _truthy(b, "tx") or _truthy(b, "tz"):
				var ex: float = x - float(b.cx)
				var ez: float = z - float(b.cz)
				var ea := atan2(ez, ex)
				var rf := foot_r(b, ea)
				var rfd := rf * maxf(1, prof(b, 0)) if drawn else rf
				var df := hypot(ex, ez) - rfd
				if df < 0:
					var u := _clamp(-df / (-df + d), 0, 1)
					var run := maxf(0.01, rf - rt)
					if drawn:
						var lo := 0.0
						var hi := 1.0
						for it in 28:
							var m := (lo + hi) / 2
							var c := c_at(b, m)
							var Rm := foot_r(b, atan2(z - c[1], x - c[0])) * prof(b, m) * t_at(b, m)
							if hypot(x - c[0], z - c[1]) > Rm:
								hi = m
							else:
								lo = m
						u = (lo + hi) / 2
					var y := y_at(b, ea, u)
					if best == null or y > best.top:
						best = {"S": B, "b": b, "top": y, "d": -1e3, "wall": true, "steep": float(b.h) / run}
					if not B.get("cols"):
						break
	return best


static func top_at(list: Array, x: float, z: float) -> float:
	var a = at(list, x, z)
	return a.top if a != null else -INF


static func foot(list: Array, x: float, z: float):
	var best = null
	for B in list:
		if absf(x - B.x) > B.R + 400 or absf(z - B.z) > B.R + 400:
			continue
		var b0: Dictionary = B.beds[0]
		var d := in_bed(b0, x, z, 1 - float(b0.nt) if float(b0.nt) < 0 else 1.0)
		if B.get("feet") != null:
			for fi in B.feet:
				var bf: Dictionary = B.beds[fi]
				d = minf(d, in_bed(bf, x, z, 1 - float(bf.nt) if float(bf.nt) < 0 else 1.0))
		if best == null or d < best.d:
			best = {"S": B, "d": d}
	return best
