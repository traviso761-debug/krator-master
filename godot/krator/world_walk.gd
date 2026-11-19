# M8 "walk the road" (GODOT-PLAN.md): a walker and host camera on a krator-world-stream. KratorWorldStream (collide and
# auto_places on) round a CharacterBody3D and a dual-mode Camera3D (grounded 1st/3rd-person walk OR KHOST-style free-fly);
# the stream loads round the active focus every half second and rebases its floating origin with it, and the walker and
# camera are carried across each rebase (the stream's `rebased` signal).
#   KratorWorldWalk.make(index_path)   the node (add it to the tree, then start_at)
#   start_at(x, z)                     the region's metres: loads the stream round it and stands the walker on the ground
#   set_walk_mode(on, at_xz)           switches seamlessly between grounded Walk mode and WASD+QE free-fly camera mode
#   set_view_region(eye, target, walk) jumps to any POI overlook or ground view in region metres
#   drive(points, speed)               autopilot along region (x, z) points (the road's), at speed m/s; done when `driving` is false
#   region_xz() -> Vector2             the walker's place in the region's metres (doubles inside, float32 out)
#   cam_region() -> Vector3            the camera's place in the region's metres
#   feet_y() -> float                  the walker's feet in the region's metres
class_name KratorWorldWalk
extends Node3D

const LOAD_R := 20000.0
const KEEP_R := 28000.0
const UPDATE_EVERY := 0.5       # seconds between stream updates
const RADIUS := 0.4
const HEIGHT := 1.8
const GRAVITY := 9.8
const STEP := 0.6               # metres the walker steps up over (_step_up)
const PITCH_LIMIT := 1.48

var stream: KratorWorldStream
var walker: CharacterBody3D
var cam: Camera3D
var interactive := false
var keyboard_enabled := true
var walk_mode := true
var first_person := false
var speed := 6.0
var speed_mul := 1.0
var chase_dist := 9.0
var driving := false
var route: Array = []           # [[x, z], ...] region metres
var route_i := 0
var steps := 0
var step_ups := 0
var floor_rescues := 0
var phys_ms := 0.0               # the last physics frame's time in this script (the stream's update and poll included)
var phys_max := 0.0
var move_max := 0.0
var move_ms := 0.0               # of it, the step-up and move_and_slide (the collision queries)
var updates: Array = []         # [{ms, loaded, unloaded, step}]: every stream update that loaded or freed something, timed
var _t := 0.0
var _yaw := 0.0
var _pitch := -0.22


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
	w.cam.far = 80000.0
	w.cam.near = 0.2
	w.cam.fov = 58.0
	w.add_child(w.cam)
	return w


func _ensure_stream_at(x: float, z: float) -> void:
	if absf(x - float(stream.origin[0])) > KratorWorldStream.REBASE or absf(z - float(stream.origin[2])) > KratorWorldStream.REBASE or stream.covering(x, z) == "":
		if absf(x - float(stream.origin[0])) > KratorWorldStream.REBASE or absf(z - float(stream.origin[2])) > KratorWorldStream.REBASE:
			stream.rebase(x, z)
		var was := stream.threaded
		stream.threaded = false
		stream.update(Vector2(x, z), LOAD_R, KEEP_R)
		stream.threaded = was


func _surface_y_at(x: float, z: float) -> float:
	var h := stream.height_at(x, z)
	var base_y := h if is_finite(h) else 0.0
	if is_inside_tree() and get_world_3d() != null:
		var sp := get_world_3d().direct_space_state
		var top := to_global(stream.local(x, base_y + 120.0, z))
		var bot := to_global(stream.local(x, base_y - 60.0, z))
		var q := PhysicsRayQueryParameters3D.create(top, bot)
		q.exclude = [walker.get_rid()]
		q.hit_back_faces = true
		var hit := sp.intersect_ray(q)
		if not hit.is_empty():
			var lp := to_local(hit["position"] as Vector3)
			return float(stream.region(lp)[1])
	return base_y


func start_at(x: float, z: float) -> void:
	walk_mode = true
	stream.rebase(x, z)
	var was := stream.threaded   # the first load round the walker in full, before it stands anywhere
	stream.threaded = false
	stream.update(Vector2(x, z), LOAD_R, KEEP_R)
	stream.threaded = was
	var h := stream.height_at(x, z)
	walker.position = stream.local(x, (h if is_finite(h) else 0.0) + HEIGHT, z)
	walker.velocity = Vector3.ZERO
	_follow(true)
	stream.refresh_flora_at(cam_region())


func walk_at(x: float, z: float, yaw_rad := NAN) -> void:
	driving = false
	walk_mode = true
	_ensure_stream_at(x, z)
	if is_finite(yaw_rad):
		_yaw = yaw_rad
	var sy := _surface_y_at(x, z)
	walker.position = stream.local(x, sy + HEIGHT * 0.5 + 0.08, z)
	walker.velocity = Vector3.ZERO
	_follow(true)
	stream.refresh_flora_at(cam_region())


func set_walk_mode(on: bool, at_xz = null) -> void:
	if on == walk_mode and at_xz == null:
		return
	if on:
		var target := Vector2.ZERO
		if at_xz is Vector2:
			target = at_xz
		else:
			var cr := cam_region()
			target = Vector2(cr.x, cr.z)
		walk_at(target.x, target.y, _yaw)
	else:
		driving = false
		walk_mode = false
		if first_person or cam.position.distance_to(walker.position) < 2.5:
			var back := Basis(Vector3.UP, _yaw) * Vector3(0, 0, 1)
			cam.position = walker.position + back * 14.0 + Vector3(0, 8.0, 0)
			_pitch = clampf(_pitch, -PITCH_LIMIT, -0.15)
		_apply_fly_basis()
		stream.refresh_flora_at(cam_region())


func set_view_region(eye_reg: Vector3, target_reg: Vector3, as_walk := false) -> void:
	driving = false
	var focus := target_reg if as_walk else eye_reg
	_ensure_stream_at(focus.x, focus.z)
	var diff := target_reg - eye_reg
	var hlen := Vector2(diff.x, diff.z).length()
	if hlen > 0.01:
		_yaw = atan2(-diff.x, -diff.z)
		_pitch = clampf(atan2(diff.y, hlen), -PITCH_LIMIT, PITCH_LIMIT)
	if as_walk:
		walk_at(target_reg.x, target_reg.z, _yaw)
	else:
		walk_mode = false
		var gh := stream.height_at(eye_reg.x, eye_reg.z)
		var ey := maxf(eye_reg.y, gh + 2.0) if is_finite(gh) else eye_reg.y
		cam.position = stream.local(eye_reg.x, ey, eye_reg.z)
		var sy := stream.height_at(target_reg.x, target_reg.z)
		walker.position = stream.local(target_reg.x, (sy if is_finite(sy) else target_reg.y) + HEIGHT, target_reg.z)
		walker.velocity = Vector3.ZERO
		_apply_fly_basis()
		stream.refresh_flora_at(cam_region())


func fly_to_point(pt_reg: Vector3, dist := 85.0) -> void:
	var pitch := -0.42
	var back := Basis(Vector3.UP, _yaw) * Basis(Vector3.RIGHT, pitch) * Vector3(0, 0, dist)
	set_view_region(pt_reg + back, pt_reg, false)


func to_ground() -> void:
	var f := focus_region_xz()
	walk_at(f.x, f.y, _yaw)


func drive(points: Array, v: float) -> void:
	if points.size() > 0 and not walk_mode:
		walk_at(float(points[0][0]), float(points[0][1]), _yaw)
	route = points
	route_i = 0
	speed = v
	driving = route.size() > 0


func region_xz() -> Vector2:
	var r: Array = stream.region(walker.position)
	return Vector2(r[0], r[2])


func cam_region() -> Vector3:
	var r: Array = stream.region(cam.position)
	return Vector3(float(r[0]), float(r[1]), float(r[2]))


func focus_region_xz() -> Vector2:
	if walk_mode:
		return region_xz()
	var c := cam_region()
	return Vector2(c.x, c.z)


func look_dir() -> Vector3:
	return -(Basis(Vector3.UP, _yaw) * Basis(Vector3.RIGHT, _pitch)).z.normalized()


func look_region(dist := 50.0) -> Vector3:
	return cam_region() + look_dir() * dist


func feet_y() -> float:
	return float(stream.region(walker.position)[1]) - HEIGHT * 0.5


func fly_speed_mps() -> float:
	var cr := cam_region()
	var gh := stream.height_at(cr.x, cr.z)
	var agl := maxf(cr.y - gh, 6.0) if is_finite(gh) else maxf(absf(cr.y), 25.0)
	return clampf(agl * 0.9, 14.0, 18000.0) * speed_mul


func _on_rebased(delta: Vector3) -> void:
	walker.position += delta
	cam.position += delta


func _update_cam_near() -> void:
	if cam == null:
		return
	if walk_mode:
		cam.near = 0.2
		return
	var cr := cam_region()
	var gh := stream.height_at(cr.x, cr.z) if stream != null else NAN
	var agl := maxf(cr.y - gh, 0.0) if is_finite(gh) else absf(cr.y)
	cam.near = clampf(0.2 + maxf(agl - 30.0, 0.0) * 0.0025, 0.2, 2.0)


func _apply_fly_basis() -> void:
	cam.basis = Basis(Vector3.UP, _yaw) * Basis(Vector3.RIGHT, _pitch)
	_update_cam_near()


func _rescue_under_terrain() -> void:
	if not stream.collide:
		return
	var rxz := region_xz()
	var gh := stream.height_at(rxz.x, rxz.y)
	if is_inside_tree() and get_world_3d() != null:
		var sp := get_world_3d().direct_space_state
		var from_p := walker.global_position
		var to_p := from_p + Vector3(0.0, 48.0, 0.0)
		var q := PhysicsRayQueryParameters3D.create(from_p, to_p)
		q.exclude = [walker.get_rid()]
		q.hit_back_faces = true
		var hit := sp.intersect_ray(q)
		if not hit.is_empty():
			var col = hit.get("collider")
			if col is Node and (col as Node).get_parent() != null and (col as Node).get_parent().name == "Terrain":
				walker.global_position.y = (hit["position"] as Vector3).y + HEIGHT * 0.5 + 0.06
				if walker.velocity.y < 0.0:
					walker.velocity.y = 0.0
				floor_rescues += 1
				return
	if not walker.is_on_floor() and is_finite(gh) and feet_y() < gh - 6.0:
		walker.position.y = stream.local(rxz.x, gh + HEIGHT * 0.5 + 0.08, rxz.y).y
		if walker.velocity.y < 0.0:
			walker.velocity.y = 0.0
		floor_rescues += 1


func _physics_process(dt: float) -> void:
	if stream == null:
		return
	var t_phys := Time.get_ticks_usec()
	if walk_mode:
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
		elif interactive and keyboard_enabled:
			var iv := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
			if Input.is_key_pressed(KEY_A): iv.x -= 1
			if Input.is_key_pressed(KEY_D): iv.x += 1
			if Input.is_key_pressed(KEY_W): iv.y -= 1
			if Input.is_key_pressed(KEY_S): iv.y += 1
			if iv.length() > 0:
				dir = (Basis(Vector3.UP, _yaw) * Vector3(iv.x, 0, iv.y)).normalized()
		var run_mul := 5.0 if interactive and keyboard_enabled and Input.is_key_pressed(KEY_SHIFT) else (0.35 if interactive and keyboard_enabled and Input.is_key_pressed(KEY_CTRL) else 1.0)
		var v := speed * speed_mul * run_mul
		walker.velocity.x = dir.x * v
		walker.velocity.z = dir.z * v
		if walker.is_on_floor():
			if interactive and keyboard_enabled and Input.is_key_pressed(KEY_SPACE):
				walker.velocity.y = 5.2
			else:
				walker.velocity.y = 0.0
		else:
			walker.velocity.y -= GRAVITY * dt
		var t_move := Time.get_ticks_usec()
		_step_up(Vector3(walker.velocity.x, 0, walker.velocity.z) * dt)
		walker.move_and_slide()
		_rescue_under_terrain()
		move_ms = (Time.get_ticks_usec() - t_move) / 1000.0
		if dir.length() > 0 and not interactive:
			_yaw = atan2(dir.x, dir.z) + PI
		_follow(false)
	else:
		move_ms = 0.0
		if interactive and keyboard_enabled:
			var mv := Vector3.ZERO
			var b := Basis(Vector3.UP, _yaw) * Basis(Vector3.RIGHT, _pitch)
			var fwd := -b.z
			var rgt := b.x
			if Input.is_key_pressed(KEY_W) or Input.is_action_pressed("ui_up"): mv += fwd
			if Input.is_key_pressed(KEY_S) or Input.is_action_pressed("ui_down"): mv -= fwd
			if Input.is_key_pressed(KEY_D) or Input.is_action_pressed("ui_right"): mv += rgt
			if Input.is_key_pressed(KEY_A) or Input.is_action_pressed("ui_left"): mv -= rgt
			if Input.is_key_pressed(KEY_E) or Input.is_key_pressed(KEY_SPACE): mv += Vector3.UP
			if Input.is_key_pressed(KEY_Q): mv -= Vector3.UP
			if mv.length_squared() > 1e-6:
				var mul := 4.0 if Input.is_key_pressed(KEY_SHIFT) else (0.25 if Input.is_key_pressed(KEY_CTRL) or Input.is_key_pressed(KEY_ALT) else 1.0)
				cam.position += mv.normalized() * (fly_speed_mps() * mul * dt)
			var cr := cam_region()
			var gh := stream.height_at(cr.x, cr.z)
			if is_finite(gh):
				var min_local_y := stream.local(cr.x, gh + 1.2, cr.z).y
				if cam.position.y < min_local_y:
					cam.position.y = min_local_y
			walker.position = Vector3(cam.position.x, cam.position.y, cam.position.z)
		_apply_fly_basis()
	stream.poll()   # attach what the worker finished
	steps += 1
	_t += dt
	if _t >= UPDATE_EVERY:
		_t = 0.0
		var t0 := Time.get_ticks_usec()
		var r := stream.update(focus_region_xz(), LOAD_R, KEEP_R)
		var cr_now := cam_region()
		if not is_finite(stream._last_flora_cam.x) or cr_now.distance_squared_to(stream._last_flora_cam) >= 1600.0:
			stream.refresh_flora_at(cr_now)
		var ms := (Time.get_ticks_usec() - t0) / 1000.0
		if (r["loaded"] as Array).size() + (r["unloaded"] as Array).size() > 0:
			updates.append({"ms": ms, "loaded": r["loaded"], "unloaded": r["unloaded"], "step": steps})
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
	var nrm := col.get_normal()
	if nrm.y < -0.5 or nrm.dot(Vector3.UP) > cos(walker.floor_max_angle):   # downward backface or walkable slope ahead, not a step
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
	if not walk_mode:
		_apply_fly_basis()


func look_drag(dx: float, dy: float) -> void:
	_yaw -= dx
	_pitch = clampf(_pitch - dy, -PITCH_LIMIT, PITCH_LIMIT)
	if not walk_mode:
		_apply_fly_basis()


func pan_drag(dx: float, dy: float) -> void:
	if walk_mode:
		return
	var cr := cam_region()
	var gh := stream.height_at(cr.x, cr.z)
	var scale_m := maxf((cr.y - gh) if is_finite(gh) else 60.0, 8.0) * 0.0022
	var b := cam.basis
	cam.position += (-b.x * dx + b.y * dy) * scale_m
	var cr2 := cam_region()
	var gh2 := stream.height_at(cr2.x, cr2.z)
	if is_finite(gh2):
		cam.position.y = maxf(cam.position.y, stream.local(cr2.x, gh2 + 1.2, cr2.z).y)


func dolly_wheel(hit_local: Variant, zoom_in: bool, fast := false) -> void:
	if walk_mode:
		var step_d := (2.6 if fast else 1.2) * (-1.0 if zoom_in else 1.0)
		if first_person and not zoom_in:
			first_person = false
			chase_dist = 3.2
		else:
			chase_dist = clampf(chase_dist + step_d, 1.6, 28.0)
			if zoom_in and chase_dist <= 1.7:
				first_person = true
		return
	var k := 0.34 if fast else 0.18
	if hit_local is Vector3:
		var delta: Vector3 = (hit_local as Vector3) - cam.position
		var dlen := delta.length()
		if zoom_in:
			if dlen > 1.8:
				cam.position += delta * k
		else:
			cam.position -= delta * k
	else:
		var step_f := maxf(fly_speed_mps() * (0.45 if fast else 0.22), 4.0)
		cam.position += look_dir() * (step_f if zoom_in else -step_f)
	var cr := cam_region()
	var gh := stream.height_at(cr.x, cr.z)
	if is_finite(gh):
		cam.position.y = maxf(cam.position.y, stream.local(cr.x, gh + 1.2, cr.z).y)


# the camera in Walk mode: 1st-person eye height or 3rd-person orbit behind the walker with spring-arm terrain clearance
func _follow(snap: bool) -> void:
	if not cam.is_inside_tree():
		return
	_update_cam_near()
	if first_person:
		cam.position = walker.position + Vector3(0.0, HEIGHT * 0.42, 0.0)
		cam.basis = Basis(Vector3.UP, _yaw) * Basis(Vector3.RIGHT, _pitch)
		return
	var pivot := walker.position + Vector3(0.0, 1.25, 0.0)
	var arm_pitch := clampf(_pitch, -1.25, 0.45)
	var arm := Basis(Vector3.UP, _yaw) * Basis(Vector3.RIGHT, arm_pitch) * Vector3(0.0, 0.0, chase_dist)
	var want := pivot + arm
	if get_world_3d() != null:
		var sp := get_world_3d().direct_space_state
		var q := PhysicsRayQueryParameters3D.create(to_global(pivot), to_global(want))
		q.exclude = [walker.get_rid()]
		var hit := sp.intersect_ray(q)
		if not hit.is_empty():
			var hp := to_local(hit["position"] as Vector3)
			var safe_d := maxf(pivot.distance_to(hp) - 0.35, 0.8)
			want = pivot + arm.normalized() * safe_d
	var cr: Array = stream.region(want)
	var gh := stream.height_at(float(cr[0]), float(cr[2]))
	if is_finite(gh):
		want.y = maxf(want.y, stream.local(float(cr[0]), gh + 0.65, float(cr[2])).y)
	cam.position = want if snap else cam.position.lerp(want, 0.24)
	if cam.position.distance_squared_to(pivot) > 1e-4:
		cam.look_at(pivot, Vector3.UP)
