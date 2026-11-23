# Godot 4.7.2 headless golden test for KratorKits (core/kits/kkit.gd vs core/kits/golden-kits.json):
#   python3 godot/tools/sync_core.py && godot --headless --path godot --script res://tests/kits/kkit_test.gd
extends SceneTree

const KKit := preload("kkit.gd")
var fails := 0


func check(cond: bool, msg: String) -> void:
	if cond:
		print("PASS  " + msg)
	else:
		fails += 1
		print("FAIL  " + msg)


func _init() -> void:
	var dir: String = get_script().resource_path.get_base_dir()
	var gold: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir + "/golden-kits.json"))
	var manifest: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/kits/kits-manifest.json"))

	var kk := KKit.new()
	kk.load_manifest(manifest)

	check(kk.list_kits().size() == int(gold["kitCount"]), "manifest kitCount matches golden (%d)" % kk.list_kits().size())

	# 1. Key parsing & dims
	var keys_ok := true
	for kc in gold["keyCases"]:
		var got := KKit.parse_key(str(kc["in"][0]), kc["in"][1])
		var want: Dictionary = kc["out"]
		if got["kitId"] != want["kitId"] or got["key"] != want["key"] or got["qkey"] != want["qkey"]:
			keys_ok = false
	check(keys_ok, "parse_key matches golden vectors")

	var dims_ok := true
	for sd in gold["sampleDims"]:
		var g = kk.dims(str(sd["qkey"]), 1, "islanders")
		var w: Dictionary = sd["dims"]
		if g == null or absf(float(g["w"]) - float(w["w"])) > 1e-6 or absf(float(g["doorH"]) - float(w["doorH"])) > 1e-6 or int(g["tier"]) != int(w["tier"]):
			dims_ok = false
	check(dims_ok, "dims(qkey) matches golden vectors across 4 cultural kits")

	# 2. Rulings #99-101 unlock & candidate parity
	var st := KKit.create_style_state("islanders")
	var x0 := str(kk.manifest["kits"]["xanadu"]["order"][0])
	KKit.update_tradesmen(st, "dilihan", {"masters": 2, "wardId": "harbour", "wardCount": 3})
	KKit.unlock_blueprint(st, {"kitId": "xanadu", "tier": 2, "keys": [x0], "id": "folio:xan:1"})
	KKit.update_tradesmen(st, "yeti", {"masters": 2, "wardId": "giant", "wardCount": 2})
	KKit.set_ward_policy(st, "harbour", {"allowedKits": ["islanders", "dilihan"], "weights": {"dilihan": 2.0, "islanders": 0.5}})
	KKit.set_ward_policy(st, "giant", {"allowedKits": ["islanders", "yeti"], "minDoorH": 3.2})
	KKit.pin_lot(st, "lot_pinned", "xanadu:" + x0)

	var gc: Dictionary = gold["candidates"]
	var hp := kk.candidates(st, {"wardId": "harbour", "cls": "poor"})
	var ga := kk.candidates(st, {"wardId": "giant"})
	var pc := kk.candidates(st, {"lotId": "lot_pinned", "wardId": "harbour", "cls": "poor"})

	var hp_match := hp.size() == int(gc["harbourPoorCount"])
	for i in mini(5, hp.size()):
		if str(hp[i]["qkey"]) != str(gc["harbourPoorFirst5"][i]["qkey"]) or absf(float(hp[i]["weight"]) - float(gc["harbourPoorFirst5"][i]["weight"])) > 1e-5:
			hp_match = false
	check(hp_match, "harbour ward candidates & weights match JS golden")

	var giant_ok := ga.size() == int(gc["giantCount"])
	for c in ga:
		if not str(c["qkey"]).begins_with("yeti:") or float(c["doorH"]) < 3.2:
			giant_ok = false
	check(giant_ok, "giant ward minDoorH >= 3.2 m matches JS golden")
	check(pc.size() == 1 and str(pc[0]["qkey"]) == str(gc["pinnedCands"][0]), "lot_pinned blueprint override matches JS golden")

	KKit.update_tradesmen(st, "dilihan", {"masters": 0, "apprentices": 0})
	var dil_st := KKit.kit_status(st, "dilihan")
	var xan_st := KKit.kit_status(st, "xanadu")
	check(bool(dil_st["standingOnly"]) == true and bool(dil_st["active"]) == false and bool(xan_st["active"]) == true,
		"Ruling #99 & #100 standingOnly vs permanent blueprint status matches JS golden")

	# 3. kits_used_by_lots
	var used := KKit.kits_used_by_lots([
		{"key": "xanadu:xa_house_poor_1", "died": null},
		{"kit": "yeti", "key": "yeti:yt_house", "died": null},
		{"key": "dilihan:dil_shop", "died": 8},
		{"key": "is_poor_1", "died": null}
	], "islanders")
	check(used == gold["usedByLots"], "kits_used_by_lots matches JS golden")

	# 4. KCITY.constructOrder triangle build-order parity
	var gco: Dictionary = gold["constructOrder"]
	var co := KKit.construct_order(gco["pos"], gco["index"])
	var got_tris := []
	for t in co["tris"]:
		got_tris.append(int(t))
	check(got_tris == gco["tris"], "construct_order triangle order [footing -> slim frame -> wall -> roof] matches JS golden")

	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails > 0 else 0)
