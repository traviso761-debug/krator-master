# The ids on a biome export (core/tags on the biome kits, ROADMAP stage 2c): the hyperjungle case imported as the spike
# imports it, then every MultiMesh instance must carry a record uid, every uid must be KTags.uid(class, key, position)
# of its instance recomputed here from the exported matrix, and every id must resolve to a record in the page's
# tags.json. Each check has a negative.
#   godot --headless --path godot --script res://tests/tags/records_test.gd     exits 0 when every check passes
# (python3 godot/tools/export_spike.py hyperjungle writes the case; a fresh checkout runs --import once first)
extends SceneTree

const KTags := preload("ktags.gd")
const CASE := "res://data/hyperjungle/"

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _init() -> void:
	if not FileAccess.file_exists(CASE + "biome.json"):
		print("FAIL no case: run python3 godot/tools/export_spike.py hyperjungle")
		quit(1)
		return
	var d: Dictionary = KData.read_json(CASE + "biome.json")
	var root: Node3D = KratorBiome.build(CASE + "biome.json")
	var tags: Dictionary = root.get_meta("tags", {})
	ok(tags.size() > 0, "tags.json read: %d records" % tags.size())

	# 1. every instance of every MultiMesh carries a uid, aligned with the instances (the importer's side table)
	var items: Node = root.get_node("Items")
	var mmis := items.get_children()
	ok(mmis.size() == d["items"].size() and mmis.size() > 0, "one MultiMesh per exported item (%d)" % mmis.size())
	var instances := 0
	var named := 0
	var nodes_named := 0
	for n in mmis:
		var mm: MultiMesh = (n as MultiMeshInstance3D).multimesh
		var side: PackedStringArray = n.get_meta("krator_records", PackedStringArray())
		instances += mm.instance_count
		if side.size() == mm.instance_count:
			nodes_named += 1
			for u in side:
				if u.length() == 8:
					named += 1
	ok(nodes_named == mmis.size() and named == instances and instances > 0,
		"every MultiMesh has a side table and every instance a uid: %d of %d instances in %d of %d MultiMeshes" % [named, instances, nodes_named, mmis.size()])

	# 2. each uid is KTags.uid(set class, set key, the instance's position) recomputed from the exported matrix, and each
	# instance id "<set>#<index>" is unique; the set is a record of tags.json
	var checked := 0
	var bad := 0
	var unresolved := 0
	var neg_same := 0
	var neg := 0
	var seen := {}
	var dup := 0
	for k in d["items"].size():
		var it: Dictionary = d["items"][k]
		var n: Node = mmis[k]
		var set_id: String = n.get_meta("krator_record", "")
		if not tags.has(set_id):
			unresolved += 1
			continue
		var rec: Dictionary = tags[set_id]
		var M := KData.floats(it["matrices"])
		var side: PackedStringArray = n.get_meta("krator_records")
		var idx: PackedInt32Array = n.get_meta("krator_index")
		for j in side.size():
			var o := j * 16
			var want := KTags.uid(rec["class"], rec["key"], [M[o + 12], M[o + 13], M[o + 14]])
			checked += 1
			if want != side[j]:
				bad += 1
			var iid := KTags.instance_id(set_id, idx[j])
			if seen.has(iid):
				dup += 1
			seen[iid] = true
			if j % 50 == 0:   # the negative: 20 cm off, the uid no longer matches
				neg += 1
				if KTags.uid(rec["class"], rec["key"], [M[o + 12] + 0.2, M[o + 13], M[o + 14]]) == side[j]:
					neg_same += 1
	ok(unresolved == 0, "every MultiMesh's set id resolves to a tags.json record (%d unresolved)" % unresolved)
	ok(checked == instances and bad == 0, "every uid recomputed in GDScript matches: %d checked, %d differ" % [checked, bad])
	ok(neg > 0 and neg_same == 0, "negative: moved 20 cm, %d sampled instances all get another uid (%d kept it)" % [neg, neg_same])
	ok(dup == 0 and seen.size() == instances, "every instance id <set>#<index> is unique (%d ids, %d repeated)" % [seen.size(), dup])
	# the negative of the alignment check: the side table read one row out of step stops matching
	var shifted := 0
	var it0: Dictionary = d["items"][0]
	var side0: PackedStringArray = mmis[0].get_meta("krator_records")
	var rec0: Dictionary = tags.get(mmis[0].get_meta("krator_record", ""), {})
	if side0.size() > 1 and rec0.size() > 0:
		var M0 := KData.floats(it0["matrices"])
		for j in side0.size() - 1:
			if KTags.uid(rec0["class"], rec0["key"], [M0[j * 16 + 12], M0[j * 16 + 13], M0[j * 16 + 14]]) == side0[j + 1]:
				shifted += 1
	ok(side0.size() > 1 and shifted == 0, "negative: the side table one row out of step matches no instance (%d of %d)" % [shifted, side0.size() - 1])

	# 3. the buckets name the volumes they merge, and each is a record whose uid is KTags.uid(class, key, at)
	var bnodes := root.get_node("Buckets").get_children()
	var bnamed := 0
	var vols := 0
	var vbad := 0
	for b in bnodes:
		var u: PackedStringArray = b.get_meta("krator_records", PackedStringArray())
		var ids: PackedStringArray = b.get_meta("krator_record_ids", PackedStringArray())
		if u.size() > 0:
			bnamed += 1
		for i in u.size():
			vols += 1
			var r: Dictionary = tags.get(ids[i], {})
			if r.is_empty() or r["uid"] != u[i] or KTags.uid(r["class"], r["key"], r["at"]) != u[i]:
				vbad += 1
	ok(bnamed > 0 and vols > 0 and vbad == 0, "buckets name the records they merge: %d of %d buckets, %d records, %d bad" % [bnamed, bnodes.size(), vols, vbad])

	# 4. a set record's tags: the biome, and the class core/tags allows a plant or an animal
	var classes := {}
	for n in mmis:
		var r: Dictionary = tags.get(n.get_meta("krator_record", ""), {})
		classes[r.get("class", "?")] = true
		if r.get("tags", {}).get("biome", "") == "":
			classes["no biome"] = true
	ok(not classes.has("?") and not classes.has("no biome") and classes.has("flora"), "set records: classes %s, each with its biome tag" % [classes.keys()])

	root.free()
	print("records: %d instances, %d buckets; %s" % [instances, bnodes.size(), "all passed" if fails == 0 else str(fails) + " failed"])
	quit(1 if fails else 0)
