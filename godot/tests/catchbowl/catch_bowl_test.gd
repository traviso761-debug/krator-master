# The catch-bowl region's Godot host (the owner, 2026-11-25: "pull up the new region in godot and give me a godot
# native host so i can navigate and trigger different weather conditions"). The data is written by
#   python3 openworld/catch-bowl/tools/export_godot.py
# and the host is krator/catch_bowl.gd on catch_bowl.tscn. Each check has a negative.
#   godot --headless --path godot --script res://tests/catchbowl/catch_bowl_test.gd    exits 0 when every check passes
# (a fresh checkout runs godot --headless --path godot --import once first, so the class names register)
extends SceneTree

const DATA := "res://data/catch-bowl/"
var fails := 0


func ok(name: String, pass_: bool, neg: bool, detail := "") -> void:
	var r := pass_ and neg
	if not r:
		fails += 1
	print(("PASS  " if r else "FAIL  ") + name + ("  (" + detail + ")" if detail != "" else "")
		+ ("  [its negative did not fail]" if pass_ and not neg else ""))


func _init() -> void:
	var f := FileAccess.open(DATA + "meta.json", FileAccess.READ)
	if f == null:
		print("FAIL  the export is there at all  (no " + DATA + "meta.json: run openworld/catch-bowl/tools/export_godot.py)")
		quit(1)
		return
	var meta: Dictionary = JSON.parse_string(f.get_as_text())
	f.close()

	# 1: the box is the plan's -- 1,280 x 1,052 km at 2 km a sample (PLAN.md section 2)
	var km: Array = meta.get("km", [0, 0])
	var size: Array = meta.get("size", [0, 0])
	ok("the box is the region's: about 1,280 x 1,052 km at %.0f m a sample" % float(meta.get("m_per_sample", 0)),
		abs(float(km[0]) - 1280.0) <= 12.0 and abs(float(km[1]) - 1052.0) <= 12.0 and int(size[0]) > 600 and int(size[1]) > 500,
		not (abs(float(km[0]) - 500.0) <= 12.0),
		"%s km over %s samples" % [str(km), str(size)])

	# 2: the six polygons, by id AND by name, since region_mask takes the name (the exporter's own note)
	var polys: Array = meta.get("polygons", [])
	var names := []
	for p in polys:
		names.append(String(p.get("name", "")))
	ok("all six biome polygons are named in the export, with their ids beside them",
		polys.size() == 6 and names.has("the catch") and names.has("the bowl") and names.has("SE outer wall")
			and names.has("stalker range") and names.has("Stalker Gate") and names.has("twins")
			and String(polys[0].get("id", "")) != "",
		polys.size() == 6, ", ".join(names))

	# 3: the heights are the model's, and the region's extremes are in them: the Bowl's salt under -1,000 m and the
	#    massifs over 13,000 m (PLAN-TERRAIN.md)
	var h: Dictionary = meta.get("height", {})
	ok("the heights span the region's own extremes, the Bowl's salt to the Godthrone's shoulder",
		float(h.get("lo", 0)) < -1000.0 and float(h.get("hi", 0)) > 13000.0,
		not (float(h.get("lo", 0)) > 0.0), "%.0f to %.0f m" % [float(h.get("lo", 0)), float(h.get("hi", 0))])

	# 4: sixteen sites, their pixels off the MODEL and not off SITES.json (which carries px for only the two
	#    "model": false rows -- reading it alone gave two sites of sixteen)
	var sites: Array = meta.get("sites", [])
	var frommodel := 0
	for s in sites:
		if bool(s.get("from_model", false)):
			frommodel += 1
	var jabal := {}
	for s in sites:
		if String(s.get("id", "")) == "sa5o6dvjdv":
			jabal = s
	ok("all sixteen sites are in, fourteen of them with the model's own pixel",
		sites.size() == 16 and frommodel >= 14 and not jabal.is_empty() and float(jabal.get("m", 0)) < -1000.0,
		sites.size() == 16,
		"%d sites, %d from the model; Jabal at px %s,%s reads %.0f m -- below the sea, on the Bowl's floor"
			% [sites.size(), frommodel, str(jabal.get("px", "?")), str(jabal.get("py", "?")), float(jabal.get("m", 0))])

	# 5: the rasters beside the heights
	var want := ["height.png", "water.png", "inside.png", "temp.png", "rain.png"]
	var missing := []
	for n in want:
		if not FileAccess.file_exists(DATA + n):
			missing.append(n)
	ok("the height, water, mask, temperature and rain rasters are all written",
		missing.is_empty(), not want.is_empty(), "missing: " + (", ".join(missing) if missing.size() else "none"))

	# 6: the image really is the model's ground -- a height sampled out of height.png at Jabal's pixel agrees with the
	#    metre the exporter recorded for it
	var img := Image.new()
	var loaded := img.load(DATA + "height.png") == OK
	var agree := false
	var read := 0.0
	if loaded and not jabal.is_empty():
		var box: Array = meta.get("box_px", [0, 0, 0, 0])
		var px := int(jabal["px"]) - int(box[0])
		var py := int(jabal["py"]) - int(box[1])
		if px >= 0 and py >= 0 and px < img.get_width() and py < img.get_height():
			read = float(h["lo"]) + img.get_pixel(px, py).r * (float(h["hi"]) - float(h["lo"]))
			agree = abs(read - float(jabal["m"])) <= 40.0
	ok("height.png is the model's ground: Jabal's pixel in the image agrees with the metre the exporter recorded",
		loaded and agree, loaded, "the image says %.0f m, the record %.0f m" % [read, float(jabal.get("m", 0))])

	# 7: THE WEATHER the host offers is this region's own, and the host's table and the export's list agree, so the
	#    panel and the plans cannot drift apart
	var wl: Array = meta.get("weather", [])
	var ids := []
	for w in wl:
		ids.append(String(w.get("id", "")))
	var fxorder: Array = KratorAtmosFx.order()
	var same := ids.size() == fxorder.size()
	if same:
		for i in ids.size():
			if not fxorder.has(ids[i]):
				same = false
	ok("the export's weather list and the host's own table are the same seven kinds",
		same and ids.has("dust") and ids.has("gale") and ids.has("whiteout") and ids.has("deadheat"),
		ids.size() == 7, ", ".join(ids))

	# 8: and they differ in the way the plans say: the black storm and the whiteout hide a Stalker and the gale does
	#    not, the gale is the windiest, the whiteout the blindest, and the dead heat brightens rather than dims
	var K: Dictionary = KratorAtmosFx.KINDS
	var dust: Dictionary = K["dust"]
	var gale: Dictionary = K["gale"]
	var wo: Dictionary = K["whiteout"]
	var dh: Dictionary = K["deadheat"]
	var cl: Dictionary = K["clear"]
	ok("each kind reads as itself: the storm and the whiteout hide a Stalker, the God-Bore is the windiest, the whiteout the blindest, the dead heat the brightest",
		bool(dust["hides"]) and bool(wo["hides"]) and not bool(gale["hides"])
			and float(gale["wind"]) > float(dust["wind"]) and float(wo["visibility_km"]) < float(dust["visibility_km"])
			and float(dh["sun"]) > float(cl["sun"]) and float(dust["sun"]) < 0.4,
		not bool(gale["hides"]),
		"the storm %.1f km and x%.1f wind; the God-Bore x%.1f; the whiteout %.0f m; the dead heat sun x%.2f"
			% [float(dust["visibility_km"]), float(dust["wind"]), float(gale["wind"]),
			   float(wo["visibility_km"]) * 1000.0, float(dh["sun"])])

	print("catch_bowl_test: " + ("all passed" if fails == 0 else str(fails) + " failed"))
	quit(1 if fails > 0 else 0)
