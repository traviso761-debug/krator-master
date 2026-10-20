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
