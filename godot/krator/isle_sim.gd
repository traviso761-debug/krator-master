# The isle demo's krator-sim export read in Godot (settlements/isle-demo/src/50-isle-export.js; P8, "the books after a
# replayed week", settlements/isle-demo/PLAN.md sections 7 and 9). The week runs in core/simulation
# (settlements/isle-demo/tools/export-sim.js writes data/isle/sim.json at its end and golden.json with the books at its
# start and the page's own answers); this reads the records and the books and derives every check again from the data:
#   KratorIsleSim.checks(doc, golden) -> [{name, ok, detail}]:
#     - every warehouse, site, home and workplace is a place of its own settlement;
#     - each good's warehouse stock is what the place records hold;
#     - every load shipped landed or is at sea;
#     - each town's books balance over the week: the change in its holdings of a good is what it made and imported, less
#       what it exported and consumed (used, less what the households bought, plus what they ate);
#     - the answers agree with the page's (golden.page: its checks and each good's balance residual).
# A GDScript twin of the economy that runs the week itself comes later (PLAN.md section 7, "Citizens").
class_name KratorIsleSim
extends RefCounted


static func places(doc: Dictionary) -> Dictionary:
	var P := {}
	for p in doc["places"]:
		P[p["id"]] = p
	return P


static func _r(name: String, ok: bool, detail: String) -> Dictionary:
	return {"name": name, "ok": ok, "detail": detail}


static func _n(d: Dictionary, k: String) -> float:
	var v = d.get(k)
	return float(v) if v != null else 0.0


# each town's balance residual by good over the week: {town: {good: residual}}
static func balance(doc: Dictionary, golden: Dictionary) -> Dictionary:
	var start := {}
	for T in golden["start"]["settlements"]:
		start[T["id"]] = T["goods"]
	var out := {}
	for T in doc["settlements"]:
		var o := {}
		var A: Dictionary = start.get(T["id"], {})
		for g in T["goods"]:
			var b: Dictionary = T["goods"][g]
			var a: Dictionary = A.get(g, {})
			var d := func(k: String) -> float: return _n(b, k) - _n(a, k)
			o[g] = d.call("total") - (d.call("made") + d.call("imported") - d.call("exported") - (d.call("used") - d.call("bought") + d.call("eaten")))
		out[T["id"]] = o
	return out


static func checks(doc: Dictionary, golden: Dictionary) -> Array:
	var out: Array = []
	var P := places(doc)
	# the settlements' places and the actors' homes and work, in their own settlement
	var bad: Array = []
	var people := 0
	for T in doc["settlements"]:
		for id in T["warehouses"] + T["sites"]:
			if not P.has(id) or P[id].get("settlement") != T["id"]:
				bad.append("%s %s" % [T["id"], str(id)])
	for a in doc["actors"]:
		if a.get("settlement") == null:
			continue
		people += 1
		for k in ["home", "work"]:
			var id = a.get(k)
			if id != null and (not P.has(id) or P[id].get("settlement") != a["settlement"]):
				bad.append("%s %s" % [str(a["id"]), str(id)])
	out.append(_r("every warehouse, site, home and workplace is a place of its own settlement", bad.is_empty() and people > 0,
		"%d places, %d people%s" % [P.size(), people, ("; OFF: " + ", ".join(bad.slice(0, 3))) if not bad.is_empty() else ""]))
	# each good's warehouse stock is what the place records hold
	var off: Array = []
	var goods := 0
	for T in doc["settlements"]:
		for g in T["goods"]:
			goods += 1
			var h := 0.0
			for id in T["warehouses"]:
				var st = P[id].get("stock") if P.has(id) else null
				if st is Dictionary and st.has(g):
					h += float(st[g])
			if absf(h - float(T["goods"][g]["warehouses"])) > 1e-6:
				off.append("%s %s %s booked, %s held" % [T["id"], g, str(T["goods"][g]["warehouses"]), str(h)])
	out.append(_r("each good's warehouse stock is what the place records hold", goods > 0 and off.is_empty(),
		"%d town-goods%s" % [goods, ("; OFF: " + ", ".join(off.slice(0, 3))) if not off.is_empty() else ""]))
	# every load shipped landed or is at sea
	var lost: Array = []
	var legs := 0
	for R in doc["routes"]:
		for k in R["shipped"]:
			for g in R["shipped"][k]:
				legs += 1
				var sh := float(R["shipped"][k][g])
				var la := float(R["landed"].get(k, {}).get(g, 0))
				var se := float(R["sea"].get(k, {}).get(g, 0))
				if absf(sh - la - se) > 1e-6:
					lost.append("%s %s %s: %d shipped, %d landed, %d at sea" % [R["id"], k, g, int(sh), int(la), int(se)])
	out.append(_r("every load shipped landed or is at sea", lost.is_empty(), "%d route legs and goods%s" % [legs, ("; " + ", ".join(lost.slice(0, 3))) if not lost.is_empty() else ""]))
	# each town's books balance over the week
	var B := balance(doc, golden)
	var unb: Array = []
	var n := 0
	for s in B:
		for g in B[s]:
			n += 1
			if absf(B[s][g]) > 1.0:
				unb.append("%s %s %.1f" % [s, g, B[s][g]])
	out.append(_r("each town's books balance over the week (change = made + imported - exported - consumed)", n > 0 and unb.is_empty(),
		"%d town-goods over %d minutes%s" % [n, int(golden["week"]["minutes"]), ("; OFF: " + ", ".join(unb.slice(0, 3))) if not unb.is_empty() else ""]))
	# the same answers as the page's
	var differ: Array = []
	var page: Dictionary = golden["page"]
	for s in page["balance"]:
		for g in page["balance"][s]:
			var mine = B.get(s, {}).get(g)
			if mine == null or absf(float(mine) - float(page["balance"][s][g])) > 1e-6:
				differ.append("%s %s page %s, godot %s" % [s, g, str(page["balance"][s][g]), str(mine)])
	var names := {}
	for c in out:
		names[c["name"]] = c["ok"]
	for c in page["checks"]:
		var nm: String = String(c["name"]).trim_prefix("the sim export: ").replace("’", "'")
		if names.has(nm) and names[nm] != bool(c["ok"]):
			differ.append("check '%s': page %s, godot %s" % [nm, str(c["ok"]), str(names[nm])])
	var counts: Dictionary = page["counts"]
	if int(counts["places"]) != doc["places"].size() or int(counts["actors"]) != doc["actors"].size():
		differ.append("counts: page %d places %d actors, godot %d, %d" % [int(counts["places"]), int(counts["actors"]), doc["places"].size(), doc["actors"].size()])
	out.append(_r("Godot's answers are the page's (the checks, each good's balance, the counts)", differ.is_empty(),
		"%d balances, %d checks%s" % [n, page["checks"].size(), ("; DIFFER: " + ", ".join(differ.slice(0, 3))) if not differ.is_empty() else ""]))
	return out


# ---- the case's citizens and canoes (P8, 2026-10-20): from the sim section of a world export (godot/data/world-isle-kautoa)

# the motion block's people at motion time t, in the drawn town's frame (world metres less the frame): KSim.pose, the
# twin of core/simulation's SIM.pose. -> [{id, x, y, z, h, moving, hidden}]
static func citizens(doc: Dictionary, t: float) -> Array:
	var M: Dictionary = doc["motion"]
	var F: Dictionary = M["frame"]
	var out: Array = []
	for a in M["actors"]:
		var o := KSim.pose(M, a, t)
		out.append({"id": a["id"], "x": o["x"] - float(F["x"]), "y": o["y"] - float(F["sea"]), "z": o["z"] - float(F["z"]),
			"h": o["h"], "moving": o["moving"], "hidden": o["hidden"]})
	return out


# a MultiMesh of stand-in bodies (a capsule each: the page draws stand-ins too, src/59-isle-citizens.js) for the people
# not hidden at time t, under `parent`
static func build_citizens(doc: Dictionary, parent: Node, t: float) -> MultiMeshInstance3D:
	var shown := citizens(doc, t).filter(func(c): return not c["hidden"])
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	var cap := CapsuleMesh.new()
	cap.radius = 0.22
	cap.height = 1.65
	mm.mesh = cap
	mm.instance_count = shown.size()
	for i in shown.size():
		var c: Dictionary = shown[i]
		mm.set_instance_transform(i, Transform3D(Basis(Vector3.UP, float(c["h"])), Vector3(c["x"], float(c["y"]) + 0.825, c["z"])))
	var n := MultiMeshInstance3D.new()
	n.name = "Citizens"
	n.multimesh = mm
	n.set_meta("krator_citizens", shown.map(func(c): return c["id"]))
	parent.add_child(n)
	return n


# every canoe line's carriers: docked at a stop (the canoe stop place of that settlement, in world metres) or at sea,
# with its cargo. -> [{id, route, state, settlement, to, cargo, place, x, z}]
static func canoes(doc: Dictionary) -> Array:
	var stop := {}
	for p in doc["places"]:
		if p.get("kind") == "canoe stop":
			stop[p["settlement"]] = p
	var out: Array = []
	for R in doc["routes"]:
		for ci in R["carriers"].size():
			var C: Dictionary = R["carriers"][ci]
			var n := 0
			for q in C["cargo"]:
				n += int(q["n"])
			var docked = C.get("at") != null
			var s = C["at"] if docked else null
			var P: Dictionary = stop.get(s, {}) if docked else {}
			out.append({"id": C.get("id", "%s#%d" % [R["id"], ci]), "route": R["id"], "state": "docked" if docked else "sea", "settlement": s, "to": C.get("to"),
				"cargo": n, "place": P.get("id"), "x": P.get("x"), "z": P.get("z")})
	return out


# the carriers docked at `town`, each a node at its canoe stop in the town's frame (a stand-in hull: the Ring Sea kit's
# lakatoi is not in the export yet), under `parent`. -> the nodes
static func build_canoes(doc: Dictionary, parent: Node, town: String) -> Array:
	var F: Dictionary = {}
	for T in doc["settlements"]:
		if T["id"] == town:
			F = T["frame"]
	var nodes: Array = []
	for c in canoes(doc):
		if c["state"] != "docked" or c["settlement"] != town or c["x"] == null:
			continue
		var hull := MeshInstance3D.new()
		var b := BoxMesh.new()
		b.size = Vector3(4.0, 1.5, 18.0)
		hull.mesh = b
		hull.name = "Canoe_%s" % str(c["id"])
		hull.position = Vector3(float(c["x"]) - float(F["x"]), 0.75, float(c["z"]) - float(F["z"]))
		hull.set_meta("krator_canoe", c)
		parent.add_child(hull)
		nodes.append(hull)
	return nodes
