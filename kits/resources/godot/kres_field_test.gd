# The GDScript twin of the node field against the JS (kits/resources/tests/test-res.js writes golden-field.json).
# In a Godot 4 project folder holding krand.gd (core/rand), kres_field.gd, this file, golden-field.json and geology.json
# (kits/resources/data):  godot --headless --path <project> --script res://kres_field_test.gd    exits 0 when all match
extends SceneTree

const KResField := preload("kres_field.gd")


func _initialize() -> void:
	var fails := 0
	var F := KResField.new()
	F.load_json("res://geology.json")
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://golden-field.json"))
	var t: Array = g.tile
	var got := F.nodes_in(float(t[0]), float(t[1]), float(t[2]), float(t[3]))
	var want: Array = g.nodes
	if got.size() != want.size():
		print("FAIL tile: %d nodes, the JS %d" % [got.size(), want.size()])
		fails += 1
	else:
		var bad := 0
		for k in want.size():
			var a: Dictionary = got[k]
			var b: Dictionary = want[k]
			if a.id != b.id or a.grade != b.grade or absf(a.gx - float(b.gx)) > 1e-6 or absf(a.gz - float(b.gz)) > 1e-6:
				bad += 1
				if bad < 4:
					print("FAIL node %d: %s %s %.9f %.9f vs %s %s %.9f %.9f" % [k, a.id, a.grade, a.gx, a.gz, b.id, b.grade, b.gx, b.gz])
		print(("PASS" if bad == 0 else "FAIL") + " tile: %d nodes, ids, grades and positions (to 1e-6 m) (%d differ)" % [want.size(), bad])
		fails += 1 if bad else 0
	# the whole world's gold lodes, as the bake's digest (numpy) and the JS's
	var C := float(F.D.field.cells.gold)
	var nx := ceili(float(F.D.grid.fullW) * float(F.D.grid.px_m) / C)
	var nz := ceili(float(F.D.grid.fullH) * float(F.D.grid.px_m) / C)
	var rows := PackedStringArray()
	for iz in nz:
		for ix in nx:
			var c := F.candidate("gold", ix, iz)
			if c.kept and c.drop == "":
				rows.append("%d,%d,%s" % [ix, iz, "2" if c.grade == "high" else ("1" if c.grade == "medium" else "0.5")])
	var h := HashingContext.new()
	h.start(HashingContext.HASH_SHA1)
	h.update(";".join(rows).to_utf8_buffer())
	var sha: String = h.finish().hex_encode().substr(0, 16)
	var ok: bool = rows.size() == int(g.lodes.gold.count) and sha == g.lodes.gold.sha1
	print(("PASS" if ok else "FAIL") + " gold lodes: Godot %d %s, the bake %d %s" % [rows.size(), sha, int(g.lodes.gold.count), g.lodes.gold.sha1])
	fails += 0 if ok else 1
	# a negative: another world seed is another field
	F.D.field.world = int(F.D.field.world) + 1
	F._seeds = {}
	var other := F.nodes_in(float(t[0]), float(t[1]), float(t[2]), float(t[3]))
	var same: bool = other.size() == want.size()
	if same:
		for k in want.size():
			if other[k].id != want[k].id:
				same = false
				break
	print(("PASS" if not same else "FAIL") + " negative: another world seed gives another tile")
	fails += 0 if not same else 1
	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)
