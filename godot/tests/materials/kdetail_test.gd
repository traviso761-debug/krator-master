# Detail normals and the normal map's frame (krator/kdetail.gd, shaders/lib/detail.gdshaderinc; GODOT-LOOK-PLAN.md
# section 8, M9 and M10). Headless: a class's layer, the shared array (one layer a class, each a tiling tangent-space
# normal map, the wood one with a grain), and the wiring (the importers, the look's switches, the library body). Each
# check has a negative. tests/shaders/look_gpu_check.gd draws them on a GPU.
#   godot --headless --path godot --script res://tests/materials/kdetail_test.gd     exits 0 when every check passes
extends SceneTree

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


# [the step across the wrap, the hardest step between neighbours inside the tile] of channel `ch` of RGB bytes, along x
# or along y (a weave steps hard at every thread, so the wrap is compared with the hardest step, not with any one)
func _wrap_and_hardest(d: PackedByteArray, n: int, ch: int, along_x: bool) -> Array:
	var wrap := 0.0
	var hard := 0.0
	for a in n:
		var b := (a + 1) % n
		var st := 0.0
		for t in range(0, n, 2):
			if along_x:
				st += absf(float(d[(t * n + a) * 3 + ch]) - float(d[(t * n + b) * 3 + ch]))
			else:
				st += absf(float(d[(a * n + t) * 3 + ch]) - float(d[(b * n + t) * 3 + ch]))
		if a == n - 1:
			wrap = st
		else:
			hard = maxf(hard, st)
	return [wrap, hard]


func _initialize() -> void:
	var D := KratorDetail
	# 1. a class's layer
	ok(D.layer_of("stone") == 0 and D.layer_of("brick") == 0 and D.layer_of("roof") == 0 and D.layer_of("plaster") == 1 and D.layer_of("wood") == 2 and D.layer_of("thatch") == 2
		and D.layer_of("metal") == 3 and D.layer_of("cloth") == 4 and D.layer_of("earth") == 5, "stone, brick and roofs take the stone layer; plaster, wood, metal, cloth and earth their own")
	ok(D.layer_of("glazed") == -1 and D.layer_of("furniture") == -1 and D.layer_of("painted") == -1 and D.layer_of("plain") == -1 and D.layer_of("") == -1,
		"negative: lacquer and gilt, furniture, a pattern and an unnamed surface take none")
	var every := true
	for c in D.CLASS_LAYER:
		every = every and KratorWeather.CLASSES.has(c) and int(D.CLASS_LAYER[c]) < D.LAYERS.size()
	ok(every, "every class named is one of the weathering stack's, and every layer exists")
	var sc := D.scale_for(Vector2(2.0, 1.6))
	ok(absf(sc.x - 2.0 / D.TILE_M) < 1e-5 and absf(sc.y - 1.6 / D.TILE_M) < 1e-5 and D.TILE_M > 0.2 and D.TILE_M < 0.4, "a 2 m tile holds %.2f detail tiles of %.2f m" % [sc.x, D.TILE_M])

	# 2. the array
	var t0 := Time.get_ticks_msec()
	var arr := D.texture_array()
	var ms := Time.get_ticks_msec() - t0
	ok(arr.get_layers() == D.LAYERS.size() and arr.get_width() == D.SIZE and arr.get_height() == D.SIZE and arr.has_mipmaps() and D.texture_array() == arr,
		"the detail array holds %d layers of %d px with mipmaps, made once (%d ms)" % [arr.get_layers(), D.SIZE, ms])
	var n := D.SIZE
	var up_ok := true
	var vary_ok := true
	var tile_ok := true
	var energy := {}
	var firsts := []
	var layer_imgs := D.layer_images()   # the headless server keeps no layer to read back from the array
	for li in layer_imgs.size():
		var img := (layer_imgs[li] as Image).duplicate() as Image
		img.clear_mipmaps()
		var d := img.get_data()
		var sb := 0.0
		var ex := 0.0
		var ey := 0.0
		var cnt := 0
		for i in range(0, n * n, 5):
			sb += d[i * 3 + 2]
			ex += absf(float(d[i * 3]) - 127.5)
			ey += absf(float(d[i * 3 + 1]) - 127.5)
			cnt += 1
		if sb / cnt < 200.0:
			up_ok = false
		if (ex + ey) / cnt < 3.0:
			vary_ok = false
		var wx := _wrap_and_hardest(d, n, 0, true)
		var wy := _wrap_and_hardest(d, n, 1, false)
		if wx[0] > wx[1] * 1.25 + float(n) or wy[0] > wy[1] * 1.25 + float(n):
			tile_ok = false
		energy[D.LAYERS[li]] = [ex / cnt, ey / cnt]
		firsts.append(d.slice(0, 600))
	ok(up_ok and vary_ok, "every layer is a normal map: it points out of the surface on average and leans both ways (%s)" % str(energy).left(180))
	ok(tile_ok, "every layer tiles: the step across the wrap is no harder than a step inside the tile")
	# negative: the same check finds the seam in bytes that do not tile (a ramp across the tile)
	var ramp := PackedByteArray()
	ramp.resize(n * n * 3)
	for i in n * n:
		ramp[i * 3] = (i % n) * 255 / (n - 1)
	var rw := _wrap_and_hardest(ramp, n, 0, true)
	ok(rw[0] > rw[1] * 1.25 + float(n), "negative: a ramp, which does not tile, shows its seam to the same check (%.0f across the wrap, %.0f at most inside)" % [rw[0], rw[1]])
	var distinct := true
	for a in firsts.size():
		for b in range(a + 1, firsts.size()):
			if firsts[a] == firsts[b]:
				distinct = false
	ok(distinct, "negative: no two layers are the same")
	var wood: Array = energy["wood"]
	var stone: Array = energy["stone"]
	ok(float(wood[0]) > 2.5 * float(wood[1]) and float(stone[0]) < 1.6 * float(stone[1]) and float(stone[1]) < 1.6 * float(stone[0]),
		"wood has a grain (it leans %.1f across against %.1f along); stone has none (%.1f and %.1f)" % [wood[0], wood[1], stone[0], stone[1]])

	# 3. the wiring
	var rep := {"gaps": {}}
	var img_t := ImageTexture.create_from_image(Image.create(4, 4, false, Image.FORMAT_RGBA8))
	var m_stone := KratorWorld._standard({"id": "w:s", "kind": "standard", "colour": "#888888", "lib": "stone.cut", "map": "t", "worldUV": {"K": 0.25}, "hook": "world-uv"}, {"t": img_t}, {}, true, rep, true) as ShaderMaterial
	var m_wood := KratorWorld._standard({"id": "w:w", "kind": "standard", "colour": "#888888", "lib": "wood.siding", "map": "t", "scale": [2.0, 1.7]}, {"t": img_t}, {}, false, rep) as ShaderMaterial
	var m_flat := KratorWorld._standard({"id": "w:f", "kind": "standard", "colour": "#888888", "lib": "stone.cut"}, {}, {}, false, rep) as ShaderMaterial
	var m_gilt := KratorWorld._standard({"id": "w:g", "kind": "standard", "colour": "#888888", "lib": "roof.scale.gilt", "map": "t"}, {"t": img_t}, {}, false, rep) as ShaderMaterial
	ok(float(m_stone.get_shader_parameter("detail_layer")) == 0.0 and (m_stone.get_shader_parameter("detail_scale") as Vector2).is_equal_approx(Vector2(4.0, 4.0) / D.TILE_M)
		and float(m_wood.get_shader_parameter("detail_layer")) == 2.0 and (m_wood.get_shader_parameter("detail_scale") as Vector2).is_equal_approx(Vector2(2.0, 1.7) / D.TILE_M),
		"a record's material names its class's layer and its own tile: 4 m for a world-uv record of K 0.25, the record's scale otherwise")
	ok(float(m_flat.get_shader_parameter("detail_layer")) == -1.0 and float(m_gilt.get_shader_parameter("detail_layer")) == -1.0, "negative: a surface with no map, and a gilt one, take no detail")
	ok(bool(m_stone.get_shader_parameter("mesh_tangents")) and not bool(m_wood.get_shader_parameter("mesh_tangents")), "a mesh with tangents says so on its material; one without does not")
	var cache := {}
	var ids := {"materials_resolved": 0, "materials_missing": 0}
	var mats := {"w:s": {"id": "w:s", "kind": "standard", "colour": "#888888", "lib": "stone.cut"}}
	var a_tan := KratorWorld._mat("w:s", mats, {}, {}, cache, ids, rep, false, false, true)
	var a_not := KratorWorld._mat("w:s", mats, {}, {}, cache, ids, rep, false, false, false)
	ok(a_tan != a_not and KratorWorld._mat("w:s", mats, {}, {}, cache, ids, rep, false, false, true) == a_tan, "one record gives one material for its meshes with tangents and another for those without")
	var hi := KratorLook.tier("high")
	var off := KratorLook.from_args(PackedStringArray(["--look=high", "--no-detail", "--no-tangents"]))
	ok(float(hi["detail"]) > 0.0 and bool(hi["tangents"]) and float(KratorLook.tier("low")["detail"]) > 0.0, "the tiers turn detail and the mesh's tangents on")
	ok(float(off["detail"]) == 0.0 and not bool(off["tangents"]) and float(KratorLook.tier("legacy")["detail"]) == 0.0 and not bool(KratorLook.tier("legacy")["tangents"]),
		"negative: the legacy tier and the switches leave both off")
	D.apply(hi)
	D.apply(off)
	var body := FileAccess.get_file_as_string("res://shaders/library_body.gdshaderinc")
	var proj := FileAccess.get_file_as_string("res://project.godot")
	ok(body.contains('#include "res://shaders/lib/detail.gdshaderinc"') and body.count("kd_detail(") == 1 and body.contains("uniform bool mesh_tangents = false;") and body.contains("uniform float detail_layer = -1.0;")
		and proj.contains("k_surface={") and proj.contains("k_detail_arr={"), "the library body reads the detail array once and knows the tangent switch; the project declares both globals")

	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)
