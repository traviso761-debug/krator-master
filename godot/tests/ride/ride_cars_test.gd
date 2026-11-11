# Riding's cars in Godot's physics (core/simulation/PLAN-RIDING.md section 7), from the page's ride export (the golden the
# replay test reads): the cars as AnimatableBody3D (godot/krator/ride_cars.gd) posed by KRide.car_pose. Checks, each with
# a negative:
#   - the doors: KRide.door_open agrees with the page's door states sampled every 3 s (the flipped states disagree), and the
#     cars' door links and door blocks follow it
#   - a CharacterBody3D standing in a car as it leaves Ledge rides it down the Line, held in the car's frame; a body on a
#     static platform beside it is not carried
#   godot --headless --path godot --script res://tests/ride/ride_cars_test.gd
extends SceneTree

var M: Dictionary
var R: RideCars
var t := 0.0
var t_end := 0.0
var rider: CharacterBody3D
var stay: CharacterBody3D
var local0 := Vector3.ZERO
var stay0 := Vector3.ZERO
var car0 := Vector3.ZERO
var bad := 0
var done := false
var frames := 0
var lag := 0.0   # the most the rider trails its place in the car while the car moves (Godot applies the platform's velocity a frame late)


func ok(name: String, pass_: bool, neg: bool) -> void:
	var r := pass_ and not neg
	if not r:
		bad += 1
	print(("PASS  " if r else "FAIL  ") + name + (" (its negative passed)" if neg else ""))


func body_at(p: Vector3) -> CharacterBody3D:
	var b := CharacterBody3D.new()
	var s := CollisionShape3D.new()
	var c := CapsuleShape3D.new()
	c.radius = 0.3
	c.height = 1.7
	s.shape = c
	s.position = Vector3(0, 0.85, 0)
	b.add_child(s)
	root.add_child(b)
	b.position = p   # the root sits at the origin: local is world (not yet inside the tree here)
	return b


func _initialize() -> void:
	M = KData.read_json("res://tests/ride/golden-ride.json")
	if not (M is Dictionary) or not M.has("walk"):
		print("FAIL: tests/ride/golden-ride.json has no walk frames (node core/simulation/ride/test-ride.js --write; sync_core.py)")
		quit(1)
		return
	# the doors against the page's samples
	var srcs: Array = M["ride"]["sources"]
	var n := 0
	var miss := 0
	var flip := 0
	var opened := 0
	for r in M["doors"]:
		var o := KRide.door_open(srcs[int(r[1])], int(r[2]), String(r[3]), float(r[0]))
		n += 1
		if o:
			opened += 1
		if (1 if o else 0) != int(r[4]):
			miss += 1
		if (0 if o else 1) != int(r[4]):
			flip += 1
	ok("the door windows agree with the page's (%d samples, %d open)" % [n, opened], n > 0 and opened > 0 and miss == 0, flip == 0)
	R = RideCars.build(M)
	root.add_child(R)
	ok("the cars are built: %d bodies, each with its door links and door blocks" % R.cars.size(), R.cars.size() == 10 and R.cars[1]["doors"].size() == 4
		and R.cars[1]["doors"]["d1"].has("block") and R.cars[1]["doors"]["d1"].has("link"), false)
	# a dwell at Ledge: three seconds before its doors shut, a rider in car 1 and a body on a platform slab beside it
	var d := KRide.dwell(srcs[0], 2)
	t = float(d["o1"]) - 3.0
	t_end = float(d["t1"]) + 85.0   # the run to the gap station is 75 s: stopped there, ten seconds in
	R.set_time(t)
	var C1: Dictionary = R.cars[1]
	var e: Dictionary = C1["doors"]["d1"]
	ok("in the window the door is open: its link enabled, its block off, the far side's shut", e["link"].enabled and e["block"].disabled
		and not C1["doors"]["d2"]["link"].enabled, not e["link"].enabled)
	var T0: Transform3D = R.car_transform(0, 1, t)
	car0 = T0.origin
	rider = body_at(T0 * Vector3(0.0, 1.22, 2.0))   # a saloon of the Line: its floor 1.2 m up
	local0 = T0.affine_inverse() * rider.position
	var slab := StaticBody3D.new()
	var sh := CollisionShape3D.new()
	var bx := BoxShape3D.new()
	bx.size = Vector3(60, 0.2, 4)
	sh.shape = bx
	slab.add_child(sh)
	root.add_child(slab)
	slab.position = Vector3(car0.x, 1.1, -4.0)
	stay = body_at(Vector3(car0.x, 1.22, -4.0))
	stay0 = stay.position


func _physics_process(delta: float) -> bool:
	if done or R == null:
		return false
	t += delta
	frames += 1
	R.set_time(t)
	for b in [rider, stay]:
		if not b.is_on_floor():
			b.velocity.y -= 9.8 * delta
		else:
			b.velocity.y = 0.0
		b.velocity.x = 0.0
		b.velocity.z = 0.0
		b.move_and_slide()
	var Tn: Transform3D = R.car_transform(0, 1, t)
	var ln := Tn.affine_inverse() * rider.position
	lag = maxf(lag, Vector2(ln.x - local0.x, ln.z - local0.z).length())
	if t >= t_end:
		done = true
	return false


func _process(_delta: float) -> bool:
	if not done:
		return false
	var T1: Transform3D = R.car_transform(0, 1, t)
	var local1 := T1.affine_inverse() * rider.position
	var moved := T1.origin.x - car0.x
	var drift := Vector2(local1.x - local0.x, local1.z - local0.z).length()
	var carried := rider.position.x - car0.x
	print("  car moved %.1f m in %d frames; the rider %.1f m, drift in the car %.3f m once stopped (%.3f m at most while moving), height in the car %.3f; the platform body moved %.3f m" % [moved, frames, carried, drift, lag, local1.y, stay.position.x - stay0.x])
	ok("a CharacterBody3D in the car rides it down the Line, held in the car's frame (back within 5 cm once it stops; under a frame's travel, 0.35 m, while it runs)", moved > 100.0 and drift < 0.05 and lag < 0.35 and absf(local1.y - 1.2) < 0.1,
		absf(stay.position.x - stay0.x) > 1.0)
	print("all passed" if bad == 0 else "%d FAILED" % bad)
	quit(0 if bad == 0 else 1)
	return true
