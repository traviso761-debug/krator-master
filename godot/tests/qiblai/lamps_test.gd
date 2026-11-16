# Qiblai's electric light in Godot (2026-11-16, the owner: "run a test of the lighting in godot"): the qiblai case's lamps
# (data/qiblai/lamps.json, krator-lamps from the page's _api.lamps, godot/tools/export_spike.py) through the spike's importer
# (krator/lamps_import.gd) and the Atmos clock's light hours (krator/atmos.gd), against the page's own numbers:
#   - the file is krator-lamps and holds the reach's street lamps, each on the avenue (within 14 m of its line, x 0) at a
#     bulb's height over the ground (5 to 8 m over the page's own ground, terrain.json), warm (#ffd6a0), 24 m, dusk to dawn
#   - the importer makes one halo a lamp and an OmniLight3D for each of the nearest (at most KratorLamps.MAX_LIGHTS), each at
#     its lamp, with its range, colour and hours
#   - by the Atmos clock the lights are off at noon and on at 21:30 (the page's pool lights the nearest by night only)
#   godot --headless --path godot --script res://tests/qiblai/lamps_test.gd      exits 0 when every check passes
extends SceneTree


func _init() -> void:
	var bad := 0
	var path := "res://data/qiblai/lamps.json"
	var d = JSON.parse_string(FileAccess.get_file_as_string(path))
	bad += _ok("krator-lamps file", d is Dictionary and d.get("format") == "krator-lamps", str(d is Dictionary))
	if bad:
		_end(bad)
		return
	var lamps: Array = d["lamps"]
	bad += _ok("lamps in the reach", lamps.size() >= 8, "%d lamps" % lamps.size())
	var ter = JSON.parse_string(FileAccess.get_file_as_string("res://data/qiblai/terrain.json"))
	var off := 0
	var warm := 0
	for l in lamps:
		var a: Array = l["at"]
		if abs(float(a[0])) > 14.0:
			off += 1
		var gy := _ground(ter, float(a[0]), float(a[2]))
		var h := float(a[1]) - gy
		if h < 5.0 or h > 8.0:
			off += 1
		if str(l["color"]).to_lower() == "#ffd6a0" and abs(float(l["radius"]) - 24.0) < 1e-6 and l["hours"] == [17.2, 30.8]:
			warm += 1
	bad += _ok("every lamp on the avenue at a bulb's height", off == 0, "%d off" % off)
	bad += _ok("every lamp warm, 24 m, dusk to dawn", warm == lamps.size(), "%d / %d" % [warm, lamps.size()])

	var focus := Vector3(0, 0, 660)
	var root: Node3D = KratorLamps.build(path, focus)
	var halos := root.get_node_or_null("Halos") as MultiMeshInstance3D
	bad += _ok("a halo a lamp", halos != null and halos.multimesh.instance_count == lamps.size(), "%d" % (halos.multimesh.instance_count if halos else -1))
	var lights := root.get_node("Lights").get_children()
	var want: int = min(KratorLamps.MAX_LIGHTS, lamps.size())
	bad += _ok("an OmniLight3D for each nearest lamp", lights.size() == want, "%d, want %d" % [lights.size(), want])
	var at_lamp := 0
	for o in lights:
		var ol := o as OmniLight3D
		var hit := false
		for l in lamps:
			var a: Array = l["at"]
			if ol.position.distance_to(Vector3(float(a[0]), float(a[1]), float(a[2]))) < 1e-3 and abs(ol.omni_range - 24.0) < 1e-6:
				hit = true
				break
		if hit:
			at_lamp += 1
	bad += _ok("each light at its lamp, its range 24 m", at_lamp == lights.size(), "%d / %d" % [at_lamp, lights.size()])

	var A = load("res://krator/atmos.gd").new()
	var day := 0.0
	var night := 0.0
	for o in lights:
		var hr: Array = o.get_meta("hours")
		day += A.glow_lit(12.0, float(hr[0]), float(hr[1]))
		night += A.glow_lit(21.5, float(hr[0]), float(hr[1]))
	bad += _ok("off at noon", day < 1e-6, "%.3f" % day)
	bad += _ok("on at 21:30", lights.size() > 0 and night / lights.size() > 0.99, "%.3f" % (night / max(1, lights.size())))
	root.free()
	A.free()
	_end(bad)


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


func _ok(name: String, cond: bool, detail: String) -> int:
	print(("PASS" if cond else "FAIL") + "  " + name + " (" + detail + ")")
	return 0 if cond else 1


func _end(bad: int) -> void:
	print("qiblai lamps: " + ("all checks pass" if bad == 0 else "%d failed" % bad))
	quit(0 if bad == 0 else 1)
