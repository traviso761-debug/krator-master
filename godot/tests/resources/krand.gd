# core/rand in GDScript: the twin of 08-core-rand.js (GODOT-PLAN.md Phase 2, item 1). Same numbers, bit for bit.
# GDScript ints are 64-bit signed, so every 32-bit product goes through imul() (16-bit halves) and every value is
# kept as u32 bits (masked, never negative). Floats are doubles, in the JS file's order of operations.
# test_rand.py is this file transliterated into Python and passes golden.json; krand_test.gd runs it here.
# Passing inside Godot 4.5 headless since 2026-10-05 (godot/tests/rand/; tools/test_all.py --nightly runs it).
#
#   var s := KRand.Stream.new(seed)   s.next() [0,1)  s.u32()  s.range_f(a,b)  s.int_in(a,b)  s.pick(arr)  s.chance(p)
#   KRand.hash_ints(seed, [a, b, c])  KRand.h3(x,y,z,seed)  KRand.vnoise(x,y,z,seed)  KRand.fbm(x,y,z,octaves,seed)
#   KRand.cell(seed, ix, iz)  KRand.child(seed, name)   (names: characters in the Basic Multilingual Plane)
extends RefCounted

const M32 := 0xFFFFFFFF
const INV := 1.0 / 4294967296.0


static func imul(a: int, b: int) -> int:
	a &= M32
	b &= M32
	return ((a & 0xFFFF) * b + ((((a >> 16) * b) & 0xFFFF) << 16)) & M32


static func mix32(h: int) -> int:
	h &= M32
	h ^= h >> 16
	h = imul(h, 0x85EBCA6B)
	h ^= h >> 13
	h = imul(h, 0xC2B2AE35)
	h ^= h >> 16
	return h


static func _step(h: int, v: int) -> int:
	h = imul(h ^ (v & M32), 0x9E3779B1)
	return ((h << 13) | (h >> 19)) & M32


static func hash_ints(sd: int, vals: Array) -> int:
	var h := (sd & M32) ^ 0x2545F491
	for v in vals:
		h = _step(h, floori(v))
	return mix32(h ^ vals.size())


static func _hash3(sd: int, a: int, b: int, c: int) -> int:
	return mix32(_step(_step(_step((sd & M32) ^ 0x2545F491, a), b), c) ^ 3)


static func unit(u: int) -> float:
	return float(u & M32) * INV


static func h3(x: float, y: float, z: float, sd: int = 0) -> float:
	return float(_hash3(sd, floori(x), floori(y), floori(z))) * INV


static func vnoise(x: float, y: float, z: float, sd: int = 0) -> float:
	var xi := floori(x)
	var yi := floori(y)
	var zi := floori(z)
	var xf := x - float(xi)
	var yf := y - float(yi)
	var zf := z - float(zi)
	var u := xf * xf * (3.0 - 2.0 * xf)
	var v := yf * yf * (3.0 - 2.0 * yf)
	var w := zf * zf * (3.0 - 2.0 * zf)
	var a0 := float(_hash3(sd, xi, yi, zi)) * INV
	var a1 := float(_hash3(sd, xi + 1, yi, zi)) * INV
	var b0 := float(_hash3(sd, xi, yi + 1, zi)) * INV
	var b1 := float(_hash3(sd, xi + 1, yi + 1, zi)) * INV
	var c0 := float(_hash3(sd, xi, yi, zi + 1)) * INV
	var c1 := float(_hash3(sd, xi + 1, yi, zi + 1)) * INV
	var d0 := float(_hash3(sd, xi, yi + 1, zi + 1)) * INV
	var d1 := float(_hash3(sd, xi + 1, yi + 1, zi + 1)) * INV
	var a := a0 + (a1 - a0) * u
	var b := b0 + (b1 - b0) * u
	var c := c0 + (c1 - c0) * u
	var d := d0 + (d1 - d0) * u
	var e := a + (b - a) * v
	var f := c + (d - c) * v
	return e + (f - e) * w


static func fbm(x: float, y: float, z: float, o: int = 3, sd: int = 0) -> float:
	var a := 0.0
	var f := 1.0
	var s := 0.0
	for i in o:
		a += vnoise(x * f, y * f, z * f, sd) / f
		s += 1.0 / f
		f *= 2.03
	return a / s


# gradient noise (core/world/PLAN-MICRO.md): the table as in the JS file, exact binary fractions (n/1024), so the parser reads the same bits
const GX := [1.0, 0.923828125, 0.70703125, 0.3828125, 0.0, -0.3828125, -0.70703125, -0.923828125, -1.0, -0.923828125, -0.70703125, -0.3828125, 0.0, 0.3828125, 0.70703125, 0.923828125]
const GZ := [0.0, 0.3828125, 0.70703125, 0.923828125, 1.0, 0.923828125, 0.70703125, 0.3828125, 0.0, -0.3828125, -0.70703125, -0.923828125, -1.0, -0.923828125, -0.70703125, -0.3828125]


static func gnoise(x: float, z: float, sd: int = 0) -> float:
	var i := floori(x)
	var j := floori(z)
	var fx := x - float(i)
	var fz := z - float(j)
	var u := fx * fx * fx * (fx * (fx * 6 - 15) + 10)
	var v := fz * fz * fz * (fz * (fz * 6 - 15) + 10)
	var k := _hash3(sd, i, j, 0x6E) & 15
	var a: float = GX[k] * fx + GZ[k] * fz
	k = _hash3(sd, i + 1, j, 0x6E) & 15
	var b: float = GX[k] * (fx - 1) + GZ[k] * fz
	k = _hash3(sd, i, j + 1, 0x6E) & 15
	var c: float = GX[k] * fx + GZ[k] * (fz - 1)
	k = _hash3(sd, i + 1, j + 1, 0x6E) & 15
	var d: float = GX[k] * (fx - 1) + GZ[k] * (fz - 1)
	var p := a + (b - a) * u
	var q := c + (d - c) * u
	return (p + (q - p) * v) * 1.4142135623730951


static func gfbm(x: float, z: float, o: int = 3, sd: int = 0) -> float:
	var a := 0.0
	var f := 1.0
	var s := 0.0
	var X := x
	var Z := z
	for i in o:
		a += gnoise(X, Z, (sd + i) & M32) / f
		s += 1.0 / f
		var nx := (.8 * X - .6 * Z) * 2.03 + 17.3
		var nz := (.6 * X + .8 * Z) * 2.03 - 9.1
		X = nx
		Z = nz
		f *= 2
	return a / s


static func cell(sd: int, ix: int, iz: int) -> int:
	return _hash3(sd, ix, iz, 0x51ED)


static func child(sd: int, name: String) -> int:
	var h := 0x811C9DC5
	for i in name.length():
		h = imul(h ^ name.unicode_at(i), 0x01000193)
	return hash_ints(sd, [h])


class Stream:
	var s: int

	func _init(sd: int) -> void:
		s = sd & 0xFFFFFFFF

	static func _imul(a: int, b: int) -> int:   # the outer imul(), repeated: an inner class cannot reach it
		a &= 0xFFFFFFFF
		b &= 0xFFFFFFFF
		return ((a & 0xFFFF) * b + ((((a >> 16) * b) & 0xFFFF) << 16)) & 0xFFFFFFFF

	func u32() -> int:
		s = (s + 0x6D2B79F5) & 0xFFFFFFFF
		var t := _imul(s ^ (s >> 15), 1 | s)
		t = ((t + _imul(t ^ (t >> 7), 61 | t)) & 0xFFFFFFFF) ^ t
		return (t ^ (t >> 14)) & 0xFFFFFFFF

	func next() -> float:
		return float(u32()) * (1.0 / 4294967296.0)

	func range_f(a: float, b: float) -> float:
		return a + (b - a) * next()

	func int_in(a: int, b: int) -> int:
		return a + floori(next() * float(b - a + 1))

	func pick(arr: Array):
		return arr[floori(next() * arr.size()) % arr.size()]

	func chance(p: float) -> bool:
		return next() < p

	func state() -> int:
		return s

	func set_state(v: int) -> void:
		s = v & 0xFFFFFFFF
