# core/biome's fire model in GDScript: the twin of 38-core-fire.js (KFIRE; hyperjungle PLAN-LANDS.md section 11, H3).
# The same arithmetic in the JS file's order: the grids are float32 (PackedFloat32Array) where the JS's are Float32Array,
# the heap keys too, Math.round is floor(x + 0.5) (GDScript's round() differs on negative halves), and Math.hypot is V8's
# (the largest-magnitude scaling and Kahan sum below), so a history and a live fire come out as the page's. exp, pow, sin
# and cos are the platform's: kfire_test.gd checks golden-fire.json (written by core/biome/test-fire.js) cell for cell.
#
#   var h := KFire.history({height = Callable(x, z), burn = Callable(x, z), R, cell, seed, wind = [dx, dz], fires = [{ago, x, z,
#            frac, veer}], old, warp = "krand" | null | Callable(x, z) -> [wx, wz]})
#   h.age_at(x, z)  h.fire_at(x, z) -> {age, fire}  h.front_at(x, z)  h.shares()   h.last h.id h.front h.base h.H h.fires
#   var r := KFire.run(h, {x, z, wind, maxT, maxCells})   r.ok  r.arrive  r.order  r.at(x, z)  r.state(x, z, t)
#   KFire.fuel_k(a)  KFire.stages(a)  KFire.burn_k(rock, flow, wet, water, patch)  KFire.patch(x, z, seed)
extends RefCounted

const KRand := preload("../rand/krand.gd")
const NEVER := 60.0
const WK := 0.84
const FIRE_SEC := 1.6
const FLAME_H := 12.0
const D8 := [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]


static func clampf_(v: float, a: float, b: float) -> float:
	return a if v < a else (b if v > b else v)


static func smooth(a: float, b: float, x: float) -> float:
	var t := clampf_((x - a) / (b - a), 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)


static func jround(x: float) -> int:
	return floori(x + 0.5)


# V8's Math.hypot (builtins: the largest magnitude, then a Kahan sum of the scaled squares)
static func hypot(a: float, b: float) -> float:
	a = absf(a)
	b = absf(b)
	var m := maxf(a, b)
	if m == 0.0:
		return 0.0
	var s := 0.0
	var c := 0.0
	for x in [a, b]:
		var n: float = x / m
		var su: float = n * n - c
		var p: float = s + su
		c = (p - s) - su
		s = p
	return sqrt(s) * m


static func fuel_k(a: float) -> float:
	return smooth(1.1, 6.0, a) * (1.0 + 0.15 * smooth(10.0, 25.0, a))


static func stages(a: float) -> Dictionary:
	return {"char": smooth(0.75, 0.4, a), "bloom": smooth(0.3, 0.6, a) * smooth(2.9, 2.0, a),
		"regrow": smooth(2.0, 3.0, a) * smooth(8.0, 6.0, a), "mature": smooth(6.0, 8.5, a)}


static func burn_k(rock: float, flow: float, wet: float, water: bool, ptch: float) -> float:
	if water or rock > 0.8:
		return 0.0
	return pow(1.0 - rock, 2.0) * (1.0 - 0.72 * flow) * (1.0 - 0.7 * smooth(0.35, 0.8, wet)) * ptch


static func patch(x: float, z: float, sd: int = 521) -> float:
	return 0.5 + 0.9 * smooth(0.28, 0.72, KRand.fbm(x * 0.0042 + 7.0, z * 0.0042 - 3.0, 0.0, 2, sd))


static func _unit_dir(w, d: Array) -> Array:
	var x: float = w[0] if w != null else d[0]
	var z: float = w[1] if w != null else d[1]
	var l := hypot(x, z)
	if l == 0.0:
		l = 1.0
	return [x / l, z / l]


# a step's speed into cell n from cell k (the JS's expression, in its order)
static func _speed(fuel: float, H: PackedFloat32Array, n: int, k: int, d: Array, cs: float, w: Array) -> float:
	var L: float = cs * (1.4142 if d[0] != 0 and d[1] != 0 else 1.0)
	var dx: float = d[0] * cs / L
	var dz: float = d[1] * cs / L
	return fuel * pow(1.0 + WK * (dx * w[0] + dz * w[1]), 2.0) * exp(clampf_((H[n] - H[k]) / L * 3.0, -1.0, 1.2))


# a binary heap of cell indices keyed by float32 time (lazy deletion), the JS's push and pop
class Heap:
	var K := PackedFloat32Array()
	var V := PackedInt32Array()
	var n := 0
	var top_k := 0.0
	var top_v := 0

	func _init(cap: int) -> void:
		K.resize(cap)
		V.resize(cap)

	func push(k: float, v: int) -> void:
		var i := n
		n += 1
		while i > 0:
			var p := (i - 1) >> 1
			if K[p] <= k:
				break
			K[i] = K[p]
			V[i] = V[p]
			i = p
		K[i] = k
		V[i] = v

	func pop() -> void:
		top_k = K[0]
		top_v = V[0]
		n -= 1
		var k: float = K[n]
		var v: int = V[n]
		var i := 0
		while true:
			var c := 2 * i + 1
			if c >= n:
				break
			if c + 1 < n and K[c + 1] < K[c]:
				c += 1
			if K[c] >= k:
				break
			K[i] = K[c]
			V[i] = V[c]
			i = c
		K[i] = k
		V[i] = v


class History:
	var R: float
	var cs: float
	var N: int
	var x0: float
	var z0: float
	var H := PackedFloat32Array()
	var base := PackedFloat32Array()
	var last := PackedFloat32Array()
	var id := PackedInt32Array()
	var front := PackedFloat32Array()
	var fires: Array = []
	var inside := 0
	var wind: Array
	var seed: int
	var warp = null

	func cell_of(x: float, z: float) -> int:
		var p := [x, z]
		if warp is String:
			p = [x + cs * 1.1 * (KRand.fbm(x * 0.021 + 3.0, z * 0.021, 0.0, 2, seed ^ 532) - 0.5),
				z + cs * 1.1 * (KRand.fbm(x * 0.021, z * 0.021 - 5.0, 0.0, 2, seed ^ 533) - 0.5)]
		elif warp is Callable:
			p = warp.call(x, z)
		var ci := clampi(floori((p[0] - x0) / cs + 0.5), 0, N - 1)
		var cj := clampi(floori((p[1] - z0) / cs + 0.5), 0, N - 1)
		return cj * N + ci

	func age_at(x: float, z: float) -> float:
		return last[cell_of(x, z)]

	func fire_at(x: float, z: float) -> Dictionary:
		var c := cell_of(x, z)
		return {"age": last[c], "fire": id[c]}

	func front_at(x: float, z: float) -> float:
		return front[cell_of(x, z)]

	func shares() -> Dictionary:
		var S := {"char": 0, "bloom": 0, "regrow": 0, "mature": 0, "never": 0}
		var n := 0
		for c in N * N:
			if base[c] <= 0.0 and last[c] >= NEVER:
				continue
			n += 1
			var a: float = last[c]
			if a < 0.6:
				S.char += 1
			elif a < 2.5:
				S.bloom += 1
			elif a < 7.0:
				S.regrow += 1
			elif a < NEVER:
				S.mature += 1
			else:
				S.never += 1
		for s in S:
			S[s] = snappedf(float(S[s]) / maxf(1.0, n), 0.001)
		return S


static func history(o: Dictionary) -> History:
	var h := History.new()
	h.R = 2600.0 if o.get("R") == null else float(o.R)
	h.cs = 20.0 if o.get("cell") == null else float(o.cell)
	var R := h.R
	var cs := h.cs
	var N := ceili(2.0 * R / cs) + 1
	var NN := N * N
	h.N = N
	h.x0 = -R
	h.z0 = -R
	h.seed = 520031 if o.get("seed") == null else int(o.seed)
	var height: Callable = o.get("height", func(_x, _z): return 0.0)
	var burn: Callable = o.get("burn", func(_x, _z): return 1.0)
	h.H.resize(NN)
	h.base.resize(NN)
	h.last.resize(NN)
	h.last.fill(NEVER)
	h.id.resize(NN)
	h.id.fill(-1)
	h.front.resize(NN)
	h.front.fill(-1.0)
	for j in N:
		for i in N:
			var k := j * N + i
			var x := h.x0 + i * cs
			var z := h.z0 + j * cs
			h.H[k] = height.call(x, z)
			if hypot(x, z) > R * 1.02:
				continue
			h.inside += 1
			h.base[k] = burn.call(x, z)
	h.wind = _unit_dir(o.get("wind"), [-0.56, -0.83])
	var W0 := h.wind
	var fires: Array = []
	for f in o.get("fires", []):
		var g := {"veer": 0.0}
		g.merge(f, true)
		fires.append(g)
	var n_old: int = 8 if o.get("old") == null else int(o.old)
	var sd := h.seed
	for k in n_old:
		var fx := 0.0
		var fz := 0.0
		for t in 30:
			var a := TAU * KRand.unit(KRand.hash_ints(sd, [k, t, 1]))
			var dd := R * 0.88 * sqrt(KRand.unit(KRand.hash_ints(sd, [k, t, 2])))
			fx = cos(a) * dd
			fz = sin(a) * dd
			var ii := jround((fx - h.x0) / cs)
			var jj := jround((fz - h.z0) / cs)
			if h.base[jj * N + ii] > 0.45:
				break
		var lt := float(k) / (n_old - 1) if n_old > 1 else 0.0
		fires.append({"ago": (7.0 + (45.0 - 7.0) * lt) * (0.88 + 0.24 * KRand.unit(KRand.hash_ints(sd, [k, -1, 3]))), "x": fx, "z": fz,
			"frac": 0.05 + 0.06 * KRand.unit(KRand.hash_ints(sd, [k, -1, 4])), "veer": -0.35 + 0.7 * KRand.unit(KRand.hash_ints(sd, [k, -1, 5]))})
	fires.sort_custom(func(a, b): return a.ago > b.ago)
	var T := PackedFloat32Array()
	T.resize(NN)
	var heap := Heap.new(NN * 8)
	for fi in fires.size():
		var f: Dictionary = fires[fi]
		# the ignition: the nearest cell that will burn, spiralling out from the asked point
		var ci := jround((f.x - h.x0) / cs)
		var cj := jround((f.z - h.z0) / cs)
		var found := -1
		for r in 40:
			if found >= 0:
				break
			for dj in range(-r, r + 1):
				if found >= 0:
					break
				for di in range(-r, r + 1):
					if maxi(absi(di), absi(dj)) != r:
						continue
					var i2 := ci + di
					var j2 := cj + dj
					if i2 < 0 or j2 < 0 or i2 >= N or j2 >= N:
						continue
					var k2 := j2 * N + i2
					if h.base[k2] * fuel_k(h.last[k2] - f.ago) > 0.25:
						found = k2
						break
		f.cells = 0
		if found < 0:
			f.failed = true
			continue
		var ca := cos(f.veer)
		var sa := sin(f.veer)
		var w := [W0[0] * ca - W0[1] * sa, W0[0] * sa + W0[1] * ca]
		var target := maxi(20, jround(f.frac * h.inside))
		var newest := fi == fires.size() - 1
		var order := PackedInt32Array()
		T.fill(INF)
		heap.n = 0
		T[found] = 0.0
		heap.push(0.0, found)
		while heap.n > 0 and f.cells < target:
			heap.pop()
			var kk := heap.top_v
			var tt := heap.top_k
			if tt > T[kk]:
				continue
			if h.id[kk] == fi:
				continue
			h.id[kk] = fi
			h.last[kk] = f.ago
			f.cells += 1
			if newest:
				order.append(kk)
			var i3 := kk % N
			var j3 := (kk - i3) / N
			for d in D8:
				var ni: int = i3 + d[0]
				var nj: int = j3 + d[1]
				if ni < 0 or nj < 0 or ni >= N or nj >= N:
					continue
				var n := nj * N + ni
				if h.id[n] == fi:
					continue
				var s := _speed(h.base[n] * fuel_k(h.last[n] - f.ago), h.H, n, kk, d, cs, w)
				if s < 0.02:
					continue
				var tn := tt + cs * (1.4142 if d[0] != 0 and d[1] != 0 else 1.0) / s
				if tn < T[n]:
					T[n] = tn
					heap.push(tn, n)
		if newest:
			for rk in order.size():
				h.front[order[rk]] = float(rk) / maxf(1.0, order.size() - 1)
		f.ix = found % N
		f.iz = (found - f.ix) / N
		f.x = h.x0 + f.ix * cs
		f.z = h.z0 + f.iz * cs
	h.fires = fires
	h.warp = "krand" if not o.has("warp") else o.warp
	return h


class Run:
	var ok := false
	var N: int
	var cs: float
	var x0: float
	var z0: float
	var x: float
	var z: float
	var arrive := PackedFloat32Array()
	var order := PackedInt32Array()
	var wind: Array

	func _near(px: float, pz: float) -> int:
		return clampi(floori((pz - z0) / cs + 0.5), 0, N - 1) * N + clampi(floori((px - x0) / cs + 0.5), 0, N - 1)

	func at(px: float, pz: float) -> float:
		return arrive[_near(px, pz)]

	func state(px: float, pz: float, t: float) -> String:
		var A: float = arrive[_near(px, pz)]
		if not (A < INF) or t < A:
			return "unburnt"
		return "burning" if t < A + 30.0 else ("smouldering" if t < A + 400.0 else "burnt")


static func run(HI: History, o: Dictionary) -> Run:
	var r := Run.new()
	var N := HI.N
	var cs := HI.cs
	var NN := N * N
	r.N = N
	r.cs = cs
	r.x0 = HI.x0
	r.z0 = HI.z0
	var w := _unit_dir(o.get("wind", HI.wind), HI.wind)
	r.wind = w
	var max_t: float = (1800.0 if o.get("maxT") == null else float(o.maxT)) / FIRE_SEC
	var max_cells: int = jround(NN * 0.15) if o.get("maxCells") == null else int(o.maxCells)
	var ci := jround((float(o.x) - HI.x0) / cs)
	var cj := jround((float(o.z) - HI.z0) / cs)
	var found := -1
	for rr in 3:
		if found >= 0:
			break
		for dj in range(-rr, rr + 1):
			if found >= 0:
				break
			for di in range(-rr, rr + 1):
				if maxi(absi(di), absi(dj)) != rr:
					continue
				var i := ci + di
				var j := cj + dj
				if i < 0 or j < 0 or i >= N or j >= N:
					continue
				var k := j * N + i
				if HI.base[k] * fuel_k(HI.last[k]) > 0.2:
					found = k
					break
	if found < 0:
		return r
	var T := PackedFloat32Array()
	T.resize(NN)
	T.fill(INF)
	var done := PackedByteArray()
	done.resize(NN)
	var heap := Heap.new(NN * 8)
	T[found] = 0.0
	heap.push(0.0, found)
	while heap.n > 0 and r.order.size() < max_cells:
		heap.pop()
		var kk := heap.top_v
		var t := heap.top_k
		if t > T[kk] or done[kk] != 0:
			continue
		if t > max_t:
			break
		done[kk] = 1
		r.order.append(kk)
		var i3 := kk % N
		var j3 := (kk - i3) / N
		for d in D8:
			var ni: int = i3 + d[0]
			var nj: int = j3 + d[1]
			if ni < 0 or nj < 0 or ni >= N or nj >= N:
				continue
			var n := nj * N + ni
			if done[n] != 0:
				continue
			var sp := _speed(HI.base[n] * fuel_k(HI.last[n]), HI.H, n, kk, d, cs, w)
			if sp < 0.02:
				continue
			var tn := t + cs * (1.4142 if d[0] != 0 and d[1] != 0 else 1.0) / sp
			if tn < T[n]:
				T[n] = tn
				heap.push(tn, n)
	r.arrive.resize(NN)
	r.arrive.fill(INF)
	for k in r.order:
		r.arrive[k] = T[k] * FIRE_SEC
	r.ok = true
	var fi := found % N
	r.x = HI.x0 + fi * cs
	r.z = HI.z0 + ((found - fi) / N) * cs
	return r
