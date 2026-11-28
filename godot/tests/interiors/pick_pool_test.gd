# pick_pool's window cases (kinteriors_light.gd, the twin of core/interiors/10-core-roomlight.js pickPool; 2026-11-23):
# a window's aperture (a jali lets less in), a skylight as a column of light (an oculus 40 m over a hall's floor still lights
# the floor), the room gate. Each case beside its fault: the check fails on the fault and passes on the fix. No data, no GPU:
#   godot --headless --path godot --script res://tests/interiors/pick_pool_test.gd
extends SceneTree

const KInteriorsLight := preload("res://krator/kinteriors_light.gd")

var passed := 0
var failed := 0


func _check(cond: bool, msg: String) -> void:
	if cond:
		passed += 1
		print("  PASS  " + msg)
	else:
		failed += 1
		print("  FAIL  " + msg)


# a fault and its fix through the same check: the check must fail the one and pass the other
func _pair(msg: String, check: Callable, faulty, fixed) -> void:
	var on_fault: bool = check.call(faulty)
	var on_fix: bool = check.call(fixed)
	_check(not on_fault and on_fix, msg + ("" if (not on_fault and on_fix) else (" (passes the fault)" if on_fault else " (fails the fix)")))


func _imeta(windows: Array) -> Dictionary:
	return {
		"room_table": {"byId": {
			"hall": {"portals": ["porch"], "daylight": 0.8, "vault": false},
			"porch": {"portals": ["hall"], "daylight": 0.9, "vault": false},
			"cell": {"portals": [], "daylight": 0.0, "vault": false},
		}},
		"lights": {"windows": windows, "lamps": []},
	}


func _pick(windows: Array, eye: Vector3, room := "hall") -> Array:
	return KInteriorsLight.pick_pool(_imeta(windows), {"at": [0, 0, 0], "ry": 0.0}, eye, room, 1.0, 8, 2)


func _init() -> void:
	print("pick_pool_test: aperture, skylight columns, the room gate")
	var eye := Vector3(0, 1.6, 0)
	# a 4-element window is what it was
	var plain := _pick([[3.0, 2.0, 0.0, "hall"]], eye)
	_check(plain.size() == 1 and is_equal_approx(float(plain[0]["energy"]), 1.25) and (plain[0]["reg_pos"] as Vector3).is_equal_approx(Vector3(3, 2, 0)),
		"a window of four fields: energy 1.25 by day at its own point")
	# aperture
	_pair("a jali (aperture 0.4) lets in 0.4 of a clear window's light",
		func(w): var p := _pick([w], eye); return p.size() == 1 and is_equal_approx(float(p[0]["energy"]), 1.25 * 0.4),
		[3.0, 2.0, 0.0, "hall"], [3.0, 2.0, 0.0, "hall", 0.4])
	# a skylight 40 m up: picked from the floor, its light 6 m over the eye; as a plain window it is out of reach
	_pair("an oculus 40 m over the floor is a column: picked from the floor, its light at the eye + 6 m",
		func(w): var p := _pick([w], eye); return p.size() == 1 and is_equal_approx((p[0]["reg_pos"] as Vector3).y, 7.6) and is_equal_approx((p[0]["reg_pos"] as Vector3).x, 0.5),
		[0.5, 40.0, 0.0, "hall", 1.0], [0.5, 40.0, 0.0, "hall", 1.0, 1])
	# never above its opening; an eye above the opening counts the height
	var low := _pick([[0.0, 4.0, 0.0, "hall", 1.0, 1]], eye)
	_check(low.size() == 1 and is_equal_approx((low[0]["reg_pos"] as Vector3).y, 4.0), "a skylight's light never above its opening (4 m: at 4 m)")
	var above := _pick([[0.0, 4.0, 0.0, "hall", 1.0, 1]], Vector3(0, 40, 0))
	_check(above.size() == 0, "an eye 36 m above a skylight is out of its reach")
	# the gate: a skylight in a room with no portal to the eye's
	_pair("a skylight is gated by room: none from a room with no portal to the eye's",
		func(w): return _pick([w], eye).size() == 0,
		[0.0, 40.0, 0.0, "hall", 1.0, 1], [0.0, 40.0, 0.0, "cell", 1.0, 1])
	print("pick_pool_test: %d passed, %d failed" % [passed, failed])
	quit(1 if failed > 0 else 0)
