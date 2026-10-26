# Krator's shared sky on a Godot world (core/atmos/SKY-PLAN.md): the twin of core/atmos/host/89-atmos-h-skyhost.js.
# Builds the WorldEnvironment's Sky from shaders/sky.gdshader, and each frame sets its uniforms from the sky model
# (sky_model.gd: the sun, the giant and its libration, the ring, six moons, the stars' sphere, the colour script) and
# drives the sun and giantshine DirectionalLight3Ds, the fog and the exposure from the same keys.
#   var sky = load("res://krator/sky.gd").new(); sky.site_px = Vector2(446, 690); add_child(sky)
# The noise volume is godot/data/sky/noise64.bin and the moon maps core/materials/library/sky.moon.*, both made by the
# JavaScript side (godot/tools/atmos_sky.js, the library); the clock is hour and day here until WorldClock drives it.
extends Node3D

const MOONS := ["companion", "week", "thirteen", "day", "two-day", "four-day"]   # the model's moon order

@export var site_px := Vector2(446, 690)       # the scale model's pixel (Voth, the reference site)
@export var hour := 6.0                        # game start: sunrise
@export var day := 0.0                         # days since game start
@export var running := false
@export var day_seconds := 4320.0              # a 72-minute day (core/clock)
@export var pressure := -1.0                   # atm; < 0 takes the preset's
@export var cover := -1.0                      # cloud cover 0..1; < 0 takes the preset's
@export var weather := {}                      # {cover, grey, fog}

var model
var preset: Dictionary
var mat: ShaderMaterial
var env: Environment
var sun: DirectionalLight3D
var shine: DirectionalLight3D
var state: Dictionary
var look_now: Dictionary
var _t := 0.0


func _ready() -> void:
	model = load("res://krator/sky_model.gd").new()
	preset = model.presets["standard"].duplicate(true)
	mat = ShaderMaterial.new()
	mat.shader = load("res://shaders/sky.gdshader")
	var sky := Sky.new()
	sky.sky_material = mat
	sky.process_mode = Sky.PROCESS_MODE_INCREMENTAL
	sky.radiance_size = Sky.RADIANCE_SIZE_128
	env = Environment.new()
	env.background_mode = Environment.BG_SKY
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.reflected_light_source = Environment.REFLECTION_SOURCE_SKY
	env.tonemap_mode = Environment.TONE_MAPPER_ACES
	env.fog_enabled = true
	env.fog_sky_affect = 0.0   # the sky draws its own horizon haze; Godot's fog would bury it (as stage.gd)
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	sun = DirectionalLight3D.new()
	sun.shadow_enabled = true
	add_child(sun)
	shine = DirectionalLight3D.new()
	add_child(shine)
	_textures()
	_constants()
	_update()


# the noise volume and the moon atlas (a 2:1 row a moon, the model's order); the ridge texture (none in the standard preset)
func _textures() -> void:
	var bytes := FileAccess.get_file_as_bytes("res://data/sky/noise64.bin")
	var layers: Array[Image] = []
	for z in 64:
		layers.append(Image.create_from_data(64, 64, false, Image.FORMAT_RGBA8, bytes.slice(z * 64 * 64 * 4, (z + 1) * 64 * 64 * 4)))
	var vol := ImageTexture3D.new()
	vol.create(Image.FORMAT_RGBA8, 64, 64, 64, false, layers)
	mat.set_shader_parameter("uNoise", vol)
	RenderingServer.global_shader_parameter_set("atm_sky_noise", vol)   # the cloud shade on the ground (atmos_cloudshade.gdshaderinc)
	var W := 512
	var atlas := Image.create(W, W / 2 * MOONS.size(), false, Image.FORMAT_RGB8)
	var ok := true
	for i in MOONS.size():
		var p := ProjectSettings.globalize_path("res://").path_join("../core/materials/library/sky.moon.%s/albedo.jpg" % MOONS[i])
		var im := Image.load_from_file(p)
		if im == null or im.get_width() < 64:   # an LFS pointer, or missing: the procedural surfaces stay
			ok = false
			break
		im.convert(Image.FORMAT_RGB8)
		im.resize(W, W / 2, Image.INTERPOLATE_LANCZOS)
		atlas.blit_rect(im, Rect2i(0, 0, W, W / 2), Vector2i(0, W / 2 * i))
	if ok:
		atlas.flip_y()   # the shader reads rows the way three.js's flipped upload lays them out
		atlas.generate_mipmaps()
		mat.set_shader_parameter("uMoonMaps", ImageTexture.create_from_image(atlas))
	mat.set_shader_parameter("uMoonMapOn", 1.0 if ok else 0.0)
	var rid := Image.create(1024, model.S.get("maxRidges", 4), false, Image.FORMAT_RGBAF)
	mat.set_shader_parameter("uRidgeTex", ImageTexture.create_from_image(rid))
	mat.set_shader_parameter("uRidgeN", 0)


# what does not change with the hour: the bright stars, the giant's colours, the planetary nebula
func _constants() -> void:
	var stars: Array = model.S["stars"]
	var st := PackedVector4Array()
	var sc := PackedVector3Array()
	for s in stars:
		var ra: float = s[0] * model.D
		var dc: float = s[1] * model.D
		st.append(Vector4(cos(dc) * cos(ra), cos(dc) * sin(ra), sin(dc), s[2]))
		sc.append(Vector3(s[3], s[4], s[5]))
	mat.set_shader_parameter("uStar", st)
	mat.set_shader_parameter("uStarC", sc)
	var C: Dictionary = model.S["cluster"]
	mat.set_shader_parameter("uCluster", Vector3(cos(C["dec"] * model.D) * cos(C["ra"] * model.D), cos(C["dec"] * model.D) * sin(C["ra"] * model.D), sin(C["dec"] * model.D)))
	var pn: Array = C["pn"]
	mat.set_shader_parameter("uPN", Vector4(cos(pn[1] * model.D) * cos(pn[0] * model.D), cos(pn[1] * model.D) * sin(pn[0] * model.D), sin(pn[1] * model.D), pn[2] * model.D))
	var G: Dictionary = preset["giant"]
	for k in ["Deep", "Mid", "Pale", "Cloud", "Plank", "Haze", "Teal", "Rim", "Night", "Ring"]:
		mat.set_shader_parameter("uG" + k, _v(G[k.to_lower()]))
	var N: Dictionary = preset["night"]
	mat.set_shader_parameter("uNightK", Vector3(N["stars"], N["nebula"], N["galaxy"]))
	# the landmarks: plumes, ceilings, cloud seas and horizon bands (sky_model.landmarks)
	var LM: Dictionary = model.landmarks(preset.get("landmarks", []))
	mat.set_shader_parameter("uLm", PackedVector4Array(LM["v"]))
	mat.set_shader_parameter("uLmK", LM["kind"])
	mat.set_shader_parameter("uLmN", LM["n"])


static func _v(a: Array) -> Vector3:
	return Vector3(a[0], a[1], a[2])


static func _c(a: Array) -> Color:
	return Color(a[0], a[1], a[2]).srgb_to_linear()


func _process(dt: float) -> void:
	_t += dt
	if running:
		hour += 24.0 * dt / day_seconds
		while hour >= 24.0:
			hour -= 24.0
			day += 1.0
	_update()


func _update() -> void:
	if pressure >= 0.0:
		preset["air"]["pressure"] = pressure
	if cover >= 0.0:
		preset["clouds"]["cover"] = cover
	var site: Dictionary = model.site_at(site_px.x, site_px.y)
	state = model.sky_state(site, hour, day)
	look_now = model.look(preset, state, weather)
	var s := state
	var L := look_now
	var m := mat
	m.set_shader_parameter("uSunDir", s["sunDir"])
	m.set_shader_parameter("uGiantDir", s["giantDir"])
	m.set_shader_parameter("uPole", s["giantAxis"])
	m.set_shader_parameter("uRingN", model.ring_normal(s))
	m.set_shader_parameter("uRingT", s["ringLine"])
	var W: Array = s["eq"]   # the shader's uEq takes the world to the stars' sphere: the transpose of W
	m.set_shader_parameter("uEq", Basis(W[0], W[1], W[2]).transposed())
	for k in [["uZen", "zen"], ["uHor", "hor"], ["uSunHor", "sunHor"], ["uSunC", "sunC"], ["uShineC", "shineC"], ["uFogC", "fogC"]]:
		m.set_shader_parameter(k[0], _v(L[k[1]]))
	m.set_shader_parameter("uExt", _v(L["ext"]))
	m.set_shader_parameter("uSunI", L["sunI"])
	m.set_shader_parameter("uHazeFloor", L["hazeFloor"])
	m.set_shader_parameter("uDayStars", L["dayStars"])
	m.set_shader_parameter("uNight", L["night"])
	m.set_shader_parameter("uEclipse", s["eclipse"])
	m.set_shader_parameter("uShineI", L["shineI"])
	m.set_shader_parameter("uSpin", s["spin"])
	m.set_shader_parameter("uFogD", L["fogD"])
	m.set_shader_parameter("uTime", _t)
	var cam3 := get_viewport().get_camera_3d() if get_viewport() else null
	m.set_shader_parameter("uCamPos", cam3.global_position if cam3 else Vector3(0, 1.7, 0))
	m.set_shader_parameter("uMoonT", s["t"] * 24.0)
	var md := PackedVector3Array(); var ml := PackedVector3Array(); var mv := PackedVector3Array(); var mg := PackedVector3Array(); var mc := PackedVector3Array()
	var mr := PackedFloat32Array(); var mk := PackedFloat32Array(); var mf := PackedFloat32Array(); var mlp := PackedFloat32Array()
	for mo in s["moons"]:
		md.append(mo["dir"]); ml.append(mo["light"]); mv.append(mo["lead"]); mg.append(mo["toGiant"]); mc.append(_v(mo["albedo"]))
		mr.append(mo["radiusDeg"] * model.D); mk.append(mo["kind"]); mf.append(mo["front"]); mlp.append(mo["lump"])
	for k in [["uMoonDir", md], ["uMoonL", ml], ["uMoonV", mv], ["uMoonG", mg], ["uMoonC", mc], ["uMoonR", mr], ["uMoonK", mk], ["uMoonLump", mlp], ["uMoonF", mf]]:
		m.set_shader_parameter(k[0], k[1])
	var st: Dictionary = s["station"]
	m.set_shader_parameter("uStaDir", st["dir"]); m.set_shader_parameter("uStaAx", st["axis"]); m.set_shader_parameter("uStaV", st["vel"])
	m.set_shader_parameter("uStaK", Vector4(st["radiusDeg"] * model.D, st["lit"], st["dist"], st["up"]))
	m.set_shader_parameter("uRealT", fmod(Time.get_ticks_msec() / 1000.0, 86400.0))   # the meteors keep wall-clock time
	m.set_shader_parameter("uMeteor", float(preset["night"].get("meteors", 1.0)))
	var Cl: Dictionary = preset["clouds"]
	m.set_shader_parameter("uCloud", Vector4(L["cover"], Cl["cumulus"], Cl["cirrus"], Cl["bank"]))
	m.set_shader_parameter("uCloudH", Vector4(Cl["height"], Cl["cirrusHeight"], Cl["scale"], Cl["drift"]))
	m.set_shader_parameter("uWind", Vector2(1.0, 0.3))
	RenderingServer.global_shader_parameter_set("atm_cloud", Vector4(L["cover"], Cl["cumulus"], Cl["cirrus"], Cl["bank"]))
	RenderingServer.global_shader_parameter_set("atm_cloud_h", Vector4(Cl["height"], Cl["cirrusHeight"], Cl["scale"], Cl["drift"]))
	RenderingServer.global_shader_parameter_set("atm_cloud_wind", Vector2(1.0, 0.3))
	RenderingServer.global_shader_parameter_set("atm_time", _t)
	RenderingServer.global_shader_parameter_set("atm_wet", float(weather.get("wet", 0.0)))
	var vp := get_viewport()
	var cam := vp.get_camera_3d() if vp else null
	var fov := deg_to_rad(cam.fov) if cam else deg_to_rad(62.0)
	var h := float(vp.get_visible_rect().size.y) if vp else 720.0
	m.set_shader_parameter("uPixAng", fov / maxf(1.0, h))
	# the lights, fog and exposure (the colour script is display-space; Godot's light colours are linear)
	sun.look_at_from_position(Vector3.ZERO, -s["sunDir"], Vector3.UP if absf(s["sunDir"].y) < 0.99 else Vector3.FORWARD)
	sun.light_color = _c(L["sunC"])
	sun.light_energy = L["sunI"] if s["sunAlt"] > -1.0 else 0.0
	shine.look_at_from_position(Vector3.ZERO, -s["giantDir"], Vector3.UP)
	shine.light_color = _c(L["shineC"])
	shine.light_energy = L["shineI"]
	env.tonemap_exposure = L["exp"]
	env.fog_light_color = _c(L["fogC"])
	env.fog_density = L["fogD"] * 0.8326   # one exponential matched to three's squared one (stage.gd)
