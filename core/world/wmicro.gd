# core/world micro-relief in GDScript: the twin of 43m-world-micro.js (core/world/PLAN-MICRO.md). The hills (gradient
# noise, two octaves, standing on a floor that drains), the drainage (the erosion filter in six octaves, 800 m to 25 m, flat floors, faded by kernel
# coverage) and the grain (by the slope, stretched down it); in the JS file's order of operations, on core/rand's
# krand.gd (gnoise, gfbm) and wrelief.gd's polynomial cos2pi and sin2pi. Checked against core/world/golden-relief.json
# (mhills, merode, mgrain) by wrelief_test.gd, to 1e-6.
#
#   WMicro.init(ox, oz, seed, version = 1)   (2: T0, PLAN-MICRO.md: the masked target mean-compensated, the kernel covering everywhere)
#   WMicro.amount(x, z, S, rel) / WMicro.hills(x, z, S, rel, min_wave) -> m
#   WMicro.erode(h, x, z, gx, gz, S, rel, min_wave, G = []) -> h      (G, if two long, gets the slope it leaves)
#   WMicro.grain(x, z, sl, gx, gz, S, min_wave) -> m
extends RefCounted

const KRand := preload("../rand/krand.gd")
const WRelief := preload("wrelief.gd")
const M32 := 0xFFFFFFFF
const HW := 1600.0
const HK := 2.6
const OCT := [800.0, 400.0, 200.0, 100.0, 50.0, 25.0]
const GAIN := 0.8
const DEPTH := 0.55
const T0 := 0.15
const KN := 0.06
const SLCAP := 0.6
const DETAIL := 1.5
const YMEAN := -0.3
const FINE := 200.0

static var OX := 0.0
static var OZ := 0.0
static var SEED := 0x4D4943
static var V2 := false


static func init(ox: float, oz: float, sd: int, version: int = 1) -> void:
	OX = ox
	OZ = oz
	SEED = sd & M32
	V2 = version == 2


static func _clamp(v: float, a: float, b: float) -> float:
	return a if v < a else (b if v > b else v)


static func _smooth(a: float, b: float, v: float) -> float:
	var t := (v - a) / (b - a)
	t = 0.0 if t < 0 else (1.0 if t > 1 else t)
	return t * t * (3 - 2 * t)


# max(0, y), its corner rounded over +-KN: the hills stand on a floor that drains
static func _knee(y: float) -> float:
	if y >= KN:
		return y
	if y <= -KN:
		return 0.0
	return (y + KN) * (y + KN) / (4 * KN)


static func amount(x: float, z: float, S: Dictionary, rel: float) -> float:
	var hl: float = S.get("hill", 0.0)
	if not (hl > 0.01):
		return 0.0
	var ax := x + OX
	var az := z + OZ
	var v := 0.55 + 1.0 * _smooth(-0.45, 0.55, KRand.gfbm(ax / 9000, az / 9000, 2, (SEED ^ 0x4157) & M32))
	return hl * v * (0.7 + 0.3 * _smooth(60, 900, rel))


static func hills(x: float, z: float, S: Dictionary, rel: float, min_wave = null) -> float:
	if min_wave != null and min_wave >= HW * 0.6:
		return 0.0
	var A := amount(x, z, S, rel)
	if not (A > 0.01):
		return 0.0
	var ax := x + OX
	var az := z + OZ
	var o := 1 if min_wave != null and min_wave >= HW * 0.3 else 2
	return A * HK * _knee(KRand.gfbm(ax / HW, az / HW, o, (SEED ^ 0x4849) & M32) - T0)


static func erode(h: float, x: float, z: float, gx: float, gz: float, S: Dictionary, rel: float, min_wave = null, G: Array = [], fine: float = 1.0) -> float:
	var g: float = S.get("gully", 0.6)
	if not (g > 0.01):
		if G.size() >= 2:
			G[0] = gx
			G[1] = gz
		if G.size() >= 3:
			G[2] = 0.0
		return h
	var sl0 := minf(SLCAP, sqrt(gx * gx + gz * gz))
	var dep := minf(0.75, DEPTH * g) * sl0 * (1 + _clamp(rel / 2000, 0, 0.5))
	var ax := x + OX
	var az := z + OZ
	var Gx := gx
	var Gz := gz
	var out := h
	var cr := 0.0
	var cw := 0.0
	var tgt := 0.0
	var mask := 1.0
	for o in OCT.size():
		var lam: float = OCT[o]
		if min_wave != null and min_wave >= lam * 0.5:
			break
		var sl := sqrt(Gx * Gx + Gz * Gz)
		var fade := _smooth(0.0005, 0.012, sl)
		if fade <= 0:
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
				var hh := KRand.hash_ints((SEED ^ 0x4D45) & M32, [o, i, j])
				var ju := KRand.unit(hh)
				var jv := KRand.unit(KRand.mix32(hh ^ 0x9E3779B9))
				if V2:
					ju = 0.25 + 0.5 * ju
					jv = 0.25 + 0.5 * jv
				var px := (float(i) + ju) * lam
				var pz := (float(j) + jv) * lam
				var dx := (ax - px) / lam
				var dz := (az - pz) / lam
				var d2 := dx * dx + dz * dz
				if V2:
					d2 /= 1.5625
				if d2 >= 1.0:
					continue
				var w := (1.0 - d2) * (1.0 - d2)
				var s := ((ax - px) * nx + (az - pz) * nz) / lam
				vx += w * WRelief.cos2pi(s)
				vy += w * WRelief.sin2pi(s)
				W += w
		if not (W > 0.0):
			continue
		var m := sqrt(vx * vx + vy * vy) + 0.15 * W
		var t := vx / m
		var sn := vy / m
		var gul := (1.0 - t) * 0.5
		var cov := _smooth(0.05, 0.6, W)
		# the stacked mask (runevision): the stripe's height y, faded toward the coarser octaves' target where they mask it
		var fo := fine if lam <= FINE else 1.0
		var a0 := dep * lam * pow(GAIN, o)
		var y := 1 - 2 * (2 * gul - gul * gul)
		var mk := mask * fade * cov * fo
		var yf := tgt + (y - tgt) * mk
		out += a0 * 0.5 * (mk * (y - YMEAN) + fade * cov * fo * (1 - mask) * ((tgt - YMEAN) if V2 else tgt))   # v2: cov always 1 (min W .60); kept for v1
		var wo := pow(GAIN, o)
		cr += wo * mk * (2 * gul - 1)
		cw += wo
		var k := -a0 * mk * (1 - gul) * _clamp(3 * sn, -1, 1) * 6.283185307179586 / lam
		Gx += k * nx
		Gz += k * nz
		tgt = yf
		var mu := (1 - pow(1 - mask, DETAIL)) * _smooth(0, 0.7, absf(sn))
		mask += (mu - mask) * cov
	if G.size() >= 2:
		G[0] = Gx
		G[1] = Gz
	if G.size() >= 3:
		G[2] = cr / cw if cw > 0 else 0.0
	return out


const GD := [[1.0, 0.0], [0.70703125, 0.70703125], [0.0, 1.0], [-0.70703125, 0.70703125]]


static func _gr1(u: float, v: float, sd: int) -> float:
	return 0.8 * KRand.gnoise(u / 9, v / 9, sd) + 0.25 * KRand.gnoise(u / 2.7 + 31, v / 2.7, sd ^ 1)


# the grain: four fixed orientations blended by the slope's direction (turning world-absolute coordinates was a seam)
static func grain(x: float, z: float, sl: float, gx: float, gz: float, S: Dictionary, min_wave = null) -> float:
	if min_wave != null and min_wave >= 13:
		return 0.0
	var ax := x + OX
	var az := z + OZ
	var sd := (SEED ^ 0x4752) & M32
	var amp := (0.3 + 2.6 * minf(sl, 0.6)) * float(S.get("rough", 1.0))
	var an := _smooth(0.02, 0.15, sl)
	var n := _gr1(ax, az, sd) if an < 1 else 0.0
	if an > 0:
		var ux := gx / sl
		var uz := gz / sl
		var s := 0.0
		var w2 := 0.0
		for k in 4:
			var c: float = GD[k][0] * ux + GD[k][1] * uz
			var w := c * c * c * c
			if w < 1e-6:
				continue
			var a: float = (ax * GD[k][0] + az * GD[k][1]) / 3
			var b: float = -ax * GD[k][1] + az * GD[k][0]
			s += w * _gr1(a, b, (sd + k + 1) & M32)
			w2 += w * w
		var na := s / sqrt(w2)
		n = n * (1 - an) + na * an
	return amp * n
