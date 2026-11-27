# The weathering stack's Godot side (krator/kweather.gd, shaders/lib/weather.gdshaderinc; GODOT-LOOK-PLAN.md section 8,
# M7). Headless: a record's class and amounts, the shared noise texture, the origin that keeps the noise on the world
# across a rebase, and the wiring (the importers, the look's switch, the library body). Each check has a negative.
# tests/shaders/look_gpu_check.gd draws the stack on a GPU.
#   godot --headless --path godot --script res://tests/materials/kweather_test.gd     exits 0 when every check passes
extends SceneTree

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	var W := KratorWeather
	# 1. the class of a record, from the library family the export names
	var want := {"wood.siding": "wood", "stone.cut": "stone", "rock.old_stone_wall": "stone", "plaster.limewash.red": "plaster", "plaster": "plaster",
		"roof.scale.slate": "roof", "roof.scale.gilt": "glazed", "roof.thatch.neutral": "thatch", "wood.lacquer.crimson": "glazed", "patterns/order/rug": "painted",
		"patterns/common/mosaic-arabesque-lapis": "painted", "band.xanadu.twig": "wood", "metal.corrugated_iron_02": "metal", "cloth.tarp": "cloth",
		"paving.flagstone": "paving", "earth.rammed": "earth", "brick.red": "brick"}
	var wrong := []
	for k in want:
		if W.class_of(k) != want[k]:
			wrong.append("%s: %s" % [k, W.class_of(k)])
	ok(wrong.is_empty(), "%d library families fall in their classes (%s)" % [want.size(), ", ".join(PackedStringArray(wrong))])
	ok(W.class_of(null, "furniture:wood") == "furniture" and W.class_of("", "furniture:stone/clay") == "furniture" and W.class_of(null, "MeshStandardMaterial") == "plain" and W.class_of(null) == "plain",
		"a record with no library family is furniture by its own family, else plain")
	var all_four := true
	for c in W.CLASSES:
		all_four = all_four and (W.CLASSES[c] as Array).size() == 4
	for f in W.FIRST:
		all_four = all_four and W.CLASSES.has(W.FIRST[f])
	for f in W.WORDS:
		all_four = all_four and W.CLASSES.has(W.WORDS[f])
	ok(all_four, "every class has its four amounts, and every word names a class")

	# 2. the amounts say what weathers how
	var stone := W.amounts("stone.cut")
	var plaster := W.amounts("plaster.limewash.red")
	var glazed := W.amounts("roof.scale.gilt")
	var furn := W.amounts(null, "furniture:wood")
	ok(plaster.y > stone.y and stone.z > plaster.z and W.amounts("roof.scale.slate").z >= stone.z and W.amounts("wood.siding").w > stone.w,
		"plaster streaks most, stone and roofs take the moss, timber bleaches on top")
	ok(glazed.x <= 0.21 and glazed.y <= 0.21 and glazed.z == 0.0 and furn.y == 0.0 and furn.z == 0.0 and furn.w == 0.0, "negative: gilt barely changes, and no rain reaches furniture")

	# 3. the shared noise: four channels, each with a spread, each one tiling
	var t0 := Time.get_ticks_msec()
	var tex := W.noise_texture()
	var ms := Time.get_ticks_msec() - t0
	var img := tex.get_image()
	var n := W.NOISE_SIZE
	ok(img.get_width() == n and img.get_height() == n and img.get_format() == Image.FORMAT_RGBA8 and img.has_mipmaps() and W.noise_texture() == tex,
		"the noise is one %d px RGBA texture with mipmaps, made once (%d ms)" % [n, ms])
	var data := img.get_data()
	var spread_ok := true
	var tile_ok := true
	var report := []
	for ch in 4:
		var lo := 255
		var hi := 0
		var sum := 0.0
		for i in range(0, n * n, 7):
			var v := data[i * 4 + ch]
			lo = mini(lo, v)
			hi = maxi(hi, v)
			sum += v
		# the seam: the step across the wrap against the step between neighbours inside the tile
		var seam := 0.0
		var inner := 0.0
		for y in n:
			seam += absf(float(data[(y * n) * 4 + ch]) - float(data[(y * n + n - 1) * 4 + ch]))
			inner += absf(float(data[(y * n + 100) * 4 + ch]) - float(data[(y * n + 101) * 4 + ch]))
			seam += absf(float(data[y * 4 + ch]) - float(data[((n - 1) * n + y) * 4 + ch]))
			inner += absf(float(data[(100 * n + y) * 4 + ch]) - float(data[(101 * n + y) * 4 + ch]))
		if hi - lo < 150:
			spread_ok = false
		if seam > inner * 2.5 + float(n):
			tile_ok = false
		report.append("%d..%d seam %.1f/%.1f" % [lo, hi, seam / (2.0 * n), inner / (2.0 * n)])
	ok(spread_ok, "each channel spans most of its range (%s)" % "; ".join(PackedStringArray(report)))
	ok(tile_ok, "each channel tiles: the step across the wrap is no more than a step inside the tile")
	var same := true
	for i in range(0, n * n, 13):
		if data[i * 4] != data[i * 4 + 2]:
			same = false
			break
	ok(not same, "negative: the channels are different fields")

	# 4. the noise stays on the world across a rebase: every period and axis of the include divides the 4096 m origin wraps at
	var om := W.origin_mod([4096.0 * 3.0 + 12.0, 0.0, -5.0])
	ok(om == Vector3(12.0, 0.0, 4091.0) and W.origin_mod([]) == Vector3.ZERO, "the origin is handed over modulo %d m" % int(W.PERIOD))
	var inc := FileAccess.get_file_as_string("res://shaders/lib/weather.gdshaderinc")
	var A := Vector3(0.75, 0.375, 0.5)
	var B := Vector3(-0.5, 0.875, 0.25)
	ok(inc.contains("const vec3 KW_A = vec3(0.75, 0.375, 0.5);") and inc.contains("const vec3 KW_B = vec3(-0.5, 0.875, 0.25);") and inc.contains("u / 32.0") and inc.contains("u.yx / 8.0")
		and inc.contains("p.x / 2.0, p.y / 32.0") and inc.contains("p.z / 2.0"), "the include's axes and periods are the ones checked here")
	var whole := true
	for shift in [Vector3(W.PERIOD, 0, 0), Vector3(0, 0, W.PERIOD)]:
		for period in [32.0, 8.0]:
			for q in [A.dot(shift) / period, B.dot(shift) / period]:
				if absf(q - roundf(q)) > 1e-9:
					whole = false
		if absf(shift.x / 2.0 - roundf(shift.x / 2.0)) > 1e-9 or absf(shift.z / 2.0 - roundf(shift.z / 2.0)) > 1e-9:
			whole = false
	ok(whole, "a shift of %d m along x or z moves every lookup by a whole number of tiles" % int(W.PERIOD))
	var odd := A.dot(Vector3(1000.0, 0, 0)) / 32.0
	ok(absf(odd - roundf(odd)) > 0.01, "negative: a shift of 1,000 m would not (so the origin wraps at %d, not at the stream's 4,000 m rebase)" % int(W.PERIOD))

	# 5. the wiring: the importers hand a surface its class's amounts, and the look turns the stack on
	var rep := {"gaps": {}}
	var m_plaster := KratorWorld._standard({"id": "w:p", "kind": "standard", "colour": "#888888", "lib": "plaster.limewash.red", "family": "xWash"}, {}, {}, false, rep) as ShaderMaterial
	var m_none := KratorWorld._standard({"id": "w:n", "kind": "standard", "colour": "#888888", "family": "furniture:wood"}, {}, {}, false, rep) as ShaderMaterial
	ok(m_plaster.get_shader_parameter("weather_k") == plaster and m_none.get_shader_parameter("weather_k") == furn, "a world record's material carries its class's amounts")
	var card_tex := ImageTexture.create_from_image(Image.create(4, 4, false, Image.FORMAT_RGBA8))
	var m_card := KratorWorld._standard({"id": "w:c", "kind": "standard", "colour": "#888888", "lib": "stone.cut", "map": "t", "alphaTest": 0.4}, {"t": card_tex}, {}, false, rep) as ShaderMaterial
	var k_card: Vector4 = m_card.get_shader_parameter("weather_k")
	ok(m_card.shader == KratorKmat.LIB_CUTOUT and k_card.x > 0.0 and k_card.x <= 0.41 and k_card.y == 0.0 and k_card.z == 0.0 and k_card.w == 0.0,
		"negative: a cut-out (a plant card, a grille) drifts in colour and takes no run-off, moss or dust, whatever its family")
	var hi_spec := KratorLook.tier("high")
	var off := KratorLook.from_args(PackedStringArray(["--look=high", "--no-weather"]))
	var half := KratorLook.from_args(PackedStringArray(["--look=low", "--weather=0.5", "--wet=0.8"]))
	ok(float(hi_spec["weather"]) == 1.0 and float(KratorLook.tier("low")["weather"]) == 1.0 and float(half["weather"]) == 0.5 and float(half["wet"]) == 0.8,
		"the tiers turn the stack on, and --weather and --wet set its strength and the wet")
	ok(float(KratorLook.tier("legacy")["weather"]) == 0.0 and float(off["weather"]) == 0.0, "negative: the legacy tier and --no-weather leave it off")
	W.apply(hi_spec)
	W.apply(off)
	W.set_origin([8000.0, 0.0, -4000.0])
	W.set_origin([0.0, 0.0, 0.0])
	var body := FileAccess.get_file_as_string("res://shaders/library_body.gdshaderinc")
	var interior := FileAccess.get_file_as_string("res://shaders/library_interior.gdshader")
	var proj := FileAccess.get_file_as_string("res://project.godot")
	ok(body.contains('#include "res://shaders/lib/weather.gdshaderinc"') and body.count("kw_weather(") == 1 and body.contains("uniform vec4 weather_k")
		and proj.contains("k_weather={") and proj.contains("k_weather_noise={") and proj.contains("k_world_origin={") and proj.contains('"value": Vector4(0, 0, 0, 0)'),
		"the library body calls the stack once, and the project declares its three globals with the strength at 0")
	ok(not interior.contains("weather"), "negative: the indoor shader has no weather")

	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)
