# A page's lamps lit at run time by a fixed pool of lights (the twin of settlements/qiblai targets/city/90v-qc-oilfield.js's
# pool, 2026-11-16): COUNT OmniLight3D moved, every INTERVAL seconds, to the lamps nearest the camera that are lit at the
# clock's hour (the Atmos autoload's glow_lit by each lamp's hours). A lamp of kind "bulb" (a room's light: always on, a short
# reach) is taken within BULB_REACH in 3D and counts nearer by BULB_BIAS (the room the eye is in); a street lamp within
# LAMP_REACH in plan. The count never changes, as the page's never does (a light's count is compiled into every lit shader).
# Built by krator/lamps_import.gd (KratorLamps.build(path, focus, true)); KratorLampPool.pick is the choice alone, for tests.
class_name KratorLampPool
extends Node3D

const COUNT := 8
const INTERVAL := 0.5
const BULB_BIAS := 0.5
const LAMP_REACH := 160.0
const BULB_REACH := 30.0

var lamps: Array = []
var focus_override = null   # a Vector3: the eye, when there is no camera (tests)
var atmos_override = null   # an Atmos instance, when the autoload is absent (tests)
var hour_override = null    # an hour, likewise
var _t := 0.0


func _ready() -> void:
	for i in COUNT:
		var o := OmniLight3D.new()
		o.name = "Pool%d" % i
		o.light_energy = 0.0
		o.visible = false
		o.shadow_enabled = false
		add_child(o)


static func pick(all: Array, pos: Vector3, hour: float, atmos, n: int) -> Array:
	var cand := []
	for l in all:
		var hr: Array = l["hours"]
		var k: float = 1.0
		if atmos != null:
			k = atmos.glow_lit(hour, float(hr[0]), float(hr[1]))
		if k <= 0.001:
			continue
		var a: Array = l["at"]
		var p := Vector3(float(a[0]), float(a[1]), float(a[2]))
		var d: float
		if str(l.get("kind", "lamp")) == "bulb":
			d = p.distance_squared_to(pos)
			if d > BULB_REACH * BULB_REACH:
				continue
			d *= BULB_BIAS
		else:
			d = Vector2(p.x - pos.x, p.z - pos.z).length_squared()
			if d > LAMP_REACH * LAMP_REACH:
				continue
		cand.append([d, l, k])
	cand.sort_custom(func(x, y): return x[0] < y[0])
	return cand.slice(0, n)


func _process(dt: float) -> void:
	_t += dt
	if _t < INTERVAL:
		return
	_t = 0.0
	refresh()


func refresh() -> int:
	var pos: Vector3
	if focus_override != null:
		pos = focus_override
	else:
		var cam := get_viewport().get_camera_3d()
		if cam == null:
			return 0
		pos = cam.global_position
	var atmos = atmos_override if atmos_override != null else get_node_or_null("/root/Atmos")
	var hour: float = 12.0
	if hour_override != null:
		hour = hour_override
	elif atmos != null:
		hour = atmos.hour
	var picked := pick(lamps, pos, hour, atmos, COUNT)
	for i in get_child_count():
		var o := get_child(i) as OmniLight3D
		if i < picked.size():
			var l: Dictionary = picked[i][1]
			var a: Array = l["at"]
			o.position = Vector3(float(a[0]), float(a[1]), float(a[2]))
			o.omni_range = float(l.get("radius", 16.0))
			o.light_color = KData.colour(l["color"], true)
			o.light_energy = 1.2 * float(l.get("amp", 1.0)) * float(picked[i][2])
			o.visible = true
		else:
			o.visible = false
			o.light_energy = 0.0
	return picked.size()
