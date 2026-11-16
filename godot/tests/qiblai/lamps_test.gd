# Qiblai's electric light in Godot (2026-11-16, the owner: "run a test of the lighting in godot"; then "work on indoor glow;
# work on a functioning godot equivalent"): the qiblai case's lamps (data/qiblai/lamps.json, krator-lamps from the page's
# _api.lamps, godot/tools/export_spike.py, with the reach's interiors placed so their room bulbs come too) through the
# spike's importer (krator/lamps_import.gd) and the pool that lights them at run time (krator/lamp_pool.gd, the twin of the
# page's 90v pool), by the Atmos clock's hours (krator/atmos.gd), against the page's own numbers:
#   - the file is krator-lamps; its street lamps stand on the avenue (within 14 m of its line, x 0) at a bulb's height over
#     the page's ground (terrain.json), warm, 24 m, dusk to dawn; its room bulbs are warm, 9 m, always on
#   - the static import (the spike's other pages): a halo a lamp, an OmniLight3D at each nearest lamp, off at noon, on at 21:30
#   - the pool: KratorLampPool.COUNT lights; at 21:30 on the avenue it lights street lamps; at noon street lamps none, bulbs
#     still; inside a room the nearest light is that room's bulb; moved down the avenue, its lights move with the eye
#   godot --headless --path godot --script res://tests/qiblai/lamps_test.gd      exits 0 when every check passes
extends SceneTree

var bad := 0


func _init() -> void:
	var path := "res://data/qiblai/lamps.json"
	var d = JSON.parse_string(FileAccess.get_file_as_string(path))
	_ok("krator-lamps file", d is Dictionary and d.get("format") == "krator-lamps", str(d is Dictionary))
	if bad:
		_end()
		return
	var lamps: Array = d["lamps"]
	var street := lamps.filter(func(l): return str(l.get("kind", "lamp")) != "bulb")
	var bulbs := lamps.filter(func(l): return str(l.get("kind", "lamp")) == "bulb")
	_ok("street lamps in the reach", street.size() >= 8, "%d" % street.size())
	_ok("room bulbs in the reach (its interiors placed)", bulbs.size() >= 8, "%d" % bulbs.size())
	var ter = JSON.parse_string(FileAccess.get_file_as_string("res://data/qiblai/terrain.json"))
	var off := 0
	var warm := 0
	for l in street:
		var a: Array = l["at"]
		if abs(float(a[0])) > 14.0:
			off += 1
		var h := float(a[1]) - _ground(ter, float(a[0]), float(a[2]))
		if h < 5.0 or h > 8.0:
			off += 1
		if str(l["color"]).to_lower() == "#ffd6a0" and abs(float(l["radius"]) - 24.0) < 1e-6 and abs(float(l["hours"][0]) - 17.2) < 1e-6 and abs(float(l["hours"][1]) - 30.8) < 1e-6:
			warm += 1
	_ok("every street lamp on the avenue at a bulb's height", off == 0, "%d off" % off)
	_ok("every street lamp warm, 24 m, dusk to dawn", warm == street.size(), "%d / %d" % [warm, street.size()])
	var bw := 0
	for l in bulbs:
		if abs(float(l["radius"]) - 9.0) < 1e-6 and float(l["hours"][0]) == 0.0 and float(l["hours"][1]) == 24.0:
			bw += 1
	_ok("every room bulb 9 m, always on", bw == bulbs.size(), "%d / %d" % [bw, bulbs.size()])

	var A = load("res://krator/atmos.gd").new()
	# the static import (the spike's other pages' route)
	var focus := Vector3(0, 0, 660)
	var root: Node3D = KratorLamps.build(path, focus)
	var halos := root.get_node_or_null("Halos") as MultiMeshInstance3D
	_ok("a halo a lamp", halos != null and halos.multimesh.instance_count == lamps.size(), "%d" % (halos.multimesh.instance_count if halos else -1))
	var lights := root.get_node("Lights").get_children()
	_ok("static: an OmniLight3D for each nearest lamp", lights.size() == min(KratorLamps.MAX_LIGHTS, lamps.size()), "%d" % lights.size())
	root.free()

	# the pool (Qiblai's route): in the tree, so it makes its lights
	var proot: Node3D = KratorLamps.build(path, focus, true)
	get_root().add_child(proot)
	var P: KratorLampPool = proot.get_node("LampPool")
	P._ready() if P.get_child_count() == 0 else null
	P.atmos_override = A
	_ok("the pool holds COUNT lights", P.get_child_count() == KratorLampPool.COUNT, "%d" % P.get_child_count())
	var gy := _ground(ter, 0.0, 700.0)
	P.hour_override = 21.5
	P.focus_override = Vector3(0, gy + 1.7, 700)
	var n := P.refresh()
	var lit_street := 0
	for o in P.get_children():
		if o.visible and _is_street(o.position, street):
			lit_street += 1
	_ok("21:30 on the avenue: the pool full, street lamps among it", n == KratorLampPool.COUNT and lit_street >= 1, "%d lit, %d street" % [n, lit_street])
	P.hour_override = 12.0   # by day, by a house with its rooms lit: its bulbs, no street lamp
	if not bulbs.is_empty():
		var b0: Array = bulbs[0]["at"]
		P.focus_override = Vector3(float(b0[0]) + 4.0, float(b0[1]) - 1.0, float(b0[2]))
	n = P.refresh()
	lit_street = 0
	var lit_bulb := 0
	for o in P.get_children():
		if o.visible:
			if _is_street(o.position, street):
				lit_street += 1
			else:
				lit_bulb += 1
	_ok("noon: no street lamp lit, bulbs still", lit_street == 0 and (lit_bulb > 0 or bulbs.is_empty()), "%d street, %d bulbs" % [lit_street, lit_bulb])
	if not bulbs.is_empty():
		var b: Array = bulbs[0]["at"]
		P.focus_override = Vector3(float(b[0]) + 0.6, float(b[1]) - 1.0, float(b[2]) + 0.6)
		P.refresh()
		var first: Vector3 = P.get_child(0).position
		_ok("inside a room: its own bulb the nearest light", first.distance_to(Vector3(float(b[0]), float(b[1]), float(b[2]))) < 0.01, str(first))
	P.hour_override = 21.5
	P.focus_override = Vector3(0, gy + 1.7, 560)
	P.refresh()
	var za := _mean_z(P)
	P.focus_override = Vector3(0, gy + 1.7, 780)
	P.refresh()
	var zb := _mean_z(P)
	_ok("the pool follows the eye down the avenue", zb - za > 60.0, "mean z %.0f then %.0f" % [za, zb])
	proot.queue_free()
	A.free()
	_end()


func _is_street(p: Vector3, street: Array) -> bool:
	for l in street:
		var a: Array = l["at"]
		if p.distance_to(Vector3(float(a[0]), float(a[1]), float(a[2]))) < 0.01:
			return true
	return false


func _mean_z(P: KratorLampPool) -> float:
	var s := 0.0
	var n := 0
	for o in P.get_children():
		if o.visible:
			s += o.position.z
			n += 1
	return s / max(1, n)


func _ground(ter, x: float, z: float) -> float:
	# terrain.json (krator-heightfield: x0, z0, step, nx, nz, heights as base64 Float32, z rows of x) at the nearest sample
	if not (ter is Dictionary):
		return 0.0
	var step := float(ter["step"])
	var nx := int(ter["nx"])
	var nz := int(ter["nz"])
	var i := clampi(int(round((x - float(ter["x0"])) / step)), 0, nx - 1)
	var j := clampi(int(round((z - float(ter["z0"])) / step)), 0, nz - 1)
	var raw := Marshalls.base64_to_raw(str(ter["heights"]["b64"]))
	return raw.decode_float((j * nx + i) * 4)


func _ok(name: String, cond: bool, detail: String) -> void:
	print(("PASS" if cond else "FAIL") + "  " + name + " (" + detail + ")")
	if not cond:
		bad += 1


func _end() -> void:
	print("qiblai lamps: " + ("all checks pass" if bad == 0 else "%d failed" % bad))
	quit(0 if bad == 0 else 1)
