# core/world smoothing in GDScript: the twin of 40-world-smooth.js (core/world/PLAN-RELIEF.md P9, P15). The heights smoothed
# along their contours, the centripetal Catmull-Rom curves (with the seeded meander), the relaxed lines; in the JS file's
# order of operations, on core/rand's krand.gd. Checked against core/world/golden-relief.json by wrelief_test.gd, to 1e-6.
#
#   WSmooth.gauss(A, nx, ny, sigma) -> PackedFloat64Array     the separable Gaussian, renormalised at the edges
#   WSmooth.bic(A, nx, ny, u, v) -> float                     Catmull-Rom at (u, v) in cells
#   WSmooth.heights(E, nx, ny, o) -> PackedFloat64Array       o: {px, cell, pre, rho, len, iters, step, minSlope}
#   WSmooth.curve(P, o) -> Array                              P: [[x, z, extra...]]; o: {step, meander: {amp, wave, seed, ox, oz}}
#   WSmooth.river(P, o) / WSmooth.line(P, o) -> Array
# Grids are any indexable array (PackedFloat64Array or PackedFloat32Array); points are Arrays of floats (never Vector2,
# whose components are 32-bit).
extends RefCounted

const KRand := preload("../rand/krand.gd")


static func _clamp(v: float, a: float, b: float) -> float:
	return a if v < a else (b if v > b else v)


static func _opt(o: Dictionary, k: String, d):
	var v = o.get(k)
	return d if v == null else v


# ---------------------------------------------------------------- the grid's helpers
static func gauss(A, nx: int, ny: int, sigma: float) -> PackedFloat64Array:
	var out := PackedFloat64Array()
	out.resize(nx * ny)
	if not (sigma > 0.0):
		for k in nx * ny:
			out[k] = A[k]
		return out
	var r := maxi(1, ceili(3.0 * sigma))
	var w := PackedFloat64Array()
	w.resize(2 * r + 1)
	for k in range(-r, r + 1):
		w[k + r] = exp(-float(k) * float(k) / (2.0 * sigma * sigma))
	var tmp := PackedFloat64Array()
	tmp.resize(nx * ny)
	for j in ny:
		var o := j * nx
		for i in nx:
			var s := 0.0
			var ws := 0.0
			var a := maxi(-r, -i)
			var b := mini(r, nx - 1 - i)
			for k in range(a, b + 1):
				s += w[k + r] * A[o + i + k]
				ws += w[k + r]
			tmp[o + i] = s / ws
	for i in nx:
		for j in ny:
			var s := 0.0
			var ws := 0.0
			var a := maxi(-r, -j)
			var b := mini(r, ny - 1 - j)
			for k in range(a, b + 1):
				s += w[k + r] * tmp[(j + k) * nx + i]
				ws += w[k + r]
			out[j * nx + i] = s / ws
	return out


static func bil(A, nx: int, ny: int, u: float, v: float) -> float:
	u = _clamp(u, 0.0, nx - 1.000001)
	v = _clamp(v, 0.0, ny - 1.000001)
	var i := floori(u)
	var j := floori(v)
	var fu := u - i
	var fv := v - j
	var o := j * nx + i
	return (A[o] * (1 - fu) + A[o + 1] * fu) * (1 - fv) + (A[o + nx] * (1 - fu) + A[o + nx + 1] * fu) * fv


static func _cr(p0: float, p1: float, p2: float, p3: float, t: float) -> float:
	return p1 + 0.5 * t * (p2 - p0 + t * (2 * p0 - 5 * p1 + 4 * p2 - p3 + t * (3 * (p1 - p2) + p3 - p0)))


static func _bic_row(A, nx: int, ny: int, jj: int, i: int, fu: float) -> float:
	var o := clampi(jj, 0, ny - 1) * nx
	return _cr(A[o + clampi(i - 1, 0, nx - 1)], A[o + clampi(i, 0, nx - 1)], A[o + clampi(i + 1, 0, nx - 1)], A[o + clampi(i + 2, 0, nx - 1)], fu)


static func bic(A, nx: int, ny: int, u: float, v: float) -> float:
	u = _clamp(u, 0.0, nx - 1)
	v = _clamp(v, 0.0, ny - 1)
	var i := mini(floori(u), nx - 2)
	var j := mini(floori(v), ny - 2)
	var fu := u - i
	var fv := v - j
	return _cr(_bic_row(A, nx, ny, j - 1, i, fu), _bic_row(A, nx, ny, j, i, fu), _bic_row(A, nx, ny, j + 1, i, fu), _bic_row(A, nx, ny, j + 2, i, fu), fv)


# the cubic B-spline's coefficients (Unser's recursive filter, pole sqrt(3) - 2, the edges mirrored); returns s
static func _bs1(s: PackedFloat64Array, o: int, stride: int, n: int) -> PackedFloat64Array:
	if n < 2:
		return s
	var z := sqrt(3.0) - 2.0
	for i in n:
		s[o + i * stride] *= 6.0
	var zn := z
	var sum := s[o]
	var K := mini(n - 1, 40)
	for k in range(1, K + 1):
		sum += zn * s[o + k * stride]
		zn *= z
	s[o] = sum
	for i in range(1, n):
		s[o + i * stride] += z * s[o + (i - 1) * stride]
	s[o + (n - 1) * stride] = (z / (z * z - 1)) * (z * s[o + (n - 2) * stride] + s[o + (n - 1) * stride])
	for i in range(n - 2, -1, -1):
		s[o + i * stride] = z * (s[o + (i + 1) * stride] - s[o + i * stride])
	return s


static func _bspline(A, nx: int, ny: int) -> PackedFloat64Array:
	var C := PackedFloat64Array()
	C.resize(nx * ny)
	for k in nx * ny:
		C[k] = A[k]
	for j in ny:
		C = _bs1(C, j * nx, 1, nx)
	for i in nx:
		C = _bs1(C, i, nx, ny)
	return C


# ---------------------------------------------------------------- the heights: smoothing along the contours
# the direction at (u, v): the four cells' directions, each turned to agree with (px, pz), blended; [] where none
static func _tan(TX: PackedFloat64Array, TZ: PackedFloat64Array, nx: int, ny: int, u: float, v: float, px: float, pz: float) -> Array:
	var i: int = nx - 2 if u >= nx - 1 else int(u)
	var j: int = ny - 2 if v >= ny - 1 else int(v)
	var fu := u - i
	var fv := v - j
	var o := j * nx + i
	var x := 0.0
	var z := 0.0
	var w: float
	var t: float
	w = (1 - fu) * (1 - fv)
	t = -w if TX[o] * px + TZ[o] * pz < 0 else w
	x += t * TX[o]
	z += t * TZ[o]
	w = fu * (1 - fv)
	t = -w if TX[o + 1] * px + TZ[o + 1] * pz < 0 else w
	x += t * TX[o + 1]
	z += t * TZ[o + 1]
	w = (1 - fu) * fv
	t = -w if TX[o + nx] * px + TZ[o + nx] * pz < 0 else w
	x += t * TX[o + nx]
	z += t * TZ[o + nx]
	w = fu * fv
	t = -w if TX[o + nx + 1] * px + TZ[o + nx + 1] * pz < 0 else w
	x += t * TX[o + nx + 1]
	z += t * TZ[o + nx + 1]
	var m := sqrt(x * x + z * z)
	if not (m > 1e-9):
		return []
	return [x / m, z / m]


static func _val(CF: PackedFloat64Array, nx: int, ny: int, u: float, v: float) -> float:
	var i := int(u)
	var j := int(v)
	if i > nx - 2:
		i = nx - 2
	if j > ny - 2:
		j = ny - 2
	var fu := u - i
	var fv := v - j
	var gu := 1 - fu
	var gv := 1 - fv
	var u3 := fu * fu * fu
	var v3 := fv * fv * fv
	var a0 := gu * gu * gu / 6
	var a1 := (3 * u3 - 6 * fu * fu + 4) / 6
	var a2 := (-3 * u3 + 3 * fu * fu + 3 * fu + 1) / 6
	var a3 := u3 / 6
	var b := [gv * gv * gv / 6, (3 * v3 - 6 * fv * fv + 4) / 6, (-3 * v3 + 3 * fv * fv + 3 * fv + 1) / 6, v3 / 6]
	var i0: int = i - 1 if i > 0 else 1
	var i3: int = i + 2 if i + 2 < nx else 2 * nx - 4 - i
	var s := 0.0
	for q in 4:
		var jj := j - 1 + q
		if jj < 0:
			jj = -jj
		elif jj > ny - 1:
			jj = 2 * ny - 2 - jj
		var r := jj * nx
		s += float(b[q]) * (a0 * CF[r + i0] + a1 * CF[r + i] + a2 * CF[r + i + 1] + a3 * CF[r + i3])
	return s


static func _pass(E: PackedFloat64Array, nx: int, ny: int, o: Dictionary) -> PackedFloat64Array:
	var N := nx * ny
	var G := gauss(E, nx, ny, o.pre)
	var gx := PackedFloat64Array()
	gx.resize(N)
	var gz := PackedFloat64Array()
	gz.resize(N)
	for j in ny:
		for i in nx:
			var k := j * nx + i
			var l: float = G[k - 1] if i > 0 else G[k]
			var r: float = G[k + 1] if i < nx - 1 else G[k]
			var u: float = G[k - nx] if j > 0 else G[k]
			var d: float = G[k + nx] if j < ny - 1 else G[k]
			gx[k] = (r - l) / (2.0 if (i > 0 and i < nx - 1) else 1.0)
			gz[k] = (d - u) / (2.0 if (j > 0 and j < ny - 1) else 1.0)
	var a0 := PackedFloat64Array()
	a0.resize(N)
	var b0 := PackedFloat64Array()
	b0.resize(N)
	var c0 := PackedFloat64Array()
	c0.resize(N)
	for k in N:
		a0[k] = gx[k] * gx[k]
		b0[k] = gx[k] * gz[k]
		c0[k] = gz[k] * gz[k]
	var Ja := gauss(a0, nx, ny, o.rho)
	var Jb := gauss(b0, nx, ny, o.rho)
	var Jc := gauss(c0, nx, ny, o.rho)
	var T2: float = o.slope * o.slope
	var out := PackedFloat64Array()
	out.resize(N)
	var L: float = o.len
	var h: float = o.step
	var n := maxi(1, ceili(L / h))
	var TX := PackedFloat64Array()
	TX.resize(N)
	var TZ := PackedFloat64Array()
	TZ.resize(N)
	var ST := PackedFloat64Array()
	ST.resize(N)
	for k in N:
		var a := Ja[k]
		var b := Jb[k]
		var c := Jc[k]
		var tr := a + c
		if not (tr > 1e-12):
			continue
		var df := sqrt((a - c) * (a - c) + 4 * b * b)
		var m1 := (tr + df) / 2
		var ex: float
		var ez: float
		if absf(m1 - c) >= absf(m1 - a):
			ex = m1 - c
			ez = b
		else:
			ex = b
			ez = m1 - a
		var nn := sqrt(ex * ex + ez * ez)
		if not (nn > 1e-300):
			continue
		TX[k] = -ez / nn
		TZ[k] = ex / nn
		var coh := df / tr
		ST[k] = coh * coh * (tr / (tr + T2))
	var CF := _bspline(E, nx, ny)
	for j in ny:
		for i in nx:
			var k := j * nx + i
			var st := ST[k]
			if st < 1e-4:
				out[k] = E[k]
				continue
			var s := E[k]
			var ws := 1.0
			for sg in [1.0, -1.0]:
				var dx: float = TX[k] * sg
				var dz: float = TZ[k] * sg
				var u := float(i)
				var v := float(j)
				for q in range(1, n + 1):
					var hu := u + dx * h * 0.5
					var hv := v + dz * h * 0.5
					if hu < 0 or hv < 0 or hu > nx - 1 or hv > ny - 1:
						break
					var tv := _tan(TX, TZ, nx, ny, hu, hv, dx, dz)
					if tv.is_empty():
						break
					var mx: float = tv[0]
					var mz: float = tv[1]
					u += mx * h
					v += mz * h
					if u < 0 or v < 0 or u > nx - 1 or v > ny - 1:
						break
					var t := q * h / L
					var w := (1 - t * t) * (1 - t * t)
					if not (t < 1):
						break
					s += w * _val(CF, nx, ny, u, v)
					ws += w
					tv = _tan(TX, TZ, nx, ny, u, v, mx, mz)
					if tv.is_empty():
						break
					dx = tv[0]
					dz = tv[1]
			out[k] = E[k] + st * (s / ws - E[k])
	return out


static func heights(E, nx: int, ny: int, o: Dictionary = {}) -> PackedFloat64Array:
	var px: float = _opt(o, "px", 4.0)
	var cell: float = _opt(o, "cell", 500.0)
	var P := {"pre": float(_opt(o, "pre", 0.5)) * px, "rho": float(_opt(o, "rho", 3.0)) * px, "len": float(_opt(o, "len", 4.0)) * px,
		"step": float(_opt(o, "step", 1.0)), "slope": float(_opt(o, "minSlope", 0.004)) * cell}
	var A := PackedFloat64Array()
	A.resize(nx * ny)
	for k in nx * ny:
		A[k] = E[k]
	var it: int = _opt(o, "iters", 2)
	for k in it:
		A = _pass(A, nx, ny, P)
	return A


# ---------------------------------------------------------------- the curves: rivers and the drainage
static func _dedupe(P: Array) -> Array:
	var Q := []
	for p in P:
		var q = Q[Q.size() - 1] if Q.size() else null
		if q == null or absf(p[0] - q[0]) + absf(p[1] - q[1]) > 1e-6:
			Q.append(p)
	return Q


static func _pt(P: Array, i: int) -> Array:
	var n := P.size()
	if i < 0:
		return [2 * P[0][0] - P[1][0], 2 * P[0][1] - P[1][1]]
	if i >= n:
		return [2 * P[n - 1][0] - P[n - 2][0], 2 * P[n - 1][1] - P[n - 2][1]]
	return P[i]


static func _d4(a: Array, b: Array) -> float:
	var v := sqrt(sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1])))
	return v if v != 0.0 else 1e-6


static func curve(P: Array, o: Dictionary = {}) -> Array:
	var step: float = _opt(o, "step", 100.0)
	var M = o.get("meander")
	P = _dedupe(P)
	if P.size() < 2:
		return P.map(func(p): return p.duplicate())
	var n := P.size()
	var ne: int = P[0].size()
	var base := []
	var frac := []
	for i in n - 1:
		var p0 := _pt(P, i - 1)
		var p1: Array = P[i]
		var p2: Array = P[i + 1]
		var p3 := _pt(P, i + 2)
		var t0 := 0.0
		var t1 := t0 + _d4(p0, p1)
		var t2 := t1 + _d4(p1, p2)
		var t3 := t2 + _d4(p2, p3)
		var chord := sqrt((p2[0] - p1[0]) * (p2[0] - p1[0]) + (p2[1] - p1[1]) * (p2[1] - p1[1]))
		var m := maxi(1, ceili(chord / step))
		for q in m:
			var f := float(q) / m
			var t := t1 + (t2 - t1) * f
			var xy := [0.0, 0.0]
			for c in 2:
				var A1: float = (t1 - t) / (t1 - t0) * p0[c] + (t - t0) / (t1 - t0) * p1[c]
				var A2: float = (t2 - t) / (t2 - t1) * p1[c] + (t - t1) / (t2 - t1) * p2[c]
				var A3: float = (t3 - t) / (t3 - t2) * p2[c] + (t - t2) / (t3 - t2) * p3[c]
				var B1: float = (t2 - t) / (t2 - t0) * A1 + (t - t0) / (t2 - t0) * A2
				var B2: float = (t3 - t) / (t3 - t1) * A2 + (t - t1) / (t3 - t1) * A3
				xy[c] = (t2 - t) / (t2 - t1) * B1 + (t - t1) / (t2 - t1) * B2
			var r := [xy[0], xy[1]]
			for e in range(2, ne):
				r.append(p1[e] + (p2[e] - p1[e]) * f)
			base.append(r)
			frac.append(f)
	base.append(P[n - 1].duplicate())
	frac.append(0.0)
	if M == null or not (float(M.get("amp", 0.0)) > 0):
		return base
	var out := []
	var N := base.size()
	var ox: float = _opt(M, "ox", 0.0)
	var oz: float = _opt(M, "oz", 0.0)
	var sd: int = int(M.seed) & KRand.M32
	for k in N:
		var a: Array = base[maxi(0, k - 1)]
		var b: Array = base[mini(N - 1, k + 1)]
		var tx: float = b[0] - a[0]
		var tz: float = b[1] - a[1]
		var L := sqrt(tx * tx + tz * tz)
		var f: float = frac[k]
		var env := 16 * f * f * (1 - f) * (1 - f)
		var p: Array = base[k]
		var r := p.duplicate()
		if L > 0 and env > 0:
			tx /= L
			tz /= L
			var nv := 2 * KRand.vnoise((p[0] + ox) / M.wave, (p[1] + oz) / M.wave, 0.5, sd) - 1
			var off: float = M.amp * nv * env
			r[0] = p[0] - tz * off
			r[1] = p[1] + tx * off
		out.append(r)
	return out


static func _relax(P: Array, k: int, cap) -> Array:
	var Q := P.map(func(p): return p.duplicate())
	var it := 0
	while it < k and Q.size() > 2:
		var R := [Q[0]]
		for i in range(1, Q.size() - 1):
			var r: Array = Q[i].duplicate()
			r[0] = (Q[i - 1][0] + 2 * Q[i][0] + Q[i + 1][0]) / 4.0
			r[1] = (Q[i - 1][1] + 2 * Q[i][1] + Q[i + 1][1]) / 4.0
			R.append(r)
		R.append(Q[Q.size() - 1])
		Q = R
		it += 1
	if cap != null:
		for i in Q.size():
			var dx: float = Q[i][0] - P[i][0]
			var dz: float = Q[i][1] - P[i][1]
			var d := sqrt(dx * dx + dz * dz)
			if d > cap:
				Q[i][0] = P[i][0] + dx * cap / d
				Q[i][1] = P[i][1] + dz * cap / d
	return Q


static func river(P: Array, o: Dictionary = {}) -> Array:
	var w: float = _opt(o, "width", 60.0)
	var M = null
	if o.get("meander") != false:
		M = {"amp": _clamp(w * 0.8, 10, 60), "wave": _clamp(w * 15, 1200, 2400),
			"seed": KRand.child(_opt(o, "seed", 0x5EED), "river:" + str(_opt(o, "name", ""))), "ox": _opt(o, "ox", 0.0), "oz": _opt(o, "oz", 0.0)}
	var Q := P
	if o.get("relax"):
		Q = _relax(_dedupe(P), o.relax, _opt(o, "cap", 400.0))
	return curve(Q, {"step": _opt(o, "step", 100.0), "meander": M})


static func line(P: Array, o: Dictionary = {}) -> Array:
	return curve(_relax(_dedupe(P), _opt(o, "relax", 2), null), {"step": _opt(o, "step", 250.0), "meander": o.get("meander")})
