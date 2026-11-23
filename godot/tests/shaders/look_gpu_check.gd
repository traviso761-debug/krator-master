# The look's shader work on a GPU (needs a renderer, not --headless; library_gpu_check.gd's pattern):
#   xvfb-run -a godot --path godot --rendering-method forward_plus --rendering-driver vulkan \
#     --script res://tests/shaders/look_gpu_check.gd          exits 0 when every check passes
# (--rendering-method gl_compatibility --rendering-driver opengl3 runs the same checks on the Compatibility renderer.)
# What a headless test cannot see (GODOT-LOOK-PLAN.md C1, C5, C9, M7, M9, M10), each read back from pixels:
#  1. the library surface's three shaders compile and draw; the opaque one culls a back face, the other two draw it;
#     only the cut-out lets the background through a hole in its map
#  2. the weathering stack: off, the surface is as it was; on, it changes; the pattern follows the world across a
#     rebase (the node moved one way and k_world_origin the other) and across the 4096 m its origin wraps at
#  3. a cell's rowless twin of the leaf and bark shaders (krator/cells.gd, K_LOD_OFF) compiles and draws what the
#     shader itself draws for a node with no rows
#  4. the sky with its clouds in the half-resolution pass against the sky at full size
#  5. detail normals and the mesh-tangent frame (krator/kdetail.gd), when the look turns them on
# Each has a negative.
extends SceneTree

const KratorSky := preload("res://krator/sky.gd")
const SIZE := Vector2i(320, 180)
const BG := Color(1.0, 0.0, 1.0)

var fails := 0
var host: Node3D
var cam: Camera3D
var env: Environment


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	_run()


func _shot(frames := 3) -> Image:
	for _f in frames:
		await process_frame
	return root.get_texture().get_image()


func _is_bg(c: Color) -> bool:
	return c.r > 0.8 and c.g < 0.25 and c.b > 0.8


# mean absolute difference of two frames, 0..255, over a rect (the whole frame when none is given)
func _diff(a: Image, b: Image, rect := Rect2i()) -> float:
	if rect.size == Vector2i.ZERO:
		rect = Rect2i(0, 0, a.get_width(), a.get_height())
	var s := 0.0
	var n := 0
	for y in range(rect.position.y, rect.end.y, 2):
		for x in range(rect.position.x, rect.end.x, 2):
			var p := a.get_pixel(x, y)
			var q := b.get_pixel(x, y)
			s += absf(p.r - q.r) + absf(p.g - q.g) + absf(p.b - q.b)
			n += 3
	return 255.0 * s / maxf(1.0, float(n))


func _quad(sh: Shader, back := false) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var q := QuadMesh.new()
	q.size = Vector2(2.0, 2.0)
	mi.mesh = q
	var sm := ShaderMaterial.new()
	sm.shader = sh
	sm.set_shader_parameter("has_albedo", false)
	sm.set_shader_parameter("has_normal", false)
	sm.set_shader_parameter("has_rough", false)
	sm.set_shader_parameter("colour", Vector3(0.2, 0.7, 0.3))
	mi.material_override = sm
	if back:
		mi.rotation.y = PI
	host.add_child(mi)
	return mi


func _run() -> void:
	DisplayServer.window_set_size(SIZE)
	var method := RenderingServer.get_current_rendering_method()
	print("renderer: %s / %s" % [method, RenderingServer.get_video_adapter_name()])
	host = Node3D.new()
	root.add_child(host)
	env = Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = BG
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(1, 1, 1)
	env.ambient_light_energy = 0.6
	env.tonemap_mode = Environment.TONE_MAPPER_LINEAR
	var we := WorldEnvironment.new()
	we.environment = env
	host.add_child(we)
	cam = Camera3D.new()
	cam.position = Vector3(0, 0, 3.2)
	cam.fov = 50.0
	host.add_child(cam)
	cam.current = true
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-35.0, 25.0, 0.0)
	host.add_child(sun)
	KratorWeather.apply({"weather": 0.0})
	KratorWeather.set_origin([0.0, 0.0, 0.0])
	var cx := SIZE.x / 2
	var cy := SIZE.y / 2

	# 1. the three library shaders
	var K := KratorKmat
	var seen := {}
	for name in ["LIB", "LIB_TWOSIDED", "LIB_CUTOUT"]:
		var sh: Shader = K.LIB if name == "LIB" else (K.LIB_TWOSIDED if name == "LIB_TWOSIDED" else K.LIB_CUTOUT)
		var f := _quad(sh)
		var front := (await _shot()).get_pixel(cx, cy)
		f.free()
		var b := _quad(sh, true)
		var backc := (await _shot()).get_pixel(cx, cy)
		b.free()
		seen[name] = [front, backc]
	ok(not _is_bg(seen["LIB"][0]) and not _is_bg(seen["LIB_TWOSIDED"][0]) and not _is_bg(seen["LIB_CUTOUT"][0]) and (seen["LIB"][0] as Color).g > (seen["LIB"][0] as Color).r,
		"the three library shaders compile and draw a lit green face (%s)" % str(seen["LIB"][0]))
	ok(_is_bg(seen["LIB"][1]) and not _is_bg(seen["LIB_TWOSIDED"][1]) and not _is_bg(seen["LIB_CUTOUT"][1]), "the opaque one culls a back face; the two-sided and the cut-out draw it")
	var hole := Image.create(64, 64, false, Image.FORMAT_RGBA8)
	hole.fill(Color(0.9, 0.9, 0.9, 1.0))
	hole.fill_rect(Rect2i(16, 16, 32, 32), Color(0.9, 0.9, 0.9, 0.0))
	var hole_tex := ImageTexture.create_from_image(hole)
	var through := {}
	for name in ["LIB", "LIB_CUTOUT"]:
		var q := _quad(K.LIB if name == "LIB" else K.LIB_CUTOUT)
		var sm := q.material_override as ShaderMaterial
		sm.set_shader_parameter("has_albedo", true)
		sm.set_shader_parameter("albedo_tex", hole_tex)
		sm.set_shader_parameter("alpha_test", 0.5)
		var im := await _shot()
		through[name] = [im.get_pixel(cx, cy), im.get_pixel(cx - 34, cy - 34)]
		q.free()
	ok(_is_bg(through["LIB_CUTOUT"][0]) and not _is_bg(through["LIB_CUTOUT"][1]), "the cut-out lets the background through the hole in its map, and draws the rest")
	ok(not _is_bg(through["LIB"][0]), "negative: the opaque shader, handed the same map and alpha test, cuts nothing (it never writes ALPHA)")

	# 2. the weathering stack on a wall
	env.background_color = Color(0.2, 0.2, 0.2)
	var wall := MeshInstance3D.new()
	var bx := BoxMesh.new()
	bx.size = Vector3(7.0, 4.0, 0.4)
	wall.mesh = bx
	var wm := ShaderMaterial.new()
	wm.shader = K.LIB
	wm.set_shader_parameter("has_albedo", false)
	wm.set_shader_parameter("has_normal", false)
	wm.set_shader_parameter("has_rough", false)
	wm.set_shader_parameter("colour", Vector3(0.62, 0.6, 0.56))
	wm.set_shader_parameter("weather_k", KratorWeather.amounts("plaster.limewash.red"))
	wall.material_override = wm
	wall.position = Vector3(0, 0, -1.0)
	host.add_child(wall)
	var plain := await _shot()
	KratorWeather.apply({"weather": 1.0})
	var worn := await _shot()
	var worn2 := await _shot()
	KratorWeather.apply({"weather": 0.0})
	var plain2 := await _shot()
	var d_on := _diff(plain, worn)
	ok(d_on > 2.0 and _diff(worn, worn2) < 0.2, "the stack changes a plaster wall (%.1f of 255 on average), the same way each frame" % d_on)
	ok(_diff(plain, plain2) < 0.2, "negative: off again, the wall is as it was (%.2f)" % _diff(plain, plain2))
	# flat colour without the stack, variation with it: the spread of the wall's own pixels
	var spread := func(im: Image) -> float:
		var lo := 1.0
		var hi := 0.0
		for y in range(50, 130, 3):
			for x in range(40, 280, 3):
				var v := im.get_pixel(x, y).get_luminance()
				lo = minf(lo, v)
				hi = maxf(hi, v)
		return hi - lo
	ok(spread.call(worn) > spread.call(plain) + 0.04, "a wall of one colour gains a range of values (%.3f against %.3f)" % [spread.call(worn), spread.call(plain)])
	# the rebase: the stream moves every node by -delta and its origin by +delta; the pattern must not move
	KratorWeather.apply({"weather": 1.0})
	var delta := Vector3(37.0, 0.0, -113.0)
	wall.position -= delta
	cam.position -= delta
	KratorWeather.set_origin([delta.x, 0.0, delta.z])
	var rebased := await _shot()
	ok(_diff(worn, rebased) < 0.6, "after a rebase (the wall and the eye moved by %s, the origin by its opposite) the pattern is where it was (%.2f)" % [str(-delta), _diff(worn, rebased)])
	KratorWeather.set_origin([0.0, 0.0, 0.0])
	var slid := await _shot()
	ok(_diff(worn, slid) > 1.0, "negative: without the origin the pattern slides (%.1f)" % _diff(worn, slid))
	wall.position += delta
	cam.position += delta
	# the wrap: 4096 m along x and along z is a whole number of tiles of every lookup
	var wrapped_ok := true
	var worst_wrap := 0.0
	for shift in [Vector3(KratorWeather.PERIOD, 0, 0), Vector3(0, 0, KratorWeather.PERIOD)]:
		wall.position += shift
		cam.position += shift
		var w_im := await _shot()
		worst_wrap = maxf(worst_wrap, _diff(worn, w_im))
		wall.position -= shift
		cam.position -= shift
	wrapped_ok = worst_wrap < 0.8
	ok(wrapped_ok, "4096 m away along x or z the wall wears the same pattern (%.2f): the origin can wrap there" % worst_wrap)
	KratorWeather.apply({"weather": 0.0})
	wall.free()

	# 3. the rowless twin of the leaf and bark shaders
	env.background_color = BG
	for sh in [KratorBiome.BARK, KratorBiome.FOLIAGE]:
		var twin := KratorCells.rowless_shader(sh)
		var ims := []
		for s2 in [sh, twin]:
			var q := MeshInstance3D.new()
			var qm := QuadMesh.new()
			qm.size = Vector2(2.0, 2.0)
			q.mesh = qm
			var sm := ShaderMaterial.new()
			sm.shader = s2
			sm.set_shader_parameter("colour", Vector3(0.4, 0.3, 0.2))
			sm.set_shader_parameter("sway_a", 0.0)      # a still card: the two frames are drawn at two moments
			sm.set_shader_parameter("has_tex", false)
			q.material_override = sm
			host.add_child(q)
			ims.append(await _shot())
			q.free()
		var name := str(sh.resource_path).get_file()
		ok(twin != sh and not _is_bg((ims[1] as Image).get_pixel(cx, cy)) and _diff(ims[0], ims[1]) < 0.3,
			"%s: its K_LOD_OFF twin compiles and draws what the shader draws for a node with no rows (%.2f apart)" % [name, _diff(ims[0], ims[1])])
	var probe := Shader.new()
	probe.code = "shader_type spatial;\n#define K_LOD_OFF\n#include \"res://shaders/lib/lod.gdshaderinc\"\nvoid fragment() { ALBEDO = vec3(klod(vec3(0.0), vec3(0.0), 0)); }\n"
	var pq := _quad(probe)
	var pc := (await _shot()).get_pixel(cx, cy)
	pq.free()
	ok(not _is_bg(pc) and pc.r < 0.35, "negative: with K_LOD_OFF klod answers 0 (drawn whole) for any row")

	# 5. detail normals (M9) and the mesh's own tangent frame (M10), under a raking light
	env.background_color = Color(0.2, 0.2, 0.2)
	sun.rotation_degrees = Vector3(-38.0, 62.0, 0.0)   # across the face and down it: both of the map's axes show
	KratorDetail.apply({"detail": 0.0, "tangents": false})
	var dq := _quad(K.LIB)
	var dm := dq.material_override as ShaderMaterial
	dm.set_shader_parameter("colour", Vector3(0.6, 0.6, 0.6))
	dm.set_shader_parameter("detail_layer", 0.0)
	dm.set_shader_parameter("detail_scale", Vector2(6.25, 6.25))
	var flat := await _shot()
	KratorDetail.apply({"detail": 1.0, "tangents": false})
	var grained := await _shot()
	var mid := Rect2i(cx - 40, cy - 40, 80, 80)
	ok(_diff(flat, grained, mid) > 1.5, "the detail normal gives a flat face a grain at arm's length (%.1f of 255)" % _diff(flat, grained, mid))
	dm.set_shader_parameter("detail_layer", -1.0)
	var none := await _shot()
	dm.set_shader_parameter("detail_layer", 0.0)
	cam.position.z = 9.0
	cam.fov = 18.0
	var far_on := await _shot()
	KratorDetail.apply({"detail": 0.0, "tangents": false})
	var far_off := await _shot()
	cam.position.z = 3.2
	cam.fov = 50.0
	ok(_diff(flat, none, mid) < 0.3 and _diff(far_on, far_off) < 0.3, "negative: a surface with no layer takes none, and past six metres it is gone (%.2f, %.2f)" % [_diff(flat, none, mid), _diff(far_on, far_off)])
	# the frame: a normal map on the mesh's tangents against the derivative frame, on a flat face they must agree
	var nmap := ImageTexture.create_from_image(KratorDetail.layer_images()[0])
	dm.set_shader_parameter("detail_layer", -1.0)
	dm.set_shader_parameter("has_normal", true)
	dm.set_shader_parameter("normal_tex", nmap)
	dm.set_shader_parameter("uv_scale", Vector3(3.0, 3.0, 1.0))
	var worst_frame := 0.0
	var bump := 0.0
	for fv in [false, true]:
		dm.set_shader_parameter("flip_v", fv)
		dm.set_shader_parameter("mesh_tangents", false)
		KratorDetail.apply({"detail": 0.0, "tangents": true})
		var by_deriv := await _shot()
		dm.set_shader_parameter("mesh_tangents", true)
		var by_mesh := await _shot()
		worst_frame = maxf(worst_frame, _diff(by_deriv, by_mesh, mid))
		print("     flip_v %s: mesh tangents against the derivative frame %.2f; the map against the flat face %.2f" % [str(fv), _diff(by_deriv, by_mesh, mid), _diff(by_deriv, flat, mid)])
		bump = maxf(bump, _diff(by_deriv, flat, mid))
		KratorDetail.apply({"detail": 0.0, "tangents": false})
		var switched_off := await _shot()
		worst_frame = maxf(worst_frame, _diff(by_deriv, switched_off, mid))
	ok(worst_frame < 0.5 and bump > 2.0, "a normal map lit on the mesh's tangents is the one lit on the derivative frame, with v flipped or not (%.2f of 255 apart; the map itself moves the face by %.1f)" % [worst_frame, bump])
	# negative: the binormal's sign matters: the same map with its green turned over is another picture
	dm.set_shader_parameter("flip_v", false)
	dm.set_shader_parameter("mesh_tangents", false)
	var right_way := await _shot()
	var inv := (KratorDetail.layer_images()[0] as Image).duplicate() as Image
	inv.clear_mipmaps()
	for y in inv.get_height():
		for x in inv.get_width():
			var c := inv.get_pixel(x, y)
			inv.set_pixel(x, y, Color(c.r, 1.0 - c.g, c.b))
	inv.generate_mipmaps()
	dm.set_shader_parameter("normal_tex", ImageTexture.create_from_image(inv))
	var wrong_way := await _shot()
	ok(_diff(right_way, wrong_way, mid) > 1.2 and _diff(right_way, wrong_way, mid) > 4.0 * worst_frame,
		"negative: turn the map's green over and the picture changes (%.1f), so the agreement above is of the binormal's sign too" % _diff(right_way, wrong_way, mid))
	dq.free()
	sun.rotation_degrees = Vector3(-35.0, 25.0, 0.0)

	# 4. the sky: clouds in the half-resolution pass against the sky at full size
	host.remove_child(we)
	var sky := KratorSky.new()
	sky.site_px = Vector2(1306.0, 1634.0)
	sky.day = 75.0
	sky.hour = 15.0
	sky.cover = 0.55
	host.add_child(sky)
	await process_frame
	sky.set_process(false)
	sky._update()
	sky.sun.visible = false
	cam.rotation_degrees = Vector3(28.0, 40.0, 0.0)
	var full := await _shot(4)
	sky.half_res_clouds = true
	var half := await _shot(4)
	sky.half_res_clouds = false
	var full2 := await _shot(4)
	var d_half := _diff(full, half)
	if method == "gl_compatibility":
		ok(d_half < 0.5 and sky.mat.shader == sky.SKY_FULL, "the Compatibility renderer has no half-resolution sky pass: asked for it, the sky stays whole (%.2f)" % d_half)
	else:
		ok(sky.mat.shader == sky.SKY_FULL and d_half < 4.0, "the sky with its clouds at half resolution is the sky at full size to %.2f of 255 on average" % d_half)
		ok(_diff(full, full2) < 0.5 and d_half > 0.0005, "negative: it is a different pass (not %.4f = 0), and the full sky comes back unchanged (%.2f)" % [d_half, _diff(full, full2)])
	sky.queue_free()
	await process_frame

	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)
