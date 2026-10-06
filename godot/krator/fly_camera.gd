# A free-flying camera for looking at an import: right mouse drag to look, WASD to move, Q/E down/up,
# Shift for x5, wheel to change speed.
extends Camera3D

var speed := 20.0
var _yaw := 0.0
var _pitch := -0.3
var _looking := false


func look_from(eye: Vector3, target: Vector3) -> void:
	position = eye
	var d := (target - eye).normalized()
	_yaw = atan2(-d.x, -d.z)
	_pitch = asin(clamp(d.y, -1.0, 1.0))
	_apply()


func _apply() -> void:
	rotation = Vector3(_pitch, _yaw, 0.0)


func _unhandled_input(e: InputEvent) -> void:
	if e is InputEventMouseButton:
		var mb := e as InputEventMouseButton
		if mb.button_index == MOUSE_BUTTON_RIGHT:
			_looking = mb.pressed
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED if mb.pressed else Input.MOUSE_MODE_VISIBLE
		elif mb.button_index == MOUSE_BUTTON_WHEEL_UP and mb.pressed:
			speed *= 1.25
		elif mb.button_index == MOUSE_BUTTON_WHEEL_DOWN and mb.pressed:
			speed /= 1.25
	elif e is InputEventMouseMotion and _looking:
		var mm := e as InputEventMouseMotion
		_yaw -= mm.relative.x * 0.003
		_pitch = clamp(_pitch - mm.relative.y * 0.003, -1.5, 1.5)
		_apply()


func _process(delta: float) -> void:
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
