# core/world small streams in GDScript: the twin of 44-world-streams.js (core/world/PLAN-RELIEF.md P3, P7, P13; P15). The
# trace (priority-flood, D8, the incision, the convergence rule, the depressions and their tarns), the encoded lines'
# decode and rebed, the fans; in the JS file's order of operations. The JS file's Float32Arrays (the rain's accumulation,
# a region's E, RW, RM) are PackedFloat32Array here, so each sum rounds as it does there. Checked against
# core/world/golden-relief.json by wrelief_test.gd, to 1e-6 (strings exactly).
#
#   WStreams.trace(o) -> {lines, cells, heads, kept, pits, ponds, F, A}   o as WSTREAMS.trace's (E, K, RW, RM: arrays)
#   WStreams.decode(L, S) -> [[x, z, s, bed]...]     WStreams.rebed(L, B)     WStreams.pond_rows(P)
#   WStreams.fans(lines, o) -> [{x, z, ux, uz, R, H, s}]     WStreams.fan_at(F, x, z)     WStreams.check(lines)
extends RefCounted

const WSmooth := preload("wsmooth.gd")

const N8 := [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]
const EPS := 1e-3
const LN10 := 2.302585092994046
static var D8 := PackedFloat64Array([sqrt(2.0), 1.0, sqrt(2.0), 1.0, 1.0, sqrt(2.0), 1.0, sqrt(2.0)])


# JS's Math.round: half up, toward +infinity
static func jround(v: float) -> float:
	return floorf(v + 0.5)


# V8's Math.hypot (the max-scaled, compensated sum), so a port gives the same last bits
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
		var sm := n * n - comp
		var pre := s + sm
		comp = (pre - s) - sm
		s = pre
	return sqrt(s) * m


static func _opt(o: Dictionary, k: String, d):
	var v = o.get(k)
	return d if v == null else v


# a binary min-heap of cells on (key, index), so equal keys pop in index order
class Heap:
	var K := PackedFloat64Array()
	var V := PackedInt32Array()
	var m := 0

	func _init(n: int) -> void:
		K.resize(n)
		V.resize(n)

	func size() -> int:
		return m

	func _less(a: int, b: int) -> bool:
		return K[a] < K[b] or (K[a] == K[b] and V[a] < V[b])

	func _sw(a: int, b: int) -> void:
		var k := K[a]
		K[a] = K[b]
		K[b] = k
		var v := V[a]
		V[a] = V[b]
		V[b] = v

	func push(k: float, v: int) -> void:
		var i := m
		m += 1
		K[i] = k
		V[i] = v
		while i > 0:
			var p := (i - 1) >> 1
			if not _less(i, p):
				break
			_sw(i, p)
			i = p

	func pop() -> int:
		var v := V[0]
		m -= 1
		if m > 0:
			K[0] = K[m]
			V[0] = V[m]
			var i := 0
			while true:
				var l := 2 * i + 1
				var r := l + 1
				var s := i
				if l < m and _less(l, s):
					s = l
				if r < m and _less(r, s):
					s = r
				if s == i:
					break
				_sw(i, s)
				i = s
		return v


# one routing of surface E: the fill F, the order, D8 (rec, dir) and the accumulations
static func _route(E, K, nx: int, ny: int, RW, RM) -> Dictionary:
	var n := nx * ny
	var F := PackedFloat64Array()
	F.resize(n)
	var done := PackedByteArray()
	done.resize(n)
	var order := PackedInt32Array()
	order.resize(n)
	var hp := Heap.new(n)
	var no := 0
	for j in ny:
		for i in nx:
			var c := j * nx + i
			F[c] = E[c]
			if K[c] or i == 0 or j == 0 or i == nx - 1 or j == ny - 1:
				done[c] = 1
				hp.push(F[c], c)
	while hp.size():
		var c := hp.pop()
		var i := c % nx
		var j := (c - i) / nx
		order[no] = c
		no += 1
		for k in 8:
			var a: int = i + N8[k][0]
			var b: int = j + N8[k][1]
			if a < 0 or b < 0 or a >= nx or b >= ny:
				continue
			var q := b * nx + a
			if done[q]:
				continue
			done[q] = 1
			var f := F[c] + EPS * D8[k]
			if F[q] < f:
				F[q] = f
			hp.push(F[q], q)
	var rec := PackedInt32Array()
	rec.resize(n)
	rec.fill(-1)
	var dir := PackedInt32Array()
	dir.resize(n)
	dir.fill(-1)
	for j in range(1, ny - 1):
		for i in range(1, nx - 1):
			var c := j * nx + i
			if K[c]:
				continue
			var best := 0.0
			var bq := -1
			var bk := -1
			for k in 8:
				var q: int = (j + N8[k][1]) * nx + i + N8[k][0]
				var s := (F[c] - F[q]) / D8[k]
				if s > best:
					best = s
					bq = q
					bk = k
			rec[c] = bq
			dir[c] = bk
	var A := PackedFloat64Array()
	A.resize(n)
	var RA := PackedFloat32Array()
	RA.resize(n)
	var AA := PackedFloat32Array()
	AA.resize(n)
	for c in n:
		A[c] = 0.0 if K[c] else float(RW[c])
		RA[c] = 0.0 if K[c] else float(RM[c])
		AA[c] = 0.0 if K[c] else 1.0
	for t in range(no - 1, -1, -1):
		var c := order[t]
		var r := rec[c]
		if r >= 0:
			A[r] += A[c]
			RA[r] += RA[c]
			AA[r] += AA[c]
	return {"F": F, "order": order, "rec": rec, "dir": dir, "A": A, "RA": RA, "AA": AA}


static func trace(o: Dictionary) -> Dictionary:
	var nx: int = o.nx
	var ny: int = o.ny
	var n := nx * ny
	var E = o.E
	var K = o.K
	var cell: float = o.cell
	var amin: float = o.amin
	var chanMin: float = _opt(o, "chanMin", amin * 30)
	var wetMM: float = _opt(o, "wetMM", 450.0)
	var minLen: float = _opt(o, "minLen", 1000.0)
	var R := _route(E, K, nx, ny, o.RW, o.RM)
	var F0: PackedFloat64Array = R.F
	var inc = o.get("incise")
	if inc and float(inc.get("k", 0)) > 0:
		for it in int(_opt(inc, "iters", 2)):
			var L := PackedFloat64Array()
			L.resize(n)
			var RA0: PackedFloat64Array = R.A
			for c in n:
				L[c] = 0.0 if K[c] else log(1 + RA0[c] / amin) / LN10
			var G := WSmooth.gauss(L, nx, ny, _opt(inc, "sigma", 1.5))
			var E2 := PackedFloat64Array()
			E2.resize(n)
			for c in n:
				E2[c] = E[c] - inc.k * G[c]
			R = _route(E2, K, nx, ny, o.RW, o.RM)
	var rec: PackedInt32Array = R.rec
	var dir: PackedInt32Array = R.dir
	var A: PackedFloat64Array = R.A
	var RA: PackedFloat32Array = R.RA
	var AA: PackedFloat32Array = R.AA
	var F: PackedFloat64Array = R.F
	var isS := PackedByteArray()
	isS.resize(n)
	var donors := PackedInt32Array()
	donors.resize(n)
	var cv: float = _opt(o, "converge", 2.0)
	var pitD: float = _opt(o, "pit", 1.5)
	var PT := PackedByteArray()
	PT.resize(n)
	var cells := 0
	for c in n:
		if not K[c] and F0[c] - E[c] > pitD:
			PT[c] = 1
	for j in range(1, ny - 1):
		for i in range(1, nx - 1):
			var c := j * nx + i
			if K[c] or PT[c] or rec[c] < 0 or A[c] < amin or isS[c]:
				continue
			var lat := 0.0
			var out := false
			for k in 8:
				var q: int = (j + N8[k][1]) * nx + i + N8[k][0]
				if rec[q] == c and PT[q]:
					out = true
				if q == rec[c] or rec[q] == c:
					continue
				if A[q] > lat:
					lat = A[q]
			if not out and cv > 0 and A[c] < cv * lat:
				continue
			var q := c
			while q >= 0 and not K[q] and not PT[q] and rec[q] >= 0 and not isS[q]:
				isS[q] = 1
				cells += 1
				q = rec[q]
	for c in n:
		if isS[c] and isS[rec[c]]:
			donors[rec[c]] += 1
	var heads := []
	for c in n:
		if isS[c] and not donors[c]:
			heads.append(c)
	heads.sort_custom(func(a, b): return F[a] > F[b] or (F[a] == F[b] and a < b))
	var lg := log(chanMin / amin)
	var owner := PackedInt32Array()
	owner.resize(n)
	owner.fill(-1)
	var raw := []
	for h in heads:
		var L := {"cells": [h], "end": "x", "to": -1, "len": 0.0, "id": raw.size()}
		var c: int = h
		owner[c] = L.id
		while true:
			var r := rec[c]
			L.len += D8[dir[c]] * cell
			L.cells.append(r)
			if K[r] == 1:
				L.end = "w"
				break
			if K[r] == 2:
				L.end = "c"
				break
			if PT[r]:
				L.end = "p"
				break
			if K[r] == 3 or not isS[r]:
				L.end = "x"
				break
			if owner[r] >= 0:
				L.end = "j"
				L.to = owner[r]
				break
			owner[r] = L.id
			c = r
		raw.append(L)
	var joined := PackedInt32Array()
	joined.resize(raw.size())
	var keep := PackedByteArray()
	keep.resize(raw.size())
	for t in range(raw.size() - 1, -1, -1):
		var L: Dictionary = raw[t]
		if L.len < minLen and not joined[t]:
			continue
		keep[t] = 1
		if L.to >= 0:
			joined[L.to] += 1
	var lines := []
	for t in raw.size():
		if not keep[t]:
			continue
		var L: Dictionary = raw[t]
		var C: Array = L.cells
		var h: int = C[0]
		var d := ""
		var s := ""
		var b0 := int(jround(F0[h] * 10))
		var q := b0
		var db := PackedStringArray()
		for k in C.size():
			var c: int = C[k]
			var sc: int = c if k < C.size() - 1 else C[k - 1]
			var sv := log(maxf(A[sc], amin) / amin) / lg
			if sv > 1:
				sv = 1.0
			s += String.chr(97 + int(jround(sv * 25)))
			if k:
				d += str(dir[C[k - 1]])
				var v := mini(q, int(jround(F0[c] * 10)))
				db.append(str(q - v))
				q = v
		var m: int = C[C.size() - 2]
		lines.append({"h": [h % nx, (h - h % nx) / nx], "d": d, "b": b0, "db": ",".join(db), "s": s,
			"w": 1 if float(RA[m]) / float(AA[m]) >= wetMM else 0, "e": L.end})
	# THE TARNS
	var ponds := []
	var seen := PackedByteArray()
	seen.resize(n)
	var pd: float = _opt(o, "pondDepth", 2.0)
	var pc: int = _opt(o, "pondCells", 2)
	var RM = o.RM
	for c0 in n:
		if not PT[c0] or seen[c0]:
			continue
		var Q := [c0]
		seen[c0] = 1
		var lvl := -1e9
		var lo := c0
		var rs := 0.0
		var qi := 0
		while qi < Q.size():
			var c: int = Q[qi]
			qi += 1
			var i := c % nx
			var j := (c - i) / nx
			if F0[c] > lvl:
				lvl = F0[c]
			if E[c] < E[lo]:
				lo = c
			rs += RM[c]
			for k in 8:
				var a: int = i + N8[k][0]
				var b: int = j + N8[k][1]
				if a < 0 or b < 0 or a >= nx or b >= ny:
					continue
				var r := b * nx + a
				if PT[r] and not seen[r]:
					seen[r] = 1
					Q.append(r)
		var depth: float = lvl - E[lo]
		if Q.size() < pc or depth < pd or rs / Q.size() < wetMM:
			continue
		var Rw := {}
		for c in Q:
			var i: int = c % nx
			var j: int = (c - i) / nx
			for b in range(-1, 2):
				var jj := j + b
				if jj < 0 or jj >= ny:
					continue
				if not Rw.has(jj):
					Rw[jj] = [1e9, -1e9]
				var e: Array = Rw[jj]
				e[0] = minf(e[0], maxi(0, i - 1))
				e[1] = maxf(e[1], mini(nx - 1, i + 1))
		var ks := Rw.keys()
		ks.sort()
		var parts := PackedStringArray()
		for jj in ks:
			parts.append(str(jj) + ":" + str(int(Rw[jj][0])) + "-" + str(int(Rw[jj][1])))
		ponds.append({"c": [lo % nx, (lo - lo % nx) / nx], "l": int(jround((lvl - 0.3) * 10)), "d": int(jround(depth * 10)), "r": ";".join(parts)})
	var pits := 0
	for c in n:
		pits += PT[c]
	return {"lines": lines, "cells": cells, "heads": heads.size(), "kept": lines.size(), "pits": pits, "ponds": ponds, "F": F, "A": A}


static func pond_rows(P: Dictionary) -> Array:
	var out := []
	for t in String(P.r).split(";"):
		var a := t.split(":")
		var b := a[1].split("-")
		out.append([int(a[0]), int(b[0]), int(b[1])])
	return out


static func rebed(L: Dictionary, B: Array) -> Dictionary:
	var q := int(jround(B[0] * 10))
	var db := PackedStringArray()
	L.b = q
	for k in range(1, B.size()):
		var v := mini(q, int(jround(B[k] * 10)))
		db.append(str(q - v))
		q = v
	L.db = ",".join(db)
	return L


static func decode(L: Dictionary, S: Dictionary) -> Array:
	var cell: float = S.cell
	var P := []
	var db := String(L.db).split(",")
	var i: int = int(L.h[0])
	var j: int = int(L.h[1])
	var b: int = int(L.b)
	var s: String = L.s
	var d: String = L.d
	for k in s.length():
		if k:
			var g: Array = N8[int(d[k - 1])]
			i += g[0]
			j += g[1]
			b -= int(db[k - 1])
		P.append([float(S.x0) + i * cell, float(S.z0) + j * cell, float(s.unicode_at(k) - 97) / 25.0, b / 10.0])
	return P


static func _sm(a: float, b: float, v: float) -> float:
	var t := (v - a) / (b - a)
	t = 0.0 if t < 0 else (1.0 if t > 1 else t)
	return t * t * (3 - 2 * t)


# THE FANS (relief P13): lines [{pts: [[x, z, s, bed]...]}]
static func fans(lines: Array, o: Dictionary = {}) -> Array:
	var STEEP: float = _opt(o, "steep", 0.06)
	var FLAT: float = _opt(o, "flat", 0.02)
	var W: float = _opt(o, "window", 300.0)
	var out := []
	for L in lines:
		var P: Array = L.pts
		if P.size() < 4:
			continue
		var arc := [0.0]
		for i in range(1, P.size()):
			arc.append(arc[i - 1] + hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]))
		var best = null
		var a := 0
		var b := 0
		for i in range(1, P.size() - 1):
			while arc[i] - arc[a] > W:
				a += 1
			while b < P.size() - 1 and arc[b] - arc[i] < W:
				b += 1
			if arc[i] - arc[a] < W * 0.8 or arc[b] - arc[i] < W * 0.8:
				continue
			var up: float = (P[a][3] - P[i][3]) / (arc[i] - arc[a])
			var dn: float = (P[i][3] - P[b][3]) / (arc[b] - arc[i])
			if up >= STEEP and dn <= FLAT and (best == null or up - dn > best.k):
				best = {"i": i, "k": up - dn}
		if best == null:
			continue
		var p: Array = P[best.i]
		var q: Array = P[mini(P.size() - 1, best.i + 3)]
		var l := maxf(1e-6, hypot(q[0] - p[0], q[1] - p[1]))
		var R: float = 150 + 450 * p[2]
		out.append({"x": p[0], "z": p[1], "ux": (q[0] - p[0]) / l, "uz": (q[1] - p[1]) / l, "R": R, "H": 0.015 * R, "s": p[2]})
	return out


static func fan_at(F: Dictionary, x: float, z: float) -> float:
	var dx: float = x - F.x
	var dz: float = z - F.z
	var r := sqrt(dx * dx + dz * dz)
	if r >= F.R:
		return 0.0
	var c: float = (dx * F.ux + dz * F.uz) / r if r > 1e-6 else 1.0
	var q: float = 1 - r / F.R
	return F.H * q * q * _sm(0, 0.15 * F.R, r) * _sm(0, 0.5, c)


static func check(lines: Array) -> Array:
	var out := []
	for n in lines.size():
		var P: Array = lines[n]
		if P.size() < 2:
			out.append("stream " + str(n) + ": under two vertices")
			continue
		for k in range(1, P.size()):
			if P[k][3] > P[k - 1][3] + 1e-6:
				out.append("stream " + str(n) + ": its bed rises at vertex " + str(k) + " (" + str(P[k - 1][3]) + " to " + str(P[k][3]) + " m)")
				break
	return out
