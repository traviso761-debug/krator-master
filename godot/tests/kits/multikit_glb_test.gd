# Godot 4.7.2 headless test for KratorMultikitCity (godot/krator/multikit_city.gd):
#   python3 tools/kit_pack.py --export-glb islanders xanadu --pieces 3 --out godot/data/kits
#   python3 godot/tools/sync_core.py && godot --headless --path godot --script res://tests/kits/multikit_glb_test.gd
extends SceneTree

var fails := 0


func check(cond: bool, msg: String) -> void:
	if cond:
		print("PASS  " + msg)
	else:
		fails += 1
		print("FAIL  " + msg)


func _init() -> void:
	var builder := KratorMultikitCity.new("res://data/kits", "islanders")
	check(builder.kits_reg.list_kits().size() >= 28, "KratorMultikitCity loaded kits-manifest.json (%d kits)" % builder.kits_reg.list_kits().size())

	var isl_key := str(builder.kits_reg.manifest["kits"]["islanders"]["order"][0])
	var xan_key := str(builder.kits_reg.manifest["kits"]["xanadu"]["order"][0])
	var locus_key := str(builder.kits_reg.manifest["kits"]["locus"]["order"][0])

	var plan := {
		"lots": [
			{"id": 0, "tag": "lot_0", "kit": "islanders", "key": "islanders:" + isl_key, "v": 0, "x": 0.0, "y": 0.0, "z": 0.0, "ry": 0.0, "w": 8.0, "d": 8.0, "h": 6.0, "died": null},
			{"id": 1, "tag": "lot_1", "kit": "xanadu", "key": "xanadu:" + xan_key, "v": 0, "x": 16.0, "y": 0.0, "z": 0.0, "ry": 1.57, "w": 10.0, "d": 10.0, "h": 8.0, "died": null},
			{"id": 2, "tag": "lot_2", "kit": "islanders", "key": "islanders:" + isl_key, "v": 0, "x": 32.0, "y": 0.0, "z": 0.0, "ry": 0.4, "w": 8.0, "d": 8.0, "h": 6.0, "died": null},
			{"id": 3, "tag": "lot_3", "kit": "locus", "key": "locus:" + locus_key, "v": 0, "x": 48.0, "y": 0.0, "z": 0.0, "ry": 0.0, "w": 10.0, "d": 10.0, "h": 8.0, "died": null}
		]
	}

	var city_node := builder.build_plan(plan, {"lot_2": 0.4})
	var rep: Dictionary = city_node.get_meta("report")
	check(int(rep["standing_lots"]) == 4, "all 4 standing multi-kit lots accounted for")

	if FileAccess.file_exists("res://data/kits/islanders.glb") and FileAccess.file_exists("res://data/kits/xanadu.glb"):
		check(int(rep["multimesh_nodes"]) >= 2 and int(rep["constructing_nodes"]) == 1,
			"loaded .glb libraries build MultiMeshInstance3D batches + 1 sliced progressive construction node")
	else:
		check(int(rep["massing_lots"]) == 4, "gracefully falls back to MassingFallback when optional .glb packs are unexported")

	city_node.free()
	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails > 0 else 0)
