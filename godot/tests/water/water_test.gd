# core/water's CPU twin in GDScript (krator/water.gd, KWater) against WATER's own (core/water/20-core-water.js) at fixed
# (x, z, t), each surface rebuilt from core/export's water section alone (the record a page exports). The golden is
# written by node godot/tools/water_golden.js: the Ring Sea's trochoids with half the shared wave field and a bed, a calm
# pond, a bay with the whole field and its chop. Heights (5 Newton steps, and the shader's 3), the vertex at a rest point,
# the shading frame and normal, the decayed foam, the bed's depth, the probes; KWater's shader uniforms. Each check has
# a negative.   godot --headless --path godot --script res://tests/water/water_test.gd     exits 0 when every check passes
extends SceneTree

const TOL := 1e-9    # metres for heights and depths, unitless for normals and foam: sin and cos differ in the last bits

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


# a number as d.de-N (GDScript's % has no %e)
static func sci(v: float) -> String:
	if v == 0.0:
		return "0"
	var e := floori(log(absf(v)) / log(10.0))
	return "%.1fe%d" % [v / pow(10.0, e), e]


func _initialize() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/water/golden.json"))
	var atm = load("res://krator/atmos.gd").new()
	atm.load_presets({"presets": {"waves": g["waves"]}})
	var sec: Dictionary = g["section"]
	var S := {}
	for w in KWater.from_section(sec, atm):
		S[w.id] = w
	ok(S.size() == 3 and sec["format"] == "krator-water" and sec["field"] == "atmos" and float(sec["period"]) == float(atm.waves["period"]),
		"the section rebuilds three open surfaces (period %s s, the field from atmos, Atmos's period the same)" % sec["period"])
	var sea: KWater = S["water:0"]
	ok(sea.level == null and sea.level_at(0.0) == 0.0 and sea.waves.size() == 4 and sea.bed != null and sea.field == 0.5,
		"the sea: no level of its own (the sea's), four trochoids, half the field, a bed of %d x %d texels" % [sea.bed["nx"], sea.bed["nz"]])

	# 1. every sampled quantity against WATER's
	var mx := {"h": 0.0, "h3": 0.0, "surface": 0.0, "normal": 0.0, "nj": 0.0, "foam": 0.0, "depth": 0.0}
	var n := 0
	for s in g["samples"]:
		var w: KWater = S[s["id"]]
		var x := float(s["x"])
		var z := float(s["z"])
		var t := float(s["t"])
		n += 1
		mx["h"] = maxf(mx["h"], absf(w.height_at(x, z, t) - float(s["h"])))
		mx["h3"] = maxf(mx["h3"], absf(w.height_at(x, z, t, 3) - float(s["h3"])))
		var su := w.surface_at(x, z, t, float(s["sp"]))
		for k in 4:
			mx["surface"] = maxf(mx["surface"], absf(su[k] - float(s["surface"][k])))
		var nn := w.normal_at(x, z, t, 60.0, 0.05)
		for k in 3:
			mx["normal"] = maxf(mx["normal"], absf(nn[k] - float(s["normal"][k])))
		var nj := w.tro_nj(x, z, t, 0.05)
		for k in 4:
			mx["nj"] = maxf(mx["nj"], absf(nj[k] - float(s["nj"][k])))
		mx["foam"] = maxf(mx["foam"], absf(w.foam_at(x, z, t, 0.05) - float(s["foam"])))
		if s["depth"] != null:
			mx["depth"] = maxf(mx["depth"], absf(w.depth_at(x, z, t) - float(s["depth"])))
	ok(mx["h"] < TOL and mx["h3"] < TOL, "heights at %d points and five clocks (to 98765 s) equal WATER.heightAt: max %s m (5 Newton steps), %s m (the shader's 3); tolerance %s m" % [n, sci(mx["h"]), sci(mx["h3"]), sci(TOL)])
	ok(mx["surface"] < TOL, "the vertex at a rest point for three vertex spacings (each wave faded by k * spacing) equals S.surfaceAt: max %s" % sci(mx["surface"]))
	ok(mx["nj"] < TOL and mx["normal"] < TOL, "the trochoids' frame and Jacobian (WATER.troNJ) and the shading normal with the field's slope (S.normalAt): max %s, %s" % [sci(mx["nj"]), sci(mx["normal"])])
	ok(mx["foam"] < TOL and mx["depth"] < TOL, "the decayed whitecap (WATER.foamAt) and the bed's depth from its bytes (S.depthAt): max %s, %s m" % [sci(mx["foam"]), sci(mx["depth"])])

	# 2. the probes the adapter wrote with WATER's own heights (as a page's export carries them)
	var pr := KratorWater.check_probes(sec, S)
	ok(pr["points"] == (sec["probes"] as Array).size() and pr["points"] > 0 and pr["missing"] == 0 and pr["max_abs_m"] < TOL,
		"the section's own probes: %d heights, max %s m" % [pr["points"], sci(pr["max_abs_m"])])

	# 3. negatives: one second off, a wave 1% taller, the field left out, a bed byte changed
	var late := KratorWater.check_probes(sec, S, 1.0)
	ok(late["max_abs_m"] > 1e-3, "negative: one second late, the probes differ by up to %.3f m" % late["max_abs_m"])
	var tall := KWater.from_record(sec["surfaces"][1], sec, atm)
	tall.waves[0]["A"] *= 1.01
	var dt := 0.0
	for s in g["samples"]:
		if s["id"] == "water:1":
			dt = maxf(dt, absf(tall.height_at(float(s["x"]), float(s["z"]), float(s["t"])) - float(s["h"])))
	ok(dt > 1e-5, "negative: the pond's first ripple 1%% taller differs by up to %.5f m" % dt)
	var calm := KWater.from_record(sec["surfaces"][0], sec, null)
	var df := 0.0
	for s in g["samples"]:
		if s["id"] == "water:0":
			df = maxf(df, absf(calm.height_at(float(s["x"]), float(s["z"]), float(s["t"])) - float(s["h"])))
	ok(df > 1e-3, "negative: the sea without the shared wave field differs by up to %.3f m" % df)
	var shoal := KWater.from_record(sec["surfaces"][0], sec, atm)
	var bytes: PackedByteArray = shoal.bed["data"]
	for i in range(0, bytes.size(), 4):
		bytes[i + 1] = mini(255, bytes[i + 1] + 3)
		bytes[i] = mini(255, bytes[i] + 3)
	shoal.bed["data"] = bytes
	var dd := 0.0
	for s in g["samples"]:
		if s["depth"] != null:
			dd = maxf(dd, absf(shoal.depth_at(float(s["x"]), float(s["z"]), float(s["t"])) - float(s["depth"])))
	ok(dd > 1e-3, "negative: the bed's bytes 3 steps off move its depth by up to %.3f m" % dd)

	# 4. the shader's uniforms (shaders/lib/water.gdshaderinc), made by KWater
	var u := sea.uniforms(0.0)
	var bt: ImageTexture = u["wtr_bed"]
	var bb: Vector4 = u["wtr_bed_box"]
	ok(u["wtr_n"] == 4 and (u["wtr_k"] as Array).size() == 8 and is_equal_approx((u["wtr_a"][3] as Vector4).w, float(sea.waves[3]["k"])) and (u["wtr_a"][4] as Vector4) == Vector4.ZERO
		and bt.get_width() == int(sea.bed["nx"]) and bt.get_height() == int(sea.bed["nz"]) and is_equal_approx(bb.z * float(sea.bed["cell"]) * float(sea.bed["nx"]), 1.0)
		and is_equal_approx(float(u["wtr_tilt_k"]), 0.5 * 1.0 * float(atm.waves["tilt"])),
		"the shader's uniforms: 4 of 8 wave slots, each wave's products, the bed as a %d x %d texture and its box, the field's tilt" % [bt.get_width(), bt.get_height()])
	var pu: Dictionary = S["water:1"].uniforms(0.0)
	ok(pu["wtr_has_bed"] == false and float(pu["wtr_field"]) == 0.0 and not pu.has("wtr_bed"), "negative space: the pond has no bed and no field, and its uniforms say so")
	atm.free()
	print("water: %s" % ("all passed" if fails == 0 else "%d failed" % fails))
	quit(1 if fails else 0)
