# Yuni through core/export (core/export/README.md, "Yuni"; ROADMAP.md section 11): the Foundry's box exported as a
# krator-world opens in Godot with its buildings as Records/Building_<id> nodes and every fixture a child of its
# building. Yuni keeps its own route too (KRATOR_EXPORT, data/yuni/: the spike's case), so the test also proves the
# two agree: a door has the same id, uid and position in both. The case is written by
#   python3 tools/harness.py export settlements/yuni/yuni.html --out godot/data/world-yuni --box 140,-80,340,90 --profile registry,fixtures,interiors?
# and imported by krator/world_import.gd. Each check has a negative.
#   godot --headless --path godot --script res://tests/export/yuni_test.gd     exits 0 when every check passes
# (a fresh checkout runs godot --headless --path godot --import once first, so the class names register)
extends SceneTree

const KTags := preload("res://tests/tags/ktags.gd")
var CASE := "res://data/world-yuni/"   # -- --case=<name>: another records-only case under data/
const SPIKE := "res://data/yuni/"      # the KRATOR_EXPORT route (godot/tools/export_spike.py yuni)
const POS_TOL := 1e-4    # metres: a record node against the position its record gives
const ROUTE_TOL := 1e-3  # metres: the two routes round to 4 and 3 decimals

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--case="):
			CASE = "res://data/%s/" % a.trim_prefix("--case=")
	if not FileAccess.file_exists(CASE + "world.json"):
		print("FAIL no case: run python3 tools/harness.py export settlements/yuni/yuni.html --out godot/data/world-yuni --box 140,-80,340,90")
		quit(1)
		return
	var d: Dictionary = KData.read_json(CASE + "world.json")
	var w := KratorWorld.build(CASE + "world.json")
	root.add_child(w)
	var rep: Dictionary = w.get_meta("report")
	ok(d["format"] == "krator-world" and int(d["version"]) == 1 and not rep["gaps"].has("load") and not rep["gaps"].has("format"),
		"world.json and world.glb load (%d ms)" % rep["counts"]["load_ms"])
	ok((d["errors"] as Array).is_empty(), "the page reported no section errors")
	ok(rep["sections"].get("registry") == "ok" and rep["sections"].get("fixtures") == "ok" and rep["sections"].get("interiors") == "empty",
		"sections: %s" % JSON.stringify(rep["sections"]))
	ok(rep["sections"].get("sim") == "stub" and rep["gaps"].has("section sim"), "the stubs arrive as stubs, and the report names them")
	var tags: Dictionary = w.get_meta("tags", {})
	var recs: Dictionary = rep.get("records", {})

	# 1. the records as nodes: buildings at their record, every fixture a child of its building, at its record
	var R := w.get_node_or_null("Records")
	var fx := 0
	var fx_par := 0
	var fx_far := 0
	var fx_worst := 0.0
	var fx_loose := 0
	var kinds := {}
	var b_far := 0
	var hosts := {"wall": 0, "sill": 0}
	if R:
		for bn in R.get_children():
			var r: Dictionary = bn.get_meta("krator", {})
			if r.get("class") == "building" and str(bn.name).begins_with("Building_"):
				var at: Array = r["at"]
				if ((bn as Node3D).position - Vector3(at[0], at[1], at[2])).length() > POS_TOL:
					b_far += 1
				for f in bn.get_children():
					var fr: Dictionary = f.get_meta("krator", {})
					fx += 1
					kinds[fr.get("kind")] = kinds.get(fr.get("kind"), 0) + 1
					if fr.get("parent") == r["id"] and tags.has(fr["parent"]) and tags[fr["parent"]]["class"] == "building" and tags.has(fr["id"]):
						fx_par += 1
					var h = f.get_meta("krator_host")
					if h is Dictionary:
						if h.get("wall") != null:
							hosts["wall"] += 1
						if h.has("sill"):
							hosts["sill"] += 1
					var g: Vector3 = (bn as Node3D).transform * (f as Node3D).transform.origin
					var e := (g - Vector3(fr["at"][0], fr["at"][1], fr["at"][2])).length()
					fx_worst = max(fx_worst, e)
					if e > POS_TOL:
						fx_far += 1
			elif r.get("class") == "fixture":
				fx_loose += 1   # a street light: parent null, its own node under Records
	var frecs: Array = d["fixtures"]["records"]
	var nfix: int = frecs.size()
	var nchild := 0
	for fr in frecs:
		if fr.get("parent") != null:
			nchild += 1
	ok(int(recs.get("buildings", 0)) > 0 and b_far == 0, "%d building records as Building nodes, each at its record (%d off)" % [recs.get("buildings", 0), b_far])
	ok(nfix > 0 and fx == nchild and fx_par == nchild and fx + fx_loose == nfix,
		"%d fixtures (%s): %d children of their building, id and parent resolving in the registry (%d); %d street fixtures on their own" % [nfix, JSON.stringify(kinds), fx, fx_par, fx_loose])
	ok(fx_far == 0, "every fixture node stands at its record's position (worst %s m, tolerance %s m)" % [str(fx_worst), str(POS_TOL)])
	ok(kinds.has("door") and kinds.has("window"), "the box holds doors and windows")
	ok(hosts["sill"] == fx and hosts["wall"] > 0, "every fixture carries its host (sill: %d of %d; a wall of the interior plan: %d)" % [hosts["sill"], fx, hosts["wall"]])
	# the gaps the importer may report here: the stubs, no terrain (Yuni registers none), and the material hooks Yuni's
	# KMAT table names (unlit, planar-uv, city-ground: krator/khooks.gd has no include for them yet); none about the records
	var odd := []
	for k in rep["gaps"]:
		if not (str(k).begins_with("section ") or k in ["terrain", "hooks"]):
			odd.append(k)
	ok(odd.is_empty(), "no gaps about the records (the others: %s)" % JSON.stringify(rep["gaps"].keys()))
	var fake: Dictionary = (frecs[0] as Dictionary).duplicate(true)
	fake["parent"] = "bld_99999"
	ok(not tags.has(fake["parent"]), "negative: a fixture whose parent the page never made does not resolve")
	var r0: Dictionary = tags.get(frecs[0]["id"], {})
	ok(not r0.is_empty() and KTags.uid(r0["class"], r0.get("key", r0.get("kind")), [float(r0["at"][0]) + 0.2, r0["at"][1], r0["at"][2]]) != r0["uid"],
		"negative: a fixture's record moved 20 cm has another uid")

	# 2. the two routes agree: KRATOR_EXPORT.fixtures() (the spike's case) names the same door at the same place
	if FileAccess.file_exists(SPIKE + "fixtures.json") and FileAccess.file_exists(SPIKE + "tags.json"):
		var sp: Dictionary = KData.read_json(SPIKE + "fixtures.json")
		var st: Dictionary = KData.read_json(SPIKE + "tags.json")
		var sp_by := {}
		for k in ["doors", "windows", "lights"]:
			for o in sp.get(k, []):
				sp_by[o["id"]] = o
		var st_by := {}
		for r in st.get("records", []):
			st_by[r["id"]] = r
		var same := 0
		var moved := 0
		var missing := 0
		var uid_same := 0
		var uid_diff := 0
		var worst := 0.0
		for fr in frecs:
			var o = sp_by.get(fr["id"])
			if o == null:
				missing += 1
				continue
			var at: Array = fr["at"]
			var e := 0.0
			if fr["kind"] == "window":   # the record's at is the pane's base; the spike's y its centre
				e = (Vector3(o["x"], o["y"] - float(o["h"]) * 0.5, o["z"]) - Vector3(at[0], at[1], at[2])).length()
			else:
				e = (Vector3(o["x"], o["y"], o["z"]) - Vector3(at[0], at[1], at[2])).length()
			worst = max(worst, e)
			if e <= ROUTE_TOL and o.get("building") == fr.get("parent"):
				same += 1
			else:
				moved += 1
			var tr = st_by.get(fr["id"])
			if tr != null and tr.get("uid") == fr.get("uid"):
				uid_same += 1
			else:
				uid_diff += 1
		ok(missing == 0 and moved == 0 and same == nfix, "the spike's route (data/yuni/fixtures.json) names every one of the %d fixtures at the same place under the same building (worst %s m; %d missing, %d moved)" % [nfix, str(worst), missing, moved])
		ok(uid_diff == 0 and uid_same == nfix, "the spike's tags.json gives every fixture the same uid (%d of %d)" % [uid_same, nfix])
		var o0: Dictionary = sp_by.get(frecs[0]["id"], {})
		ok(not o0.is_empty() and abs(float(o0["x"]) + 0.5 - float(frecs[0]["at"][0])) > ROUTE_TOL, "negative: the spike's door moved half a metre no longer matches")
	else:
		print("skip the route comparison: no data/yuni/fixtures.json (godot/tools/export_spike.py yuni)")

	w.queue_free()
	print("yuni: %d buildings, %d records, %d fixtures; %s" % [recs.get("buildings", 0), tags.size(), nfix, "all passed" if fails == 0 else str(fails) + " failed"])
	quit(1 if fails else 0)
