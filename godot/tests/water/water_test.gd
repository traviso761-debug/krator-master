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
	for w in KWater.from_section(sec, atm, ["open"]):
		S[w.id] = w
	var ALL := {}
	for w in KWater.from_section(sec, atm):
		ALL[w.id] = w
	ok(S.size() == 4 and ALL.size() == 7 and sec["format"] == "krator-water" and sec["field"] == "atmos" and float(sec["period"]) == float(atm.waves["period"]),
		"the section rebuilds four open surfaces and seven in all (open, flow, fall, still; period %s s, the field from atmos, Atmos's period the same)" % sec["period"])
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

	# 2. the probes the adapter wrote with WATER's own heights (as a page's export carries them): open water, the shore
	# grid's tarn, and the river's heights and currents
	var pr := KratorWater.check_probes(sec, ALL)
	ok(pr["points"] == (sec["probes"] as Array).size() and pr["points"] > 0 and pr["missing"] == 0 and pr["max_abs_m"] < TOL and pr["flow"] > 0 and pr["max_flow"] < TOL,
		"the section's own probes: %d heights (%d on the river, its current too), max %s m, current %s m/s" % [pr["points"], pr["flow"], sci(pr["max_abs_m"]), sci(pr["max_flow"])])

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
	_phase2(g, sec, ALL)
	_phase3(g, ALL)
	_phase4(g, ALL)
	atm.free()
	print("water: %s" % ("all passed" if fails == 0 else "%d failed" % fails))
	quit(1 if fails else 0)


# ---------------------------------------------------------------- Phase 2: the shore grid
func _phase2(g: Dictionary, sec: Dictionary, ALL: Dictionary) -> void:
	var H: Dictionary = g["shore"]
	var w: KWater = ALL[H["id"]]
	var G: Dictionary = H["grid"]
	ok(w.shore != null and float(w.shore["band"]) == float(G["band"]) and w.bed != null, "the tarn: an open surface on a shore grid (band %s m, clip %s cells)" % [w.shore["band"], w.shore["clip"]])
	# the grid rebuilt in GDScript from the ground's heights: the flood, the exact distance transform, the bytes
	var gr := PackedFloat64Array(G["ground"])
	var t0 := Time.get_ticks_msec()
	var R := KWater.shore_grid(gr, int(G["nx"]), int(G["nz"]), float(G["x0"]), float(G["z0"]), float(G["cell"]), float(G["level"]), G["seeds"], float(G["band"]), w.presets["bed"], w.presets["shore"]["mid"])
	var want := Marshalls.base64_to_raw(str(G["bytes"]))
	var diff := 0
	for k in want.size():
		if want[k] != (R["data"] as PackedByteArray)[k]:
			diff += 1
	ok(diff == 0 and int(R["wet_cells"]) == int(G["wetCells"]) and want == w.bed["data"],
		"the shore grid rebuilt here from the ground (%d x %d cells, %d wet, %d ms): every byte as the page's (%d differ), the export's bytes the same" % [G["nx"], G["nz"], R["wet_cells"], Time.get_ticks_msec() - t0, diff])
	var R2 := KWater.shore_grid(gr, int(G["nx"]), int(G["nz"]), float(G["x0"]), float(G["z0"]), float(G["cell"]), float(G["level"]), null, float(G["band"]), w.presets["bed"], w.presets["shore"]["mid"])
	ok(int(R2["wet_cells"]) > int(R["wet_cells"]), "negative: without its seed the flood takes every cell under the level (%d wet, the hollow among them)" % R2["wet_cells"])
	# no lower hollow floods
	var HO: Dictionary = H["hollow"]
	ok(not w.wet_at(float(HO["x"]), float(HO["z"])) and w.wet_at(float(HO["x"]) - 150.0, 0.0) and float(HO["ground"]) < float(w.level) and not w.contains(float(HO["x"]), float(HO["z"])),
		"no lower hollow floods: the hollow %.1f m under the level is not the tarn's (wet %s), the tarn's middle is" % [float(w.level) - float(HO["ground"]), w.wet_at(float(HO["x"]), float(HO["z"]))])
	var mx := {"h": 0.0, "h3": 0.0, "surface": 0.0, "normal": 0.0, "dist": 0.0, "surf": 0.0, "foam": 0.0, "wg": 0.0, "depth": 0.0}
	var same := 0
	for s in H["samples"]:
		var x := float(s["x"])
		var z := float(s["z"])
		var t := float(s["t"])
		mx["h"] = maxf(mx["h"], absf(w.height_at(x, z, t) - float(s["h"])))
		mx["h3"] = maxf(mx["h3"], absf(w.height_at(x, z, t, 3) - float(s["h3"])))
		var su := w.surface_at(x, z, t, 0.7)
		for k in 4:
			mx["surface"] = maxf(mx["surface"], absf(su[k] - float(s["surface"][k])))
		var nn := w.normal_at(x, z, t, 60.0, 0.05)
		for k in 3:
			mx["normal"] = maxf(mx["normal"], absf(nn[k] - float(s["normal"][k])))
		mx["dist"] = maxf(mx["dist"], absf(w.shore_dist(x, z) - float(s["dist"])))
		mx["surf"] = maxf(mx["surf"], absf(w.surf_at(x, z, t) - float(s["surf"])))
		mx["foam"] = maxf(mx["foam"], absf(w.surf_foam_at(x, z, t) - float(s["surfFoam"])))
		var wg := w.wet_ground_at(x, z, float(s["gy"]), t)
		mx["wg"] = maxf(mx["wg"], maxf(absf(wg[0] - float(s["wetGround"][0])), absf(wg[1] - float(s["wetGround"][1]))))
		mx["depth"] = maxf(mx["depth"], absf(w.depth_at(x, z, t) - float(s["depth"])))
		if w.wet_at(x, z) == bool(s["wet"]) and w.contains(x, z) == bool(s["contains"]):
			same += 1
	var n: int = (H["samples"] as Array).size()
	ok(mx["h"] < TOL and mx["h3"] < TOL and mx["surface"] < TOL and mx["normal"] < TOL,
		"shore: heights (shoaled, breakers in) at %d points equal WATER.heightAt: max %s m (5 steps), %s m (3); the vertex %s, the normal %s" % [n, sci(mx["h"]), sci(mx["h3"]), sci(mx["surface"]), sci(mx["normal"])])
	ok(mx["dist"] < TOL and mx["surf"] < TOL and mx["foam"] < TOL and mx["wg"] < TOL and mx["depth"] < TOL and same == n,
		"shore: the shore distance %s m, the breakers %s m, their foam %s, the beach's wetness %s, the depth %s m; the wet test and containment agree at %d of %d" % [sci(mx["dist"]), sci(mx["surf"]), sci(mx["foam"]), sci(mx["wg"]), sci(mx["depth"]), same, n])
	# negatives: a second late moves the breakers; the band a metre off moves the distance
	var dl := 0.0
	var db := 0.0
	var band0 := float(w.shore["band"])
	for s in H["samples"]:
		dl = maxf(dl, absf(w.surf_at(float(s["x"]), float(s["z"]), float(s["t"]) + 1.0) - float(s["surf"])))
	w.shore["band"] = band0 + 1.0
	for s in H["samples"]:
		db = maxf(db, absf(w.shore_dist(float(s["x"]), float(s["z"])) - float(s["dist"])))
	w.shore["band"] = band0
	ok(dl > 1e-3 and db > 1e-2, "negative: one second late the breakers differ by %.3f m; the band 1 m off moves the shore distance by %.3f m" % [dl, db])


# ---------------------------------------------------------------- Phase 3: flow and falls
func _phase3(g: Dictionary, ALL: Dictionary) -> void:
	var F: Dictionary = g["flow"]
	var r: KWater = ALL[F["id"]]
	var RB := r.ribbon(r.ribbon_opt)
	var want: Dictionary = F["ribbon"]
	var dp := 0.0
	for k in (want["pos"] as Array).size():
		dp = maxf(dp, absf((RB["pos"] as PackedFloat64Array)[k] - float(want["pos"][k])))
	var da := 0.0
	for k in (want["flow"] as Array).size():
		da = maxf(da, absf((RB["flow"] as PackedFloat64Array)[k] - float(want["flow"][k])))
	for k in (want["bank"] as Array).size():
		da = maxf(da, absf((RB["bank"] as PackedFloat64Array)[k] - float(want["bank"][k])))
		da = maxf(da, absf((RB["slope"] as PackedFloat64Array)[k] - float(want["slope"][k])))
	var same_idx: bool = (RB["idx"] as PackedInt32Array).size() == (want["idx"] as Array).size()
	if same_idx:
		for k in (want["idx"] as Array).size():
			if (RB["idx"] as PackedInt32Array)[k] != int(want["idx"][k]):
				same_idx = false
				break
	ok(int(RB["count"]) == int(want["count"]) and dp < TOL and da < TOL and same_idx,
		"flow: the ribbon rebuilt here (%d vertices, %d rows): positions within %s m, currents, banks and slopes %s, the same triangles" % [RB["count"], RB["rows"], sci(dp), sci(da)])
	var mx := {"h": 0.0, "flow": 0.0, "n": 0.0, "foam": 0.0}
	var inside := 0
	for s in F["samples"]:
		var x := float(s["x"])
		var z := float(s["z"])
		var t := float(s["t"])
		mx["h"] = maxf(mx["h"], absf(r.flow_height(x, z) - float(s["h"])))
		var fl := r.flow_at(x, z)
		for k in 4:
			mx["flow"] = maxf(mx["flow"], absf(fl[k] - float(s["flow"][k])))
		var nn := r.flow_normal(x, z, float(s["v"][0]), float(s["v"][1]), float(s["slope"]), t)
		var n0 := r.flow_normal(x, z, 0.0, 0.0, float(s["slope"]), t)
		for k in 3:
			mx["n"] = maxf(mx["n"], maxf(absf(nn[k] - float(s["normal"][k])), absf(n0[k] - float(s["normal0"][k]))))
		mx["foam"] = maxf(mx["foam"], absf(r.flow_foam(float(s["slope"]), float(s["bank"])) - float(s["foam"])))
		if r.contains(x, z) == bool(s["contains"]):
			inside += 1
	var n: int = (F["samples"] as Array).size()
	ok(mx["h"] < TOL and mx["flow"] < TOL and mx["n"] < TOL and mx["foam"] < TOL and inside == n,
		"flow: at %d points the sloping surface's height %s m, the current %s, the advected normal %s, the foam %s; containment agrees everywhere" % [n, sci(mx["h"]), sci(mx["flow"]), sci(mx["n"]), sci(mx["foam"])])
	var late := 0.0
	for s in F["samples"]:
		var nn := r.flow_normal(float(s["x"]), float(s["z"]), float(s["v"][0]), float(s["v"][1]), float(s["slope"]), float(s["t"]) + 1.0)
		late = maxf(late, absf(nn[0] - float(s["normal"][0])))
	ok(late > 1e-3, "negative: one second late the advected normal differs by %.4f" % late)
	# the fall
	var L: Dictionary = g["fall"]
	var f: KWater = ALL[L["id"]]
	var CM := f.curtain(f.curtain_opt)
	var dc := 0.0
	for k in (L["curtain"]["pos"] as Array).size():
		dc = maxf(dc, absf((CM["pos"] as PackedFloat64Array)[k] - float(L["curtain"]["pos"][k])))
		dc = maxf(dc, absf((CM["nrm"] as PackedFloat64Array)[k] - float(L["curtain"]["nrm"][k])))
	var pl := f.plunge()
	var dpl := 0.0
	for k in 4:
		dpl = maxf(dpl, absf(pl[k] - float(L["plunge"][k])))
	var cp: PackedFloat64Array = CM["pos"]
	ok(int(CM["count"]) == int(L["curtain"]["count"]) and dc < TOL and dpl < TOL,
		"fall: the curtain rebuilt here (%d vertices: it arcs %.1f m out over its %.0f m drop) within %s, the plunge pool at its foot within %s" % [CM["count"], cp[cp.size() - 3] - float(f.lip[0][0]), f.drop, sci(dc), sci(dpl)])
	var ms := 0.0
	for s in L["samples"]:
		var st := f.fall_streak(float(s["u"]), float(s["f"]), float(s["t"]))
		ms = maxf(ms, absf(st - float(s["streak"])))
		ms = maxf(ms, absf(KWater.fall_foam(float(s["f"]), st) - float(s["foam"])))
		var pa := f.plunge_at(float(s["x"]), float(s["z"]), float(s["t"]))
		ms = maxf(ms, maxf(absf(pa[0] - float(s["plunge"][0])), absf(pa[1] - float(s["plunge"][1]))))
	var held := 0.0
	for s in L["samples"]:
		held = maxf(held, absf(f.fall_streak(float(s["u"]), float(s["f"]), float(s["t"]) + 0.5) - float(s["streak"])))
	ok(ms < TOL and held > 1e-2, "fall: the streaks, the foam and the plunge churn at %d points within %s; negative: half a second late a streak differs by %.3f" % [(L["samples"] as Array).size(), sci(ms), held])


# ---------------------------------------------------------------- Phase 4: still water and the rain's wetness
func _phase4(g: Dictionary, ALL: Dictionary) -> void:
	var P: Dictionary = g["still"]
	var w: KWater = ALL[P["id"]]
	var mn := 0.0
	var inside := 0
	for s in P["samples"]:
		var nn := w.still_normal(float(s["x"]), float(s["z"]), float(s["t"]))
		for k in 3:
			mn = maxf(mn, absf(nn[k] - float(s["normal"][k])))
		if w.contains(float(s["x"]), float(s["z"])) == bool(s["contains"]):
			inside += 1
	var n: int = (P["samples"] as Array).size()
	ok(mn < TOL and inside == n and float(w.height(3001.0, 1.0, 0.0)) == 3.25, "still: the pool's normal (ripple and fountain) at %d points within %s, containment of its L everywhere, its level %s m" % [n, sci(mn), w.level])
	var keep = w.fountain
	w.fountain = null
	var df := 0.0
	for s in P["samples"]:
		df = maxf(df, absf(w.still_normal(float(s["x"]), float(s["z"]), float(s["t"]))[0] - float(s["normal"][0])))
	w.fountain = keep
	ok(df > 1e-4, "negative: without its fountain the pool's normal differs by %.4f" % df)
	var mw := 0.0
	for e in g["wet"]:
		mw = maxf(mw, absf(KWater.wet_ground_rain(float(e[0]), float(e[1])) - float(e[2])))
	ok(mw < TOL and KWater.wet_ground_rain(1.0, 0.0) == 0.0, "the rain's wetness on what faces up equals WATER.wetGroundRain (%s); a wall stays dry" % sci(mw))
