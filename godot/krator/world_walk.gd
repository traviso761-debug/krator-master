# M8 "walk the road" (GODOT-PLAN.md): a walker on a krator-world-stream. KratorWorldStream (collide and auto_places on)
# round a CharacterBody3D and a third-person camera; the stream loads round the walker every half second and rebases its
# floating origin with it, and the walker and camera are carried across each rebase (the stream's `rebased` signal).
#   KratorWorldWalk.make(index_path)   the node (add it to the tree, then start_at)
#   start_at(x, z)                     the region's metres: loads the stream round it and stands the walker on the ground
#   drive(points, speed)               autopilot along region (x, z) points (the road's), at speed m/s; done when `driving` is false
#   region_xz() -> Vector2             the walker's place in the region's metres (doubles inside, float32 out)
#   feet_y() -> float                  the walker's feet in the region's metres
# Keys when `interactive` (walk.gd): WASD walk, Shift run, the camera follows; walk.gd adds the rest.
class_name KratorWorldWalk
extends Node3D

const LOAD_R := 20000.0
const KEEP_R := 28000.0
const UPDATE_EVERY := 0.5       # seconds between stream updates
const RADIUS := 0.4
const HEIGHT := 1.8
const GRAVITY := 9.8
const STEP := 0.6               # metres the walker steps up over (_step_up)

var stream: KratorWorldStream
var walker: CharacterBody3D
var cam: Camera3D
var interactive := false
var speed := 6.0
var driving := false
var route: Array = []           # [[x, z], ...] region metres
var route_i := 0
var steps := 0
var step_ups := 0
var phys_ms := 0.0               # the last physics frame's time in this script (the stream's update and poll included)
var phys_max := 0.0
var move_max := 0.0
var move_ms := 0.0               # of it, the step-up and move_and_slide (the collision queries)
var updates: Array = []         # [{ms, loaded, unloaded, step}]: every stream update that loaded or freed something, timed
var _t := 0.0
var _yaw := 0.0


static func make(index_path: String, collide := true, threaded := true) -> KratorWorldWalk:
	var w := KratorWorldWalk.new()
	w.name = "WorldWalk"
	w.stream = KratorWorldStream.open(index_path)
	w.stream.collide = collide
	w.stream.auto_places = true
	w.stream.threaded = threaded   # cases built on a worker thread, attached by poll() each frame
	w.add_child(w.stream)
	w.stream.rebased.connect(w._on_rebased)
	w.walker = CharacterBody3D.new()
	w.walker.name = "Walker"
	var cs := CollisionShape3D.new()
	var cap := CapsuleShape3D.new()
	cap.radius = RADIUS
	cap.height = HEIGHT
	cs.shape = cap
	w.walker.add_child(cs)
	w.walker.floor_snap_length = 2.0
	w.walker.floor_max_angle = deg_to_rad(50.0)
	w.add_child(w.walker)
	w.cam = Camera3D.new()
	w.cam.name = "Camera"
	w.cam.far = 60000.0
	w.cam.near = 0.2
	w.add_child(w.cam)
	return w


func start_at(x: float, z: float) -> void:
	stream.rebase(x, z)
	var was := stream.threaded   # the first load round the walker in full, before it stands anywhere
	stream.threaded = false
	stream.update(Vector2(x, z), LOAD_R, KEEP_R)
	stream.threaded = was
	var h := stream.height_at(x, z)
	walker.position = stream.local(x, (h if is_finite(h) else 0.0) + HEIGHT, z)
	walker.velocity = Vector3.ZERO
	_follow(true)


func drive(points: Array, v: float) -> void:
	route = points
	route_i = 0
	speed = v
	driving = route.size() > 0


func region_xz() -> Vector2:
	var r: Array = stream.region(walker.position)
	return Vector2(r[0], r[2])


func feet_y() -> float:
	return float(stream.region(walker.position)[1]) - HEIGHT * 0.5


func _on_rebased(delta: Vector3) -> void:
	walker.position += delta
	cam.position += delta


func _physics_process(dt: float) -> void:
	if stream == null:
		return
	var t_phys := Time.get_ticks_usec()
	var dir := Vector3.ZERO
	if driving:
		var here: Array = stream.region(walker.position)
		while route_i < route.size():
			var p: Array = route[route_i]
			var dx: float = float(p[0]) - here[0]
			var dz: float = float(p[1]) - here[2]
			if sqrt(dx * dx + dz * dz) > maxf(2.0, speed * dt * 1.5):
				dir = Vector3(dx, 0, dz).normalized()
				break
			route_i += 1
		if route_i >= route.size():
			driving = false
	elif interactive:
		var iv := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
		if Input.is_key_pressed(KEY_A): iv.x -= 1
		if Input.is_key_pressed(KEY_D): iv.x += 1
		if Input.is_key_pressed(KEY_W): iv.y -= 1
		if Input.is_key_pressed(KEY_S): iv.y += 1
		if iv.length() > 0:
			dir = (Basis(Vector3.UP, _yaw) * Vector3(iv.x, 0, iv.y)).normalized()
	var v := speed * (5.0 if interactive and Input.is_key_pressed(KEY_SHIFT) else 1.0)
	walker.velocity.x = dir.x * v
	walker.velocity.z = dir.z * v
	if walker.is_on_floor():
		walker.velocity.y = 0.0
	else:
		walker.velocity.y -= GRAVITY * dt
	var t_move := Time.get_ticks_usec()
	_step_up(Vector3(walker.velocity.x, 0, walker.velocity.z) * dt)
	walker.move_and_slide()
	move_ms = (Time.get_ticks_usec() - t_move) / 1000.0
	if dir.length() > 0 and not interactive:
		_yaw = atan2(dir.x, dir.z) + PI
	stream.poll()   # attach what the worker finished
	steps += 1
	_t += dt
	if _t >= UPDATE_EVERY:
		_t = 0.0
		var t0 := Time.get_ticks_usec()
		var r := stream.update(region_xz(), LOAD_R, KEEP_R)
		var ms := (Time.get_ticks_usec() - t0) / 1000.0
		if (r["loaded"] as Array).size() + (r["unloaded"] as Array).size() > 0:
			updates.append({"ms": ms, "loaded": r["loaded"], "unloaded": r["unloaded"], "step": steps})
	_follow(false)
	phys_ms = (Time.get_ticks_usec() - t_phys) / 1000.0
	phys_max = maxf(phys_max, phys_ms)   # a caller timing frames reads and resets these (tests/perf/road_perf.gd)
	move_max = maxf(move_max, move_ms)


# a step up: blocked ahead but clear STEP higher, the walker rises onto it (a kerb, a door sill, the seam where a chunk's
# coarse ground meets a place's finer ground a few centimetres higher); floor snapping brings it down after
func _step_up(motion: Vector3) -> void:
	if motion.length_squared() < 1e-6 or not walker.is_on_floor():
		return
	var t := walker.global_transform
	var col := KinematicCollision3D.new()
	if not walker.test_move(t, motion, col):
		return
	if col.get_normal().dot(Vector3.UP) > cos(walker.floor_max_angle):   # a walkable slope ahead, not a step: move_and_slide climbs it
		return
	var up := Vector3(0, STEP, 0)
	if walker.test_move(t, up):
		return
	if walker.test_move(t.translated(up), motion):
		return
	walker.global_position += up
	step_ups += 1


func turn(dyaw: float) -> void:
	_yaw += dyaw


# the camera behind the walker and above it, looking past it
func _follow(snap: bool) -> void:
	if not cam.is_inside_tree():
		return
	var back := Basis(Vector3.UP, _yaw) * Vector3(0, 0, 1)
	var want := walker.position + back * 9.0 + Vector3(0, 3.5, 0)
	cam.position = want if snap else cam.position.lerp(want, 0.2)
	cam.look_at(walker.position + Vector3(0, 1.2, 0), Vector3.UP)
