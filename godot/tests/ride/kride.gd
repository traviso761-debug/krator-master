# core/simulation/ride's motion in GDScript: the twin of 78-sim-ride.js (SIM.rideCarPose, the frame leg in SIM.pose) and of
# core/sched's KSCHED.timeline.at (the train's s(t), its A end). A ride source's car k stands at s(t) - off along its track, its bogies
# at +-b, its frame's origin their midpoint, yaw and pitch rear bogie to front; a leg carrying `frame` [source, k] is posed
# through that car (its route in the car's coordinates); every other leg is KSim.pose's. Same numbers as the page: doubles
# in the JS order of operations. Read from SIM.rideExportMotion (the motion block plus `ride`: the sources); tested against
# the page's trace by kride_test.gd (golden-ride.json, written by core/simulation/ride/test-ride.js --write). Synced into
# godot/tests/ride/ by godot/tools/sync_core.py.
#
#   KRide.timeline_at(TL, t) -> s          a KSCHED timeline export's value at t (numbers)
#   KRide.car_pose(S, k, t)  -> {x, y, z, yaw, pitch, roll}     S: one of the export's ride.sources
#   KRide.to_world(P, p)     -> [x, y, z]  a point of the car's frame in the world
#   KRide.pose(M, a, t)      -> {x, y, z, h, moving, hidden, mode, leg}   M: the motion export with its `ride` block
class_name KRide
extends RefCounted


static func ease_of(name: String, u: float) -> float:
	match name:
		"linear":
			return u
		"inOut":
			return 4.0 * u * u * u if u < 0.5 else 1.0 - pow(-2.0 * u + 2.0, 3.0) / 2.0
		"out":
			return 1.0 - (1.0 - u) * (1.0 - u)
		"in":
			return u * u
	return u * u * (3.0 - 2.0 * u)   # smooth, the default


static func timeline_at(TL: Dictionary, t: float) -> float:
	var segs: Array = TL["segments"]
	var period: float = float(TL["period"])
	var phase: float = float(TL.get("phase", 0.0))
	var starts := []
	var total := 0.0
	for s in segs:
		starts.append(total)
		total += float(s["dur"])
	var tt := t + phase
	var l := fposmod(tt, period)
	var i := segs.size() - 1
	while i >= 0:
		if l >= float(starts[i]):
			break
		i -= 1
	var S: Dictionary = segs[i]
	var u := clampf((l - float(starts[i])) / float(S["dur"]), 0.0, 1.0)
	var a: float = float(S["from"])
	var b: float = float(S["to"]) if S.has("to") and S["to"] != null else a
	if l >= total:
		u = 1.0
	return a + (b - a) * ease_of(String(S.get("ease", "smooth")), u)


static func car_pose(S: Dictionary, k: int, t: float) -> Dictionary:
	var C: Dictionary = S["cars"][k]
	var s := timeline_at(S["timeline"], t) - float(C["off"])
	var F := KSim.at(S["track"], s + float(C["b"]))
	var R := KSim.at(S["track"], s - float(C["b"]))
	var dx: float = F["x"] - R["x"]
	var dz: float = F["z"] - R["z"]
	var dy: float = F["y"] - R["y"]
	var L := sqrt(dx * dx + dz * dz)
	return {"x": (F["x"] + R["x"]) / 2.0, "y": (F["y"] + R["y"]) / 2.0, "z": (F["z"] + R["z"]) / 2.0,
		"yaw": atan2(dx, dz), "pitch": atan2(dy, L) if L > 0.0 else 0.0, "roll": 0.0}


static func to_world(P: Dictionary, p: Array) -> Array:
	var cp := cos(float(P["pitch"]))
	var sp := sin(float(P["pitch"]))
	var cy := cos(float(P["yaw"]))
	var sy := sin(float(P["yaw"]))
	var y2: float = float(p[1]) * cp + float(p[2]) * sp
	var z2: float = -float(p[1]) * sp + float(p[2]) * cp
	var x2: float = float(p[0])
	return [float(P["x"]) + x2 * cy + z2 * sy, float(P["y"]) + y2, float(P["z"]) - x2 * sy + z2 * cy]


# the g-th dwell since the timetable's start (SIM.rideDwell): {g, stop, side, t0, t1, o0, o1}
static func dwell(S: Dictionary, g: int) -> Dictionary:
	var TL: Dictionary = S["timeline"]
	var D := []
	var start := 0.0
	for s in TL["segments"]:
		var nm := String(s.get("name", ""))
		if nm.begins_with("stop:"):
			var part := nm.substr(5).split(":")
			D.append({"stop": part[0], "side": int(part[1]) if part.size() > 1 else null, "start": start, "dur": float(s["dur"])})
		start += float(s["dur"])
	var n := D.size()
	var c := int(floor(float(g) / n))
	var j := posmod(g, n)
	var d: Dictionary = D[j]
	var t0: float = c * float(TL["period"]) - float(TL.get("phase", 0.0)) + float(d["start"])
	var side := int(d["side"]) if d["side"] != null else int(S["stops"][d["stop"]].get("side", 0))
	return {"g": g, "stop": d["stop"], "side": side, "t0": t0, "t1": t0 + float(d["dur"]),
		"o0": t0 + float(S["doorLag"]), "o1": t0 + float(d["dur"]) - float(S["doorClose"])}


# the dwell standing at t ({} on a run), with `open` true inside its door window (SIM.rideDwellAt)
static func dwell_at(S: Dictionary, t: float) -> Dictionary:
	var TL: Dictionary = S["timeline"]
	var n := 0
	for s in TL["segments"]:
		if String(s.get("name", "")).begins_with("stop:"):
			n += 1
	var g := (int(floor((t + float(TL.get("phase", 0.0))) / float(TL["period"]))) - 1) * n
	while true:
		var d := dwell(S, g)
		if d["t0"] > t:
			return {}
		if t < d["t1"]:
			d["open"] = t >= d["o0"] and t <= d["o1"]
			return d
		g += 1
	return {}


# a car door open at t: inside its dwell's window, on its side (SIM.rideDoorOpen)
static func door_open(S: Dictionary, k: int, door_id: String, t: float) -> bool:
	var d := dwell_at(S, t)
	if d.is_empty() or not d["open"]:
		return false
	for D in S["cars"][k]["doors"]:
		if String(D["id"]) == door_id:
			var side := int(D["side"])
			return int(d["side"]) == 0 or side == int(d["side"])
	return false


static func pose(M: Dictionary, a: Dictionary, t: float) -> Dictionary:
	var T = a.get("task")
	if not (T is Dictionary) or not T.get("ride", false):
		return KSim.pose(M, a, t)
	var legs: Array = T["legs"]
	var dt: float = t - float(T["t0"])
	for i in legs.size():
		var L: Dictionary = legs[i]
		if dt < float(L["dur"]):
			var fr = L.get("frame")
			if not (fr is Array):
				return KSim.pose(M, a, t)
			var S: Dictionary = M["ride"]["sources"][int(fr[0])]
			var k := int(fr[1])
			var P := car_pose(S, k, t)
			var R: Dictionary = M["routes"][int(L["route"])]
			var rlen: float = float(R["len"])
			var s := maxf(0.0, minf(dt * float(L["speed"]), rlen))
			var q := KSim.at(R, s)
			var w := to_world(P, [q["x"], q["y"], q["z"]])
			var mv := rlen > 0.0 and s > 0.0 and s < rlen
			var cy := cos(float(P["yaw"]))
			var sy := sin(float(P["yaw"]))
			var h: float = atan2(q["tx"] * cy + q["tz"] * sy, -q["tx"] * sy + q["tz"] * cy) if mv else float(P["yaw"]) + float(L.get("face", 0.0))
			var sealed: bool = S["cars"][k].get("sealed", false)
			return {"x": w[0], "y": w[1], "z": w[2], "h": h, "moving": mv, "hidden": (not a.get("present", false)) or sealed, "mode": "ride", "leg": i}
		dt -= float(L["dur"])
	return KSim.pose(M, a, t)
