# core/terrain/46-core-lava.js in GDScript: KLAVA's CPU stepper, the same arithmetic in the same order on doubles
# (PackedFloat64Array), so a Godot world runs the page's lava flow. golden-lava.json (test-lava.js --write) holds both to the
# same numbers; klava_test.gd checks it. pow and the cube root are the engines' own, so the match is to a tolerance, not bits.
#
#   var s := KLava.new(heights, nx, nz, x0, z0, step, opt)   heights: the lattice points' ground (PackedFloat32Array or
#            Array, row j then column i); opt: {rheo: {...over KLava.BASALT}, seed, rough, hmin, edge 'drain'|'wall', cfl,
#            dt_max, dt_min}. A KField gives its heights, nx, nz, x0, z0, step (stride and box are the page's: crop first)
#   s.vent({x, z, r, Q: float | Callable(t), T})    s.pond({cells: [k...], level: float | Callable(t, out), T})
#   s.step(dt)   s.run(seconds) -> steps   s.mass()   s.at(x, z)   s.heat(k)   s.front()
#   s.z, s.h, s.T, s.dep, s.vx, s.vz, s.froze_at (PackedFloat64Array), s.t, s.steps, s.dt_next, s.molten
class_name KLava
extends RefCounted

const KRand := preload("../rand/krand.gd")
const SIGMA := 5.670374e-8
const G0 := 9.81
const DI := [1, -1, 0, 0, 1, -1, -1, 1]
const DJ := [0, 0, 1, -1, 1, -1, 1, -1]
const WO := 2.0 / 3.0
const KO := 0.1
const KD := 0.025
const BASALT := {"rho": 2600.0, "cp": 1150.0, "emis": 0.9, "exposed": 0.1, "Tvent": 1400.0, "Tsol": 1173.0, "Tair": 280.0,
	"Tground": 300.0, "kc": 2.0, "dc": 2.0, "eta": [25.0882, -0.015419], "yld": [20.5, -0.013216], "etaMin": 1.0}

var x0: float
var z0: float
var cs: float
var nx: int
var nz: int
var n_cells: int
var R: Dictionary
var z := PackedFloat64Array()
var h := PackedFloat64Array()
var T := PackedFloat64Array()
var dep := PackedFloat64Array()
var vx := PackedFloat64Array()
var vz := PackedFloat64Array()
var froze_at := PackedFloat64Array()
var rough := PackedFloat64Array()
var t := 0.0
var steps := 0
var dt_next: float
var molten := 0
var vents: Array = []
var ponds: Array = []
var _h2 := PackedFloat64Array()
var _e2 := PackedFloat64Array()
var _out := PackedFloat64Array()
var _pond_of := PackedInt32Array()
var _D: Array
var _W: Array
var _KAP: Array
var _rhog: float
var _hmin: float
var _edge: String
var _cfl: float
var _dt_max: float
var _dt_min: float
var _lv := 0.0
var _lost := 0.0
var _b := [0, 0, -1, -1]


static func rheo(r: Dictionary, temp: float) -> Array:   # [eta, Sy], doubles (a Vector2 is single precision)
	var e: Array = r["eta"]
	var le: float = float(e[0]) + float(e[1]) / max(1.0, temp - float(e[2])) if e.size() > 2 else float(e[0]) + float(e[1]) * temp
	var y: Array = r["yld"]
	return [max(float(r.get("etaMin", 1.0)), pow(10.0, le)), pow(10.0, float(y[0]) + float(y[1]) * temp)]


static func flux(he: float, dH: float, d: float, w: float, eta: float, sy: float, rhog: float) -> float:
	if not (he > 0.0) or not (dH > 0.0):
		return 0.0
	var g := rhog * dH / sqrt(dH * dH + d * d)
	var hc := sy / g
	if he <= hc:
		return 0.0
	var e := he - hc
	return w * g * e * e * (he + 0.5 * hc) / (3.0 * eta)


func _init(heights, p_nx: int, p_nz: int, p_x0: float, p_z0: float, step: float, opt: Dictionary = {}) -> void:
	nx = p_nx; nz = p_nz; x0 = p_x0; z0 = p_z0; cs = step; n_cells = nx * nz
	R = BASALT.duplicate(true)
	for k in opt.get("rheo", {}):
		R[k] = opt["rheo"][k]
	_rhog = float(R["rho"]) * G0
	_hmin = float(opt.get("hmin", 0.02)); _edge = str(opt.get("edge", "drain")); _cfl = float(opt.get("cfl", 0.5))
	_dt_max = float(opt.get("dtMax", 60.0)); _dt_min = float(opt.get("dtMin", 0.05)); dt_next = _dt_max
	for a in [z, h, T, dep, vx, vz, froze_at, rough, _h2, _e2]:
		a.resize(n_cells); a.fill(0.0)
	froze_at.fill(NAN)
	_out.resize(n_cells * 8); _out.fill(0.0)
	_pond_of.resize(n_cells); _pond_of.fill(-1)
	var sd: int = int(opt.get("seed", 1))
	var rk: float = float(opt.get("rough", 0.0))
	for j in nz:
		for i in nx:
			var k := j * nx + i
			z[k] = float(heights[k])
			if rk != 0.0:
				rough[k] = rk * (KRand.unit(KRand.hash_ints(sd, [i, j, 0x1A7A])) - 0.5)
	var s2 := step * sqrt(2.0)
	var wd := sqrt(2.0) / 6.0
	_D = [step, step, step, step, s2, s2, s2, s2]
	_W = [WO * step, WO * step, WO * step, WO * step, wd * step, wd * step, wd * step, wd * step]
	_KAP = [KO, KO, KO, KO, KD, KD, KD, KD]
	_b = [nx, nz, -1, -1]


func _grow(k: int) -> void:
	var i := k % nx
	var j := (k - i) / nx
	_b[0] = mini(_b[0], i); _b[2] = maxi(_b[2], i); _b[1] = mini(_b[1], j); _b[3] = maxi(_b[3], j)


func vent(v: Dictionary) -> Dictionary:
	var r: float = float(v.get("r", 0.0))
	var ks: Array = []
	for j in nz:
		for i in nx:
			var dx: float = x0 + i * cs - float(v["x"])
			var dz: float = z0 + j * cs - float(v["z"])
			if dx * dx + dz * dz <= r * r:
				ks.append(j * nx + i)
	if ks.is_empty():
		var i := roundi((float(v["x"]) - x0) / cs)
		var j := roundi((float(v["z"]) - z0) / cs)
		assert(i >= 0 and j >= 0 and i < nx and j < nz, "KLava.vent: outside the sim")
		ks.append(j * nx + i)
	var V := {"x": v["x"], "z": v["z"], "Q": v["Q"], "T": float(v.get("T", R["Tvent"])), "cells": ks, "poured": 0.0}
	for k in ks:
		_grow(k)
	vents.append(V)
	return V


func pond(p: Dictionary) -> Dictionary:
	var P := {"level": p["level"], "T": float(p.get("T", R["Tvent"])), "cells": p["cells"], "out": 0.0, "id": ponds.size()}
	for k in P["cells"]:
		_pond_of[k] = P["id"]; _grow(k)
	ponds.append(P)
	return P


func heat(k: int) -> float:
	if not (h[k] > 0.0):
		return 0.0
	return clampf((T[k] - float(R["Tsol"])) / (float(R["Tvent"]) - float(R["Tsol"])), 0.0, 1.0)


func step(dt: float) -> float:
	var A := cs * cs
	for P in ponds:
		var lv: float = P["level"].call(t, P["out"]) if P["level"] is Callable else float(P["level"])
		for k in P["cells"]:
			var d: float = lv - z[k] - rough[k]
			h[k] = d if d > 0.0 else 0.0
			T[k] = P["T"]
	var i0: int = maxi(0, _b[0] - 1)
	var j0: int = maxi(0, _b[1] - 1)
	var i1: int = mini(nx - 1, _b[2] + 1)
	var j1: int = mini(nz - 1, _b[3] + 1)
	if i1 < i0:
		t += dt; steps += 1
		return dt
	var umax := 0.0
	# 1. flux
	for j in range(j0, j1 + 1):
		for i in range(i0, i1 + 1):
			var c := j * nx + i
			var o8 := c * 8
			for n in 8:
				_out[o8 + n] = 0.0
			var hc: float = h[c]
			if not (hc > _hmin):
				continue
			var zc: float = z[c] + rough[c]
			var Hc: float = zc + hc
			var rr := rheo(R, T[c])
			var tot := 0.0
			for n in 8:
				var ii: int = i + DI[n]
				var jj: int = j + DJ[n]
				var zn: float
				var Hn: float
				if ii >= 0 and jj >= 0 and ii < nx and jj < nz:
					var k := jj * nx + ii
					zn = z[k] + rough[k]; Hn = zn + h[k]
				else:
					if _edge == "wall":
						continue
					var mi: int = mini(nx - 1, maxi(0, i - DI[n]))
					var mj: int = mini(nz - 1, maxi(0, j - DJ[n]))
					var m := mj * nx + mi
					zn = 2.0 * zc - z[m] - rough[m]; Hn = zn
				var dH := Hc - Hn
				if not (dH > 0.0):
					continue
				var he: float = min(hc, Hc - zn)
				var q := flux(he, dH, _D[n], _W[n], rr[0], rr[1], _rhog)
				if not (q > 0.0):
					continue
				var v := q * dt
				var cap: float = _KAP[n] * A * dH
				if v > cap:
					v = cap
				_out[o8 + n] = v; tot += v
				var u: float = q / (_W[n] * he)
				if u > umax:
					umax = u
			if tot > hc * A:
				var s := hc * A / tot
				for n in 8:
					_out[o8 + n] *= s
	# 2. gather
	for j in range(j0, j1 + 1):
		for i in range(i0, i1 + 1):
			var c := j * nx + i
			var o8 := c * 8
			var pc: int = _pond_of[c]
			var so := 0.0
			var fx := 0.0
			var fz := 0.0
			for n in 8:
				var v: float = _out[o8 + n]
				if v == 0.0:
					continue
				so += v; fx += v * DI[n]; fz += v * DJ[n]
				var ii: int = i + DI[n]
				var jj: int = j + DJ[n]
				if ii < 0 or jj < 0 or ii >= nx or jj >= nz:
					_lost += v
					if pc >= 0:
						ponds[pc]["out"] += v
			var V: float = h[c] * A - so
			var E: float = T[c] * V
			for n in 8:
				var ii: int = i + DI[n]
				var jj: int = j + DJ[n]
				if ii < 0 or jj < 0 or ii >= nx or jj >= nz:
					continue
				var k := jj * nx + ii
				var v: float = _out[k * 8 + (n ^ 1)]
				if v == 0.0:
					continue
				V += v; E += v * T[k]; fx -= v * DI[n]; fz -= v * DJ[n]
				var pk: int = _pond_of[k]
				if pk != pc:
					if pk >= 0:
						ponds[pk]["out"] += v
					if pc >= 0:
						ponds[pc]["out"] -= v
			if V < 0.0:
				V = 0.0
			_h2[c] = V / A
			_e2[c] = E / V if V > 0.0 else T[c]
			var hm: float = max(_h2[c], _hmin)
			vx[c] = fx / (2.0 * dt * cs * hm); vz[c] = fz / (2.0 * dt * cs * hm)
	for j in range(j0, j1 + 1):
		for i in range(i0, i1 + 1):
			var c := j * nx + i
			h[c] = _h2[c]; T[c] = _e2[c]
	# 3. vents
	for V in vents:
		var Q: float = V["Q"].call(t) if V["Q"] is Callable else float(V["Q"])
		var vol: float = (Q if Q > 0.0 else 0.0) * dt
		if not (vol > 0.0):
			continue
		var per: float = vol / V["cells"].size()
		for k in V["cells"]:
			var v0: float = h[k] * A
			T[k] = (T[k] * v0 + V["T"] * per) / (v0 + per); h[k] += per / A
		V["poured"] += vol; _lv += vol
	# 4. cooling and freezing
	var ra: float = 3.0 * R["emis"] * R["exposed"] * SIGMA * dt / (R["rho"] * R["cp"])
	var ca: float = R["kc"] * dt / (R["dc"] * R["rho"] * R["cp"])
	var a0 := nx
	var b0 := nz
	var a1 := -1
	var b1 := -1
	var mol := 0
	for j in range(j0, j1 + 1):
		for i in range(i0, i1 + 1):
			var c := j * nx + i
			if _pond_of[c] >= 0:
				a0 = mini(a0, i); a1 = maxi(a1, i); b0 = mini(b0, j); b1 = maxi(b1, j)
				continue
			var hc: float = h[c]
			if not (hc > 0.0):
				vx[c] = 0.0; vz[c] = 0.0
				continue
			var Tc: float = T[c]
			Tc = Tc / pow(1.0 + ra * Tc * Tc * Tc / hc, 1.0 / 3.0)
			Tc = (Tc + ca / hc * R["Tground"]) / (1.0 + ca / hc)
			T[c] = Tc
			if Tc <= R["Tsol"]:
				z[c] += hc; dep[c] += hc; h[c] = 0.0; vx[c] = 0.0; vz[c] = 0.0; froze_at[c] = t + dt
				continue
			if hc > _hmin:
				mol += 1
			a0 = mini(a0, i); a1 = maxi(a1, i); b0 = mini(b0, j); b1 = maxi(b1, j)
	for V in vents:
		for k in V["cells"]:
			var i: int = k % nx
			var j: int = (k - i) / nx
			a0 = mini(a0, i); a1 = maxi(a1, i); b0 = mini(b0, j); b1 = maxi(b1, j)
	_b = [a0, b0, a1, b1]; molten = mol
	var dn := _cfl * cs / umax if umax > 0.0 else _dt_max
	dt_next = clampf(dn, _dt_min, _dt_max)
	t += dt; steps += 1
	return dt


func run(seconds: float) -> int:
	var end := t + seconds
	var n := 0
	while t < end - 1e-9:
		step(min(dt_next, end - t)); n += 1
	return n


func mass() -> Dictionary:
	var m := 0.0
	var f := 0.0
	for k in n_cells:
		if _pond_of[k] >= 0:
			continue
		m += h[k]; f += dep[k]
	var po := 0.0
	for P in ponds:
		po += P["out"]
	var A := cs * cs
	var er := _lv + po
	return {"erupted": er, "molten": m * A, "frozen": f * A, "lost": _lost, "pondOut": po, "error": er - m * A - f * A - _lost}


func at(x: float, zz: float) -> Dictionary:
	var i := clampi(roundi((x - x0) / cs), 0, nx - 1)
	var j := clampi(roundi((zz - z0) / cs), 0, nz - 1)
	var k := j * nx + i
	return {"k": k, "h": h[k], "T": T[k], "z": z[k], "dep": dep[k], "surf": z[k] + h[k], "molten": h[k] > _hmin and T[k] > R["Tsol"],
		"heat": heat(k), "vx": vx[k], "vz": vz[k], "pond": _pond_of[k] >= 0}


func front() -> Array:
	var o: Array = []
	for j in range(maxi(0, _b[1]), mini(nz - 1, _b[3]) + 1):
		for i in range(maxi(0, _b[0]), mini(nx - 1, _b[2]) + 1):
			var c := j * nx + i
			if not (h[c] > _hmin and T[c] > R["Tsol"]) or _pond_of[c] >= 0:
				continue
			for n in 4:
				var ii: int = i + DI[n]
				var jj: int = j + DJ[n]
				var k := jj * nx + ii
				if ii < 0 or jj < 0 or ii >= nx or jj >= nz or not (h[k] > _hmin and T[k] > R["Tsol"]):
					o.append(Vector2(x0 + i * cs, z0 + j * cs))
					break
	return o
