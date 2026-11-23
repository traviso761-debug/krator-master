# core/terrain stacks in GDScript: the twin of 37-core-stacks.js and its opt-in companion 37b-core-stacks-contour.js
# (core/world/PLAN-RELIEF.md P15). Every kind (mesa, butte, spire, fin, balanced, mound, dome, tor, arch, pillar, chimney;
# tower), the layouts (row, cluster, mounds, pillars), the queries (at, surface, top_at, foot, ledge, ring, wall, bore),
# the mesh (every kind, the gridded top, the chimney's bore and fall, ice), hash, weather, export and load, and 37b's
# contour and arch_round; in the JS files' order of operations and draws, on core/rand's krand.gd. Checked against
# core/terrain/golden-stacks.json by kstacks_test.gd and through core/world/golden-relief.json by wrelief_test.gd, to 1e-6.
# A record is a Dictionary with the JS record's fields; a bed is one too; a mesh is {pos, uv, occ (PackedFloat32Array),
# idx (PackedInt32Array), part, bed (PackedByteArray), ice}. Options are Dictionaries; the JS functions they carry (ground,
# strata, soilAt, foot, lift, accept, zone, top, topH) are Callables here.
#
#   KStacks.make(o) / tower(o) / row(o) / cluster(o) / mounds(o) / pillars(o)
#   KStacks.at / surface / top_at / foot / ledge (list, x, z)   ring(B, y, n)   wall(B, b, a, u)   bore(B, o)
#   KStacks.mesh(B, opt) / hash(m) / weather(B, m, o) / contour(B, m, o) / arch_round(B, m, o)
#   KStacks.foot_r(b, ang) / top_h(b, x, z) / prof(b, u) / y_at(b, a, u)   KStacks.kinds()   export_list(list) / load(j)
extends RefCounted

const KRand := preload("../rand/krand.gd")
const TAU := PI * 2.0
const GYN := 24
const OCHRE := [0.72, 0.38, 0.2]
const LATERITE := [0.6, 0.34, 0.22]
const KINDS := {"mesa": "bedded", "butte": "bedded", "spire": "stack", "fin": "stack", "balanced": "stack", "mound": "mound", "dome": "dome",
	"tor": "tor", "arch": "arch", "pillar": "pillar", "chimney": "chimney"}
const CH_FORM := {"pipe": {"H": 30, "r": 4, "wallK": 0.3, "taper": 0.75, "flare": {"from": 0.8, "k": 1.35}},
	"bell": {"H": 14, "r": 6, "wallK": 0.12, "taper": 0.7, "flare": {"from": 0.35, "k": 2.4, "p": 1.6}, "holdfasts": {"n": 6}},
	"stalk": {"H": 18, "r": 0.9, "wallK": 0.25, "taper": 0.8, "flare": 0, "state": "broken"},
	"siphon": {"H": 40, "r": 5, "wallK": 0.22, "taper": 0.6, "flare": {"from": 0.7, "k": 1.8}}}


# ---------------------------------------------------------------- JS's arithmetic
static func _clamp(v: float, a: float, b: float) -> float:
	return a if v < a else (b if v > b else v)


static func sm(a: float, b: float, v: float) -> float:
	var t := _clamp((v - a) / (b - a), 0.0, 1.0)
	return t * t * (3 - 2 * t)


static func _S(sd: int) -> KRand.Stream:
	return KRand.Stream.new(sd & KRand.M32)


static func _h(sd: int, vals: Array) -> int:
	return KRand.hash_ints(sd, vals)


# JS's Math.round: half up
static func jround(v: float) -> float:
	return floorf(v + 0.5)


# V8's Math.hypot (the max-scaled, compensated sum), so the last bits agree
static func hypotn(vals: Array) -> float:
	var m := 0.0
	var ab := []
	for v in vals:
		var a := absf(float(v))
		ab.append(a)
		if a > m:
			m = a
	if m == 0.0:
		return 0.0
	var s := 0.0
	var comp := 0.0
	for a in ab:
		var n: float = a / m
		var sv := n * n - comp
		var pre := s + sv
		comp = (pre - s) - sv
		s = pre
	return sqrt(s) * m


static func hypot(a: float, b: float) -> float:
	return hypotn([a, b])


static func _f(b: Dictionary, k: String, d := 0.0) -> float:
	var v = b.get(k)
	return d if v == null else float(v)


# JS truthiness of a field (undefined, null, 0, false, "" are false; an Array or a Dictionary, even empty, true)
static func _t(b: Dictionary, k: String) -> bool:
	return _truthy(b.get(k))


static func _truthy(v) -> bool:
	if v == null:
		return false
	if v is bool:
		return v
	if v is int or v is float:
		return float(v) != 0.0
	if v is String:
		return v != ""
	return true


static func _opt(o: Dictionary, k: String, d):
	var v = o.get(k)
	return d if v == null else v


# ---------------------------------------------------------------- the one footprint function
static func foot_r(b: Dictionary, ang: float) -> float:
	var a: float = ang - b.ry
	var c: float = cos(a) / b.rx
	var s: float = sin(a) / b.rz
	var R: float
	if _t(b, "sq"):
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
	if _t(b, "fn"):
		var fn: float = b.fn
		var fa: float = ang - b.ry + (KRand.fbm(ca * 1.3 + 60, sa * 1.3 + 60, tier * 2.3, 1, ns + 31) - 0.5) * 1.4 * TAU / fn
		var g: float = 0.5 - 0.5 * cos(fn * fa + _f(b, "fp"))
		R *= 1 - _f(b, "fd") * pow(g, 1.5)
	if _t(b, "wr") or _t(b, "gu") or _t(b, "fl"):
		var rec := 0.0
		if _t(b, "wr"):
			rec = _f(b, "wr") * (0.5 + 2.2 * (KRand.fbm(ca * 5 + 11, sa * 5 + 11, float(b.k) * 0.9, 1, int(b.wn)) - 0.5))
		if _t(b, "fl"):
			var Rf: float = _f(b, "fr") if _t(b, "fr") else R / 22
			var u2 := KRand.fbm(ca * Rf + 3, sa * Rf + 3, tier * 1.3, 2, ns + 23)
			rec += _f(b, "fl") * (1 - pow(absf(2 * u2 - 1), 0.6))
		if _t(b, "gu"):
			for g in b.gu:
				var d: float = atan2(sin(ang - g[0]), cos(ang - g[0])) / g[1]
				rec += g[2] * exp(-d * d)
		R = maxf(R * 0.3, R - rec)
	if _t(b, "cw"):
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
	return float(b.y) + float(b.h) + rg * (KRand.fbm(x * 0.045 + ns % 97, z * 0.045, float(b.k), 2, ns + 11) - 0.5) + (_jag_at(b, x, z) if _t(b, "jag") else 0.0)


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


static func kinds() -> Array:
	return KINDS.keys()


# ---------------------------------------------------------------- the bodies
static func make(o: Dictionary) -> Dictionary:
	if not KINDS.has(o.get("kind", "")):
		push_error("KStacks.make: kind must be one of " + str(KINDS.keys()))
		return {}
	if o.get("id") == null:
		push_error("KStacks.make: a body needs an id")
		return {}
	var seed: int = (KRand.child(1, str(o.id)) if o.get("seed") == null else int(o.seed)) & KRand.M32
	var x: float = _opt(o, "x", 0.0)
	var z: float = _opt(o, "z", 0.0)
	var y0: float = _opt(o, "y0", 0.0)
	var beds := []
	match KINDS[o.kind]:
		"mound":
			return mound(o, seed)
		"dome":
			return dome(o, seed)
		"tor":
			return tor(o, seed)
		"arch":
			return arch(o, seed)
		"pillar":
			return pillar(o, seed)
		"chimney":
			return chimney(o, seed)
	if o.kind == "mesa" or o.kind == "butte":
		var tiers: Array = o.tiers if _t(o, "tiers") else [{"h": _opt(o, "H", 120.0), "r": _opt(o, "r", 150.0), "e": _opt(o, "e", 1.3), "ry": _opt(o, "ry", 0.0)}]
		var bl: Array = o.bed if _t(o, "bed") else [14.0, 34.0]
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
			var SH = o.shoulder if t == tiers.size() - 1 and _t(o, "shoulder") else null
			var shY: float = top - float(SH.h) if SH != null else INF
			var sbl: Array = SH.bed if SH != null and _t(SH, "bed") else [3.0, 7.0]
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
			if _t(o, "columns"):
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
		var jit: float = (0.3 if PL != null else 0.0) if o.get("jitter") == null else float(o.jitter)
		var taper: float
		if o.get("taper") == null:
			taper = 0.35 if o.kind == "fin" else (0.3 if PL != null else 0.45)
		else:
			taper = o.taper
		var n := maxi(3, int(jround(H / (r.range_f(PL[0], PL[1]) if PL != null else r.range_f(12, 20)))))
		var yy := y0
		var hs := []
		var sum := 0.0
		for i in n:
			var w := r.range_f(0.4 if PL != null else 0.7, 1.8 if PL != null else 1.3)
			hs.append(w)
			sum += w
		var neck := n - 2 if o.kind == "balanced" else -1
		var lobS := 0.07 if o.kind == "fin" else (0.16 if PL != null else 0.1)
		for i in n:
			var hh: float = H * hs[i] / sum
			var u := (yy - y0) / H
			var rr := r0 * (1 - taper * u) * (r.range_f(1 - jit, 1 + jit) if PL != null else r.range_f(0.97, 1.03))
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
			var ch: float = (r.range_f(0.25, 0.7) if PL != null else (r.range_f(0.6, 1.2) if fine else r.range_f(0.15, 0.4))) / rm
			var nt: float = (r.range_f(1.2, 2.8) if PL != null else (r.range_f(0.5, 1) if fine else r.range_f(0.1, 0.35))) / rm
			beds.append(bed(i, yy, hh, ccx, ccz, rr * sqrt(e2), rr / sqrt(e2), ryb, ch, nt, lobS, _h(seed, [i + 1 if PL != null else 0, 9]), 0))
			yy += hh
		for i in n:
			var b0: Dictionary = beds[i]
			var b1 = beds[i + 1] if i + 1 < n else null
			if b1 != null and not (o.kind == "balanced" and i == n - 2):
				b0.tp = 1.0 if PL != null else minf(float(b1.rx) / float(b0.rx), 1.15)
				b0.tx = float(b1.cx) - float(b0.cx)
				b0.tz = float(b1.cz) - float(b0.cz)
			elif b1 == null:
				if o.get("crown") == null:
					b0.tp = 0.9 if o.kind == "balanced" else (1.0 if PL != null else 0.8)
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


# ---------------------------------------------------------------- the mound (a termite cathedral)
static func mound(o: Dictionary, seed: int) -> Dictionary:
	var x: float = _opt(o, "x", 0.0)
	var z: float = _opt(o, "z", 0.0)
	var r := _S(_h(seed, [0, 701]))
	var H: float = _opt(o, "H", 6.0)
	var G: float = _opt(o, "r", H * 0.45)
	var gr = o.get("ground")
	var nfD := int(jround(r.range_f(7, 12)))
	var nf: int = nfD if o.get("flutes") == null else int(jround(o.flutes))
	var fd: float = _opt(o, "fluteDepth", 0.16)
	var nsD := r.int_in(1, 5)
	var nsp: int = maxi(1, nsD if o.get("spires") == null else int(jround(o.spires)))
	var hs := H * r.range_f(0.14, 0.22)
	var tps := r.range_f(0.5, 0.62)
	var es := r.range_f(1, 1.2)
	var rys := r.range_f(0, TAU)
	var fp0 := r.range_f(0, TAU)
	var flare := -0.22
	var sink: float = _opt(o, "sink", 0.06)
	var gC: float = gr.call(x, z) if gr is Callable else float(_opt(o, "y0", 0.0))
	var ns := _h(seed, [0, 9])
	var Gf := G / (1 - flare)
	var sk := bed(0, 0, 1, x, z, Gf * sqrt(es), Gf / sqrt(es), rys, 0.3, flare, 0.07, ns, 0)
	sk.tp = tps
	sk.col = -1
	sk.rg = 0.05
	if nf > 0:
		sk.fn = nf
		sk.fd = fd * 0.5
		sk.fp = fp0
	var Ytop: float
	var yb: float
	if gr is Callable:
		var gy := []
		var gmax := -INF
		for i in GYN:
			var a := float(i) / GYN * TAU
			var R0 := foot_r(sk, a) * (1 - flare)
			var g: float = gr.call(x + cos(a) * R0, z + sin(a) * R0)
			gmax = maxf(gmax, g)
			gy.append(g - sink)
		yb = gy.min()
		Ytop = gmax + hs
		sk.gy = gy
	else:
		yb = gC
		Ytop = gC + hs
	sk.y = yb
	sk.h = Ytop - yb
	var beds := [sk]
	var drawnSk := {"x": x, "z": z, "R": Gf * maxf(sqrt(es), 1) * 1.6 + 1, "beds": [sk]}
	var Rt := Gf * minf(sqrt(es), 1 / sqrt(es)) * tps * (1 - float(sk.ch))
	var embed := maxf(0.05, 0.02 * G)
	var rm := 0.0
	var cols := 0
	for c in nsp:
		var q := _S(_h(seed, [c, 702]))
		var main := c == 0
		var dA := q.range_f(0, TAU)
		var dR := q.range_f(0, 1)
		var rF := q.range_f(0, 1)
		var hF := q.range_f(0.3, 0.75)
		var e := q.range_f(1, 1.2)
		var ry := q.range_f(0, TAU)
		var lean := q.range_f(0.0 if main else 0.04, 0.05 if main else 0.13)
		var lA := q.range_f(0, TAU)
		var fp := q.range_f(0, TAU)
		var taper := q.range_f(0.78, 0.86)
		var crown := q.range_f(0.3, 0.42)
		var cx: float
		var cz: float
		var r0: float
		var top: float
		if main:
			r0 = Rt * (0.8 + 0.15 * rF)
			var d0 := Rt * 0.15 * dR
			cx = x + cos(dA) * d0
			cz = z + sin(dA) * d0
			top = gC + H
		else:
			var aj := fp0 + float(c) / (nsp - 1) * TAU + (dA - PI) * 0.25 / maxf(1, nsp - 1)
			var dj := Rt * (0.55 + 0.3 * dR)
			r0 = minf(rm * (0.35 + 0.25 * rF), (Rt * 1.25 - dj) / 1.35)
			if r0 < rm * 0.2:
				continue
			cx = x + cos(aj) * dj
			cz = z + sin(aj) * dj
			lA = aj
			top = gC + H * hF
		var fn: int = maxi(4, int(jround(nf * (1.0 if main else r0 / rm)))) if nf > 0 else 0
		var col := _column_beds(c, cx, cz, r0, e, ry, fn, fd, fp, _h(seed, [c, 9]), taper, crown, maxi(3, mini(9, int(jround((top - gC) / 0.9)))))
		var lo := INF
		var b0: Dictionary = col[0]
		for i in 32:
			var a2 := float(i) / 32 * TAU
			var R2 := foot_r(b0, a2) * prof(b0, 0)
			lo = minf(lo, _on_skirt(drawnSk, sk, x, z, yb, float(b0.cx) + cos(a2) * R2, float(b0.cz) + sin(a2) * R2))
		var y0c := lo - embed
		var Hc := maxf(top - y0c, (top - gC) * 0.4)
		var hb := Hc / col.size()
		var off := tan(lean)
		for i in col.size():
			var b: Dictionary = col[i]
			b.y = y0c + i * hb
			b.h = hb
			b.cx = cx + cos(lA) * off * i * hb
			b.cz = cz + sin(lA) * off * i * hb
			b.tx = cos(lA) * off * hb
			b.tz = sin(lA) * off * hb
		if main:
			rm = r0
		cols += 1
		beds.append_array(col)
	for i in beds.size():
		beds[i].k = i
	var R := 0.0
	var top2 := -INF
	for b in beds:
		for i in 16:
			var a := float(i) / 16 * TAU
			var m := foot_r(b, a) * maxf(1, prof(b, 0)) + hypot(float(b.cx) - x, float(b.cz) - z) + hypot(float(b.tx), float(b.tz))
			if m > R:
				R = m
		top2 = maxf(top2, float(b.y) + float(b.h))
	var soil = o.get("soil")
	if not _truthy(soil):
		soil = o.soilAt.call(x, z) if o.get("soilAt") is Callable else null
	if not _truthy(soil):
		soil = LATERITE
	var cr := _S(_h(seed, [0, 703]))
	var rd: float = _opt(o, "redden", 0.3)
	var lt := 1.04 + cr.range_f(-0.05, 0.05)
	var clay := []
	for i in 3:
		clay.append(_clamp((soil[i] + (OCHRE[i] - soil[i]) * rd) * lt, 0, 1))
	return {"id": str(o.id), "kind": "mound", "x": x, "z": z, "y0": yb, "seed": seed, "beds": beds, "top": top2, "R": R * 1.08 + 0.5, "cols": cols, "flutes": nf, "clay": clay}


static func _on_skirt(drawnSk: Dictionary, sk: Dictionary, x: float, z: float, yb: float, px: float, pz: float) -> float:
	var s = surface([drawnSk], px, pz, Callable(), {"drawn": true})
	if s != null:
		return s.top
	return _gy_at(sk, atan2(pz - z, px - x)) if sk.get("gy") != null else yb


static func _column_beds(c: int, cx: float, cz: float, r0: float, e: float, ry: float, fn: int, fd: float, fp: float, ns: int, taper: float, crown: float, nb: int) -> Array:
	var out := []
	for i in nb:
		var R0 := r0 * (1 - taper * pow(float(i) / nb, 1.4))
		var last := i == nb - 1
		var b := bed(i, 0, 1, cx, cz, R0 * sqrt(e), R0 / sqrt(e), ry, 0.25 if last else 0.0, 0.0 if i else -0.35, 0.05, ns, c + 1)
		b.tp = crown if last else r0 * (1 - taper * pow(float(i + 1) / nb, 1.4)) / R0
		b.col = c
		b.rg = 0.04
		if fn > 0:
			b.fn = fn
			b.fd = fd
			b.fp = fp
		out.append(b)
	return out


# a savannah's mounds by cell
static func mounds(o: Dictionary) -> Array:
	var C: float = _opt(o, "cell", 40.0)
	var per: int = _opt(o, "per", 1)
	var p: float = _opt(o, "p", 0.3)
	var Hr: Array = o.H if _t(o, "H") else [4.0, 12.0]
	var gap: float = _opt(o, "gap", 4.0)
	var w: int = _opt(o, "world", 0)
	var out := []
	var i0 := floori(o.x0 / C)
	var i1 := floori(o.x1 / C)
	var j0 := floori(o.z0 / C)
	var j1 := floori(o.z1 / C)
	for j in range(j0, j1 + 1):
		for i in range(i0, i1 + 1):
			var here := []
			for t in per:
				var s := _S(_h(w, [i, j, t, 0x3D1]))
				var hit := s.chance(p)
				var H := s.range_f(Hr[0], Hr[1])
				var gf := s.range_f(0.35, 0.55)
				var rg: float = s.range_f(o.r[0], o.r[1]) if _t(o, "r") else H * gf
				var u := s.next()
				var v := s.next()
				if not hit:
					continue
				var ins := minf(C / 2, rg * 1.3 + gap / 2)
				var x := i * C + ins + u * (C - 2 * ins)
				var z := j * C + ins + v * (C - 2 * ins)
				var ok := true
				for q in here:
					if hypot(q[0] - x, q[1] - z) < (q[2] + rg) * 1.3 + gap:
						ok = false
						break
				if not ok or (o.get("accept") is Callable and not o.accept.call(x, z, rg)):
					continue
				here.append([x, z, rg])
				if x < o.x0 or x >= o.x1 or z < o.z0 or z >= o.z1:
					continue
				out.append(make({"id": ("mound" if o.get("id") == null else str(o.id)) + ":" + str(i) + "," + str(j) + ":" + str(t), "kind": "mound", "x": x, "z": z, "H": H, "r": rg,
					"seed": _h(w, [i, j, t, 0x3D2]), "ground": o.get("ground"), "y0": o.get("y0"), "soil": o.get("soil"), "soilAt": o.get("soilAt")}))
	return out


# the foot on the sampled ground
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
	var sh: Array = o.sheet if _t(o, "sheet") else [3.0, 8.0]
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
	var bl: Array = o.block if _t(o, "block") else [1.0, 2.6]
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


# AN ARCH: two legs and a lintel, the fin striking ry
static func arch(o: Dictionary, seed: int) -> Dictionary:
	var x: float = _opt(o, "x", 0.0)
	var z: float = _opt(o, "z", 0.0)
	var r := _S(_h(seed, [0, 821]))
	var gr = o.get("ground")
	var span: float = _opt(o, "span", 12.0)
	var rise: float = _opt(o, "rise", span * 0.8)
	var H: float = _opt(o, "H", rise * 1.6)
	var tD := r.range_f(0.3, 0.45)
	var ryD := r.range_f(0, TAU)
	var inD := r.range_f(0.12, 0.22)
	var lwD := r.range_f(0.5, 0.7)
	var t: float = _opt(o, "t", span * tD)
	var ry: float = _opt(o, "ry", ryD)
	var inw: float = _opt(o, "inward", inD)
	var lw: float = _opt(o, "leg", span * lwD)
	if not (H > rise + 0.5):
		push_error("KStacks.make arch: H must stand over the rise")
		return {}
	var sink: float = _opt(o, "sink", 0.12)
	var ux := cos(ry)
	var uz := sin(ry)
	var gC: float = gr.call(x, z) if gr is Callable else float(_opt(o, "y0", 0.0))
	var yO := gC + rise
	var beds := []
	var feet := []
	var ns := _h(seed, [0, 9])
	for c in 2:
		var sg := 1.0 if c else -1.0
		var q := _S(_h(seed, [c, 822]))
		var lx := x + ux * sg * (span / 2 + lw / 2)
		var lz := z + uz * sg * (span / 2 + lw / 2)
		var gb: float = gr.call(lx, lz) if gr is Callable else gC
		if not (yO - gb > 1):
			push_error("KStacks.make arch: leg " + str(c) + " stands on ground within a metre of the opening's top")
			return {}
		var nb := maxi(2, int(jround((yO - gb) / q.range_f(2, 4))))
		var hb := (yO + 0.15 - gb) / nb
		feet.append(beds.size())
		for i in nb:
			var ex := inw * span * pow(float(i + 1) / nb, 2)
			var bry := ry + q.range_f(-0.02, 0.02)
			var bch := 0.0 if i == nb - 1 else q.range_f(0.01, 0.03)
			var bnt := q.range_f(0.01, 0.04)
			var b := bed(0, gb + i * hb, hb, lx - ux * sg * ex / 2, lz - uz * sg * ex / 2, (lw + ex) / 2, t / 2, bry, bch, bnt, 0.04, ns, c)
			b.sq = 3
			b.col = c
			b.rg = 0.05
			beds.append(b)
		if gr is Callable:
			_set_foot(beds[feet[c]], gr, sink, gb + hb)
	var L := bed(0, yO, gC + H - yO, x, z, span / 2 + lw + 0.3, t / 2 * 0.95, ry, 0.1, 0, 0.05, ns, 2)
	L.sq = 3
	L.col = 2
	L.rg = 0.08
	L.und = true
	beds.append(L)
	for i in beds.size():
		beds[i].k = i
	var bb := _bound(beds, x, z)
	return {"id": str(o.id), "kind": "arch", "x": x, "z": z, "y0": minf(beds[feet[0]].y, beds[feet[1]].y), "seed": seed, "beds": beds, "top": bb[1], "R": bb[0], "cols": 3, "feet": feet,
		"opening": {"x": x, "z": z, "y0": gC, "y1": yO, "w0": span, "w1": span * (1 - 2 * inw), "ry": ry}}


# A PILLAR: a jointed block standing H over the ground, its beds hard and soft
static func pillar(o: Dictionary, seed: int) -> Dictionary:
	var x: float = _opt(o, "x", 0.0)
	var z: float = _opt(o, "z", 0.0)
	var r := _S(_h(seed, [0, 831]))
	var H: float = _opt(o, "H", 250.0)
	var W: float = _opt(o, "w", 40.0)
	var Lr: float = _opt(o, "l", W)
	var gr = o.get("ground")
	var bl: Array = o.bed if _t(o, "bed") else [5.0, 40.0]
	var sqD := r.range_f(3, 5)
	var tpD := r.range_f(0.04, 0.12)
	var lnD := r.range_f(0, 0.02)
	var la := r.range_f(0, TAU)
	var sq: float = _opt(o, "sq", sqD)
	var taper: float = _opt(o, "taper", tpD)
	var ry: float = _opt(o, "ry", 0.0)
	var lean: float = _opt(o, "lean", lnD)
	var gC: float = gr.call(x, z) if gr is Callable else float(_opt(o, "y0", 0.0))
	var sink: float = _opt(o, "sink", 0.2)
	var ns := _h(seed, [0, 9])
	var beds := []
	var yy := 0.0
	var m := 0
	var strata = o.get("strata")
	while yy < H - 1e-6 and m < 60:
		var q = strata.call(x, gC + yy, z) if strata is Callable else null
		var hh: float = q.h if q != null and float(q.get("h", 0)) > 0 else bl[0] + (bl[1] - bl[0]) * KRand.unit(_h(seed, [m, 832]))
		var hard: float = q.hard if q != null and q.get("hard") != null else KRand.unit(_h(seed, [m, 833]))
		hh = maxf(hh, H / 60)
		if H - yy - hh < hh * 0.4:
			hh = H - yy
		var f := (1 - taper * yy / H) * (1 - 0.03 * (1 - hard))
		var off := tan(lean) * yy
		var M := maxf(W, Lr) / 2
		var b := bed(m, gC + yy, hh, x + cos(la) * off, z + sin(la) * off, W / 2 * f, Lr / 2 * f, ry, 0, (0.4 + 2 * (1 - hard)) / M, 0.035, ns, 0)
		b.sq = sq
		beds.append(b)
		yy += hh
		m += 1
	for i in beds.size():
		var b0: Dictionary = beds[i]
		if i + 1 < beds.size():
			var b1: Dictionary = beds[i + 1]
			b0.tp = float(b1.rx) / float(b0.rx)
			b0.tx = float(b1.cx) - float(b0.cx)
			b0.tz = float(b1.cz) - float(b0.cz)
		else:
			b0.tp = _opt(o, "crown", 0.97)
			b0.ch = 1.5 / maxf(W, Lr) * 2
	for b in beds:
		b.tp = minf(b.tp, 1)
	if gr is Callable:
		_set_foot(beds[0], gr, sink, float(beds[0].y) + float(beds[0].h))
	var bb := _bound(beds, x, z)
	return {"id": str(o.id), "kind": "pillar", "x": x, "z": z, "y0": beds[0].y, "seed": seed, "beds": beds, "top": bb[1], "R": bb[0], "feet": [0]}


# A CHIMNEY: a hollow column of beds (pipe, bell, stalk, siphon; standing, broken, rubble, fallen)
static func _chp(o: Dictionary, F: Dictionary, k: String, d):
	if o.get(k) != null:
		return o[k]
	if F.get(k) != null:
		return F[k]
	return d


static func _ice_w(I, u: float) -> float:
	if I == null:
		return 0.0
	var fr: float = _opt(I, "from", 0.0)
	return sm(fr - 0.04, fr + 0.04, u)


static func _rad_at(R0: float, taper: float, fl, u: float) -> float:
	var q := 1 - (1 - taper) * u
	if _truthy(fl):
		var fr: float = _opt(fl, "from", 0.8)
		if u > fr:
			q *= 1 + (float(_opt(fl, "k", 1.5)) - 1) * pow((u - fr) / (1 - fr), float(_opt(fl, "p", 2.0)))
	return R0 * q


static func chimney(o: Dictionary, seed: int) -> Dictionary:
	var form: String = _opt(o, "form", "pipe")
	if not CH_FORM.has(form):
		push_error("KStacks.make: a chimney's form is one of " + str(CH_FORM.keys()))
		return {}
	var F: Dictionary = CH_FORM[form]
	var x: float = _opt(o, "x", 0.0)
	var z: float = _opt(o, "z", 0.0)
	var r := _S(_h(seed, [0, 841]))
	var H: float = _chp(o, F, "H", 30.0)
	var R0: float = _chp(o, F, "r", 4.0)
	var gr = o.get("ground")
	var ryD := r.range_f(0, TAU)
	var laD := r.range_f(0, TAU)
	var lnD := r.range_f(0, 0.05)
	var cutD := r.range_f(0.3, 0.8)
	var wall: float
	if o.get("wall") != null:
		wall = o.wall
	elif o.get("bore") != null:
		wall = R0 - float(o.bore)
	else:
		wall = R0 * float(F.wallK)
	if not (wall > 0.02) or not (wall < R0):
		push_error("KStacks.make: a chimney's wall must be thinner than its radius (bore > 0)")
		return {}
	var state: String = _chp(o, F, "state", "standing")
	if not ["standing", "broken", "rubble", "fallen"].has(state):
		push_error("KStacks.make: a chimney's state is standing, broken, rubble or fallen, not " + state)
		return {}
	var ry: float = _opt(o, "ry", ryD)
	var e: float = _chp(o, F, "e", 1.0)
	var lob: float = _chp(o, F, "lobes", 0.05)
	var taper: float = _chp(o, F, "taper", 0.75)
	var fl = _chp(o, F, "flare", 0)
	var T = o.get("toward")
	var la: float = atan2(T[1], T[0]) if _truthy(T) else laD
	var lean: float = 0.0 if state == "fallen" else float(_opt(o, "lean", lnD))
	var cut: float
	if state == "broken":
		cut = _opt(o, "cut", cutD)
	elif state == "rubble":
		cut = _opt(o, "cut", 0.12)
	else:
		cut = 1.0
	var fork: float = _chp(o, F, "fork", 0.7)
	var mouths: int = 1 if state == "fallen" or (state != "standing" and cut <= fork) else maxi(1, mini(3, int(_chp(o, F, "mouths", 1))))
	var se := sqrt(e)
	var gC: float = gr.call(x, z) if gr is Callable else float(_opt(o, "y0", 0.0))
	var sink: float = _opt(o, "sink", 0.3)
	var beds := []
	var I = o.get("ice") if _truthy(o.get("ice")) else null
	var ns := _h(seed, [0, 9])
	var LG: Array = (o.ledges if _truthy(o.get("ledges")) else []).duplicate()
	LG.sort_custom(func(a, b): return str(a) < str(b))
	var LW: float = _chp(o, F, "ledgeW", 0.5)
	var bedH := maxf(float(_chp(o, F, "bed", H / 12)), 1.5)
	var ctx := {"H": H, "wall": wall, "I": I, "LG": LG, "LW": LW, "bedH": bedH, "se": se, "ry": ry, "lob": lob, "ns": ns}
	var radAt := func(u): return _rad_at(R0, taper, fl, u)
	var u1: float = fork if mouths > 1 else cut
	_ch_column(beds, ctx, 0, x, z, gC, 0, u1, radAt, lean, la, 0)
	if mouths > 1:
		var yF := gC + fork * H
		var ox := cos(la) * tan(lean) * fork * H
		var oz := sin(la) * tan(lean) * fork * H
		var sp: float = _chp(o, F, "spread", 0.3)
		var base := KRand.unit(_h(seed, [0, 842])) * TAU
		for m in mouths:
			var az := base + m * TAU / mouths
			var rf: float = radAt.call(fork) * (0.68 if mouths == 2 else 0.58)
			var q: float = radAt.call(fork) * 0.42
			var rfork: float = radAt.call(fork)
			var RF := func(u): return maxf(rf * (radAt.call(u) / rfork), wall + 0.05)
			_ch_column(beds, ctx, m + 1, x + ox + cos(az) * q, z + oz + sin(az) * q, yF, fork, cut, RF, sp * (0.8 + 0.4 * KRand.unit(_h(seed, [m, 843]))), az, m + 1)
	var feet := [0]
	if gr is Callable and state != "fallen":
		_set_foot(beds[0], gr, sink, float(beds[0].y) + float(beds[0].h))
	var HF = _chp(o, F, "holdfasts", null)
	if state == "broken" or state == "rubble":
		for b in beds:
			var c = beds[b.k + 1] if b.k + 1 < beds.size() else null
			if c == null or c.col != b.col:
				b.jag = minf(float(b.h) * 0.9, maxf(0.3, R0 * 0.7))
	if _truthy(HF) and state != "fallen":
		var nh: int = _opt(HF, "n", 5)
		var reach: float = _opt(HF, "reach", R0)
		var hh: float = _opt(HF, "h", H * 0.2)
		var w: float = _opt(HF, "w", R0 * 0.14)
		for h in nh:
			var az2 := (h + 0.35 * KRand.unit(_h(seed, [h, 844]))) / nh * TAU
			var cx := x + cos(az2) * (R0 + reach)
			var cz := z + sin(az2) * (R0 + reach)
			var g: float = gr.call(cx, cz) if gr is Callable else gC
			var b2 := bed(beds.size(), g - sink, gC + hh - g + sink, cx, cz, w, w, az2, 0.1, 0, 0.08, ns, 50 + h)
			var rt: float = radAt.call(hh / H) - w * 0.5
			b2.tx = x + cos(az2) * rt - cx
			b2.tz = z + sin(az2) * rt - cz
			b2.tp = 0.55
			b2.col = 50 + h
			b2.rg = 0.08
			feet.append(beds.size())
			beds.append(b2)
	var ChN := beds.size()
	var FN = null
	if not (o.get("fan") is bool and o.fan == false):
		if _truthy(o.get("fan")):
			FN = o.fan
		elif state != "standing":
			FN = {}
	var G = null
	if state == "fallen":
		var dxF := cos(la)
		var dzF := sin(la)
		var g0: float = gr.call(x, z) if gr is Callable else gC
		var g1: float = gr.call(x + dxF * H, z + dzF * H) if gr is Callable else gC
		var R1: float = radAt.call(1.0)
		var y0a := g0 + R0 * 0.7
		var y1a := g1 + R1 * 0.7
		var dy := (y1a - y0a) / H
		var L := hypot(1, dy)
		G = {"ax": x, "ay": y0a, "az": z, "dx": dxF / L, "dy": dy / L, "dz": dzF / L, "L": H}
	if FN != null:
		var nf: int = mini(24, maxi(3, int(jround(H * (1 - (0.7 if state == "fallen" else cut)) / (R0 * 0.9))))) if FN.get("n") == null else int(FN.n)
		var fr2: float = _opt(FN, "reach", H * 0.5)
		var ox0 := cos(la) * H if state == "fallen" else 0.0
		var oz0 := sin(la) * H if state == "fallen" else 0.0
		for c in nf:
			var u0 := KRand.unit(_h(seed, [c, 845]))
			var u1v := KRand.unit(_h(seed, [c, 846]))
			var u2 := KRand.unit(_h(seed, [c, 847]))
			var u3 := KRand.unit(_h(seed, [c, 848]))
			var u4 := KRand.unit(_h(seed, [c, 849]))
			var a3 := la + (u0 - 0.5) * 1.5
			var d := R0 * 1.2 + fr2 * pow(u1v, 1.4)
			var px := x + ox0 + cos(a3) * d
			var pz := z + oz0 + sin(a3) * d
			var rc := R0 * (0.2 + 0.35 * u2)
			var g3: float = gr.call(px, pz) if gr is Callable else gC
			var chb := bed(beds.size(), g3 - 0.15, rc * (0.5 + 0.5 * u3), px, pz, rc, rc * 0.7, u4 * TAU, 0.12, 0, 0.14, ns, 100 + c)
			chb.col = 100 + c
			chb.rg = 0.1
			chb.tp = 0.9
			beds.append(chb)
	var RR := 0.0
	var top := -INF
	for b in beds:
		RR = maxf(RR, hypot(float(b.cx) - x, float(b.cz) - z) + hypot(float(b.tx), float(b.tz)) + maxf(b.rx, b.rz) * maxf(1, b.tp) * (1 + 2.5 * float(b.lob)))
		top = maxf(top, float(b.y) + float(b.h))
	var rec := {"id": str(o.id), "kind": "chimney", "form": form, "state": state, "x": x, "z": z, "y0": beds[0].y, "seed": seed, "beds": beds, "top": top,
		"R": RR * 1.05 + 0.5, "cols": maxi(1, mouths), "feet": feet, "wall": wall, "toward": la, "body": ChN}
	if G != null:
		rec.fall = G
		rec.R = maxf(rec.R, H + R0 * 2)
		rec.top = G.ay + maxf(0, G.dy) * H + radAt.call(1.0)
	if I != null:
		rec.ice = {"from": _opt(I, "from", 0.0), "thick": _opt(I, "thick", 0.3)}
	return rec


static func _ch_column(beds: Array, X: Dictionary, col: int, x0: float, z0: float, y0: float, u0: float, u1: float, Rf: Callable, ln: float, az: float, tier: int) -> void:
	var H: float = X.H
	var n := maxi(2, int(jround((u1 - u0) * H / X.bedH)))
	var I = X.I
	for i in n:
		var a := u0 + (u1 - u0) * i / n
		var b := u0 + (u1 - u0) * (i + 1) / n
		var step := 0.0
		for l in X.LG:
			if l <= a + 1e-9 and l > u0:
				step += X.LW
		var ra: float = Rf.call(a)
		var rb: float = Rf.call(b)
		var t := _ice_w(I, a)
		var t2 := _ice_w(I, b)
		var th: float = float(_opt(I, "thick", 0.3)) if I != null else 0.0
		var oa := maxf(ra - step, X.wall * 0.5 + 0.02) + th * t
		var ob := maxf(rb - step, X.wall * 0.5 + 0.02) + th * t2
		var off := tan(ln) * H
		var y := y0 + (a - u0) * H
		var h := (b - a) * H
		var B := bed(beds.size(), y, h, x0 + cos(az) * off * (a - u0), z0 + sin(az) * off * (a - u0), oa * X.se, oa / X.se, X.ry, 0, 0, X.lob, X.ns, tier)
		B.tp = ob / oa
		B.tx = cos(az) * off * (b - a)
		B.tz = sin(az) * off * (b - a)
		B.col = col
		B.rg = 0.12
		B.ot = 1
		B.bo = maxf(ra - X.wall, 0.05)
		B.bt = maxf(rb - X.wall, 0.05)
		beds.append(B)


# the bore as KCAVERN.shaft records
static func bore(B: Dictionary, o: Dictionary = {}) -> Dictionary:
	if B.kind != "chimney":
		push_error("KStacks.bore: only a chimney has a bore")
		return {}
	if B.get("fall") != null:
		return {"shafts": [], "opening": null}
	var dp: float = _opt(o, "depth", 20.0)
	var out := []
	var b0: Dictionary = B.beds[0]
	out.append({"id": B.id + ":throat", "owner": B.id, "c": [b0.cx, b0.cz], "y0": float(b0.y) - dp, "y1": b0.y, "r0": b0.bo, "r1": b0.bo})
	for b in B.beds:
		if b.col < 50:
			out.append({"id": B.id + ":bore" + str(b.k), "owner": B.id, "c": [float(b.cx) + _f(b, "tx") / 2, float(b.cz) + _f(b, "tz") / 2], "y0": b.y, "y1": float(b.y) + float(b.h), "r0": b.bo, "r1": b.bt})
	return {"shafts": out, "opening": {"id": B.id + ":well", "c": [b0.cx, b0.cz], "r": b0.bo, "kind": "well"}}


# a fallen chimney's reading: t along the axis, q off it, R its radius there; d signed
static func _fall_at(B: Dictionary, x: float, z: float) -> Dictionary:
	var G: Dictionary = B.fall
	var h := hypot(G.dx, G.dz)
	var ex: float = x - G.ax
	var ez: float = z - G.az
	var t: float = (ex * G.dx + ez * G.dz) / (h * h)
	var tc := _clamp(t, 0, G.L)
	var q := hypot(ex - G.dx * tc, ez - G.dz * tc)
	var u: float = tc / G.L
	var R := 0.0
	for i in int(B.body):
		var b: Dictionary = B.beds[i]
		if b.col != 0:
			continue
		var u0: float = (float(b.y) - float(B.y0)) / G.L
		var u1: float = (float(b.y) + float(b.h) - float(B.y0)) / G.L
		if u >= u0 and u <= u1 + 1e-9:
			var den: float = u1 - u0
			R = maxf(b.rx, b.rz) * (1 + (float(b.tp) - 1) * _clamp((u - u0) / (den if den != 0.0 else 1.0), 0, 1))
			break
	return {"t": tc, "q": q, "R": R, "d": q - R, "top": G.ay + G.dy * tc + sqrt(maxf(0, R * R - q * q))}


static func _in_bore(b: Dictionary, x: float, z: float) -> bool:
	var c := c_at(b, 1)
	return hypot(x - c[0], z - c[1]) < float(b.bt)


# ---------------------------------------------------------------- the layouts
static func _variety(o: Dictionary, i: int, x: float, z: float, rad: float, into: Dictionary) -> Dictionary:
	var v: KRand.Stream = null
	for k in ["taper", "lean", "e", "crown"]:
		var rg = o.get(k)
		if not (rg is Array) or rg.size() != 2:
			continue
		if v == null:
			v = _S(_h(o.seed, [i, 406]))
		into[k] = v.range_f(rg[0], rg[1])
	if o.get("plates") is Array and o.plates.size() == 2:
		if v == null:
			v = _S(_h(o.seed, [i, 406]))
		if v.chance(_opt(o, "platesShare", 0.5)):
			into.plates = o.plates
	if o.get("lift") is Callable:
		into.H += o.lift.call(x, z, rad)
	return into


static func row(o: Dictionary) -> Array:
	var n: int = o.n if _t(o, "n") else 5
	var a: Array = o.a
	var b: Array = o.b
	var out := []
	var st := atan2(b[1] - a[1], b[0] - a[0])
	var g: Callable = o.ground if o.get("ground") is Callable else func(_x, _z): return 0.0
	var lean := _S(_h(o.seed, [0, 303])).range_f(0, 0.07)
	var jit: float = o.jitter if _t(o, "jitter") else 8.0
	for i in n:
		var r := _S(_h(o.seed, [i, 304]))
		var t := (i + 0.5 + r.range_f(-0.3, 0.3)) / n
		var x: float = a[0] + (b[0] - a[0]) * t
		var z: float = a[1] + (b[1] - a[1]) * t
		x += cos(st + PI / 2) * r.range_f(-1, 1) * jit
		z += sin(st + PI / 2) * r.range_f(-1, 1) * jit
		var sd := _h(o.seed, [i, 305])
		var HH := r.range_f(o.H[0], o.H[1])
		var rr := r.range_f(o.r[0], o.r[1])
		var e: float = r.range_f(o.e[0], o.e[1]) if _t(o, "e") else 4.0
		var ryv := st + r.range_f(-0.08, 0.08)
		var spec := {"id": str(o.id) + "-" + str(i), "kind": o.kind if _t(o, "kind") else "fin", "x": x, "z": z, "y0": float(g.call(x, z)) - 1, "seed": sd, "H": HH,
			"r": rr, "e": e, "ry": ryv, "lean": lean}
		out.append(make(_variety({"seed": o.seed, "taper": o.get("taper"), "lean": o.get("lean"), "crown": o.get("crown"), "plates": o.get("plates"),
			"platesShare": o.get("platesShare"), "lift": o.get("lift")}, i, x, z, rr, spec)))
	return out


static func cluster(o: Dictionary) -> Array:
	var n: int = o.n if _t(o, "n") else 8
	var out := []
	var rads := []
	var g: Callable = o.ground if o.get("ground") is Callable else func(_x, _z): return 0.0
	var K: Dictionary = o.kinds if _t(o, "kinds") else {"spire": 0.6, "balanced": 0.25, "fin": 0.15}
	var keys := K.keys()
	var tot := 0.0
	for k in keys:
		tot += K[k]
	for i in n:
		for tr in 24:
			var r := _S(_h(o.seed, [i, tr, 404]))
			var ang := r.range_f(0, TAU)
			var d: float = o.rad * sqrt(r.next())
			var x: float = o.c[0] + cos(ang) * d
			var z: float = o.c[1] + sin(ang) * d
			var rad := r.range_f(o.r[0], o.r[1])
			var ok: bool = not (o.get("accept") is Callable) or o.accept.call(x, z, rad)
			var gap: float = _opt(o, "gap", 6.0)
			for j in out.size():
				if not ok:
					break
				if hypot(out[j].x - x, out[j].z - z) < rad + rads[j] + gap:
					ok = false
			if not ok:
				continue
			var u := r.next() * tot
			var kind: String = keys[0]
			for q in keys.size():
				u -= K[keys[q]]
				if u <= 0:
					kind = keys[q]
					break
			var sd := _h(o.seed, [i, 405])
			var HH := r.range_f(o.H[0], o.H[1])
			var B := make(_variety(o, i, x, z, rad, {"id": str(o.id) + "-" + str(i), "kind": kind, "x": x, "z": z, "y0": float(g.call(x, z)) - 1, "seed": sd, "H": HH, "r": rad}))
			out.append(B)
			rads.append(rad)
			break
	return out


# THE PILLAR RIM's layout (o.blocks, or o.joints {blocks: Callable(box), world})
static func pillars(o: Dictionary) -> Array:
	if not (_t(o, "blocks") or _t(o, "joints")) or not (o.get("zone") is Callable) or o.get("top") == null:
		push_error("KStacks.pillars: blocks or joints, zone and top are needed")
		return []
	var BL: Array = o.blocks if _t(o, "blocks") else o.joints.blocks.call([o.x0, o.z0, o.x1, o.z1])
	var fr: float = _opt(o, "from", 0.3)
	var to: float = _opt(o, "to", 0.9)
	var w: int
	if o.get("world") == null:
		w = int(o.joints.get("world", 0)) if _t(o, "joints") else 0
	else:
		w = int(o.world)
	w &= KRand.M32
	var mw: float = _opt(o, "minW", 8.0)
	var out := []
	for B in BL:
		var zz: float = o.zone.call(B.cx, B.cz)
		if zz < fr or zz >= to:
			continue
		var t := (zz - fr) / (to - fr)
		var s := _S(_h(w, [B.i, B.j, 0x91]))
		var stand := s.chance(1 - 0.75 * pow(t, 1.5))
		var gp := 0.15 + 0.5 * t
		var brk := s.next()
		var ln := s.next()
		if not stand:
			continue
		var ww: float = B.w * (1 - gp)
		var ll: float = B.l * (1 - gp)
		if minf(ww, ll) < mw:
			continue
		var g: float = o.ground.call(B.cx, B.cz) if o.get("ground") is Callable else float(_opt(o, "y0", 0.0))
		var T: float = o.top.call(B.cx, B.cz) if o.top is Callable else float(o.top)
		var H: float = (T - g) * (1 - brk / 0.35 * 0.6 * t if brk < 0.35 else 1.0)
		if H < 4:
			continue
		if o.get("accept") is Callable and not o.accept.call(B.cx, B.cz, B):
			continue
		out.append(make({"id": ("pillar" if o.get("id") == null else str(o.id)) + ":" + str(B.id), "kind": "pillar", "x": B.cx, "z": B.cz, "w": ww, "l": ll, "ry": B.ry, "H": H,
			"lean": atan(minf(ww, ll) * gp * 0.25 / H) * ln, "ground": o.get("ground"), "y0": g, "seed": _h(w, [B.i, B.j, 0x92]), "strata": o.get("strata")}))
	return out


static func _colonnade(beds: Array, t: int, t0: float, Th: float, seed: int, CO: Dictionary) -> void:
	var cwr: Array = CO.w if _t(CO, "w") else [1.2, 2.4]
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


# A KARST TOWER: a spire's one column given the tower's profile
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
	return hypot(dx, dz) - foot_r(b, atan2(dz, dx)) * shrink


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
		var fall: bool = B.get("fall") != null
		if fall:
			var fa := _fall_at(B, x, z)
			if fa.d < 0 and (best == null or fa.top > best.top):
				best = {"S": B, "b": B.beds[0], "top": fa.top, "d": fa.d}
		var beds: Array = B.beds
		for k in range(beds.size() - 1, -1, -1):
			var b: Dictionary = beds[k]
			if fall and k < int(B.body):
				break
			var d := in_top(b, x, z, 1 - float(b.ch))
			if d < 0:
				if _t(b, "bo") and _in_bore(b, x, z):
					continue
				var t := top_h(b, x, z)
				if best == null or t > best.top:
					best = {"S": B, "b": b, "top": t, "d": d}
				if not _t(B, "cols"):
					break
	return best


# THE SURFACE, walls included: {S, b, top, d, wall, steep} or null; fr replaces foot_r, o.drawn the flared foot
static func surface(list: Array, x: float, z: float, fr: Callable = Callable(), o: Dictionary = {}):
	var best = null
	var drawn: bool = _t(o, "drawn")
	for B in list:
		if absf(x - B.x) > B.R or absf(z - B.z) > B.R:
			continue
		var fall: bool = B.get("fall") != null
		if fall:
			var fa := _fall_at(B, x, z)
			if fa.d < 0 and (best == null or fa.top > best.top):
				best = {"S": B, "b": B.beds[0], "top": fa.top, "d": fa.d, "wall": false, "steep": 0.0}
		var beds: Array = B.beds
		for k in range(beds.size() - 1, -1, -1):
			var b: Dictionary = beds[k]
			var tp := _f(b, "tp", 1.0)
			var cx: float = float(b.cx) + _f(b, "tx")
			var cz: float = float(b.cz) + _f(b, "tz")
			var dx := x - cx
			var dz := z - cz
			if fall and k < int(B.body):
				break
			if _t(b, "bo") and _in_bore(b, x, z):
				continue
			var rt: float = _fr(fr, b, atan2(dz, dx)) * tp * (1 - float(b.ch))
			var d := hypot(dx, dz) - rt
			if d < 0:
				var t := top_h(b, x, z)
				if best == null or t > best.top:
					best = {"S": B, "b": b, "top": t, "d": d, "wall": false, "steep": 0.0}
				if not _t(B, "cols"):
					break
				continue
			if tp < 0.995 or _t(b, "tx") or _t(b, "tz"):
				var ex: float = x - float(b.cx)
				var ez: float = z - float(b.cz)
				var ea := atan2(ez, ex)
				var rf: float = _fr(fr, b, ea)
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
							var Rm: float = _fr(fr, b, atan2(z - c[1], x - c[0])) * prof(b, m) * t_at(b, m)
							if hypot(x - c[0], z - c[1]) > Rm:
								hi = m
							else:
								lo = m
						u = (lo + hi) / 2
					var y := y_at(b, ea, u)
					if best == null or y > best.top:
						best = {"S": B, "b": b, "top": y, "d": -1e3, "wall": true, "steep": float(b.h) / run}
					if not _t(B, "cols"):
						break
	return best


static func _fr(fr: Callable, b: Dictionary, a: float) -> float:
	return fr.call(b, a) if fr.is_valid() else foot_r(b, a)


static func _th(TH: Callable, b: Dictionary, x: float, z: float) -> float:
	return _th(TH, b, x, z) if TH.is_valid() else top_h(b, x, z)


# a point on a bed's WALL and its outward normal
static func wall(B: Dictionary, b: Dictionary, a: float, u: float) -> Dictionary:
	var f := prof(b, u) * (1 + (_f(b, "tp", 1.0) - 1) * u)
	var cx: float = float(b.cx) + _f(b, "tx") * u
	var cz: float = float(b.cz) + _f(b, "tz") * u
	var R := foot_r(b, a) * f
	var x := cx + cos(a) * R
	var z := cz + sin(a) * R
	var e := 0.01
	var R1 := foot_r(b, a + e) * f
	var tx := cx + cos(a + e) * R1 - x
	var tz := cz + sin(a + e) * R1 - z
	var tl := hypot(tx, tz)
	if tl == 0.0:
		tl = 1.0
	return {"x": x, "y": y_at(b, a, u), "z": z, "nx": tz / tl, "nz": -tx / tl}


static func top_at(list: Array, x: float, z: float) -> float:
	var a = at(list, x, z)
	return a.top if a != null else -INF


static func foot(list: Array, x: float, z: float):
	var best = null
	for B in list:
		if absf(x - B.x) > B.R + 400 or absf(z - B.z) > B.R + 400:
			continue
		if B.get("fall") != null:
			var fq := _fall_at(B, x, z)
			if best == null or fq.d < best.d:
				best = {"S": B, "d": fq.d}
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


# on a ledge: on bed k's top and outside the foot of the bed standing on it
static func ledge(list: Array, x: float, z: float):
	var a = at(list, x, z)
	if a == null or a.S.get("fall") != null:
		return null
	var B: Dictionary = a.S
	var k: int = a.b.k
	if _t(B, "cols"):
		var ups := []
		var acol = a.b.get("col")
		for q in range(k + 1, B.beds.size()):
			var c: Dictionary = B.beds[q]
			var hit: bool
			if acol != null and acol < 0:
				hit = B.beds[q - 1].get("col") != c.get("col")
			else:
				hit = c.get("col") == acol
			if hit:
				ups.append(c)
				if acol != null and acol >= 0:
					break
		if not ups.size():
			return null
		var dm := INF
		for c in ups:
			dm = minf(dm, in_bed(c, x, z, 1))
		if dm <= 0:
			return null
		return {"S": B, "b": a.b, "w": -float(a.d), "out": dm}
	if k >= B.beds.size() - 1:
		return null
	var up: Dictionary = B.beds[k + 1]
	var dUp := in_bed(up, x, z, 1 - float(up.nt))
	if dUp <= 0:
		return null
	return {"S": B, "b": a.b, "w": -float(a.d), "out": dUp}


static func ring(B: Dictionary, y: float, n: int = 48):
	if n <= 0:
		n = 48
	if B.get("fall") != null:
		return null
	var b = null
	for q in B.beds:
		if y >= q.y and y <= float(q.y) + float(q.h):
			b = q
			break
	if b == null:
		return null
	var u: float = (y - float(b.y)) / float(b.h)
	var f := prof(b, u) * t_at(b, u)
	var c := c_at(b, u)
	var out := []
	for i in n:
		var a := float(i) / n * TAU
		var R := foot_r(b, a) * f
		out.append([c[0] + cos(a) * R, c[1] + sin(a) * R])
	return out


# ---------------------------------------------------------------- the mesh
class _Mesh:
	var pos := []
	var uv := []
	var idx := []
	var part := []
	var bedA := []
	var occ := []

	# rows: Callables s -> [x, y, z, u, v, occ]
	func grid(rows: Array, seg: int, p: int, bk: int, flip: bool) -> void:
		var base := pos.size() / 3
		for r in rows.size():
			var row: Callable = rows[r]
			for s in seg + 1:
				var q: Array = row.call(s)
				pos.append(q[0])
				pos.append(q[1])
				pos.append(q[2])
				uv.append(q[3])
				uv.append(q[4])
				part.append(p)
				bedA.append(bk)
				occ.append(q[5])
		for r in rows.size() - 1:
			for s in seg:
				var a := base + r * (seg + 1) + s
				var c := a + seg + 1
				if flip:
					idx.append_array([a, c, a + 1, a + 1, c, c + 1])
				else:
					idx.append_array([a, a + 1, c, a + 1, c + 1, c])

	func fan(seg: int, p: int, bk: int, x: float, y: float, z: float) -> void:
		var r0 := pos.size() / 3 - (seg + 1)
		var C := r0 + seg + 1
		pos.append_array([x, y, z])
		uv.append_array([x, z])
		part.append(p)
		bedA.append(bk)
		occ.append(1.0)
		for s in seg:
			idx.append_array([r0 + s, r0 + s + 1, C])


static func _ang(s: int, seg: int) -> float:
	return -float(s) / seg * TAU


static func mesh(B: Dictionary, opt: Dictionary = {}) -> Dictionary:
	var step: float = opt.step if _t(opt, "step") else 5.0
	var M := _Mesh.new()
	var TH: Callable = opt.topH if opt.get("topH") is Callable else Callable()
	var NR: int = opt.topRings if _t(opt, "topRings") else 5
	var SMAX: int = opt.segMax if _t(opt, "segMax") else 160
	var rhos := [1.0, 0.8, 0.55, 0.3, 0.08]
	if NR != 5:
		rhos = []
		for q in NR:
			rhos.append(1 - (float(q) / (NR - 1)) * 0.98)
	if B.kind == "chimney":
		return _chimney_mesh(B, opt, M, TH, rhos, step, SMAX)
	var otop = opt.get("top")
	for k in B.beds.size():
		var b: Dictionary = B.beds[k]
		var per := TAU * maxf(b.rx, b.rz) * (1 + float(b.lob))
		var seg := maxi(16, mini(SMAX, int(jround(per / step))))
		if _t(b, "fn"):
			seg = maxi(seg, mini(SMAX, int(float(b.fn) * float(_opt(opt, "perFlute", 6)))))
		if _t(b, "cw"):
			seg = maxi(seg, mini(int(opt.colMax) if _t(opt, "colMax") else 2400, int(maxf(6, jround(TAU * (float(b.rx) + float(b.rz)) / 2 / float(b.cw))) * float(_opt(opt, "perColumn", 4)))))
		var arc := [0.0]
		for s in range(1, seg + 1):
			var a0 := _ang(s - 1, seg)
			var a1 := _ang(s, seg)
			var r0 := foot_r(b, a0)
			var r1 := foot_r(b, a1)
			arc.append(arc[s - 1] + hypot(cos(a1) * r1 - cos(a0) * r0, sin(a1) * r1 - sin(a0) * r0))
		var colv = b.get("col")
		var us: Array
		if colv == null:
			us = [0.0, 0.06, 0.2, 0.5, 0.78, 0.9, 1.0]
		else:
			us = [0.0]
			if _t(b, "nt"):
				us.append_array([0.05, 0.1, 0.15, 0.2])
			if _t(b, "ch"):
				us.append_array([0.78, 0.84, 0.9, 0.95])
			us.append(1.0)
		var c1 := c_at(b, 1)
		var t1 := t_at(b, 1)
		var low_occ: bool = not (colv != null and colv >= 0)
		var rows := []
		for ui in us.size() - 1:
			var u: float = us[ui]
			rows.append(func(s):
				var a := _ang(s, seg)
				var c := c_at(b, u)
				var R := foot_r(b, a) * prof(b, u) * t_at(b, u)
				var y := y_at(b, a, u)
				return [c[0] + cos(a) * R, y, c[1] + sin(a) * R, arc[s], y, 0.55 + 0.45 * (u / 0.2) if u < 0.2 and low_occ else 1.0])
		rows.append(func(s):
			var a := _ang(s, seg)
			var R := foot_r(b, a) * (1 - float(b.ch)) * t1
			var x: float = c1[0] + cos(a) * R
			var z: float = c1[1] + sin(a) * R
			return [x, _th(TH, b, x, z), z, arc[s], float(b.y) + float(b.h), 1.0])
		M.grid(rows, seg, 0, k, false)
		var GT: float = float(otop.grid) if otop != null and float(otop.get("grid", 0)) > 0 else 0.0
		var MC: float = float(otop.minCells) if otop != null and otop.get("minCells") != null else 3.0
		var nxb = null if colv == null else (B.beds[k + 1] if k + 1 < B.beds.size() else null)
		if nxb != null and colv >= 0 and nxb.get("col") == colv and not _t(b, "ot"):
			pass
		elif GT > 0 and minf(b.rx, b.rz) * (1 - float(b.ch)) * t1 * (1 - float(b.lob)) > GT * MC:
			var upb = B.beds[k + 1] if k + 1 < B.beds.size() and not (otop.get("cull") is bool and otop.cull == false) else null
			_grid_top(M, b, k, seg, c1, t1, GT, upb, TH)
		else:
			var tops := []
			for rho in rhos:
				tops.append(func(s):
					var a := _ang(s, seg)
					var R: float = foot_r(b, a) * (1 - float(b.ch)) * t1 * rho
					var x: float = c1[0] + cos(a) * R
					var z: float = c1[1] + sin(a) * R
					return [x, _th(TH, b, x, z), z, x, z, 1.0])
			M.grid(tops, seg, 1, k, false)
			M.fan(seg, 1, k, c1[0], _th(TH, b, c1[0], c1[1]), c1[1])
		var below = B.beds[k - 1] if k > 0 else null
		var over := false
		if below != null and colv != null and below.get("col") != colv:
			below = null
		if below != null:
			for s in seg:
				if over:
					break
				var aa := _ang(s, seg)
				if foot_r(b, aa) * (1 - float(b.nt)) > foot_r(below, aa) * (1 - float(below.ch)) * t_at(below, 1) + 0.05:
					over = true
		if _t(b, "und"):
			over = true
		if over:
			var und := []
			for rho in ([1.0, 0.75, 0.5, 0.25, 0.0] if _t(b, "und") else [1.0, 0.6, 0.25]):
				und.append(func(s):
					var a := _ang(s, seg)
					var R: float = foot_r(b, a) * (1 - float(b.nt)) * rho
					var x: float = float(b.cx) + cos(a) * R
					var z: float = float(b.cz) + sin(a) * R
					return [x, b.y, z, x, z, 0.35])
			M.grid(und, seg, 2, k, true)
	return _out(M)


static func _out(M: _Mesh) -> Dictionary:
	var bed8 := PackedByteArray()
	bed8.resize(M.bedA.size())
	for i in M.bedA.size():
		bed8[i] = int(M.bedA[i]) & 255
	var part8 := PackedByteArray()
	part8.resize(M.part.size())
	for i in M.part.size():
		part8[i] = int(M.part[i]) & 255
	return {"pos": PackedFloat32Array(M.pos), "uv": PackedFloat32Array(M.uv), "idx": PackedInt32Array(M.idx), "part": part8, "bed": bed8, "occ": PackedFloat32Array(M.occ)}


# THE GRIDDED TOP: a square grid on world multiples of G clipped to the top's edge ring (Sutherland-Hodgman, Weiler-Atherton
# for a cell the ring enters more than once), ear-clipped
static func _grid_top(M: _Mesh, b: Dictionary, k: int, n: int, c1: Array, t1: float, G: float, up, TH: Callable) -> void:
	var RX := PackedFloat64Array()
	RX.resize(n)
	var RZ := PackedFloat64Array()
	RZ.resize(n)
	var RY := PackedFloat64Array()
	RY.resize(n)
	var ids := {}
	var mnx := INF
	var mxx := -INF
	var mnz := INF
	var mxz := -INF
	for s in n:
		var a := _ang(s, n)
		var R := foot_r(b, a) * (1 - float(b.ch)) * t1
		RX[s] = c1[0] + cos(a) * R
		RZ[s] = c1[1] + sin(a) * R
		RY[s] = _th(TH, b, RX[s], RZ[s])
		mnx = minf(mnx, RX[s])
		mxx = maxf(mxx, RX[s])
		mnz = minf(mnz, RZ[s])
		mxz = maxf(mxz, RZ[s])
	var T := {"M": M, "b": b, "k": k, "n": n, "c1": c1, "G": G, "up": up, "TH": TH, "RX": RX, "RZ": RZ, "RY": RY, "ids": ids}
	var edge := {}
	var e := 1e-7
	for s in n:
		var s1 := (s + 1) % n
		var ia := floori((minf(RX[s], RX[s1]) - e) / G)
		var ib := floori((maxf(RX[s], RX[s1]) + e) / G)
		var ja := floori((minf(RZ[s], RZ[s1]) - e) / G)
		var jb := floori((maxf(RZ[s], RZ[s1]) + e) / G)
		for i in range(ia, ib + 1):
			for j in range(ja, jb + 1):
				edge[str(i) + "," + str(j)] = true
	var ring := []
	for s in n:
		ring.append({"x": RX[s], "z": RZ[s], "y": RY[s], "key": "r" + str(s), "e": [0, s]})
	var i0 := floori(mnx / G) - 1
	var i1 := floori(mxx / G) + 1
	var j0 := floori(mnz / G) - 1
	var j1 := floori(mxz / G) + 1
	for j in range(j0, j1 + 1):
		for i in range(i0, i1 + 1):
			if not edge.has(str(i) + "," + str(j)):
				if not _gt_inside(T, (i + 0.5) * G, (j + 0.5) * G) or (up != null and _gt_hidden(T, i, j)):
					continue
				var g00 := _gt_corner(T, i, j)
				var g10 := _gt_corner(T, i + 1, j)
				var g11 := _gt_corner(T, i + 1, j + 1)
				var g01 := _gt_corner(T, i, j + 1)
				_gt_tri(T, g00, g10, g11)
				_gt_tri(T, g00, g11, g01)
				continue
			var P := _gt_clip(T, _gt_clip(T, _gt_clip(T, _gt_clip(T, ring, 0, i, true), 0, i + 1, false), 1, j, true), 1, j + 1, false)
			var Q := []
			for pq in P:
				var pr = Q[Q.size() - 1] if Q.size() else null
				if pr == null or absf(pr.x - pq.x) + absf(pr.z - pq.z) > 1e-9:
					Q.append(pq)
			while Q.size() > 1 and absf(Q[0].x - Q[Q.size() - 1].x) + absf(Q[0].z - Q[Q.size() - 1].z) <= 1e-9:
				Q.pop_back()
			if Q.size() < 3:
				continue
			for L in _gt_relink(T, Q, i, j):
				if L.size() < 3:
					continue
				var ar := 0.0
				for q in L.size():
					var u: Dictionary = L[q]
					var w: Dictionary = L[(q + 1) % L.size()]
					ar += u.x * w.z - w.x * u.z
				if absf(ar) < 1e-9:
					continue
				if ar < 0:
					L.reverse()
				_ear_clip(T, L)


static func _gt_V(T: Dictionary, key: String, x: float, y: float, z: float) -> int:
	var ids: Dictionary = T.ids
	if ids.has(key):
		return ids[key]
	var M: _Mesh = T.M
	var v := M.pos.size() / 3
	ids[key] = v
	M.pos.append_array([x, y, z])
	M.uv.append_array([x, z])
	M.part.append(1)
	M.bedA.append(T.k)
	M.occ.append(1.0)
	return v


static func _gt_corner(T: Dictionary, i: int, j: int) -> Dictionary:
	var x: float = i * T.G
	var z: float = j * T.G
	return {"x": x, "z": z, "y": _th(T.TH, T.b, x, z), "key": "g" + str(i) + "," + str(j)}


static func _gt_cross(T: Dictionary, s: int, ax: int, li: int) -> Dictionary:
	var n: int = T.n
	var RX: PackedFloat64Array = T.RX
	var RZ: PackedFloat64Array = T.RZ
	var RY: PackedFloat64Array = T.RY
	var s1 := (s + 1) % n
	var x0 := RX[s]
	var z0 := RZ[s]
	var x1 := RX[s1]
	var z1 := RZ[s1]
	var L: float = li * T.G
	var t := (L - z0) / (z1 - z0) if ax else (L - x0) / (x1 - x0)
	if not (t >= 0):
		t = 0.0
	if t > 1:
		t = 1.0
	if t < 1e-9:
		return {"x": x0, "z": z0, "y": RY[s], "key": "r" + str(s)}
	if t > 1 - 1e-9:
		return {"x": x1, "z": z1, "y": RY[s1], "key": "r" + str(s1)}
	return {"x": x0 + t * (x1 - x0) if ax else L, "z": L if ax else z0 + t * (z1 - z0), "y": RY[s] + t * (RY[s1] - RY[s]), "key": ("z" if ax else "x") + str(s) + "," + str(li)}


static func _gt_inside(T: Dictionary, x: float, z: float) -> bool:
	var n: int = T.n
	var c1: Array = T.c1
	var RX: PackedFloat64Array = T.RX
	var RZ: PackedFloat64Array = T.RZ
	var a := atan2(z - c1[1], x - c1[0])
	var f := fmod(-a / TAU * n, n)
	if f < 0:
		f += n
	var s0 := floori(f) % n
	var s1 := (s0 + 1) % n
	var ex := RX[s1] - RX[s0]
	var ez := RZ[s1] - RZ[s0]
	return (ex * (z - RZ[s0]) - ez * (x - RX[s0])) * (ex * (c1[1] - RZ[s0]) - ez * (c1[0] - RX[s0])) >= 0


static func _gt_tri(T: Dictionary, p: Dictionary, q: Dictionary, r: Dictionary) -> void:
	var ny: float = (q.z - p.z) * (r.x - p.x) - (q.x - p.x) * (r.z - p.z)
	if absf(ny) < 1e-10:
		return
	var A := _gt_V(T, p.key, p.x, p.y, p.z)
	var Bv := _gt_V(T, q.key, q.x, q.y, q.z)
	var C := _gt_V(T, r.key, r.x, r.y, r.z)
	var M: _Mesh = T.M
	if ny > 0:
		M.idx.append_array([A, Bv, C])
	else:
		M.idx.append_array([A, C, Bv])


static func _gt_under(T: Dictionary, x: float, z: float) -> bool:
	var up: Dictionary = T.up
	var dx: float = x - float(up.cx)
	var dz: float = z - float(up.cz)
	return hypot(dx, dz) < foot_r(up, atan2(dz, dx)) * (1 - float(up.nt)) - T.G


static func _gt_hidden(T: Dictionary, i: int, j: int) -> bool:
	var G: float = T.G
	return _gt_under(T, i * G, j * G) and _gt_under(T, i * G + G, j * G) and _gt_under(T, i * G, j * G + G) and _gt_under(T, i * G + G, j * G + G)


static func _gt_clip(T: Dictionary, P: Array, ax: int, li: int, ge: bool) -> Array:
	var out := []
	var L: float = li * T.G
	var m := P.size()
	for q in m:
		var A: Dictionary = P[q]
		var Bq: Dictionary = P[(q + 1) % m]
		var av: float = A.z if ax else A.x
		var bv: float = Bq.z if ax else Bq.x
		var ai: bool = av >= L if ge else av <= L
		var bi: bool = bv >= L if ge else bv <= L
		if ai == bi:
			if bi:
				out.append(Bq)
			continue
		var I: Dictionary
		if A.e[0] == 0:
			I = _gt_cross(T, A.e[1], ax, li)
		else:
			I = _gt_corner(T, A.e[1], li) if ax else _gt_corner(T, li, A.e[1])
		if ai:
			I.e = [2 if ax else 1, li]
			out.append(I)
		else:
			I.e = A.e
			out.append(I)
			out.append(Bq)
	return out


static func _gt_tau(T: Dictionary, v: Dictionary, X0: float, Z0: float) -> float:
	var G: float = T.G
	var P4 := 4 * G
	var d := [absf(v.z - Z0), absf(v.x - X0 - G), absf(v.z - Z0 - G), absf(v.x - X0)]
	var k := 0
	for t in range(1, 4):
		if d[t] < d[k]:
			k = t
	var r: float
	if k == 0:
		r = v.x - X0
	elif k == 1:
		r = G + (v.z - Z0)
	elif k == 2:
		r = 2 * G + (X0 + G - v.x)
	else:
		r = 3 * G + (Z0 + G - v.z)
	return fmod(fmod(r, P4) + P4, P4)


static func _gt_relink(T: Dictionary, Q: Array, i: int, j: int) -> Array:
	var m := Q.size()
	var hs := false
	var hr := false
	for q in m:
		if Q[q].e[0] == 0:
			hr = true
		else:
			hs = true
	if not hs or not hr:
		return [Q]
	var G: float = T.G
	var X0 := i * G
	var Z0 := j * G
	var P4 := 4 * G
	var CN := [_gt_corner(T, i, j), _gt_corner(T, i + 1, j), _gt_corner(T, i + 1, j + 1), _gt_corner(T, i, j + 1)]
	var CT := [0.0, G, 2 * G, 3 * G]
	var ch := []
	for q in m:
		if not (Q[q].e[0] == 0) or Q[(q + m - 1) % m].e[0] == 0:
			continue
		var c := [Q[q]]
		var r := q
		while Q[r].e[0] == 0:
			r = (r + 1) % m
			c.append(Q[r])
			if r == q:
				break
		ch.append({"v": c, "ti": _gt_tau(T, c[0], X0, Z0), "to": _gt_tau(T, c[c.size() - 1], X0, Z0), "used": false})
	var out := []
	for a in ch.size():
		if ch[a].used:
			continue
		var L := []
		var cur: Dictionary = ch[a]
		var guard := 0
		while guard <= ch.size():
			guard += 1
			cur.used = true
			L.append_array(cur.v)
			var to: float = cur.to
			var best = null
			var bd := INF
			for b in ch.size():
				if ch[b].used and not is_same(ch[b], ch[a]):
					continue
				var d := fmod(fmod(to - ch[b].ti, P4) + P4, P4)
				if d < 1e-9:
					d = 0.0
				if d < bd:
					bd = d
					best = ch[b]
			var cs := []
			for t in 4:
				var dc := fmod(fmod(to - CT[t], P4) + P4, P4)
				if dc > 1e-9 and dc < bd - 1e-9:
					cs.append([dc, CN[t]])
			cs.sort_custom(func(x, y): return x[0] < y[0])
			for x in cs:
				L.append(x[1])
			if best == null or is_same(best, ch[a]):
				break
			cur = best
		var D := []
		for v in L:
			var pv = D[D.size() - 1] if D.size() else null
			if pv == null or absf(pv.x - v.x) + absf(pv.z - v.z) > 1e-9:
				D.append(v)
		while D.size() > 1 and absf(D[0].x - D[D.size() - 1].x) + absf(D[0].z - D[D.size() - 1].z) <= 1e-9:
			D.pop_back()
		out.append(D)
	return out


static func _cr2(a: Dictionary, b: Dictionary, c: Dictionary) -> float:
	return (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x)


static func _ear_clip(T: Dictionary, Q: Array) -> void:
	var guard := 0
	while Q.size() > 3 and guard < 4096:
		guard += 1
		var m := Q.size()
		var cut := -1
		for q in m:
			if cut >= 0:
				break
			var a: Dictionary = Q[(q + m - 1) % m]
			var b: Dictionary = Q[q]
			var c: Dictionary = Q[(q + 1) % m]
			if _cr2(a, b, c) <= 1e-12:
				continue
			var clear := true
			for t in m:
				if not clear:
					break
				var p: Dictionary = Q[t]
				if is_same(p, a) or is_same(p, b) or is_same(p, c):
					continue
				if absf(p.x - b.x) + absf(p.z - b.z) < 1e-9:
					continue
				if _cr2(a, b, p) >= -1e-12 and _cr2(b, c, p) >= -1e-12 and _cr2(c, a, p) >= -1e-12:
					clear = false
			if clear:
				cut = q
		if cut < 0:
			var fl := -1
			for q in m:
				if absf(_cr2(Q[(q + m - 1) % m], Q[q], Q[(q + 1) % m])) <= 1e-9:
					fl = q
					break
			if fl >= 0:
				Q.remove_at(fl)
				continue
			for q in range(1, m - 1):
				_gt_tri(T, Q[0], Q[q], Q[q + 1])
			return
		_gt_tri(T, Q[(cut + m - 1) % m], Q[cut], Q[(cut + 1) % m])
		Q.remove_at(cut)
	if Q.size() == 3:
		_gt_tri(T, Q[0], Q[1], Q[2])


# A CHIMNEY's mesh: the outer wall bed by bed, a step's ledge, the lip, the bore (part 3) down inside, darkening with depth;
# a fallen record drawn lying on its axis; ice
static func _chimney_mesh(B: Dictionary, opt: Dictionary, M: _Mesh, TH: Callable, rhos: Array, step: float, SMAX: int) -> Dictionary:
	var nRot := 0
	var topY: float = B.top
	var fall: bool = B.get("fall") != null
	for k in B.beds.size():
		if k == int(B.body) and fall:
			nRot = M.pos.size() / 3
		var b: Dictionary = B.beds[k]
		var nxb = B.beds[k + 1] if k + 1 < B.beds.size() else null
		var last: bool = nxb == null or nxb.get("col") != b.get("col")
		var t1 := t_at(b, 1)
		var c1 := c_at(b, 1)
		var seg := maxi(10, mini(SMAX, int(jround(TAU * maxf(b.rx, b.rz) * maxf(1, t1) / step))))
		var hollow: bool = b.get("bo") != null and b.col < 50
		var arc := [0.0]
		for s in range(1, seg + 1):
			var a0 := _ang(s - 1, seg)
			var a1 := _ang(s, seg)
			var r0 := foot_r(b, a0)
			var r1 := foot_r(b, a1)
			arc.append(arc[s - 1] + hypot(cos(a1) * r1 - cos(a0) * r0, sin(a1) * r1 - sin(a0) * r0))
		var rows := []
		for u in [0.0, 0.5, 1.0]:
			rows.append(func(s):
				var a := _ang(s, seg)
				var c := c_at(b, u)
				var R := foot_r(b, a) * t_at(b, u)
				var x: float = c[0] + cos(a) * R
				var z: float = c[1] + sin(a) * R
				var y: float
				if u == 1.0:
					y = _th(TH, b, x, z) if last else float(b.y) + float(b.h)
				else:
					y = y_at(b, a, u)
				return [x, y, z, arc[s], y, 0.6 if u == 0.0 and hollow and k == 0 else 1.0])
		M.grid(rows, seg, 0, k, false)
		if not hollow:
			var tops := []
			for rho in rhos:
				tops.append(_ch_ring_at(b, c1, last, TH, seg, func(a): return foot_r(b, a) * t1 * rho))
			M.grid(tops, seg, 1, k, false)
			M.fan(seg, 1, k, c1[0], _th(TH, b, c1[0], c1[1]) if last else float(b.y) + float(b.h), c1[1])
			continue
		if last:
			M.grid([_ch_ring_at(b, c1, last, TH, seg, func(a): return foot_r(b, a) * t1), _ch_ring_at(b, c1, last, TH, seg, func(a): return (foot_r(b, a) * t1 + float(b.bt)) / 2),
				_ch_ring_at(b, c1, last, TH, seg, func(_a): return float(b.bt))], seg, 1, k, false)
		else:
			var nf := foot_r(nxb, 0) / foot_r(b, 0)
			if nf < t1 - 0.002:
				M.grid([_ch_ring_at(b, c1, last, TH, seg, func(a): return foot_r(b, a) * t1), _ch_ring_at(b, c1, last, TH, seg, func(a): return foot_r(nxb, a))], seg, 1, k, false)
		var inner := []
		for u in [0.0, 0.5, 1.0]:
			inner.append(func(s):
				var a := _ang(s, seg)
				var c := c_at(b, u)
				var R: float = float(b.bo) + (float(b.bt) - float(b.bo)) * u
				var x: float = c[0] + cos(a) * R
				var z: float = c[1] + sin(a) * R
				var y: float
				if u == 1.0:
					y = _th(TH, b, x, z) if last else float(b.y) + float(b.h)
				else:
					y = float(b.y) + u * float(b.h)
				return [x, y, z, R * a, y, _clamp(1 - (topY - y) / (maxf(b.bo, b.bt) * 8), 0.08, 1)])
		M.grid(inner, seg, 3, k, true)
		if k == 0 and not (opt.get("bore") == "open" and not fall):
			var plug := []
			for rho in [1.0, 0.5, 0.0]:
				plug.append(func(s):
					var a := _ang(s, seg)
					var R: float = float(b.bo) * rho + 0.001
					var x: float = float(b.cx) + cos(a) * R
					var z: float = float(b.cz) + sin(a) * R
					return [x, float(b.y) + 0.15, z, x, z, 0.05])
			M.grid(plug, seg, 3, k, false)
	if fall and not nRot:
		nRot = M.pos.size() / 3
	if fall:
		var G: Dictionary = B.fall
		var Y := [float(G.dx), float(G.dy), float(G.dz)]
		var ax := [0.0, 0.0, 1.0]
		var X := [Y[1] * ax[2] - Y[2] * ax[1], Y[2] * ax[0] - Y[0] * ax[2], Y[0] * ax[1] - Y[1] * ax[0]]
		var l := hypotn(X)
		if l < 0.01:
			X = [1.0, 0.0, 0.0]
			l = 1.0
		X = [X[0] / l, X[1] / l, X[2] / l]
		var Z := [X[1] * Y[2] - X[2] * Y[1], X[2] * Y[0] - X[0] * Y[2], X[0] * Y[1] - X[1] * Y[0]]
		var A := [float(G.ax), float(G.ay), float(G.az)]
		var P: Array = M.pos
		for i in nRot:
			var lx: float = P[3 * i] - float(B.x)
			var ly: float = P[3 * i + 1] - float(B.y0)
			var lz: float = P[3 * i + 2] - float(B.z)
			for c in 3:
				P[3 * i + c] = A[c] + X[c] * lx + Y[c] * ly + Z[c] * lz
	var out := _out(M)
	if B.get("ice") != null:
		var n := M.pos.size() / 3
		var I := PackedFloat32Array()
		I.resize(n)
		var H: float = float(B.top) - float(B.y0)
		var fr: float = B.ice.from
		for i2 in n:
			if M.part[i2] == 3:
				continue
			var bb: Dictionary = B.beds[M.bedA[i2]]
			if bb.col >= 50:
				continue
			var u: float = (float(bb.y) + float(bb.h) / 2 - float(B.y0)) / H
			I[i2] = sm(fr - 0.04, fr + 0.04, u) * _clamp(0.45 + 1.1 * KRand.fbm(M.pos[3 * i2] * 0.4, M.pos[3 * i2 + 1] * 0.4, M.pos[3 * i2 + 2] * 0.4, 2, int(B.seed)), 0, 1)
		out.ice = I
	return out


static func _ch_ring_at(b: Dictionary, c1: Array, last: bool, TH: Callable, seg: int, rf: Callable) -> Callable:
	return func(s):
		var a := _ang(s, seg)
		var R: float = rf.call(a)
		var x: float = c1[0] + cos(a) * R
		var z: float = c1[1] + sin(a) * R
		return [x, _th(TH, b, x, z) if last else float(b.y) + float(b.h), z, x, z, 1.0]


# a fingerprint of a mesh's arrays (determinism)
static func hash(m: Dictionary) -> int:
	var P: PackedFloat32Array = m.pos
	var I: PackedInt32Array = m.idx
	var h := _h(1, [P.size(), I.size()])
	for i in range(0, P.size(), 7):
		h = _h(h, [jround(P[i] * 1000)])
	for i in range(0, I.size(), 11):
		h = _h(h, [I[i]])
	return h


static func export_list(list: Array) -> Dictionary:
	return {"format": "krator-stacks", "version": 1, "bodies": list.map(func(B): return B.duplicate(true))}


static func load(j: Dictionary) -> Array:
	if j.get("format") != "krator-stacks":
		push_error("KStacks.load: not a krator-stacks export")
		return []
	return j.bodies.map(func(B): return B.duplicate(true))


# ---------------------------------------------------------------- KSTACKS.weather: a drawn body worn natural
static func weather(B: Dictionary, m: Dictionary, o: Dictionary = {}) -> Dictionary:
	var P: PackedFloat32Array = m.pos
	var n := P.size() / 3
	var sd: int = int(_opt(o, "seed", B.seed)) & KRand.M32
	var amp: float = _opt(o, "amp", 2.2)
	var gr: float = _opt(o, "grain", 0.12)
	var pit: float = _opt(o, "pit", 0.6)
	var pg: float = _opt(o, "pitGrain", 0.5)
	var G = o.get("ground")
	if B.get("opening") != null and not (o.get("round") != null and float(o.round) == 0.0):
		var Op: Dictionary = B.opening
		var ux := cos(float(Op.ry))
		var uz := sin(float(Op.ry))
		var Lh := 0.0
		for v in n:
			var a0 := absf((P[3 * v] - float(B.x)) * ux + (P[3 * v + 2] - float(B.z)) * uz)
			if a0 > Lh:
				Lh = a0
		var R := minf(Lh * 0.55, maxf(6, (float(B.top) - float(Op.y1)) * float(_opt(o, "round", 1.9))))
		var cx := Lh - R
		var cy: float = float(B.top) - R
		for v in n:
			var x: float = P[3 * v]
			var y: float = P[3 * v + 1]
			var z: float = P[3 * v + 2]
			var dx: float = x - float(B.x)
			var dz: float = z - float(B.z)
			var a := dx * ux + dz * uz
			var c := -dx * uz + dz * ux
			var aa := absf(a)
			if aa > cx and y > cy:
				var d := hypot(aa - cx, y - cy)
				if d > R:
					var k := R / d
					var a2 := (-1.0 if a < 0 else 1.0) * (cx + (aa - cx) * k)
					P[3 * v + 1] = cy + (y - cy) * k
					P[3 * v] = float(B.x) + a2 * ux - c * uz
					P[3 * v + 2] = float(B.z) + a2 * uz + c * ux
	for v in n:
		var x: float = P[3 * v]
		var y: float = P[3 * v + 1]
		var z: float = P[3 * v + 2]
		var f: float = sm(0.5, 4, y - float(G.call(x, z))) if G is Callable else 1.0
		var A := amp * f
		var a3 := pit * f
		P[3 * v] = x + A * _wnz(sd, 0, x * gr, y * gr, z * gr) + a3 * _wnz(sd, 3, x * pg, y * pg, z * pg)
		P[3 * v + 1] = y + 0.7 * (A * _wnz(sd, 1, x * gr + 7, y * gr, z * gr) + a3 * _wnz(sd, 4, x * pg + 7, y * pg, z * pg))
		P[3 * v + 2] = z + A * _wnz(sd, 2, x * gr, y * gr + 3, z * gr) + a3 * _wnz(sd, 5, x * pg, y * pg + 3, z * pg)
	m.pos = P
	return m


static func _wnz(sd: int, k: int, u: float, v: float, w: float) -> float:
	return (KRand.fbm(u, v, w, 3, sd + k) - 0.5) * 2


# ---------------------------------------------------------------- 37b: the contour of a drawn tower, an arch's round opening
static func _num(o: Dictionary, k: String, d):
	var v = o.get(k)
	return d if v == null else v


static func contour(B: Dictionary, m: Dictionary, o: Dictionary = {}) -> Dictionary:
	var sd: int = int(_num(o, "seed", B.seed)) & KRand.M32
	var H: float = float(B.top) - float(B.y0)
	var keep: float = _num(o, "keep", 0.0)
	var prof_k: float = _num(o, "profile", 0.16)
	var flare: float = _num(o, "flare", 0.12)
	var crown: float = 0.0 if keep > 0 else float(_num(o, "crown", 0.28))
	var wan: float = _num(o, "wander", 1.8)
	var fl: float = _num(o, "floor", 0.25)
	var jn: Array = _num(o, "joints", [5, 8])
	var jw: Array = _num(o, "jointW", [0.8, 2.2])
	var jd: Array = _num(o, "jointD", [4.0, 9.0])
	var cf: Array = _num(o, "cleftFrom", [0.35, 0.6])
	var J := []
	var nj: int = int(jn[0]) + (_h(sd, [0, 78]) % (int(jn[1]) - int(jn[0]) + 1))
	for j in nj:
		J.append({"a": _cu(sd, 10 + j) * TAU, "w": jw[0] + (jw[1] - jw[0]) * _cu(sd, 20 + j), "d": jd[0] + (jd[1] - jd[0]) * _cu(sd, 30 + j), "k": 40 + j})
	var cleft = null
	if not (keep > 0 or (o.get("cleft") is bool and o.cleft == false)):
		cleft = {"a": _cu(sd, 5) * TAU, "w": 1.5 + 1.5 * _cu(sd, 6), "from": cf[0] + (cf[1] - cf[0]) * _cu(sd, 7)}
	var P: PackedFloat32Array = m.pos
	for v in P.size() / 3:
		var x: float = P[3 * v]
		var y: float = P[3 * v + 1]
		var z: float = P[3 * v + 2]
		var t: float = (y - float(B.y0)) / H
		var kp: float = 1 - _sm37b(H - keep, H - keep / 4, y - float(B.y0)) if keep > 0 else 1.0
		var dx: float = x - float(B.x)
		var dz: float = z - float(B.z)
		var r := hypot(dx, dz)
		if r < 1e-6:
			continue
		var a := atan2(dz, dx)
		var ox := wan * _cnz(sd, 1, t * 2.2) * kp
		var oz := wan * _cnz(sd, 2, t * 2.2) * kp
		var p := (1 + prof_k * _cnz(sd, 3, t * 2.8) + flare * (1 - _sm37b(0, 0.14, t))) * (1 - crown * _sm37b(0.78, 1, t))
		var R := r * (1 + (p - 1) * kp)
		for g in J:
			var d: float = a - g.a
			d = atan2(sin(d), cos(d))
			var s: float = d * r / g.w
			R -= g.d * (0.55 + 0.45 * _cnz(sd, g.k, t * 4)) * exp(-s * s) * kp
		if cleft != null and t > cleft.from:
			var dc: float = a - cleft.a
			dc = atan2(sin(dc), cos(dc))
			var sc: float = dc * r / cleft.w
			R -= r * 0.5 * _sm37b(cleft.from, cleft.from + 0.12, t) * exp(-sc * sc)
		R = maxf(R, r * fl)
		P[3 * v] = float(B.x) + ox + dx / r * R
		P[3 * v + 2] = float(B.z) + oz + dz / r * R
	m.pos = P
	return m


static func _cu(sd: int, k: int) -> float:
	return KRand.unit(_h(sd, [k, 77]))


static func _cnz(sd: int, k: int, t: float) -> float:
	return (KRand.fbm(t, k * 1.7, 0.5, 3, sd + k) - 0.5) * 2


static func _sm37b(a: float, b: float, x: float) -> float:
	var t := minf(1, maxf(0, (x - a) / (b - a)))
	return t * t * (3 - 2 * t)


static func arch_round(B: Dictionary, m: Dictionary, o: Dictionary = {}) -> Dictionary:
	var Op = B.get("opening")
	if Op == null:
		return m
	var band: float = _num(o, "band", 0.6)
	var ux := cos(float(Op.ry))
	var uz := sin(float(Op.ry))
	var hw: float = float(Op.w0) / 2
	var rise: float = float(Op.y1) - float(Op.y0)
	if not (hw > 0 and rise > 0):
		return m
	var P: PackedFloat32Array = m.pos
	for v in P.size() / 3:
		var x: float = P[3 * v]
		var y: float = P[3 * v + 1]
		var z: float = P[3 * v + 2]
		var dx: float = x - float(Op.x)
		var dz: float = z - float(Op.z)
		var a := dx * ux + dz * uz
		var c := -dx * uz + dz * ux
		var an := a / hw
		var yn: float = (y - float(Op.y0)) / rise
		if yn <= 0:
			continue
		var mm := maxf(absf(an), yn)
		if mm >= 1 + band:
			continue
		var hy := hypot(an, yn)
		if hy < 1e-9:
			continue
		var w := 1 - _sm37b(1, 1 + band, mm)
		var f := 1 + (mm / hy - 1) * w
		var a2 := an * f * hw
		var y2: float = float(Op.y0) + yn * f * rise
		P[3 * v] = float(Op.x) + a2 * ux - c * uz
		P[3 * v + 1] = y2
		P[3 * v + 2] = float(Op.z) + a2 * uz + c * ux
	m.pos = P
	return m
