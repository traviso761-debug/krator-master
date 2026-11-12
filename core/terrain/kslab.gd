# The tilted slab's cliff, the GDScript twin of core/terrain/38d-core-slab.js: a krator-slab record (KRELIEF.slabExport(S) in the page)
# read back and sampled with the same arithmetic, so a Godot terrain, walker or hazard reads the page's own heights and parts (spur,
# gully, ledge, the fresh scar). The record is built in the page (the spurs, cones and ledges are drawn there from KRAND.hash);
# this only samples it. Held to golden-slab.json by kslab_test.gd.
# The project's copy is godot/tests/terrain/kslab.gd (godot/tools/sync_core.py keeps it in step).
# Axes: y up, metres, x east, z south.
class_name KSlab
extends RefCounted

const KRand := preload("../rand/krand.gd")
const TAU_ := PI * 2.0

var seed_value := 0
var pts: Array = []        # [[x, z], ...] the rim
var arc: Array = []        # the arc length at each point
var side := 1.0
var h := 1200.0
var run := 600.0
var dip := 0.12
var spurs: Array = []      # [{s, hw, out, run, pw, dh, tip, back}], sorted by s
var cones: Array = []      # [{s, h, reach}], sorted by s
var ledges: Array = []     # [{L, w, seed}]
var ledge_wander := 0.035
var ledge_k := [0.7, 2.0]
var skirt = null           # {h, reach} or null
var rough := {"face": 0.03, "flute": 0.018, "crest": 0.05}
var scars: Array = []      # [{s, w, back, run}]


# a krator-slab record; null with an error when it is not one
static func from_export(d: Dictionary) -> KSlab:
	if d.get("format") != "krator-slab" or d.get("kind") != "slab":
		push_error("KSlab: not a krator-slab")
		return null
	if int(d.get("version", 0)) != 1:
		push_error("KSlab: version %s (this reads 1)" % d.get("version"))
		return null
	var R := KSlab.new()
	R.seed_value = int(d["seed"])
	for p in d["pts"]:
		R.pts.append([float(p[0]), float(p[1])])
	for a in d["S"]:
		R.arc.append(float(a))
	R.side = float(d["side"])
	R.h = float(d["h"])
	R.run = float(d["run"])
	R.dip = float(d["dip"])
	for q in d["spurs"]:
		R.spurs.append({"s": float(q["s"]), "hw": float(q["hw"]), "out": float(q["out"]), "run": float(q["run"]), "pw": float(q["pw"]),
			"dh": float(q["dh"]), "tip": float(q["tip"]), "back": float(q["back"])})
	for q in d["cones"]:
		R.cones.append({"s": float(q["s"]), "h": float(q["h"]), "reach": float(q["reach"])})
	for q in d["ledges"]:
		R.ledges.append({"L": float(q["L"]), "w": float(q["w"]), "seed": int(q["seed"])})
	R.ledge_wander = float(d["ledgeWander"])
	R.ledge_k = [float(d["ledgeK"][0]), float(d["ledgeK"][1])]
	if d["skirt"] is Dictionary:
		R.skirt = {"h": float(d["skirt"]["h"]), "reach": float(d["skirt"]["reach"])}
	R.rough = {"face": float(d["rough"]["face"]), "flute": float(d["rough"]["flute"]), "crest": float(d["rough"]["crest"])}
	for q in d["scars"]:
		R.scars.append({"s": float(q["s"]), "w": float(q["w"]), "back": float(q["back"]), "run": float(q["run"])})
	return R


static func _c01(v: float) -> float:
	return 0.0 if v < 0.0 else (1.0 if v > 1.0 else v)


static func _sm(a: float, b: float, v: float) -> float:
	var t := _c01((v - a) / (b - a))
	return t * t * (3.0 - 2.0 * t)


# where (x, z) is: s along the rim, d the metres from the rim toward the floor (negative on the slab)
func _local(x: float, z: float) -> Array:
	var best := INF
	var bs := 0.0
	var bq := 0.0
	for i in pts.size() - 1:
		var a: Array = pts[i]
		var b: Array = pts[i + 1]
		var dx: float = b[0] - a[0]
		var dz: float = b[1] - a[1]
		var l: float = arc[i + 1] - arc[i]
		if l == 0.0:
			l = 1.0
		var ux := dx / l
		var uz := dz / l
		var ax: float = x - a[0]
		var az: float = z - a[1]
		var t := ax * ux + az * uz
		var tc := 0.0 if t < 0.0 else (l if t > l else t)
		var ex := ax - ux * tc
		var ez := az - uz * tc
		var dd := sqrt(ex * ex + ez * ez)
		if dd < best - 1e-9:
			best = dd
			bs = arc[i] + tc
			bq = -uz * ax + ux * az
	var sg := (1.0 if bq >= 0.0 else -1.0) * side
	return [bs, -sg * best]


func _near(A: Array, s: float) -> Vector2i:
	var lo := 0
	var hi := A.size() - 1
	while hi - lo > 1:
		var m := (lo + hi) >> 1
		if A[m]["s"] <= s:
			lo = m
		else:
			hi = m
	return Vector2i(lo, hi)


func _params(s: float) -> Dictionary:
	var N := _near(spurs, s)
	var a: Dictionary = spurs[N.x]
	var b: Dictionary = spurs[N.y]
	var wa := 0.0
	var wb := 0.0
	var ua: float = (s - a["s"]) / a["hw"]
	var ub: float = (s - b["s"]) / b["hw"]
	if absf(ua) < 1.0:
		wa = pow(cos(PI / 2.0 * ua), 2.0)
	if absf(ub) < 1.0:
		wb = pow(cos(PI / 2.0 * ub), 2.0)
	var B := wa + wb
	var g := 1.0 - minf(1.0, B)
	var span: float = b["s"] - a["s"]
	if span == 0.0:
		span = 1.0
	var kl := _c01((s - a["s"]) / span)
	var kb := (wb / B if B > 0.0 else kl) * (1.0 - g) + kl * g
	var F: float = wa * a["out"] + wb * b["out"] - g * (a["back"] + b["back"]) / 2.0
	var rn: float = a["run"] * (1.0 - kb) + b["run"] * kb
	var sc := 0.0
	for q in scars:
		var u: float = (s - q["s"]) / q["w"]
		if absf(u) < 1.0:
			var k := pow(cos(PI / 2.0 * u), 2.0)
			if k > sc:
				sc = k
			F -= k * q["back"]
			rn *= 1.0 - (1.0 - q["run"]) * k
	return {"F": F, "run": rn, "pw": a["pw"] * (1.0 - kb) + b["pw"] * kb, "dh": a["dh"] * (1.0 - kb) + b["dh"] * kb,
		"tip": a["tip"] * (1.0 - kb) + b["tip"] * kb, "out": maxf(1.0, a["out"] * (1.0 - kb) + b["out"] * kb), "g": g,
		"spur": N.x if wa >= wb else N.y, "scar": sc}


func _ledge_shift(s: float, sh: float) -> Array:
	var dsh := 0.0
	var on := 0.0
	for i in ledges.size():
		var E: Dictionary = ledges[i]
		var L: float = E["L"] + ledge_wander * (2.0 * KRand.fbm(s * 0.0009, 0.5, float(i), 2, E["seed"]) - 1.0)
		var u: float = (sh - L) / E["w"]
		if absf(u) >= 0.5:
			continue
		var k := minf(1.25, maxf(0.0, ledge_k[0] + ledge_k[1] * (KRand.fbm(s * 0.0011, 0.5, float(i), 2, E["seed"] + 40) - 0.5)))
		dsh -= k * E["w"] * sin(TAU_ * u) / TAU_
		if k > 0.6 and absf(u) < 0.15:
			on = 1.0
	return [dsh, on]


func _near_cone(s: float) -> Dictionary:
	if cones.is_empty():
		return {}
	var N := _near(cones, s)
	return cones[N.x] if absf(cones[N.x]["s"] - s) < absf(cones[N.y]["s"] - s) else cones[N.y]


# the height over g (no noise) and what it is, at (s, d)
func _core(s: float, dd0: float) -> Dictionary:
	var p := _params(s)
	var F: float = p["F"]
	var dd := dd0 - F
	var H: float = h * (1.0 + p["dh"])
	if dd <= 0.0:
		var tip_fall: float = p["tip"] * h * _c01(minf(dd0, F) / p["out"]) if F > 0.0 and dd0 > 0.0 else 0.0
		return {"y": H - tip_fall - dip * maxf(0.0, -dd0), "part": "spur" if dd0 > 0.0 else "plateau", "share": 1.0, "dd": dd, "p": p}
	var edge_drop: float = p["tip"] * h * _c01(F / p["out"]) if F > 0.0 else 0.0
	var Te: float = H - edge_drop - dip * maxf(0.0, -F)
	var sh := 0.0
	var part = null
	if dd < p["run"]:
		var t: float = dd / p["run"]
		sh = 1.0 - (1.0 - pow(1.0 - t, p["pw"])) * _sm(0.0, 0.03, t)
		part = "scar" if p["scar"] > 0.3 else ("gully" if p["g"] > 0.7 else "face")
	var ls := [0.0, 0.0]
	if sh > 0.0 and sh < 1.0 and not ledges.is_empty():
		ls = _ledge_shift(s, sh)
		if ls[1] > 0.0 and part == "face":
			part = "ledge"
	var y := Te * _c01(sh + ls[0])
	var ty := 0.0
	if skirt != null:
		var rch: float = skirt["reach"] * p["run"]
		var t2: float = (dd - p["run"] * 0.75) / rch
		if t2 > -0.4 and t2 < 1.0:
			var sk: float = skirt["h"] * h * pow(1.0 - _c01(t2), 1.6) * _sm(-0.4, 0.0, t2)
			if sk > y:
				ty = sk
	if not cones.is_empty():
		var C := _near_cone(s)
		if dd > p["run"] * 0.5:
			var ex: float = s - C["s"]
			var ez: float = maxf(0.0, dd - p["run"] * 0.9)
			var dist := sqrt(ex * ex + ez * ez)
			if dist < C["reach"]:
				var c: float = C["h"] * pow(1.0 - dist / C["reach"], 1.4)
				if c > ty:
					ty = c
	if ty > y:
		y = ty
		if sh < 0.15:
			part = "cone" if ty > (skirt["h"] * h * 0.6 if skirt != null else 0.0) and not cones.is_empty() else "skirt"
	return {"y": y, "part": part, "share": sh, "dd": dd, "p": p}


func _noise(x: float, z: float, s: float, c: Dictionary) -> float:
	var sh: float = c["share"]
	var n := 0.0
	var band := _sm(0.02, 0.2, sh) * _sm(1.0, 0.85, sh) if sh > 0.0 and sh < 1.0 else 0.0
	if band > 0.0:
		n += band * h * (rough["face"] * (2.0 * KRand.fbm(x / 70.0, 0.5, z / 70.0, 3, seed_value + 7) - 1.0)
			+ rough["flute"] * (2.0 * KRand.fbm(s * 0.022, 0.5, 0.0, 2, seed_value + 8) - 1.0)
			+ rough["flute"] * 0.35 * (2.0 * KRand.fbm(s * 0.07, 0.5, 0.0, 2, seed_value + 9) - 1.0))
	if sh > 0.0:
		n += pow(minf(sh, 1.0), 3.0) * h * rough["crest"] * (2.0 * KRand.fbm(s * 0.0042, 0.5, 0.0, 3, seed_value + 10) - 1.0) \
			* (_sm(-200.0, 0.0, c["dd"]) if c["dd"] <= 0.0 else 1.0)
	return n


# KRELIEF.shape(S, x, z, g): the ground g with the slab's cliff on it
func shape(x: float, z: float, g: float = 0.0) -> float:
	var q := _local(x, z)
	var c := _core(q[0], q[1])
	if c["part"] == null and c["y"] <= 0.0:
		return g
	return g + c["y"] + _noise(x, z, q[0], c)


# KRELIEF.at(S, x, z): {part, s, d, dd, share, spur, fresh}, or {} where the slab does not reach (the page's null)
func at(x: float, z: float) -> Dictionary:
	var q := _local(x, z)
	var c := _core(q[0], q[1])
	if c["part"] == null:
		return {}
	return {"part": c["part"], "s": q[0], "d": q[1], "dd": c["dd"], "share": c["share"], "spur": c["p"]["spur"], "fresh": c["p"]["scar"]}
