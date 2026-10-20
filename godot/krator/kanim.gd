# The GDScript twin of shaders/lib/anim.gdshaderinc (itself the twin of BIO.animHook, core/biome/35-core-anim.js): where
# an animated fauna body is at a time, for tests (tests/anim/anim_test.gd, tests/shaders/library_gpu_check.gd) and for
# anything on the CPU that must know where a ray or a dart is (a probe, a hunter, a camera that follows a flock).
#   mode 0 orbit, 1 flit, 2 walk; rad = aP0.w; p1 = aP1 = (speed, phase, vertical amplitude, eccentricity)
class_name KAnim
extends RefCounted

const MODES := {"orbit": 0, "flit": 1, "walk": 2}


static func hdg(a: float) -> Basis:
	return Basis(Vector3(cos(a), 0, sin(a)), Vector3(0, 1, 0), Vector3(-sin(a), 0, cos(a)))


static func rz(a: float) -> Basis:
	return Basis(Vector3(cos(a), sin(a), 0), Vector3(-sin(a), cos(a), 0), Vector3(0, 0, 1))


static func rx(a: float) -> Basis:
	return Basis(Vector3(1, 0, 0), Vector3(0, cos(a), sin(a)), Vector3(0, -sin(a), cos(a)))


# {"M": Basis, "P": Vector3}: the body's turn and its offset from the path's centre at time t
static func pose(mode: int, rad: float, p1: Vector4, t: float) -> Dictionary:
	if mode == 0:
		var th := p1.y + p1.x * t
		var e := maxf(p1.w, 0.15)
		var P := Vector3(cos(th) * rad, p1.z * (0.6 * sin(th * 2.3 + p1.y) + 0.4 * sin(th * 0.7 + 2.0 * p1.y)), sin(th) * rad * e)
		var d := Vector2(-sin(th), cos(th) * e).normalized()
		var yaw := atan2(d.y, d.x)
		var bank := -0.42 * signf(p1.x) * (0.7 + 0.3 * sin(th * 3.1 + p1.y))
		var pit := 0.25 * p1.z * (1.38 * cos(th * 2.3 + p1.y)) / maxf(1.0, rad) * 4.0
		return {"M": hdg(yaw) * rz(clampf(pit, -0.3, 0.3)) * rx(bank), "P": P}
	if mode == 1:
		var t1 := p1.y + p1.x * t
		var e := maxf(p1.w, 0.15)
		var P := Vector3(sin(t1) * rad, p1.z * sin(t1 * 1.7 + 1.0), cos(t1 * 0.83 + 0.5) * rad * e)
		var v := Vector3(cos(t1) * rad, p1.z * 1.7 * cos(t1 * 1.7 + 1.0), -0.83 * sin(t1 * 0.83 + 0.5) * rad * e)
		var yaw := atan2(v.z, v.x)
		var pit := atan2(v.y, maxf(0.001, Vector2(v.x, v.z).length())) * 0.6
		return {"M": hdg(yaw) * rz(clampf(pit, -0.6, 0.6)), "P": P}
	return {"M": Basis.IDENTITY, "P": Vector3.ZERO}


static func flap(pos: Vector3, tr: Vector3, t: float, p1: Vector4, walk: bool, rate: float, amp: float, root: float) -> Vector3:
	var w := maxf(0.0, absf(pos.z) - root)
	var f := sin(t * rate + p1.y * 7.0 + (p1.x if walk else 0.0))
	tr.y += w * f * amp
	tr.z -= signf(pos.z) * w * (1.0 - cos(f * amp)) * 0.5
	return tr


static func legs(pos: Vector3, tr: Vector3, p1: Vector4, top: float, amp: float, lift: float) -> Vector3:
	if pos.y < top:
		var k := (top - pos.y) / top
		var ph := p1.x + (0.0 if pos.x > 0.0 else 3.14159) + (0.0 if pos.z > 0.0 else 3.14159)
		tr.x += k * sin(ph) * amp
		tr.y += k * maxf(0.0, cos(ph)) * lift
	else:
		tr.y += 0.02 * sin(p1.x * 2.0)
	return tr


# where a body vertex is in the world: the instance's centre c, its basis B (the instance matrix without translation),
# the vertex `local` in the body's frame, as shaders/anim_body.gdshaderinc places it (not a billboard)
static func world(c: Vector3, B: Basis, local: Vector3, mode: int, rad: float, p1: Vector4, t: float) -> Vector3:
	var q := pose(mode, rad, p1, t)
	return c + q["P"] + (q["M"] as Basis) * (B * local)
