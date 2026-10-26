# core/water's gap options (2026-10-21) in GDScript (krator/water.gd, KWater) against WATER's own, each surface rebuilt from core/export's water
# section alone: a flow's own rapids band (the normal, the foam, the shader's uniform), the chute's foot and run on a fall fitted to land on it, a
# still pool's gradient, an open surface's tint field (the bytes in the record, bilinear), and shore grids on edge seeds (the flood from the box's
# rim, every byte). Each check has a negative.   godot --headless --path godot --script res://tests/water/gaps_test.gd     exits 0 when every check passes
# (the golden: node godot/tools/water_gaps_golden.js)
extends SceneTree

const TOL := 1e-9

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


static func sci(v: float) -> String:
	if v == 0.0:
		return "0"
	var e := floori(log(absf(v)) / log(10.0))
	return "%.1fe%d" % [v / pow(10.0, e), e]


func _initialize() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/water/gaps_golden.json"))
	var sec: Dictionary = g["section"]
	var S := {}
	for w in KWater.from_section(sec, null):
		S[w.id] = w
	ok(S.size() == 6, "the section rebuilds %d surfaces (three flows, a fall, a pool and an open surface with a tint field)" % S.size())
	# ---- a flow's own rapids band
	var F: Dictionary = g["flow"]
	var w: KWater = S[F["id"]]
	var wb: KWater = S[F["brook"]]
	ok(w.rapids is Array and absf(float(w.rapids[0]) - 0.12) < 1e-12 and absf(float(w.rapids[1]) - 0.4) < 1e-12 and wb.rapids == null, "the torrent carries its own band %s, the brook none" % str(w.rapids))
	var mn := 0.0
	var mf := 0.0
	var dn := 0.0
	var df := 0.0
	var db := 0.0
	for s in F["samples"]:
		var n := w.flow_normal(float(s["x"]), float(s["z"]), float(s["vx"]), float(s["vz"]), float(s["slope"]), float(s["t"]))
		for k in 3:
			mn = maxf(mn, absf(n[k] - float(s["n"][k])))
			dn = maxf(dn, absf(n[k] - float(s["nPreset"][k])))
		mf = maxf(mf, absf(w.flow_foam(float(s["slope"]), float(s["bank"])) - float(s["foam"])))
		df = maxf(df, absf(w.flow_foam(float(s["slope"]), float(s["bank"])) - float(s["foamPreset"])))
		# a flow with no band of its own is the preset's: the brook (same line, no rapids) equals the preset's twin
		var nb := wb.flow_normal(float(s["x"]), float(s["z"]), float(s["vx"]), float(s["vz"]), float(s["slope"]), float(s["t"]))
		for k in 3:
			db = maxf(db, absf(nb[k] - float(s["nPreset"][k])))
	ok(mn < TOL and mf < TOL and db < TOL, "the normal %s and the foam %s equal WATER's with the flow's band (40 samples); a flow with none is the preset's %s" % [sci(mn), sci(mf), sci(db)])
	ok(dn > 1e-3 and df > 0.05, "negative: the preset's band would be off by %s in the normal and %s in the foam" % [sci(dn), sci(df)])
	var u: Dictionary = w.kind_uniforms()
	var u0: Dictionary = wb.kind_uniforms()
	ok(absf(u["wk_flow_r"].x - 0.12) < 1e-6 and absf(u["wk_flow_r"].y - 0.4) < 1e-6 and absf(u0["wk_flow_r"].y - float(w.presets["flow"]["rapids"][1])) < 1e-6,
		"the shader's uniform wk_flow_r carries the flow's band (%s), the brook's the preset's (%s)" % [str(u["wk_flow_r"]), str(u0["wk_flow_r"])])
	var wmax := 0.0
	var ws: Array = F["widths"]
	for i in w.pts.size():
		wmax = maxf(wmax, absf(float(w.pts[i]["w"]) - float(ws[i])))
	ok(w.pts.size() == int(F["npts"]) and wmax < 1e-12 and w.pts.size() > 25 and absf(float(w.pts[0]["w"]) - 6.0) < 1e-9, "its densified width profile came through the record's points (%d points, widths %s m to %s m)" % [w.pts.size(), str(w.pts[0]["w"]), str(ws.max())])
	# ---- the fall's foot
	var FA: Dictionary = g["fall"]
	var fw: KWater = S[FA["id"]]
	var lt := fw.curtain_at(0.5, 1.0)
	ok(fw.foot is Array and absf(float(fw.foot[0]) - 14.0) < 1e-9 and absf(fw.run - 4.0) < 1e-9 and absf(fw.speed - float(FA["speed"])) < 1e-12 and absf(lt[0] - float(FA["landing"][0])) < TOL and absf(lt[0] - float(fw.foot[0])) < 1e-9 and absf(lt[1] - float(fw.foot[2])) < 1e-9,
		"the fall keeps the chute's foot %s and run %s, its speed fitted (%s m/s): the curtain lands on the foot (%s)" % [str(fw.foot), str(fw.run), "%.3f" % fw.speed, str(lt)])
	# ---- the pool's gradient
	var P: Dictionary = g["pool"]
	var pw: KWater = S[P["id"]]
	var mg := 0.0
	var spread := 0.0
	for s in P["samples"]:
		var t := pw.gradient_t(float(s["x"]), float(s["z"]))
		mg = maxf(mg, absf(t - float(s["t"])))
		spread = maxf(spread, t)
	ok(mg < TOL and spread > 0.4 and pw.gradient_t(120.0, 110.0) < 1e-12, "the pool's gradient t equals WATER's at %d points (%s), 0 at its middle, up to %.2f" % [(P["samples"] as Array).size(), sci(mg), spread])
	ok(S[F["brook"]].gradient == null and S[F["brook"]].gradient_t(1.0, 1.0) == 0.0, "negative: a surface with no gradient has t = 0")
	# ---- the tint field
	var TT: Dictionary = g["tint"]
	var tw: KWater = S[TT["id"]]
	var mt := 0.0
	var solid := 0
	for s in TT["samples"]:
		var v := tw.tint_at(float(s["x"]), float(s["z"]))
		for k in 4:
			mt = maxf(mt, absf(v[k] - float(s["v"][k])))
		if v[3] > 0.5:
			solid += 1
	ok(tw.tint is Dictionary and mt < TOL and solid > 3, "the tint field's bytes came through the record: premultiplied RGBA bilinear at %d points equals WATER's (%s), %d of them mostly tinted" % [(TT["samples"] as Array).size(), sci(mt), solid])
	var sh: Dictionary = (tw.tint as Dictionary).duplicate()
	var d: PackedByteArray = (sh["data"] as PackedByteArray).duplicate()
	for k in range(0, d.size() - 12):
		d[k] = d[k + 12]
	sh["data"] = d
	var keep: Variant = tw.tint
	tw.tint = sh
	var wrong := 0.0
	for s in TT["samples"]:
		var v := tw.tint_at(float(s["x"]), float(s["z"]))
		for k in 4:
			wrong = maxf(wrong, absf(v[k] - float(s["v"][k])))
	tw.tint = keep
	ok(wrong > 0.05 and tw.tint_at(500.0, 0.0)[3] == 0.0, "negative: the bytes shifted three cells are not WATER's (%s); outside its box the tint is zero" % sci(wrong))
	# ---- edge seeds
	var E: Array = g["edge"]
	var pr: Dictionary = sec["presets"]
	var cells: Array = []
	for e in E:
		var gr := PackedFloat64Array(e["ground"])
		var R := KWater.shore_grid(gr, int(e["nx"]), int(e["nz"]), float(e["x0"]), float(e["z0"]), float(e["cell"]), float(e["level"]), e["seeds"], float(e["band"]), pr["bed"], pr["shore"]["mid"])
		var want := Marshalls.base64_to_raw(str(e["bytes"]))
		var diff := 0
		for k in want.size():
			if want[k] != (R["data"] as PackedByteArray)[k]:
				diff += 1
		cells.append(int(R["wet_cells"]))
		ok(diff == 0 and int(R["wet_cells"]) == int(e["wetCells"]), "shore grid on seeds %s: %d x %d cells, %d wet, every byte as the page's (%d differ)" % [str(e["seeds"]), e["nx"], e["nz"], R["wet_cells"], diff])
	ok(cells[0] > 4000 and cells[1] == 0 and cells[2] == cells[0] and cells[3] == cells[0] and cells[4] == 0, "edge seeds: the sea floods from the rim (%d), a rim never deep enough seeds nothing (%d), sides w is the sea's rim (%d), points reach it (%d), the east rim is land (%d)" % [cells[0], cells[1], cells[2], cells[3], cells[4]])
	print("water gaps: %s" % ("all passed" if fails == 0 else "%d failed" % fails))
	quit(1 if fails else 0)
