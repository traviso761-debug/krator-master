# The isle demo's books after a replayed week, in Godot (P8; settlements/isle-demo/PLAN.md sections 7 and 9): reads
# data/isle/sim.json and golden.json (settlements/isle-demo: node tools/export-sim.js) and runs KratorIsleSim.checks,
# each with a negative. Exits 0 when every check passes and every negative is caught.
#   godot --headless --path godot --script res://tests/isle/isle_books_test.gd
extends SceneTree


func _init() -> void:
	var S = KData.read_json("res://data/isle/sim.json")
	var G = KData.read_json("res://data/isle/golden.json")
	if not (S is Dictionary) or not (G is Dictionary) or S.get("format") != "krator-sim":
		print("FAIL: no data/isle/sim.json or golden.json (settlements/isle-demo: node tools/export-sim.js)")
		quit(1)
		return
	var bad := 0
	for r in KratorIsleSim.checks(S, G):
		print(("PASS  " if r["ok"] else "FAIL  ") + r["name"] + "  (" + r["detail"] + ")")
		if not r["ok"]:
			bad += 1
	# the negatives: each a copy with one thing wrong, which its check must catch
	var missed := 0
	var negs := [
		["a Valapo resident housed in Kautoa", "own settlement", func(d: Dictionary) -> void:
			var home = null
			for a in d["actors"]:
				if a.get("settlement") == "kautoa" and a.get("home") != null:
					home = a["home"]
					break
			for a in d["actors"]:
				if a.get("settlement") == "valapo" and a.get("home") != null:
					a["home"] = home
					break],
		["7 units booked that no warehouse holds", "place records hold", func(d: Dictionary) -> void:
			var T: Dictionary = d["settlements"][0]
			var g: String = T["goods"].keys()[0]
			T["goods"][g]["warehouses"] = float(T["goods"][g]["warehouses"]) + 7.0],
		["5 units shipped and never landed", "landed or is at sea", func(d: Dictionary) -> void:
			var R: Dictionary = d["routes"][0]
			var k: String = R["shipped"].keys()[0]
			var g: String = R["shipped"][k].keys()[0]
			R["shipped"][k][g] = float(R["shipped"][k][g]) + 5.0],
		["50 fish from nowhere", "balance over the week", func(d: Dictionary) -> void:
			for T in d["settlements"]:
				if T["id"] == "valapo":
					T["goods"]["fish"]["total"] = float(T["goods"]["fish"]["total"]) + 50.0],
		["a page that booked a different week", "answers are the page", func(d: Dictionary) -> void:
			d["places"].pop_back()],
	]
	for n in negs:
		var d: Dictionary = S.duplicate(true)
		n[2].call(d)
		var hit := false
		var detail := ""
		for r in KratorIsleSim.checks(d, G):
			if String(r["name"]).contains(n[1]) and not r["ok"]:
				hit = true
				detail = r["detail"]
		print(("PASS  " if hit else "MISSED") + " negative: " + n[0] + ("  (" + detail + ")" if hit else ""))
		if not hit:
			missed += 1
	print("isle books: %d failed, %d negatives missed" % [bad, missed])
	quit(0 if bad == 0 and missed == 0 else 1)
