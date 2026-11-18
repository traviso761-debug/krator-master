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
const PORTAL_PENALTY := 2.4
const EXTERIOR_PORTAL_REACH := 3.5
const LAMP_REACH := 160.0
const BULB_REACH := 30.0

var lamps: Array = []
var rooms: Array = []       # optional room records ({id, box:[x0,y0,z0,x1,y1,z1] or poly+y0+y1, portals:[id,...], doors:[[x,y,z],...]})
var hero_shadows := 0       # nearest N pool lights cast dynamic OmniLight3D shadows (0..2)
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


static func _point_in_room(r: Dictionary, pos: Vector3) -> bool:
	if r.has("box"):
		var b: Array = r["box"]
		return (pos.x >= float(b[0]) and pos.x <= float(b[3])
			and pos.y >= float(b[1]) and pos.y <= float(b[4])
			and pos.z >= float(b[2]) and pos.z <= float(b[5]))
	if r.has("poly"):
		var lp := pos
		if r.get("inv_xf") is Transform3D:
			lp = (r["inv_xf"] as Transform3D) * pos
		var y0 := float(r.get("y0", -INF))
		var y1 := float(r.get("y1", INF))
		if lp.y < y0 or lp.y > y1:
			return false
		var p2 := PackedVector2Array()
		for pt in r["poly"]:
			p2.append(Vector2(float(pt[0]), float(pt[1])))
		return Geometry2D.is_point_in_polygon(Vector2(lp.x, lp.z), p2)
	return false


# returns the id of the room containing pos, or "" when outdoors / outside all rooms
static func room_at(rooms_list: Array, pos: Vector3) -> String:
	for r in rooms_list:
		if r is Dictionary and _point_in_room(r, pos):
			return str(r.get("id", ""))
	return ""


static func _room_center(r: Dictionary) -> Variant:
	if r.get("center") is Vector3:
		return r["center"]
	if r.has("box"):
		var b: Array = r["box"]
		return Vector3(0.5 * (float(b[0]) + float(b[3])), 0.5 * (float(b[1]) + float(b[4])), 0.5 * (float(b[2]) + float(b[5])))
	return null


static func _near_door(r: Dictionary, pos: Vector3, reach: float, outside_only := false) -> bool:
	var r2 := reach * reach
	var c = _room_center(r) if outside_only else null
	for dp in r.get("doors", []):
		var q := dp as Vector3 if dp is Vector3 else Vector3(float(dp[0]), float(dp[1]), float(dp[2]))
		if q.distance_squared_to(pos) <= r2:
			if c is Vector3:
				var outward := Vector2(q.x - c.x, q.z - c.z)
				var to_eye := Vector2(pos.x - q.x, pos.z - q.z)
				if outward.length_squared() > 1e-4 and to_eye.dot(outward.normalized()) < -0.20:
					continue
			return true
	return false


static func pick(all: Array, pos: Vector3, hour: float, atmos, n: int) -> Array:
	return pick_rooms(all, pos, hour, atmos, n, [])


# Room-gated selection (I2/I3): when rooms_list is non-empty, indoor bulbs never bleed across solid 20 cm walls into
# unlinked rooms or through solid exterior walls onto the street; portal-linked adjacent rooms receive soft doorway spill.
static func pick_rooms(all: Array, pos: Vector3, hour: float, atmos, n: int, rooms_list: Array) -> Array:
	var has_rooms := not rooms_list.is_empty()
	var by_room := {}
	var eye_room := ""
	if has_rooms:
		for r in rooms_list:
			if r is Dictionary:
				by_room[str(r.get("id", ""))] = r
		eye_room = room_at(rooms_list, pos)
	var eye_rec: Dictionary = by_room.get(eye_room, {})
	var eye_portals: Array = eye_rec.get("portals", [])
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
			if has_rooms:
				var lroom := str(l["room"]) if l.get("room") != null and str(l["room"]) != "" else room_at(rooms_list, p)
				if eye_room != "":
					if lroom == eye_room:
						d *= BULB_BIAS
					elif lroom != "" and (lroom in eye_portals):
						d *= PORTAL_PENALTY
					elif lroom != "":
						continue
					else:
						d *= PORTAL_PENALTY
				else:
					if lroom != "":
						var lrec: Dictionary = by_room.get(lroom, {})
						if _near_door(lrec, pos, EXTERIOR_PORTAL_REACH, true):
							d *= PORTAL_PENALTY
						else:
							continue
					else:
						d *= BULB_BIAS
			else:
				d *= BULB_BIAS
		else:
			d = Vector2(p.x - pos.x, p.z - pos.z).length_squared()
			if d > LAMP_REACH * LAMP_REACH:
				continue
			if has_rooms and eye_room != "":
				if _near_door(eye_rec, pos, 12.0):
					d *= 4.0
				else:
					continue
		cand.append([d, l, k])
	cand.sort_custom(func(x, y): return x[0] < y[0])
	return cand.slice(0, n)


func eye_is_indoors(pos: Vector3) -> bool:
	return room_at(rooms, pos) != ""


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
		pos = to_local(cam.global_position) if is_inside_tree() else cam.global_position
	var atmos = atmos_override if atmos_override != null else get_node_or_null("/root/Atmos")
	var hour: float = 12.0
	if hour_override != null:
		hour = hour_override
	elif atmos != null:
		hour = atmos.hour
	var picked := pick_rooms(lamps, pos, hour, atmos, COUNT, rooms)
	for i in get_child_count():
		var o := get_child(i) as OmniLight3D
		if i < picked.size():
			var l: Dictionary = picked[i][1]
			var a: Array = l["at"]
			o.position = Vector3(float(a[0]), float(a[1]), float(a[2]))
			o.omni_range = float(l.get("radius", 16.0))
			o.light_color = KData.colour(l["color"], true)
			o.light_energy = 1.2 * float(l.get("amp", 1.0)) * float(picked[i][2])
			o.shadow_enabled = (i < hero_shadows)
			o.visible = true
		else:
			o.shadow_enabled = false
			o.visible = false
			o.light_energy = 0.0
	return picked.size()
