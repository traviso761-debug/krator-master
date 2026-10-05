# Verge's life layer in Godot: the krator-sim export (settlements/verge, SIM.export()) read back, and a group
# member's pose evaluated as a FUNCTION OF TIME, the same function as SIM.memberPose in
# settlements/verge/src/74-verge-sim.js (tests/verge/verge_sim_test.gd checks it against SIM.golden()).
#
#   var M := KratorVergeSim.load_sim("res://data/verge/sim.json")      the model (groups, places, slots)
#   KratorVergeSim.pose(M, g, m, tau) -> {vis, x, y, z, yaw, dispersed}  g, m: indices; tau: run time (seconds)
#   KratorVergeSim.run_time(M, g, t, copy) -> tau                         motion time t to a copy's run time
#   KratorVergeSim.build(sim_path, place_path) -> Node3D                   stand-ins: the trail and streets as
#       ribbons, buildings as boxes, every group member as a capsule (people) or a box (camels, lizards), moved
#       each frame by pose(); a report like the other importers'
#
# Conventions (the export says them too): x east, z south, y up, metres; yaw is three's rotation.y (the front, +z,
# turns to (sin yaw, cos yaw)); motion time in seconds; the timetable repeats every T.
class_name KratorVergeSim
extends RefCounted


static func load_sim(path: String) -> Dictionary:
	var d = KData.read_json(path)
	if not (d is Dictionary) or d.get("format", "") != "krator-sim":
		return {}
	var slots := {}
	for p in d["places"]:
		for s in p.get("slots", []):
			slots[s["id"]] = s
	var places := {}
	for p in d["places"]:
		places[p["id"]] = p
	for g in d["groups"]:
		var pts: Array = g["path"]
		var cum := PackedFloat64Array()
		cum.resize(pts.size())
		cum[0] = 0.0
		for i in range(1, pts.size()):
			cum[i] = cum[i - 1] + Vector2(float(pts[i][0]) - float(pts[i - 1][0]), float(pts[i][1]) - float(pts[i - 1][1])).length()
		g["_cum"] = cum
		g["_len"] = cum[cum.size() - 1]
		var tl: Dictionary = g["timeline"]
		var starts := PackedFloat64Array()
		var sum := 0.0
		for sg in tl["segments"]:
			starts.append(sum)
			sum += float(sg["dur"])
		tl["_starts"] = starts
		tl["_sum"] = sum
	d["_slots"] = slots
	d["_places"] = places
	return d


# KSCHED.timeline(...).at(t).value (core/sched/20-core-sched.js), linear ease (the only one Verge uses)
static func timeline_at(tl: Dictionary, t: float) -> float:
	var period := float(tl["period"])
	var tt := t + float(tl.get("phase", 0.0))
	var l := fmod(fmod(tt, period) + period, period)
	var segs: Array = tl["segments"]
	var starts: PackedFloat64Array = tl["_starts"]
	var i := segs.size() - 1
	while i > 0 and l < starts[i]:
		i -= 1
	var s: Dictionary = segs[i]
	var u := clampf((l - starts[i]) / float(s["dur"]), 0.0, 1.0)
	if l >= float(tl["_sum"]):
		u = 1.0
	var a := float(s["from"])
	var b := float(s.get("to", a))
	return a + (b - a) * u


# the path at arc length s: [x, z, y, heading], the heading looking one point ahead (as SIM.pathAt)
static func path_at(g: Dictionary, s: float) -> Array:
	var pts: Array = g["path"]
	var cum: PackedFloat64Array = g["_cum"]
	var n := cum.size()
	s = clampf(s, 0.0, float(g["_len"]))
	var lo := 0
	var hi := n - 1
	while hi - lo > 1:
		var m := (lo + hi) >> 1
		if cum[m] <= s:
			lo = m
		else:
			hi = m
	var a: Array = pts[lo]
	var b: Array = pts[hi]
	var t := (s - cum[lo]) / maxf(1e-6, cum[hi] - cum[lo])
	# (past any point within 5 cm of where it looks from, so a doubled point never gives a heading of noise)
	var j := mini(n - 1, hi + 1)
	var i0 := lo
	while j < n - 1 and _d2(pts[j], pts[i0]) < 0.05:
		j += 1
	while i0 > 0 and _d2(pts[j], pts[i0]) < 0.05:
		i0 -= 1
	var q: Array = pts[j]
	var p0: Array = pts[i0]
	var h := atan2(float(q[0]) - float(p0[0]), float(q[1]) - float(p0[1]))
	return [float(a[0]) + (float(b[0]) - float(a[0])) * t, float(a[1]) + (float(b[1]) - float(a[1])) * t, float(a[2]) + (float(b[2]) - float(a[2])) * t, h]


static func _d2(p: Array, q: Array) -> float:
	return Vector2(float(p[0]) - float(q[0]), float(p[1]) - float(q[1])).length()


# walking a short polyline [[x, z, y]...] d metres from its start (2-D lengths, as walkLeg in 74)
static func walk_leg(pts: Array, d: float) -> Array:
	for i in range(1, pts.size()):
		var a: Array = pts[i - 1]
		var b: Array = pts[i]
		var l := Vector2(b[0] - a[0], b[1] - a[1]).length()
		if d <= l or i == pts.size() - 1:
			var u := clampf(d / maxf(1e-6, l), 0.0, 1.0)
			return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, atan2(b[0] - a[0], b[1] - a[1])]
		d -= l
	return pts[pts.size() - 1] + [0.0]


static func pose(M: Dictionary, gi: int, mi: int, tau: float) -> Dictionary:
	var g: Dictionary = M["groups"][gi]
	var m: Dictionary = g["members"][mi]
	var o := {"vis": false, "dispersed": false}
	if tau < 0.0 or tau > float(g["duration"]):
		return o
	var lag := float(m["lag"])
	var v := float(g["speed"])
	for st in g["stops"]:
		if not st.get("disperse", false) or st.get("slots") == null:
			continue
		var sid = st["slots"].get(str(int(m["i"])))
		if sid == null:
			continue
		var S: Dictionary = M["_slots"][sid]
		var a0 := float(st["t0"]) + float(m["i"]) * 2.2
		var b1 := float(st["t1"])
		if tau < a0 or tau > b1:
			continue
		var p := path_at(g, float(st["s"]) - lag)
		var E: Array = st["gate"]
		var pts := [[p[0], p[1], p[2]], [float(E[0]), float(E[1]), float(st["gateY"])], [float(S["x"]), float(S["z"]), float(S["y"])]]
		var L := 0.0
		for i in range(1, pts.size()):
			L += Vector2(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]).length()
		var vw := 1.25 if m["kind"] == "person" else 1.1
		var dur := L / vw
		if 2.0 * dur > b1 - a0:
			break
		o["vis"] = true
		o["dispersed"] = true
		var r: Array
		if tau < a0 + dur:
			r = walk_leg(pts, (tau - a0) * vw)
		elif tau > b1 - dur:
			var rev := pts.duplicate()
			rev.reverse()
			r = walk_leg(rev, (tau - (b1 - dur)) * vw)
		else:
			r = [float(S["x"]), float(S["z"]), float(S["y"]), float(S["ry"])]
		o["x"] = r[0]; o["z"] = r[1]; o["y"] = r[2]; o["yaw"] = r[3]
		return o
	var s := timeline_at(g["timeline"], tau) - lag
	if s < 0.0 or s > float(g["_len"]):
		return o
	var p := path_at(g, s)
	var side := float(m["side"])
	o["vis"] = true
	o["x"] = p[0] + cos(p[3]) * side
	o["z"] = p[1] - sin(p[3]) * side
	o["y"] = p[2]
	o["yaw"] = p[3]
	return o


static func run_time(M: Dictionary, gi: int, t: float, copy: int) -> float:
	var T := float(M["T"])
	var g: Dictionary = M["groups"][gi]
	return fmod(fmod(t - float(g["phase"]), T) + T, T) + copy * T


static func copies(M: Dictionary, gi: int) -> int:
	return int(ceil(float(M["groups"][gi]["duration"]) / float(M["T"]))) + 1


# ---------------------------------------------------------------- the stand-ins
static func build(sim_path: String, place_path: String) -> Node3D:
	var root := Node3D.new()
	root.name = "Verge"
	var report := {"route": "krator-sim + krator-verge-place (settlements/verge)", "counts": {}, "gaps": {}}
	var M := load_sim(sim_path)
	if M.is_empty():
		report["gaps"]["load"] = "no krator-sim at " + sim_path
		root.set_meta("report", report)
		return root
	var place = KData.read_json(place_path)
	var mats := {}
	var mat := func(c: Color) -> StandardMaterial3D:
		var k := c.to_html()
		if not mats.has(k):
			var mm := StandardMaterial3D.new()
			mm.albedo_color = c
			mats[k] = mm
		return mats[k]
	# the buildings: one box each, coloured by city
	var nb := 0
	if place is Dictionary:
		var mmesh := MultiMesh.new()
		mmesh.transform_format = MultiMesh.TRANSFORM_3D
		mmesh.use_colors = true
		var bs: Array = place.get("buildings", [])
		mmesh.instance_count = bs.size()
		var box := BoxMesh.new()
		box.size = Vector3.ONE
		mmesh.mesh = box
		for i in bs.size():
			var b: Dictionary = bs[i]
			var tr := Transform3D(Basis(Vector3.UP, float(b["ry"])).scaled(Vector3(float(b["w"]), float(b["h"]) * 0.6, float(b["d"]))), Vector3(float(b["x"]), float(b["y"]) + float(b["h"]) * 0.3, float(b["z"])))
			mmesh.set_instance_transform(i, tr)
			mmesh.set_instance_color(i, Color(0.85, 0.55, 0.32) if b["city"] == "upper" else Color(0.75, 0.82, 0.8) if b["city"] == "lower" else Color(0.6, 0.6, 0.6))
			nb += 1
		var mi := MultiMeshInstance3D.new()
		mi.multimesh = mmesh
		var bm := StandardMaterial3D.new()
		bm.vertex_color_use_as_albedo = true
		mi.material_override = bm
		mi.name = "Buildings"
		root.add_child(mi)
		# the trail as a line of small markers every 20 m
		var tr_pts: Array = place.get("trail", {}).get("pts", [])
		var im := ImmediateMesh.new()
		im.surface_begin(Mesh.PRIMITIVE_LINE_STRIP, mat.call(Color(1, 0.9, 0.6)))
		for p in tr_pts:
			im.surface_add_vertex(Vector3(p[0], p[2] + 0.5, p[1]))
		im.surface_end()
		var tl := MeshInstance3D.new()
		tl.mesh = im
		tl.name = "Trail"
		root.add_child(tl)
	# the members: a capsule per person, a box per camel or lizard; moved by _process (verge_sim_node.gd)
	var holder := Node3D.new()
	holder.name = "Life"
	holder.set_script(load("res://krator/verge_sim_node.gd"))
	holder.set("model", M)
	var cap := CapsuleMesh.new()
	cap.radius = 0.3
	cap.height = 1.75
	var cam_box := BoxMesh.new()
	cam_box.size = Vector3(0.9, 1.9, 2.8)
	var liz := BoxMesh.new()
	liz.size = Vector3(0.8, 0.8, 3.0)
	var nm := 0
	var nodes := []
	for gi in M["groups"].size():
		var g: Dictionary = M["groups"][gi]
		for c in copies(M, gi):
			for mi2 in g["members"].size():
				var m: Dictionary = g["members"][mi2]
				var n := MeshInstance3D.new()
				n.mesh = cap if m["kind"] == "person" else cam_box if m["kind"] == "camel" else liz
				var look: Dictionary = m.get("look", {})
				var col: int = int(look.get("robe", look.get("coat", look.get("skin", 0x999999))))
				n.material_override = mat.call(Color.hex((col << 8) | 0xff))
				n.visible = false
				n.set_meta("krator", {"group": g["id"], "copy": c, "member": mi2, "kind": m["kind"], "role": m.get("role"), "faction": g["faction"], "org": g["org"]})
				holder.add_child(n)
				nodes.append([gi, c, mi2, n])
				nm += 1
	holder.set("members", nodes)
	root.add_child(holder)
	report["counts"] = {"buildings": nb, "groups": M["groups"].size(), "member_nodes": nm, "places": M["places"].size(), "nav_nodes": M["nav"]["nodes"].size()}
	report["gaps"]["rigs"] = "stand-ins: capsules and boxes, no gait (the page's rigs are three.js; RIGS' API is the contract)"
	report["gaps"]["citizens"] = "the citizens walk by decisions taken at run time (SIM.decide, logged); not replayed here"
	root.set_meta("report", report)
	var t0: Dictionary = place.get("trail", {}) if place is Dictionary else {}
	if t0.has("pts") and t0["pts"].size() > 0:
		var p0: Array = t0["pts"][int(t0["pts"].size() * 0.5)]
		root.set_meta("focus", Vector3(p0[0], p0[2], p0[1]))
	return root
