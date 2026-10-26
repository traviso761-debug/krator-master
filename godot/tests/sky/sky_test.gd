# The sky model in Godot (krator/sky_model.gd) against core/atmos's own numbers (golden.json, written by
# godot/tools/atmos_sky.js from the JavaScript): skyState at a spread of sites, hours and days (the sun, the giant and its
# libration, the ring, all six moons, the eclipse, the stars' sphere), the colour script, the date, the noise volume
# (baked at 8^3 here, the shipped 64^3 file by its digest), and that shaders/atmos_sky.gdshaderinc is current.
#   godot --headless --path godot --script res://tests/sky/sky_test.gd      exits 0 when every vector matches
extends SceneTree

const EPS := 1e-6   # Vector3 is single precision in Godot's default build: directions agree to ~1e-7


func _initialize() -> void:
	var dir: String = get_script().resource_path.get_base_dir()
	var gold: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir + "/golden.json"))
	var M = load("res://krator/sky_model.gd").new()
	var bad := 0
	var n := 0
	for g in gold["state"]:
		var site: Dictionary = M.site_at(g["px"], g["py"])
		var s: Dictionary = M.sky_state(site, g["hour"], g["day"])
		var tag := "state %s,%s h%s d%s" % [g["px"], g["py"], g["hour"], g["day"]]
		bad += _near(tag + " latitude", site["latitude"], g["latitude"])
		bad += _near(tag + " subGiantLon", site["subGiantLon"], g["subGiantLon"])
		for k in ["sunDir", "giantDir", "giantAxis", "pole", "ringLine", "clusterDir"]:
			bad += _vec(tag + " " + k, s[k], g[k])
		bad += _vec(tag + " ringNormal", M.ring_normal(s), g["ringNormal"])
		for k in ["ringOpen", "eclipse", "giantLit", "spin", "lst"]:
			bad += _near(tag + " " + k, s[k], g[k])
		for c in 3:   # W's columns: the JavaScript's eq is rows of W
			bad += _vec(tag + " eq col %d" % c, s["eq"][c], [g["eq"][0][c], g["eq"][1][c], g["eq"][2][c]])
		for i in g["moons"].size():
			var a: Dictionary = s["moons"][i]
			var b: Dictionary = g["moons"][i]
			for k in ["dir", "light", "lead", "toGiant"]:
				bad += _vec(tag + " " + b["name"] + " " + k, a[k], b[k])
			for k in ["radiusDeg", "lit"]:
				bad += _near(tag + " " + b["name"] + " " + k, a[k], b[k])
			bad += _near(tag + " " + b["name"] + " distKm", a["distKm"] / 1e5, b["distKm"] / 1e5)
			bad += 0 if int(a["front"]) == int(b["front"]) else _fail(tag + " " + b["name"] + " front")
		var sa: Dictionary = s["station"]
		var sb: Dictionary = g["station"]
		for k in ["dir", "axis", "vel"]:
			bad += _vec(tag + " station " + k, sa[k], sb[k])
		bad += _near(tag + " station dist", sa["dist"] / 1e4, sb["dist"] / 1e4)
		bad += _near(tag + " station lit", sa["lit"], sb["lit"])
		n += 1
	# the landmarks: the same packing as ATMOS.skyLandmarks
	var LG: Dictionary = gold["landmarks"]
	var LM: Dictionary = M.landmarks(LG["input"])
	bad += 0 if int(LM["n"]) == int(LG["n"]) else _fail("landmarks n")
	for i in LM["kind"].size():
		bad += _near("landmark kind %d" % i, LM["kind"][i], LG["kind"][i])
	for i in LM["v"].size():
		var lv: Vector4 = LM["v"][i]
		for c in 4:
			bad += _near("landmark v %d.%d" % [i, c], lv[c], LG["v"][i * 4 + c])
	var P: Dictionary = gold["preset"]
	for g in gold["look"]:
		var site: Dictionary = M.site_at(446, 690)
		var s: Dictionary = M.sky_state(site, g["hour"], g["day"])
		var L: Dictionary = M.look(P, s, g["weather"])
		for k in g["look"]:
			var v = g["look"][k]
			if v is Array:
				bad += _vec("look h%s %s" % [g["hour"], k], L[k], v)
			elif v is float or v is int:
				bad += _near("look h%s %s" % [g["hour"], k], L[k], v)
	for g in gold["dates"]:
		var d: Dictionary = M.sky_date(g["day"], g["hour"])
		for k in g["date"]:
			var x = g["date"][k]
			if (str(d[k]) != str(x)) if x is String else absf(float(d[k]) - float(x)) > 0.0:
				bad += _fail("date %s %s: %s != %s" % [g["day"], k, d[k], g["date"][k]])
	var v8: PackedByteArray = M.noise_volume(8)
	var g8: Array = gold["noise"]["n8"]
	for i in g8.size():
		if v8[i] != int(g8[i]):
			bad += _fail("noise8 byte %d: %d != %d" % [i, v8[i], g8[i]])
			break
	var shipped := FileAccess.get_file_as_bytes("res://data/sky/noise64.bin")
	var ctx := HashingContext.new()
	ctx.start(HashingContext.HASH_SHA1)
	ctx.update(shipped)
	if ctx.finish().hex_encode() != gold["noise"]["sha1"]:
		bad += _fail("data/sky/noise64.bin is not the JavaScript's volume: rerun node godot/tools/atmos_sky.js")
	var inc := FileAccess.get_file_as_string("res://shaders/atmos_sky.gdshaderinc")
	if inc.sha1_text() != gold["gdshaderinc_sha1"]:
		bad += _fail("shaders/atmos_sky.gdshaderinc is stale: rerun node godot/tools/atmos_sky.js")
	print("sky: %d states, %d looks checked, %d bad" % [n, gold["look"].size(), bad])
	quit(1 if bad else 0)


func _fail(msg: String) -> int:
	printerr("FAIL  " + msg)
	return 1


func _near(tag: String, a, b) -> int:
	var x := float(a)
	var y := float(b)
	if absf(x - y) <= EPS * maxf(1.0, absf(y)):
		return 0
	return _fail("%s: %.12f != %.12f" % [tag, x, y])


func _vec(tag: String, a, b) -> int:
	var A: Array = [a.x, a.y, a.z] if a is Vector3 else a
	for i in 3:
		if absf(float(A[i]) - float(b[i])) > EPS * maxf(1.0, absf(float(b[i]))):
			return _fail("%s: %s != %s" % [tag, str(A), str(b)])
	return 0
