# core/world relief in GDScript: the twin of 43-world-relief.js (core/world/PLAN-RELIEF.md P15). The caprock, the benches,
# the erosion filter and the peaks, in the JS file's order of operations, on core/rand's krand.gd. Checked against
# core/world/golden-relief.json (P9) by wrelief_test.gd, to 1e-6.
#
#   WRelief.init(ox, oz, seed)                        the region's frame (metres of its origin from the model's) and seed
#   WRelief.caprock(x, z, S, rel) -> 0..1             S: a Dictionary of the style blend (terr, step, gully, peak)
#   WRelief.bench(h, x, z, S, rel, min_wave) -> h
#   WRelief.erode(h, x, z, gx, gz, S, rel, min_wave) -> h
#   WRelief.peaks(h, x, z, S, rel, pk, min_wave) -> h
# JS's `a ^ b` on the seeds is a 32-bit XOR; here every seed is masked to 32 bits (krand.gd keeps u32 bits), so the same
# hashes come out.
extends RefCounted

const KRand := preload("../rand/krand.gd")
const M32 := 0xFFFFFFFF

static var OX := 0.0
static var OZ := 0.0
static var SEED := 0x52454C


static func init(ox: float, oz: float, sd: int) -> void:
	OX = ox
	OZ = oz
	SEED = sd & M32


static func _clamp(v: float, a: float, b: float) -> float:
	return a if v < a else (b if v > b else v)


static func _smooth(a: float, b: float, x: float) -> float:
	var t := (x - a) / (b - a)
	t = 0.0 if t < 0.0 else (1.0 if t > 1.0 else t)
	return t * t * (3.0 - 2.0 * t)


static func _sx(k: int) -> int:
	return (SEED ^ k) & M32


static func _vn(x: float, z: float, s: int) -> float:
	return KRand.vnoise(x, z, 0.5, s & M32)


static func _fbm(x: float, z: float, o: int, s: int) -> float:
	var a := 0.0
	var f := 1.0
	var w := 0.0
	var t := 1.0
	for i in o:
		a += _vn(x * f, z * f, s + i) * t
		w += t
		t *= 0.5
		f *= 2.03
	return a / w


# ---------------------------------------------------------------- S2: caprock benches
static func caprock(x: float, z: float, S: Dictionary, rel: float) -> float:
	var terr: float = S.get("terr", 0.0)
	if not (terr > 0.01):
		return 0.0
	var band := _smooth(40.0, 250.0, rel) * _smooth(4200.0, 1800.0, rel)
	if band <= 0.0:
		return 0.0
	return terr * band * _smooth(0.53, 0.6, _fbm((x + OX) / 16000.0, (z + OZ) / 16000.0, 3, _sx(0x4341)))


const HARD := 0.4
const RISER := 0.2
const JIT := 0.35


static func _bed_base(k: int, s: int) -> float:
	return float(k) + JIT * (KRand.unit(KRand.hash_ints(s, [k, 0x42])) - 0.5)


static func bench(h: float, x: float, z: float, S: Dictionary, rel: float, min_wave: float) -> float:
	if min_wave >= 600.0:
		return h
	var cw := caprock(x, z, S, rel)
	if cw < 0.01:
		return h
	var ax := x + OX
	var az := z + OZ
	var step: float = S.get("step", 40.0) * (0.75 + 0.5 * _vn(ax / 9000.0, az / 9000.0, _sx(0x5354)))
	var hs := h + 400.0 * (_fbm(ax / 30000.0, az / 30000.0, 2, _sx(0x4458)) - 0.5) + (_fbm(ax / 6000.0, az / 6000.0, 2, _sx(0x5741)) - 0.5) * 0.6 * step
	var t := hs / step
	var s := _sx(0x4245)
	var k := floori(t)
	if t < _bed_base(k, s):
		k -= 1
	elif t >= _bed_base(k + 1, s):
		k += 1
	var b0 := _bed_base(k, s)
	var b1 := _bed_base(k + 1, s)
	if not (KRand.unit(KRand.hash_ints(s, [k, 0x48])) < HARD):
		return h
	var f := (t - b0) / (b1 - b0)
	var g := 0.0 if f < 1.0 - RISER else _smooth(1.0 - RISER, 1.0, f)
	var off := (b0 + g * (b1 - b0) - t) * step
	return h + cw * off


# ---------------------------------------------------------------- S3: the erosion filter
const OCT := [[900.0, 1.0], [420.0, 1.0], [200.0, 1.0]]
const DEPTH := 0.18


static func _cos_pi_w(w: float) -> float:
	var v := w * w
	return 1.0 - v * (4.934802200544679 - v * (4.058712126416768 - v * (1.335262768854589 - v * (0.2353306303588932 - v * (0.02580689139001406 - v * (0.0019295743094039 - v * 0.0001046381049248))))))


static func cos2pi(u: float) -> float:
	var x := u - floorf(u) - 0.5
	return -_cos_pi_w(2.0 * x)


static func sin2pi(u: float) -> float:
	return cos2pi(u - 0.25)


static func erode(h: float, x: float, z: float, gx: float, gz: float, S: Dictionary, rel: float, min_wave: float) -> float:
	var gs: float = S.get("gully", 0.6)
	if not (gs > 0.01):
		return h
	var sl0 := minf(0.6, sqrt(gx * gx + gz * gz))
	var dep := gs * DEPTH * sl0 * (1.0 + _clamp(rel / 2000.0, 0.0, 0.5))
	var ax := x + OX
	var az := z + OZ
	var Gx := gx
	var Gz := gz
	var out := h
	for o in OCT.size():
		var lam: float = OCT[o][0]
		if min_wave >= lam * 0.5:
			break
		var sl := sqrt(Gx * Gx + Gz * Gz)
		var fade := _smooth(0.02, 0.1, sl)
		if fade <= 0.0:
			break
		var nx := -Gz / sl
		var nz := Gx / sl
		var ci := floori(ax / lam)
		var cj := floori(az / lam)
		var vx := 0.0
		var vy := 0.0
		var W := 0.0
		for dj in range(-1, 2):
			for di in range(-1, 2):
				var i := ci + di
				var j := cj + dj
				var hh := KRand.hash_ints(_sx(0x4552), [o, i, j])
				var px := (float(i) + KRand.unit(hh)) * lam
				var pz := (float(j) + KRand.unit(KRand.mix32(hh ^ 0x9E3779B9))) * lam
				var dx := (ax - px) / lam
				var dz := (az - pz) / lam
				var d2 := dx * dx + dz * dz
				if d2 >= 1.0:
					continue
				var w := (1.0 - d2) * (1.0 - d2)
				var s := ((ax - px) * nx + (az - pz) * nz) / lam
				vx += w * cos2pi(s)
				vy += w * sin2pi(s)
				W += w
		if not (W > 0.0):
			continue
		var m := sqrt(vx * vx + vy * vy) + 0.15 * W
		var t := vx / m
		var sn := vy / m
		var gul := (1.0 - t) * 0.5
		var a: float = dep * lam * OCT[o][1] * fade
		out -= a * (gul * gul - 0.35)
		var kk := -a * gul * sn * 6.283185307179586 / lam
		Gx += kk * nx
		Gz += kk * nz
	return out


# ---------------------------------------------------------------- S4: peaks
const POCT := [1300.0, 650.0, 325.0, 162.0]
const PMEAN := 0.56


static func peaks(h: float, x: float, z: float, S: Dictionary, rel: float, pk: float, min_wave: float) -> float:
	var w: float = S.get("peak", 0.0) * pk
	if not (w > 0.01):
		return h
	var amp := w * _clamp(rel * 0.18, 0.0, 300.0)
	if amp < 1.0:
		return h
	var X := x + OX
	var Z := z + OZ
	var wx := (_fbm(X / 2600.0, Z / 2600.0, 2, _sx(0x5045)) - 0.5) * 700.0
	var wz := (_fbm(X / 2600.0 + 19.3, Z / 2600.0 - 7.1, 2, _sx(0x5046)) - 0.5) * 700.0
	var sum := 0.0
	var norm := 0.0
	var wt := 1.0
	var a := 1.0
	for o in POCT.size():
		norm += a
		if POCT[o] < min_wave:
			a *= 0.5
			continue
		var n := _vn((X + wx) / POCT[o], (Z + wz) / POCT[o], _sx(0x5050 + o))
		var r := 1.0 - absf(2.0 * n - 1.0)
		r *= r
		r *= wt
		sum += r * a
		wt = _clamp(r * 2.0, 0.0, 1.0)
		a *= 0.5
	return h + amp * 2.0 * (sum / norm - PMEAN)
