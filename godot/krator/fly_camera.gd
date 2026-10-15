# A free-flying camera for looking at an import: left or right mouse drag to look, middle drag to orbit the point
# ahead, arrow keys to turn and tilt, wheel to zoom (dolly), Ctrl+wheel for fly speed, + / - to narrow or widen the
# lens (Backspace resets it), WASD to move, Q/E down/up, Shift for x5.
extends Camera3D

var speed := 20.0
var _yaw := 0.0
var _pitch := -0.3
var _drag := 0          # 0 none, 1 look, 2 orbit
var _orbit_dist := 10.0
const TURN := 1.6       # arrow keys, radians a second
var _fov0 := -1.0      # the lens the viewer started with (spike.gd --fov), kept at the first zoom


func look_from(eye: Vector3, target: Vector3) -> void:
	position = eye
	var d := (target - eye).normalized()
	_yaw = atan2(-d.x, -d.z)
	_pitch = asin(clamp(d.y, -1.0, 1.0))
	_orbit_dist = clamp(eye.distance_to(target), 2.0, 200.0)
	_apply()


func _apply() -> void:
	rotation = Vector3(_pitch, _yaw, 0.0)


func _forward() -> Vector3:
	return -global_transform.basis.z


func _unhandled_input(e: InputEvent) -> void:
	if e is InputEventMouseButton:
		var mb := e as InputEventMouseButton
		if mb.button_index in [MOUSE_BUTTON_LEFT, MOUSE_BUTTON_RIGHT, MOUSE_BUTTON_MIDDLE]:
			if mb.pressed and _drag == 0:
				_drag = 2 if mb.button_index == MOUSE_BUTTON_MIDDLE else 1
			elif not mb.pressed:
				_drag = 0
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED if _drag != 0 else Input.MOUSE_MODE_VISIBLE
		elif mb.pressed and mb.button_index in [MOUSE_BUTTON_WHEEL_UP, MOUSE_BUTTON_WHEEL_DOWN]:
			var up := mb.button_index == MOUSE_BUTTON_WHEEL_UP
			if mb.ctrl_pressed:
				speed = speed * 1.25 if up else speed / 1.25
			else:
				# dolly: a step that grows with the fly speed, so it suits both a room and a whole region
				var step := speed * 0.1 * (5.0 if mb.shift_pressed else 1.0)
				position += _forward() * (step if up else -step)
				_orbit_dist = clamp(_orbit_dist - (step if up else -step), 2.0, 200.0)
	elif e is InputEventMouseMotion and _drag != 0:
		var mm := e as InputEventMouseMotion
		if _drag == 2:
			var pivot := position + _forward() * _orbit_dist
			_yaw -= mm.relative.x * 0.005
			_pitch = clamp(_pitch - mm.relative.y * 0.005, -1.5, 1.5)
			_apply()
			position = pivot - _forward() * _orbit_dist
		else:
			_yaw -= mm.relative.x * 0.003
			_pitch = clamp(_pitch - mm.relative.y * 0.003, -1.5, 1.5)
			_apply()
	elif e is InputEventKey and e.pressed:
		var k := e as InputEventKey
		if _fov0 < 0.0:
			_fov0 = fov
		if k.keycode in [KEY_EQUAL, KEY_PLUS, KEY_KP_ADD]:
			fov = clamp(fov / 1.15, 10.0, 110.0)
		elif k.keycode in [KEY_MINUS, KEY_KP_SUBTRACT]:
			fov = clamp(fov * 1.15, 10.0, 110.0)
		elif k.keycode == KEY_BACKSPACE:
			fov = _fov0


func _process(delta: float) -> void:
	var turn := Vector2.ZERO
	if Input.is_key_pressed(KEY_LEFT): turn.x += 1
	if Input.is_key_pressed(KEY_RIGHT): turn.x -= 1
	if Input.is_key_pressed(KEY_UP): turn.y += 1
	if Input.is_key_pressed(KEY_DOWN): turn.y -= 1
	if turn != Vector2.ZERO:
		# slower when zoomed in, so a narrow lens stays steerable
		var r := TURN * delta * (fov / (_fov0 if _fov0 > 0.0 else fov))
		_yaw += turn.x * r
		_pitch = clamp(_pitch + turn.y * r, -1.5, 1.5)
		_apply()
	var v := Vector3.ZERO
	if Input.is_key_pressed(KEY_W): v.z -= 1
	if Input.is_key_pressed(KEY_S): v.z += 1
	if Input.is_key_pressed(KEY_A): v.x -= 1
	if Input.is_key_pressed(KEY_D): v.x += 1
	if Input.is_key_pressed(KEY_E): v.y += 1
	if Input.is_key_pressed(KEY_Q): v.y -= 1
	if v == Vector3.ZERO:
		return
	var s := speed * (5.0 if Input.is_key_pressed(KEY_SHIFT) else 1.0)
	translate(v.normalized() * s * delta)
