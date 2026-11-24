# Steps 4 and 6 on a GPU (needs a renderer, not --headless; look_gpu_check.gd's pattern):
#   xvfb-run -a godot --path godot --rendering-method forward_plus --rendering-driver vulkan \
#     --script res://tests/shaders/cook_air_gpu_check.gd          exits 0 when every check passes
# What a headless test cannot see, each read back from pixels or from the renderer's counts:
#  1. a shadow mesh (krator/cook.gd, C4) is what the sun's shadow pass draws for the opaque library shader, and is
#     not for its two-sided twin: shown with a shadow mesh that lies about the shape
#  2. a cooked mesh draws fewer triangles far off (C7), and all of them with the threshold at 0
#  3. the valley mist (shaders/air_mist.gdshader, F2): the ground near the camera stays clear and the ground far off
#     goes to the mist's colour; from above the layer the floor is veiled; the sky is left alone
#  4. the wet ground (shaders/terrain.gdshader, F6): level ground darkens and holds standing water; a slope holds none
# Each has a negative.
extends SceneTree

const SIZE := Vector2i(320, 180)
const BG := Color(1.0, 0.0, 1.0)

var fails := 0
var host: Node3D
var cam: Camera3D
var env: Environment
var sun: DirectionalLight3D


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


func _lum(c: Color) -> float:
	return (c.r + c.g + c.b) / 3.0


func _lib(sh: Shader, col: Vector3) -> ShaderMaterial:
	var sm := ShaderMaterial.new()
	sm.shader = sh
	sm.set_shader_parameter("has_albedo", false)
	sm.set_shader_parameter("has_normal", false)
	sm.set_shader_parameter("has_rough", false)
	sm.set_shader_parameter("colour", col)
	return sm


func _run() -> void:
	DisplayServer.window_set_size(SIZE)
	print("renderer: %s / %s" % [RenderingServer.get_current_rendering_method(), RenderingServer.get_video_adapter_name()])
	var forward := RenderingServer.get_current_rendering_method() == "forward_plus"
	host = Node3D.new()
	root.add_child(host)
	env = Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = BG
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(1, 1, 1)
	env.ambient_light_energy = 0.5
	env.tonemap_mode = Environment.TONE_MAPPER_LINEAR
	var we := WorldEnvironment.new()
	we.environment = env
	host.add_child(we)
	cam = Camera3D.new()
	host.add_child(cam)
	cam.current = true
	sun = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-90.0, 0.0, 0.0)   # straight down: a box's shadow is its footprint
	sun.shadow_enabled = true
	sun.directional_shadow_max_distance = 60.0
	host.add_child(sun)
	KratorWeather.apply({"weather": 0.0})

	# 1. the shadow mesh
	var ground := MeshInstance3D.new()
	var gp := PlaneMesh.new()
	gp.size = Vector2(40, 40)
	ground.mesh = gp
	ground.material_override = _lib(KratorKmat.LIB, Vector3(0.8, 0.8, 0.8))
	host.add_child(ground)
	cam.fov = 50.0
	var box := BoxMesh.new()
	box.size = Vector3(4, 1, 4)
	var real := ArrayMesh.new()
	real.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, box.get_mesh_arrays())
	var cooked := KratorCook.cook_mesh(real)
	var small := BoxMesh.new()
	small.size = Vector3(0.5, 1, 0.5)
	var liar := ArrayMesh.new()
	liar.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, small.get_mesh_arrays())
	var mi := MeshInstance3D.new()
	mi.position = Vector3(0, 6, 0)
	host.add_child(mi)
	# a ground point under the real box's footprint and outside the small one's (1.5 m off centre), seen past the box's edge? The box
	# hides it from straight above, so the camera looks from the side
	cam.position = Vector3(0, 3.0, 12.0)
	cam.rotation_degrees = Vector3(-14.0, 0.0, 0.0)
	await process_frame
	var probe := cam.unproject_position(Vector3(1.5, 0.0, 1.2))
	var px := Vector2i(int(probe.x), int(probe.y))
	var res := {}
	for name in ["LIB true", "LIB lying", "LIB_TWOSIDED lying", "LIB none"]:
		var m: ArrayMesh = cooked.duplicate() as ArrayMesh
		if name.ends_with("lying"):
			m.shadow_mesh = liar
		elif name.ends_with("none"):
			m.shadow_mesh = null
		mi.mesh = m
		mi.material_override = _lib(KratorKmat.LIB_TWOSIDED if name.begins_with("LIB_TWOSIDED") else KratorKmat.LIB, Vector3(0.3, 0.3, 0.9))
		res[name] = _lum((await _shot(4)).get_pixel(px.x, px.y))
	ok(cooked.shadow_mesh != null and cooked.shadow_mesh.surface_get_array_len(0) == 8, "a cooked box has a shadow mesh of its 8 corners")
	ok(float(res["LIB true"]) < 0.8 and absf(float(res["LIB true"]) - float(res["LIB none"])) < 0.02, "with its true shadow mesh the box shades the ground as it does without one (%.2f, %.2f)" % [res["LIB true"], res["LIB none"]])
	ok(float(res["LIB lying"]) > float(res["LIB true"]) + 0.2, "the opaque library shader's shadow pass draws the shadow mesh: one that lies about the shape leaves the ground lit (%.2f)" % res["LIB lying"])
	ok(absf(float(res["LIB_TWOSIDED lying"]) - float(res["LIB true"])) < 0.02, "negative: the two-sided twin draws its own vertices, whatever the shadow mesh says (%.2f)" % res["LIB_TWOSIDED lying"])
	mi.free()

	# 2. levels of detail by distance
	var sph := SphereMesh.new()
	sph.radial_segments = 64
	sph.rings = 32
	var sm := ArrayMesh.new()
	sm.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, sph.get_mesh_arrays())
	var cs := KratorCook.cook_mesh(sm)
	var ball := MeshInstance3D.new()
	ball.mesh = cs
	ball.material_override = _lib(KratorKmat.LIB, Vector3(0.9, 0.4, 0.2))
	ball.position = Vector3(0, 1, -12)
	ball.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	ground.visible = false
	sun.shadow_enabled = false
	host.add_child(ball)
	cam.position = Vector3(0, 1, 0)
	cam.rotation_degrees = Vector3.ZERO
	root.mesh_lod_threshold = 0.0
	await _shot(3)
	var full := int(Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME))
	root.mesh_lod_threshold = 2.0
	var im_l := await _shot(3)
	var lod := int(Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME))
	ok(full >= cs.surface_get_array_index_len(0) / 3 and lod < full * 3 / 4 and lod > 16 and not (im_l.get_pixel(SIZE.x / 2, SIZE.y / 2).g < 0.05 and im_l.get_pixel(SIZE.x / 2, SIZE.y / 2).b > 0.8),
		"a cooked sphere 12 m off draws %d primitives at a 2 px threshold against %d at 0, and is still there" % [lod, full])
	root.mesh_lod_threshold = 1.0
	ball.free()

	# 3. the mist
	ground.visible = true
	(gp as PlaneMesh).size = Vector2(6000, 6000)
	ground.material_override = _lib(KratorKmat.LIB, Vector3(0.1, 0.1, 0.1))
	env.fog_enabled = false
	var air := KratorAir.make({"mist": 1.0})
	host.add_child(air)
	air.mist_quad.visible = true
	air.mist_mat.set_shader_parameter("mist", Vector4(0.01, 0.0, 40.0, 0.94))
	air.mist_mat.set_shader_parameter("mist_colour", Color(0.9, 0.9, 0.9))
	air.mist_mat.set_shader_parameter("sun", Vector4(0, 1, 0, 0))
	cam.position = Vector3(0, 2, 0)
	cam.rotation_degrees = Vector3(-6, 0, 0)
	var far_y := SIZE.y / 2 - int(6.0 / 50.0 * SIZE.y) + 4   # a degree under the horizon: about 100 m off
	var im_m := await _shot(4)
	var near_c := _lum(im_m.get_pixel(SIZE.x / 2, SIZE.y - 3))
	var far_c := _lum(im_m.get_pixel(SIZE.x / 2, far_y))
	var sky_c := im_m.get_pixel(SIZE.x / 2, 6)
	air.mist_quad.visible = false
	var im_0 := await _shot(3)
	var near_0 := _lum(im_0.get_pixel(SIZE.x / 2, SIZE.y - 3))
	var far_0 := _lum(im_0.get_pixel(SIZE.x / 2, far_y))
	ok(near_c - near_0 < 0.06 and far_c - far_0 > 0.3, "in the mist the ground at the camera's feet stays clear (+%.2f) and the ground far off goes to the mist's colour (+%.2f)" % [near_c - near_0, far_c - far_0])
	ok(sky_c.r > 0.8 and sky_c.g < 0.25 and sky_c.b > 0.8, "the sky is left alone")
	air.mist_quad.visible = true
	cam.position = Vector3(0, 400, 0)
	cam.rotation_degrees = Vector3(-90, 0, 0)
	air.mist_mat.set_shader_parameter("mist", Vector4(0.004, 0.0, 40.0, 0.94))
	var down := _lum((await _shot(4)).get_pixel(SIZE.x / 2, SIZE.y / 2))
	air.mist_mat.set_shader_parameter("mist", Vector4(0.0, 0.0, 40.0, 0.94))
	var off := _lum((await _shot(3)).get_pixel(SIZE.x / 2, SIZE.y / 2))
	air.mist_quad.visible = false
	var bare := _lum((await _shot(3)).get_pixel(SIZE.x / 2, SIZE.y / 2))
	var want := (1.0 - exp(-0.004 * 40.0)) * 0.94   # the layer's whole depth: density at the floor times its scale height
	var lin := func(v: float) -> float: return Color(v, v, v).srgb_to_linear().r   # the frame is display-encoded; the blend is linear
	var got: float = (lin.call(down) - lin.call(bare)) / (lin.call(0.9) - lin.call(bare))
	ok(absf(got - want) < 0.04, "from 400 m above, the floor is veiled by the layer's whole depth (%.2f of the way to the mist's colour; %.2f worked out)" % [got, want])
	ok(absf(off - bare) < 0.01, "negative: at no density the pass changes nothing")
	air.free()

	# 4. the wet ground
	(gp as PlaneMesh).size = Vector2(60, 60)
	(gp as PlaneMesh).subdivide_width = 8
	(gp as PlaneMesh).subdivide_depth = 8
	var tm := ShaderMaterial.new()
	tm.shader = load("res://shaders/terrain.gdshader")
	ground.material_override = tm
	env.background_color = Color(0.2, 0.5, 1.0)
	env.reflected_light_source = Environment.REFLECTION_SOURCE_BG
	env.ambient_light_source = Environment.AMBIENT_SOURCE_BG
	env.ambient_light_energy = 1.0
	sun.rotation_degrees = Vector3(-50.0, 30.0, 0.0)
	cam.position = Vector3(0, 3, 0)
	cam.rotation_degrees = Vector3(-30, 0, 0)
	RenderingServer.global_shader_parameter_set("atm_wet", 0.0)
	var dry := await _shot(4)
	RenderingServer.global_shader_parameter_set("atm_wet", 1.0)
	var wet := await _shot(4)
	if OS.get_environment("KRATOR_CHECK_SHOTS") != "":
		dry.save_png(OS.get_environment("KRATOR_CHECK_SHOTS") + "/wet_dry.png")
		wet.save_png(OS.get_environment("KRATOR_CHECK_SHOTS") + "/wet_wet.png")
	var darker := 0
	var mirror := 0
	var n := 0
	for y in range(SIZE.y / 2 + 10, SIZE.y, 3):
		for x in range(0, SIZE.x, 3):
			var a := dry.get_pixel(x, y)
			var b := wet.get_pixel(x, y)
			n += 1
			darker += 1 if _lum(b) < _lum(a) - 0.01 else 0
			mirror += 1 if _lum(b) < _lum(a) * 0.6 else 0   # standing water: far darker than wet earth (and smooth: what it mirrors is the sky's to give)
	ok(darker > n / 3 and mirror > n / 50 and mirror < n * 3 / 4, "wet, level ground darkens (%d%% of it) and water stands on part of it (%d%%)" % [darker * 100 / n, mirror * 100 / n])
	ground.rotation_degrees = Vector3(0, 0, 14.0)
	ground.position = Vector3(0, -2, 0)
	var slope := await _shot(4)
	var m2 := 0
	RenderingServer.global_shader_parameter_set("atm_wet", 0.0)
	var slope_dry := await _shot(4)
	for y in range(SIZE.y / 2 + 10, SIZE.y, 3):
		for x in range(0, SIZE.x, 3):
			m2 += 1 if _lum(slope.get_pixel(x, y)) < _lum(slope_dry.get_pixel(x, y)) * 0.6 else 0
	ok(m2 < mirror / 4, "negative: on a slope of 14 degrees no water stands (%d%%)" % [m2 * 100 / n])
	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)
