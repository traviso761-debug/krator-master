# core/water's final-rebuild items (2026-10-26) in GDScript (krator/water.gd, KWater) against WATER's own: a fall that follows a sloped face (its
# drops through core/export's water section), the curtain's margin and side fade, spray scaled to the drop, rain rings, the hollows' puddles and
# the wet look. Each check has a negative.   godot --headless --path godot --script res://tests/water/rebuild_test.gd     exits 0 when all pass
# (the golden: node godot/tools/water_rebuild_golden.js)
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
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/water/rebuild_golden.json"))
	var S := {}
	for w in KWater.from_section(g["section"], null):
		S[w.id] = w
	# ---- W3: the face
	var F: KWater = S[g["face"]["id"]]
	var A: KWater = S[g["face"]["arc"]]
	ok(F.face is Array and (F.face as Array).size() == 25 and A.face == null, "the face fall carries its drops (%d samples), the arc none" % (F.face as Array).size())
	var ep := 0.0
	var en := 0.0
	for s in g["face"]["samples"]:
		var p := F.curtain_at(float(s["u"]), float(s["f"]))
		var n := F.curtain_normal(float(s["f"]))
		for k in 3:
			ep = maxf(ep, absf(p[k] - float(s["p"][k])))
			en = maxf(en, absf(n[k] - float(s["n"][k])))
	ok(ep < TOL and en < TOL, "the curtain down the face (24 points) and its normal equal WATER's: %s, %s" % [sci(ep), sci(en)])
	F.face = null
	var neg := absf(F.curtain_at(0.5, 0.5)[1] - float(g["face"]["samples"][15]["p"][1]))
	ok(neg > 5.0, "negative: without its face the same fall arcs %.1f m off it half way down" % neg)
	# ---- W1: the margin
	var M: Dictionary = g["margin"]
	var W: KWater = S[M["id"]]
	var C := W.curtain(M["opt"])
	var eu := 0.0
	for i in (C["uv"] as PackedFloat64Array).size():
		eu = maxf(eu, absf(C["uv"][i] - float(M["uv"][i])))
	for i in (C["pos"] as PackedFloat64Array).size():
		eu = maxf(eu, absf(C["pos"][i] - float(M["pos"][i])))
	var es := 0.0
	for s in M["side"]:
		es = maxf(es, absf(KWater.curtain_side(float(s["u"]), float(s["lw"]), float(s["margin"]), float(s["edge"])) - float(s["v"])))
	var C0 := W.curtain({"rows": 10, "cols": 6})
	ok(int(C["count"]) == int(M["count"]) and eu < TOL and es < TOL, "the curtain with a 1.5 m margin (%d vertices, %s) and its side fade (%s) equal WATER's" % [C["count"], sci(eu), sci(es)])
	ok(absf(C0["uv"][0]) < 1e-12 and absf(C["uv"][0] + 0.125) < 1e-12, "negative: without the margin u starts at 0 (%.3f), with it at -0.125" % C0["uv"][0])
	# ---- W2: spray
	var sp := F.curtain_at(0.5, 1.0)
	F.face = g["section"]["surfaces"].filter(func(r): return r["id"] == g["face"]["id"])[0]["face"]
	var es2 := 0.0
	var pairs := [[F.fall_spray(), g["spray"]["face"]], [W.fall_spray(), g["spray"]["arc"]], [F.fall_spray({"max": 6}), g["spray"]["faceMax6"]]]
	var counts := []
	var same := true
	for pr in pairs:
		var a: Array = pr[0]
		var b: Array = pr[1]
		counts.append("%d/%d" % [a.size(), b.size()])
		if a.size() != b.size():
			same = false
			continue
		for i in a.size():
			for k in 3:
				es2 = maxf(es2, absf(float(a[i][k]) - float(b[i][k])))
	ok(same and es2 < TOL, "spray scaled to the drop: the emitters equal WATER's (%s; %s)" % [", ".join(counts), sci(es2)])
	ok((g["spray"]["face"] as Array).size() > 3 and sp.size() == 3, "negative: the 70 m fall throws %d emitters, not the old three" % (g["spray"]["face"] as Array).size())
	# ---- R9: rain rings
	var er := 0.0
	var dk := 0.0
	for s in g["ripple"]:
		var q := W.rain_ripple(float(s["x"]), float(s["z"]), float(s["t"]), float(s["rain"]))
		er = maxf(er, maxf(absf(q[0] - float(s["g"][0])), absf(q[1] - float(s["g"][1]))))
		var q2 := W.rain_ripple(float(s["x"]), float(s["z"]), float(s["t"]) + 0.5, float(s["rain"]))
		dk = maxf(dk, absf(q2[0] - float(s["g"][0])))
	ok(er < 1e-9, "rain rings equal WATER.rainRipple at 40 points (%s)" % sci(er))
	ok(dk > 1e-3, "negative: half a second later they are %s off" % sci(dk))
	# ---- R9: hollows and puddles
	var H: Dictionary = g["hollow"]["rec"].duplicate()
	H["data"] = Marshalls.base64_to_raw(str(H["bytes"]))
	var eh := 0.0
	var wet_seen := 0
	for s in g["hollow"]["samples"]:
		eh = maxf(eh, absf(KWater.hollow_at(H, float(s["x"]), float(s["z"])) - float(s["m"])))
		eh = maxf(eh, absf(KWater.puddle_at(H, float(s["x"]), float(s["z"]), float(s["wet"])) - float(s["p"])))
		if float(s["p"]) > 0.5:
			wet_seen += 1
	ok(eh < 1e-12 and wet_seen > 0, "the hollows' bytes and the puddles equal WATER's at 40 points (%s; %d of them under water)" % [sci(eh), wet_seen])
	var H2: Dictionary = H.duplicate()
	H2["x0"] = float(H["x0"]) + 20.0
	var en2 := 0.0
	for s in g["hollow"]["samples"]:
		en2 = maxf(en2, absf(KWater.hollow_at(H2, float(s["x"]), float(s["z"])) - float(s["m"])))
	ok(en2 > 0.1, "negative: the same bytes 20 m off are %.2f out" % en2)
	# ---- R9: the wet look
	var ew := 0.0
	for s in g["wet"]:
		var v := KWater.wet_look(float(s["r"]), float(s["w"]), float(s["pd"]), float(s["por"]), float(s["film"]))
		ew = maxf(ew, maxf(absf(v[0] - float(s["v"][0])), absf(v[1] - float(s["v"][1]))))
	ok(ew < 1e-12, "the wet look (albedo factor, roughness) equals WATER.wetLook (%s)" % sci(ew))
	print("water rebuild: " + ("all passed" if fails == 0 else "%d FAILED" % fails))
	quit(1 if fails else 0)
