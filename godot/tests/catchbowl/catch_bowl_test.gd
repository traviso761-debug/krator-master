# The catch-bowl region's Godot host (the owner, 2026-11-25: "pull up the new region in godot and give me a godot
# native host so i can navigate and trigger different weather conditions"). The data is written by
#   python3 openworld/catch-bowl/tools/export_godot.py
# and the host is krator/catch_bowl.gd on catch_bowl.tscn. Each check has a negative.
#   godot --headless --path godot --script res://tests/catchbowl/catch_bowl_test.gd    exits 0 when every check passes
# (a fresh checkout runs godot --headless --path godot --import once first, so the class names register)
extends SceneTree

const KRand := preload("res://tests/rand/krand.gd")

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

	# 9: the water has a LEVEL of its own, not just a mask. Without wlevel.png a host can only lay water on the lake
	#    bed, which draws as a stain on the floor rather than as a lake.
	var wi := Image.new()
	var li := Image.new()
	var lv_ok := wi.load(DATA + "water.png") == OK and li.load(DATA + "wlevel.png") == OK
	var wet := 0
	var levelled := 0
	var above := 0
	if lv_ok:
		var lo2 := float(meta["height"]["lo"])
		var hi2 := float(meta["height"]["hi"])
		for z in mini(wi.get_height(), li.get_height()):
			for x in mini(wi.get_width(), li.get_width()):
				if wi.get_pixel(x, z).r < 0.5:
					continue
				wet += 1
				var r := li.get_pixel(x, z).r
				if r > 0.0:
					levelled += 1
					if lo2 + r * (hi2 - lo2) > -2600.0:
						above += 1
	ok("every water cell has its surface height recorded beside it, on height.png's own scale",
		lv_ok and wet > 0 and levelled == wet and above == wet,
		not (lv_ok and levelled == 0),
		"%d water cells, %d with a level" % [wet, levelled])

	# 10: grit is on for the kinds that carry something and off for the kinds that do not. The monsoon is rain, which
	#     is weather_fx.gd's box, not grit's.
	var G: Dictionary = KratorGritFx.GRIT
	var carries := G.has("dust") and G.has("whiteout") and G.has("gale") and G.has("duststorm_season")
	var bare := not G.has("clear") and not G.has("deadheat") and not G.has("monsoon")
	ok("grit is drawn for the four kinds that carry something and for none of the three that do not",
		carries and bare and float(G["dust"]["amount"]) > float(G["duststorm_season"]["amount"]),
		not G.has("clear"),
		"%d kinds carry grit: %s" % [G.size(), ", ".join(G.keys())])

	# 11: a mote is metres across, not a grain. Grains were invisible: at a third of a metre a quad two hundred
	#     metres off is a fraction of a pixel.
	var smallest := 999.0
	for k in G:
		smallest = minf(smallest, float(G[k]["size"]))
	ok("a mote is metres across, so it is visible at the distance the fog allows",
		smallest >= 1.5 and float(G["dust"]["size"]) >= 5.0,
		not (smallest < 0.5),
		"the smallest mote is %.1f m, the storm's %.1f m" % [smallest, float(G["dust"]["size"])])

	# 12: the vantages point at ground inside the box, and at something other than their own eye
	# catch_bowl.gd has no class_name (it is a scene script), so the vantages are read off its source
	var V: Dictionary = _views()
	var bx: Array = meta.get("box_px", [0, 0, 0, 0])
	var good := V.size() >= 4
	for k in V:
		var e: Vector3 = V[k]["eye"]
		var t: Vector3 = V[k]["at"]
		if e.distance_to(t) < 4.0:
			good = false
		for q in [e, t]:
			if q.x < float(bx[0]) or q.x > float(bx[2]) or q.y < float(bx[1]) or q.y > float(bx[3]):
				good = false
	ok("every vantage looks from one place in the box at another",
		good, V.size() >= 4, "%d vantages: %s" % [V.size(), ", ".join(V.keys())])

	# 13: the near-field layer takes the core's noise and writes no hash of its own (CLAUDE.md: do not copy
	#     infrastructure into a build -- take the core module)
	var shf := FileAccess.open("res://shaders/catch_bowl_ground.gdshader", FileAccess.READ)
	var sht := shf.get_as_text() if shf else ""
	if shf:
		shf.close()
	var takes_core := sht.find("lib/breakup.gdshaderinc") >= 0 and sht.find("km_n(") >= 0
	# the CODE, not the prose: the shader's own header explains why it does not use fract(sin(large)), and scanning
	# the whole file for that string made the check fail on the comment that exists to say it is not there
	var code := ""
	for ln in sht.split("\n"):
		var t: String = ln.strip_edges()
		if t.begins_with("//"):
			continue
		var c := t.find("//")
		code += (t.substr(0, c) if c >= 0 else t) + "\n"
	var own_hash := code.find("fract(sin") >= 0 or code.find("float hash") >= 0 or code.find("randomSeed") >= 0
	ok("the ground shader takes core/rand's noise through the shader library and writes none of its own",
		takes_core and not own_hash and sht.find("dune_") >= 0,
		not (sht == ""), "%d characters of code, breakup.gdshaderinc %s, no hash of its own: %s" % [code.length(), "included" if takes_core else "MISSING", str(not own_hash)])

	# 14: the dune profile is ASYMMETRIC, which is the whole reason a dune reads as a dune rather than as corrugated
	#     iron: a long windward rise and a short slipface at the angle of repose.
	var wind := 0.0
	var lee := 0.0
	var re2 := RegEx.new()
	re2.compile("f < (0\\.[0-9]+) \\? smoothstep")
	var m2 := re2.search(sht)
	if m2:
		wind = float(m2.get_string(1))
		lee = 1.0 - wind
	ok("the dune profile is asymmetric: a long windward rise and a short slipface",
		wind > 0.6 and lee > 0.05 and wind > lee * 2.0,
		not (absf(wind - 0.5) < 0.01), "windward %.2f of the dune, slipface %.2f" % [wind, lee])

	# 15: a rock is placed by core/rand from its cell, so the same ground gives the same rocks however the camera got
	#     there -- never a draw-order stream (CLAUDE.md: "a tile or cell is seeded from a hash of (world, cell,
	#     index, salt), never from how many draws came before it")
	var RK := load("res://krator/catch_bowl_rocks.gd")
	var rsrc := FileAccess.open("res://krator/catch_bowl_rocks.gd", FileAccess.READ)
	var rtxt := rsrc.get_as_text() if rsrc else ""
	if rsrc:
		rsrc.close()
	var by_cell := rtxt.find("KRand.cell(SEED") >= 0
	var no_rng := rtxt.find("RandomNumberGenerator") < 0 and rtxt.find("randf()") < 0 and rtxt.find("randi()") < 0
	var a1 = KRand.cell(7731, 412, -88)
	var a2 = KRand.cell(7731, 412, -88)
	var a3 = KRand.cell(7731, 413, -88)
	ok("rocks are placed from their cell by core/rand, and the same cell gives the same rock twice",
		by_cell and no_rng and a1 == a2 and a1 != a3 and RK != null,
		not (a1 == a3), "cell(412,-88) gives %d twice; cell(413,-88) gives %d" % [a1, a3])

	# 16: the ground-layer set is packed, six layers in terrain.gdshader's own roles, so it drops into the 1:1
	#     shader when the region is cut rather than being repacked
	var lf := FileAccess.open("res://data/ground_layers/catch-bowl/layers.json", FileAccess.READ)
	var ldoc: Dictionary = JSON.parse_string(lf.get_as_text()) if lf else {}
	if lf:
		lf.close()
	var lrows: Array = ldoc.get("layers", [])
	var all_there := lrows.size() == 6
	var lnames := []
	for r in lrows:
		lnames.append(String(r.get("name", "?")))
		if not FileAccess.file_exists("res://data/ground_layers/catch-bowl/" + String(r.get("albedo", ""))):
			all_there = false
		if not FileAccess.file_exists("res://data/ground_layers/catch-bowl/" + String(r.get("normal_rough", ""))):
			all_there = false
		if float(r.get("tile_m", 0.0)) <= 0.0:
			all_there = false
	ok("the ground-layer set is packed: six desert layers with their maps and tile sizes",
		all_there and String(ldoc.get("set", "")) == "catch-bowl",
		lrows.size() != 0, "%d layers: %s" % [lrows.size(), ", ".join(lnames)])

	# 17: the shader normalises the grain on the texture's OWN mip rather than a passed-in mean. The mean in
	#     layers.json is linear and whether the sampler hands back linear or sRGB is the thing not to assume: with
	#     the wrong one a mid grey divides to 2.4, every clamp saturates and the ground renders blown white.
	var on_mip := sht.find("textureLod(gl_albedo") >= 0 and sht.find("9.0") >= 0
	ok("the grain is normalised on the texture's own top mip, not on a mean in an assumed colour space",
		on_mip and sht.find("layer_mean") < 0 and sht.find("kh_tame") >= 0,
		not (sht.find("layer_mean") >= 0), "textureLod normalisation %s" % ("present" if on_mip else "MISSING"))

	print("catch_bowl_test: " + ("all passed" if fails == 0 else str(fails) + " failed"))
	quit(1 if fails > 0 else 0)




# the host's vantages, read off the script rather than instanced: the test has no viewport to build terrain in
func _views() -> Dictionary:
	var src := FileAccess.open("res://krator/catch_bowl.gd", FileAccess.READ)
	if src == null:
		return {}
	var txt := src.get_as_text()
	src.close()
	var out := {}
	for line in txt.split("\n"):
		var t := line.strip_edges()
		if not t.begins_with("\"") or t.find("\"eye\":") < 0:
			continue
		var name := t.substr(1, t.find("\"", 1) - 1)
		var nums := []
		var re := RegEx.new()
		re.compile("-?[0-9]+\\.[0-9]+")
		for m in re.search_all(t):
			nums.append(float(m.get_string()))
		if nums.size() >= 6:
			out[name] = {"eye": Vector3(nums[0], nums[1], nums[2]), "at": Vector3(nums[3], nums[4], nums[5])}
	return out

