# core/simulation's motion in GDScript: the twin of 77-sim-5-motion.js (SIM.at, SIM.pose). Motion is a pure function of
# time: an actor's baked task (legs of routes, each with a speed and a duration, then a spot it idles at, wandering on a
# hashed loop) gives its pose at any motion time t, here as in the page. Same numbers: doubles in the JS file's order of
# operations, and the wander's 32-bit hash through imul() (GDScript ints are 64-bit; krand.gd's idiom).
# Read from a krator-sim export's `motion` block (settlements/dhelv: sim.json); tested against the page's trace
# (golden.json) by godot/tests/dhelv/dhelv_sim_test.gd. Synced into godot/tests/sim/ by godot/tools/sync_core.py.
#
#   KSim.pose(M, actor, t) -> {x, y, z, h, moving, hidden, mode, leg}     M: the export's motion block (routes, wander)
#   KSim.at(route, s)      -> {x, y, z, tx, tz}                            the point s metres along a route
class_name KSim
extends RefCounted

const M32 := 0xFFFFFFFF


static func imul(a: int, b: int) -> int:
	a &= M32
	b &= M32
	return ((a & 0xFFFF) * b + ((((a >> 16) * b) & 0xFFFF) << 16)) & M32


# the wander's hash (h32 in the JS): two ints to [0, 1)
static func h32(a: int, b: int) -> float:
	var h := imul((a & M32) ^ 0x9E3779B1, 0x85EBCA6B) ^ imul(b & M32, 0xC2B2AE35)
	h ^= h >> 15
	h = imul(h, 0x27D4EB2D)
	h ^= h >> 13
	return float(h & M32) / 4294967296.0


static func _seg(P: Array, i: int, u: float) -> Dictionary:
	var n := P.size()
	var a: Array = P[clampi(i, 0, n - 1)]
	var b: Array = P[clampi(i + 1, 0, n - 1)]
	var dx: float = b[0] - a[0]
	var dz: float = b[2] - a[2]
	var L := sqrt(dx * dx + dz * dz)
	if L == 0.0:
		L = 1.0
	return {"x": a[0] + dx * u, "y": a[1] + (b[1] - a[1]) * u, "z": a[2] + dz * u, "tx": dx / L, "tz": dz / L}


static func at(R: Dictionary, s: float) -> Dictionary:
	var P: Array = R["pts"]
	var C: Array = R["cum"]
	var n := P.size()
	if s <= 0.0:
		return _seg(P, 0, 0.0)
	if s >= float(R["len"]):
		return _seg(P, n - 2, 1.0)
	var lo := 0
	var hi := n - 1
	while lo < hi - 1:
		var m := (lo + hi) >> 1
		if float(C[m]) <= s:
			lo = m
		else:
			hi = m
	var L: float = C[lo + 1] - C[lo]
	return _seg(P, lo, (s - C[lo]) / L if L > 0.0 else 0.0)


static func pose(M: Dictionary, a: Dictionary, t: float) -> Dictionary:
	var o := {"x": 0.0, "y": 0.0, "z": 0.0, "h": float(a.get("h0", 0.0)), "moving": false, "hidden": false, "mode": "walk", "leg": -1}
	var present: bool = a.get("present", false)
	var T = a.get("task")
	if not (T is Dictionary):
		var p = a.get("pos")
		if not (p is Dictionary):
			var d = a.get("homeDoor")
			if d is Dictionary:
				p = d
				o["hidden"] = true
			else:
				var q: Array = a.get("at") if a.get("at") is Array else [0, 0]
				p = {"x": q[0], "y": 0.0, "z": q[1]}
		o["x"] = float(p["x"])
		o["y"] = float(p.get("y", 0.0))
		o["z"] = float(p["z"])
		if not present:
			o["hidden"] = true
		return o
	var routes: Array = M["routes"]
	var legs: Array = T["legs"]
	var dt: float = t - float(T["t0"])
	for i in legs.size():
		var L: Dictionary = legs[i]
		var R: Dictionary = routes[int(L["route"])]
		if dt < float(L["dur"]):   # a group member trails `back` metres behind its leader, and stops there
			var s := maxf(0.0, minf(dt * float(L["speed"]), float(R["len"])) - float(L["back"]))
			var q := at(R, s)
			o["x"] = q["x"] - q["tz"] * float(L["side"])
			o["z"] = q["z"] + q["tx"] * float(L["side"])
			o["y"] = q["y"]
			o["h"] = atan2(q["tx"], q["tz"])
			o["moving"] = s > 0.0 and s < float(R["len"])
			o["mode"] = L["mode"]
			o["leg"] = i
			if not present:
				o["hidden"] = true
			return o
		dt -= float(L["dur"])
	# arrived: at the spot, or a group's member where its walk stopped, `back` metres behind its leader along the way
	var sp = T.get("spot")
	var lastL = legs[legs.size() - 1] if legs.size() > 0 else null
	var back: float = float(lastL["back"]) if lastL else 0.0
	var side: float = float(lastL["side"]) if lastL else 0.0
	if lastL:
		var R: Dictionary = routes[int(lastL["route"])]
		var e := at(R, maxf(0.0, float(R["len"]) - back))
		o["h"] = atan2(e["tx"], e["tz"])
		o["mode"] = lastL["mode"]
		o["x"] = e["x"] - e["tz"] * side
		o["z"] = e["z"] + e["tx"] * side
		o["y"] = e["y"] if back != 0.0 else float(sp.get("y", 0.0)) if sp is Dictionary else 0.0
	elif sp is Dictionary:
		o["x"] = float(sp["x"])
		o["z"] = float(sp["z"])
		o["y"] = float(sp.get("y", 0.0))
	var W: float = float(T.get("wander", 0.0))
	if W > 0.0 and not T.get("indoor", false):
		var P: float = float(M.get("wander", {}).get("period", 14.0))
		var k: int = int(a.get("k", 0))
		var v: float = (t + k * 3.7) / P
		var c := int(floor(v))
		var u: float = v - c
		var ax := (h32(k, c) - 0.5) * 2.0 * W
		var az := (h32(k + 7919, c) - 0.5) * 2.0 * W
		var bx := (h32(k, c + 1) - 0.5) * 2.0 * W
		var bz := (h32(k + 7919, c + 1) - 0.5) * 2.0 * W
		var f := 0.0 if u < 0.55 else (u - 0.55) / 0.45
		var sm := f * f * (3.0 - 2.0 * f)
		o["x"] += ax + (bx - ax) * sm
		o["z"] += az + (bz - az) * sm
		if sm > 0.0 and sm < 1.0:
			o["moving"] = true
			o["h"] = atan2(bx - ax, bz - az)
	o["hidden"] = T.get("indoor", false) or not present
	if a.get("inVehicle") == "boat" and legs.size() > 0 and lastL and lastL["mode"] == "boat":
		o["mode"] = "boat"
		o["hidden"] = not present
	return o
