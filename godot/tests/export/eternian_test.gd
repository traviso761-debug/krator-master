# The Eternian kit's sheet through core/export (kits/eternian P7; core/export/README.md, "Profiles"): a tile of the sheet
# (the canal street) exported as a krator-world opens in Godot with its records, materials and ground. The kit is on the
# Scyvoi engine, whose pages give the exporter records and materials but no meshes (the isle demo's route), so the case
# is held to the profile registry, materials, terrain. The case is written by
#   python3 tools/harness.py export kits/eternian/dist/eternian.html --out godot/data/world-eternian --box -45,-205,45,-145 --profile registry,materials,terrain
# and imported by krator/world_import.gd. Each check that can have a negative has one.
#   godot --headless --path godot --script res://tests/export/eternian_test.gd     exits 0 when every check passes
# (a fresh checkout runs godot --headless --path godot --import once first, so the class names register)
extends SceneTree

const KTags := preload("res://tests/tags/ktags.gd")
var CASE := "res://data/world-eternian/"   # -- --case=<name>: another case under data/
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
		print("FAIL no case: run python3 tools/harness.py export kits/eternian/dist/eternian.html --out godot/data/world-eternian --box ...")
		quit(1)
		return
	var d: Dictionary = KData.read_json(CASE + "world.json")
	var w := KratorWorld.build(CASE + "world.json")
	root.add_child(w)
	var rep: Dictionary = w.get_meta("report")
	ok(d["format"] == "krator-world" and not rep["gaps"].has("load") and not rep["gaps"].has("format"),
		"world.json and world.glb load (%d ms)" % rep["counts"]["load_ms"])
	ok((d["errors"] as Array).is_empty(), "the page reported no section errors")
	var bad := []
	for s in ["registry", "materials", "terrain"]:
		if rep["sections"].get(s) != "ok":
			bad.append(s)
	ok(bad.is_empty(), "the profile's sections filled: %s" % JSON.stringify(rep["sections"]))
	ok(rep["sections"].get("items") != "ok" and rep["sections"].get("buckets") != "ok",
		"negative: the Scyvoi engine gives no meshes, and the report does not claim any")

	# 1. the registry: every record resolves, its uid recomputed here from its class, key and position
	var tags: Dictionary = w.get_meta("tags", {})
	var recs: Array = d["registry"]["records"]
	ok(recs.size() > 0 and tags.size() == recs.size(), "%d records in the registry, %d resolve in Godot" % [recs.size(), tags.size()])
	var differ := 0
	var moved_same := 0
	var orphans := 0
	var buildings := 0
	var foreign := 0
	for r in recs:
		var at: Array = r["at"]
		if KTags.uid(r["class"], r["key"], at) != r["uid"]:
			differ += 1
		if KTags.uid(r["class"], r["key"], [float(at[0]), float(at[1]), float(at[2]) + 0.2]) == r["uid"]:
			moved_same += 1
		if r["parent"] != null and not tags.has(r["parent"]):
			orphans += 1
		if r["class"] == "building":
			buildings += 1
			if (r.get("tags", {}) as Dictionary).get("culture") != "eternian":
				foreign += 1
	ok(differ == 0, "every record's uid recomputed in GDScript: %d of %d differ" % [differ, recs.size()])
	ok(moved_same == 0, "negative: 20 cm off, every record gets another uid (%d kept it)" % moved_same)
	ok(orphans == 0, "every record's parent resolves (%d do not)" % orphans)
	ok(buildings > 0 and foreign == 0, "%d buildings, every one of them Eternian (%d not)" % [buildings, foreign])
	ok(not tags.has("bld_99999"), "negative: an id the page never made does not resolve")

	# 2. the materials: one record per kit key, the library's sets named by reference
	var mats: Array = d["materials"]
	var ids := {}
	var nofam := 0
	var lib := 0
	for m in mats:
		ids[m["id"]] = true
		if str(m.get("family", "")) == "":
			nofam += 1
		if m.get("lib") != null:
			lib += 1
	ok(mats.size() > 0 and ids.size() == mats.size(), "%d materials, their ids unique" % mats.size())
	ok(nofam == 0 and lib > mats.size() / 2, "every material names its family; %d of %d are the library's sets" % [lib, mats.size()])

	# 3. the ground: the sheet stands on flat ground, and the export's probes say so off the lattice
	var g = w.get_meta("ground", null)
	var pts: Array = d["terrain"]["probes"]["points"]
	var off := 0
	for p in pts:
		if abs(float(p[2])) > 1e-4:
			off += 1
	ok(g != null and pts.size() > 0 and off == 0, "the ground arrives, and its %d probes stand at the sheet's height 0 (%d off)" % [pts.size(), off])

	print("%s: %d failed" % [CASE, fails])
	quit(1 if fails > 0 else 0)
