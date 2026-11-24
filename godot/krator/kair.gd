# The air (GODOT-LOOK-PLAN.md section 7, F1 to F6): what lies between the camera and what it looks at, in layers.
#   F1 aerial perspective   far things take the sky's colour behind them (Environment.fog_aerial_perspective; the look sets it)
#   F2 valley mist          an exponential layer over the floor of the country round the camera, integrated along the view
#                           ray (shaders/air_mist.gdshader): the engine's own height fog is a function of height alone
#   F3 volumetric fog       shafts and glow within a few hundred metres (high tier), its density and the sun's share of it
#                           by the hour
#   F4 fog volumes          mist over still water and along streams, spray at falls, steam at vents: FogVolume nodes from
#                           the records a place already has, a pool of them round the camera (with volumetric fog)
#   F5 particles            steam at vents, spray at falls, leaves coming down among trees: GPUParticles3D, counts by tier
#   F6 wetness              one number for the weathering stack (k_weather.y) and the ground (atm_wet)
# The hour and the weather set the amounts through keys() below, a table that lives here and not in the colour script:
# krator/sky_model.gd is core/atmos's port and stays line for line with it.
# A host makes one (KratorAir.make), adds it beside its sky, and calls update() each frame after the sky's own update,
# which writes the distance fog this adds to. Everything here is off in the legacy tier and behind a switch (krator/look.gd).
class_name KratorAir
extends Node3D

const MIST_SHADER := preload("res://shaders/air_mist.gdshader")
const FLOOR_RINGS := [0.0, 400.0, 1200.0]   # metres: where the country's floor is looked for
const SOURCE_EVERY := 0.5                    # seconds between looks at which sources are near
const STREAM_STEP := 70.0                    # metres between mist volumes along a stream

var spec := {}
var mist_quad: MeshInstance3D
var mist_mat: ShaderMaterial
var now := {}                # the keys in force (keys())
var floor_y := 0.0           # the floor of the country round the camera, region metres
var _floor_set := false
var _floor_at := Vector3(1e12, 0.0, 1e12)
var sources: Array = []      # [{kind, at (region metres), r, h}] from the places that are open
var _sources_key := ""
var _pool: Array[FogVolume] = []
var _emitters := {}          # source index -> GPUParticles3D
var _leaves: GPUParticles3D
var _noise: NoiseTexture3D
var _since := 1e9
var stats := {"volumes": 0, "emitters": 0, "sources": 0, "leaves": 0}
var indoors := false         # the host says when the camera is inside a building: the mist stays outside
var _open := 1.0             # 1 outdoors, 0 indoors, eased
var wet := 0.0               # F6: how wet the world is, 0..1 (the larger of the look's and the weather's)


static func make(spec_: Dictionary) -> KratorAir:
	var a := KratorAir.new()
	a.name = "Air"
	a.spec = spec_
	return a


func _init() -> void:
	var q := QuadMesh.new()
	q.size = Vector2(2.0, 2.0)
	mist_mat = ShaderMaterial.new()
	mist_mat.shader = MIST_SHADER
	mist_mat.render_priority = 127   # after the water and everything else that blends
	mist_quad = MeshInstance3D.new()
	mist_quad.name = "Mist"
	mist_quad.mesh = q
	mist_quad.material_override = mist_mat
	mist_quad.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	mist_quad.custom_aabb = AABB(Vector3(-1e7, -1e7, -1e7), Vector3(2e7, 2e7, 2e7))   # never culled: its vertices are the screen's corners
	mist_quad.layers = 1
	mist_quad.visible = false
	add_child(mist_quad)


static func _ss(a: float, b: float, x: float) -> float:
	return smoothstep(a, b, x)


# The air's amounts by the sun and the weather. sun_alt in degrees; hour 0..24; weather {fog, rain, wet} each 0..1.
#   mist            0..1: the dawn's (the sun within a few degrees of the horizon before noon), less at dusk, a little
#                   through the night, none by day; the weather's fog and a wet world add to it
#   mist_density    1/m at the floor; mist_scale the layer's scale height, m
#   vfog_density    the volumetric fog's, 1/m; vfog_sun the sun's light_volumetric_fog_energy (shafts want a low sun)
#   volumes         0..1: how dense the mist over water stands
static func keys(sun_alt: float, hour: float, weather := {}, spec_ := {}) -> Dictionary:
	var morning := hour < 12.0
	var low := (1.0 - _ss(4.0, 18.0 if morning else 12.0, sun_alt)) * _ss(-14.0, -4.0, sun_alt)   # the sun low, and up or nearly
	var night := 1.0 - _ss(-14.0, -4.0, sun_alt)
	var fog_w := clampf(float(weather.get("fog", 0.0)), 0.0, 1.0)
	var wet := clampf(float(weather.get("wet", 0.0)), 0.0, 1.0)
	var rain := clampf(float(weather.get("rain", 0.0)), 0.0, 1.0)
	var k := clampf(float(spec_.get("mist", 1.0)), 0.0, 2.0)
	var mist := clampf(((1.0 if morning else 0.5) * low + 0.28 * night + 0.9 * fog_w + 0.3 * wet * (1.0 - rain)) * k, 0.0, 1.0)
	var vd := float(spec_.get("vfog_density", 0.0006))
	return {"mist": mist, "low": low, "night": night,
		"mist_density": 0.0045 * mist,
		"mist_scale": lerpf(60.0, 38.0, low),
		"mist_max": 0.94,
		"mist_sun": 0.4 * low,
		"vfog_density": vd * (0.2 + 1.9 * mist + 0.8 * rain),   # by day a thin veil: the frame past the fog's reach takes all of it
		"vfog_sun": float(spec_.get("vfog_sun_energy", 1.0)) * (2.6 + 1.0 * low),   # thin air, bright shafts
		"volumes": clampf(0.2 + 0.8 * mist + 0.3 * wet, 0.0, 1.0)}


# the lowest ground round a point: where mist lies. NAN where the stream has no ground at all.
static func floor_near(stream: Node, at: Vector3) -> float:
	var lo := INF
	for ri in FLOOR_RINGS.size():
		var r: float = FLOOR_RINGS[ri]
		var n := 1 if r == 0.0 else 8
		for k in n:
			var a := TAU * float(k) / float(n) + 0.4 * float(ri)
			var h: float = stream.height_at(at.x + cos(a) * r, at.z + sin(a) * r)
			if is_finite(h):
				lo = minf(lo, h)
	return lo if is_finite(lo) else NAN


# Every frame, after the sky has set the distance fog. sky_state is KratorSky.state (sunAlt, sunDir); cam_region the
# camera in region metres; stream a KratorWorldStream or null (then the floor is floor_fallback, this scene's y).
func update(env: Environment, sun_light: DirectionalLight3D, sky_state: Dictionary, hour: float, weather: Dictionary, stream: Node, cam_region: Vector3, dt: float, floor_fallback := 0.0) -> void:
	now = keys(float(sky_state.get("sunAlt", 45.0)), hour, weather, spec)
	_open = move_toward(_open, 0.0 if indoors else 1.0, clampf(dt * 1.5, 0.0, 1.0))
	# F6: one number for the weathering stack and the ground; reflections of what stands by the water where the tier has them
	wet = clampf(maxf(float(spec.get("wet", 0.0)), float(weather.get("wet", 0.0))), 0.0, 1.0)
	KratorWeather.set_wet(float(spec.get("weather", 0.0)), wet)
	RenderingServer.global_shader_parameter_set("atm_wet", wet)
	env.ssr_enabled = bool(spec.get("ssr", false)) and wet > 0.05
	var origin_y := 0.0
	if stream != null:
		origin_y = float(stream.origin[1])
		if not _floor_set or Vector2(cam_region.x - _floor_at.x, cam_region.z - _floor_at.z).length() > 60.0:
			var f := floor_near(stream, cam_region)
			if is_finite(f):
				_floor_at = cam_region
				_floor_target = f
				if not _floor_set:
					floor_y = f
					_floor_set = true
		floor_y = lerpf(floor_y, _floor_target, clampf(dt * 0.5, 0.0, 1.0))
	else:
		floor_y = floor_fallback
	# F2
	var mist_on := float(now["mist_density"]) * _open > 1e-6
	mist_quad.visible = mist_on
	if mist_on:
		mist_mat.set_shader_parameter("mist", Vector4(float(now["mist_density"]) * _open, floor_y - origin_y, float(now["mist_scale"]), float(now["mist_max"])))
		mist_mat.set_shader_parameter("mist_colour", env.fog_light_color)
		var sd: Vector3 = sky_state.get("sunDir", Vector3.UP)
		mist_mat.set_shader_parameter("sun", Vector4(sd.x, sd.y, sd.z, float(now["mist_sun"])))
		mist_mat.set_shader_parameter("sun_colour", sun_light.light_color if sun_light != null else Color(1, 1, 1))
	# F3: the volumetric fog's amounts by the hour (the look turned it on or left it off)
	if env.volumetric_fog_enabled:
		env.volumetric_fog_density = float(now["vfog_density"])
		if sun_light != null:
			sun_light.light_volumetric_fog_energy = float(now["vfog_sun"])
	# F4, F5
	_since += dt
	if _since >= SOURCE_EVERY:
		_since = 0.0
		_place(env, stream, cam_region)


var _floor_target := 0.0


# ---- F4, F5: sources ----------------------------------------------------------------------------------------------------

# What gives off mist, spray or steam in the places that are open: still water, streams, falls, vents. A record each:
# {kind: "still" | "stream" | "fall" | "vent", at: region metres, r: radius, h: height}. Read from the water the importer
# drew (krator/water_import.gd: each surface's meta "krator" names its kind) and the case's vents.
static func sources_of(stream: Node) -> Array:
	var out := []
	if stream == null:
		return out
	for v in stream.index.get("vents", []):
		if v is Array and (v as Array).size() >= 2:
			var x := float(v[0])
			var z := float(v[1])
			var h: float = stream.height_at(x, z)
			if is_finite(h):
				out.append({"kind": "vent", "at": Vector3(x, h, z), "r": clampf(float(v[2]) * 0.06 if (v as Array).size() > 2 else 12.0, 8.0, 40.0), "h": 60.0})
	var org := Vector3(float(stream.origin[0]), float(stream.origin[1]), float(stream.origin[2]))
	for wn in stream.find_children("Water", "Node3D", true, false):
		for mi in wn.find_children("*", "MeshInstance3D", true, false):
			var kr = mi.get_meta("krator", null)
			if not (kr is Dictionary) or (mi as MeshInstance3D).mesh == null:
				continue
			var kind := str((kr as Dictionary).get("kind", ""))
			var xf: Transform3D = (mi as MeshInstance3D).global_transform if (mi as Node3D).is_inside_tree() else (mi as Node3D).transform
			var box: AABB = xf * (mi as MeshInstance3D).mesh.get_aabb()
			var c := box.get_center() + org
			if kind == "still":
				var r := 0.5 * maxf(box.size.x, box.size.z)
				if r >= 3.0:
					out.append({"kind": "still", "at": Vector3(c.x, box.end.y + org.y, c.z), "r": minf(r, 90.0), "h": 3.0})
			elif kind == "fall" or kind == "plunge":
				out.append({"kind": "fall", "at": Vector3(c.x, box.position.y + org.y, c.z), "r": clampf(0.6 * maxf(box.size.x, box.size.z), 4.0, 30.0), "h": clampf(box.size.y, 6.0, 40.0)})
			elif kind == "flow":
				for p in _along((mi as MeshInstance3D).mesh, STREAM_STEP):
					var q: Vector3 = xf * p + org
					out.append({"kind": "stream", "at": q, "r": STREAM_STEP * 0.6, "h": 2.5})
	return out


# points along a ribbon mesh no closer together than `step` (its vertices run down the ribbon row by row)
static func _along(mesh: Mesh, step: float) -> PackedVector3Array:
	var out := PackedVector3Array()
	if mesh.get_surface_count() == 0:
		return out
	var verts: PackedVector3Array = mesh.surface_get_arrays(0)[Mesh.ARRAY_VERTEX]
	var last := Vector3(INF, INF, INF)
	var s2 := step * step
	for i in range(0, verts.size(), 4):
		if out.is_empty() or verts[i].distance_squared_to(last) >= s2:
			last = verts[i]
			out.append(last)
	return out


func _ensure_noise() -> void:
	if _noise != null:
		return
	var fn := FastNoiseLite.new()
	fn.noise_type = FastNoiseLite.TYPE_SIMPLEX_SMOOTH
	fn.frequency = 0.06
	fn.fractal_octaves = 3
	fn.seed = 4127
	_noise = NoiseTexture3D.new()
	_noise.width = 32
	_noise.height = 32
	_noise.depth = 32
	_noise.seamless = true
	_noise.noise = fn


# the pool of fog volumes and emitters on the sources nearest the camera
func _place(env: Environment, stream: Node, cam_region: Vector3) -> void:
	if stream == null:
		return
	var key := ",".join(PackedStringArray(stream.places_open.keys()))
	if key != _sources_key:
		_sources_key = key
		sources = sources_of(stream)
		for e in _emitters.values():
			(e as Node).queue_free()
		_emitters = {}
	stats["sources"] = sources.size()
	var reach := float(spec.get("vfog_length", 200.0)) + 60.0
	var near := []
	for i in sources.size():
		var s: Dictionary = sources[i]
		var d := (s["at"] as Vector3).distance_to(cam_region) - float(s["r"])
		if d < reach:
			near.append([d, i])
	near.sort_custom(func(a, b): return a[0] < b[0])
	# F4: volumes, only where the froxels are
	var want_vol := env != null and env.volumetric_fog_enabled and bool(spec.get("fog_volumes", true))
	var n_vol := mini(near.size(), int(spec.get("fog_volume_max", 16))) if want_vol else 0
	if n_vol > 0:
		_ensure_noise()
	while _pool.size() < n_vol:
		var fv := FogVolume.new()
		fv.shape = RenderingServer.FOG_VOLUME_SHAPE_ELLIPSOID
		var fm := FogMaterial.new()
		fm.density_texture = _noise
		fm.edge_fade = 0.6
		fv.material = fm
		add_child(fv)
		_pool.append(fv)
	var vk := float(now.get("volumes", 0.5))
	for j in _pool.size():
		var fv := _pool[j]
		fv.visible = j < n_vol
		if j >= n_vol:
			continue
		var s: Dictionary = sources[near[j][1]]
		var kind := str(s["kind"])
		var r := float(s["r"])
		var h := float(s["h"])
		var fm := fv.material as FogMaterial
		var at: Vector3 = s["at"]
		fv.position = stream.local(at.x, at.y + h * (0.5 if kind != "vent" else 0.45), at.z)
		fv.size = Vector3(r * 2.0, h * (1.0 if kind == "vent" else 2.0), r * 2.0)
		if kind == "vent":      # steam: always there, whiter than the air
			fm.density = 0.5
			fm.albedo = Color(0.95, 0.95, 0.95)
			fm.height_falloff = 0.0
		elif kind == "fall":    # spray
			fm.density = 0.25 + 0.2 * vk
			fm.albedo = Color(0.92, 0.94, 0.96)
			fm.height_falloff = 0.4
		else:                   # mist on water: by the hour
			fm.density = (0.16 if kind == "still" else 0.1) * vk
			fm.albedo = Color(0.9, 0.92, 0.95)
			fm.height_falloff = 1.2
	stats["volumes"] = n_vol
	# F5: emitters at vents and falls
	var n_em := 0
	var em_max := int(spec.get("emitters", 0))
	var keep := {}
	for e in near:
		var si: int = e[1]
		var s: Dictionary = sources[si]
		if n_em >= em_max or not (str(s["kind"]) in ["vent", "fall"]):
			continue
		n_em += 1
		keep[si] = true
		if not _emitters.has(si):
			_emitters[si] = _emitter(str(s["kind"]), float(s["r"]), float(s["h"]))
			add_child(_emitters[si])
		var at: Vector3 = s["at"]
		(_emitters[si] as Node3D).position = stream.local(at.x, at.y, at.z)
	for si in _emitters.keys():
		if not keep.has(si):
			(_emitters[si] as Node).queue_free()
			_emitters.erase(si)
	stats["emitters"] = _emitters.size()
	# F5: leaves coming down, where the camera is among trees
	var leaf_n := int(spec.get("leaves", 0))
	var among := leaf_n > 0 and stream.has_method("flora_near") and float(stream.flora_near(cam_region)) > 0.0
	if among and _leaves == null:
		_leaves = _leaf_fall(leaf_n)
		add_child(_leaves)
	if _leaves != null:
		_leaves.emitting = among
		_leaves.position = stream.local(cam_region.x, cam_region.y + 9.0, cam_region.z)
	stats["leaves"] = leaf_n if among else 0


static func _soft_card() -> ImageTexture:
	var n := 64
	var img := Image.create(n, n, false, Image.FORMAT_RGBA8)
	for y in n:
		for x in n:
			var d := Vector2(x + 0.5 - n * 0.5, y + 0.5 - n * 0.5).length() / (n * 0.5)
			var a := clampf(1.0 - d, 0.0, 1.0)
			img.set_pixel(x, y, Color(1, 1, 1, a * a * (3.0 - 2.0 * a)))
	img.generate_mipmaps()
	return ImageTexture.create_from_image(img)


static var _card: ImageTexture


# a plume of steam (a vent) or a curtain of spray (a fall's foot): soft cards that rise, spread and thin
func _emitter(kind: String, r: float, h: float) -> GPUParticles3D:
	if _card == null:
		_card = _soft_card()
	var p := GPUParticles3D.new()
	var vent := kind == "vent"
	p.amount = int(spec.get("emitter_amount", 48))
	p.lifetime = 9.0 if vent else 2.6
	p.preprocess = p.lifetime
	p.randomness = 0.6
	p.local_coords = false
	p.visibility_aabb = AABB(Vector3(-r * 3.0, -4.0, -r * 3.0), Vector3(r * 6.0, h * 1.6 + 8.0, r * 6.0))
	p.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	var pm := ParticleProcessMaterial.new()
	pm.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
	pm.emission_sphere_radius = r * (0.35 if vent else 0.8)
	pm.direction = Vector3(0.25, 1.0, 0.1) if vent else Vector3(0.0, 1.0, 0.0)
	pm.spread = 14.0 if vent else 70.0
	pm.initial_velocity_min = (h / 11.0) if vent else 1.2
	pm.initial_velocity_max = (h / 7.0) if vent else 3.4
	pm.gravity = Vector3(0.6, 0.35, 0.2) if vent else Vector3(0.0, -2.2, 0.0)
	pm.damping_min = 0.15
	pm.damping_max = 0.4
	pm.scale_min = r * (0.5 if vent else 0.35)
	pm.scale_max = r * (1.1 if vent else 0.8)
	var grow := Curve.new()
	grow.add_point(Vector2(0.0, 0.35))
	grow.add_point(Vector2(1.0, 1.9 if vent else 1.3))
	var gt := CurveTexture.new()
	gt.curve = grow
	pm.scale_curve = gt
	var fade := Gradient.new()
	fade.set_color(0, Color(1, 1, 1, 0.0))
	fade.add_point(0.15, Color(1, 1, 1, 0.5 if vent else 0.36))
	fade.set_color(fade.get_point_count() - 1, Color(1, 1, 1, 0.0))
	var ft := GradientTexture1D.new()
	ft.gradient = fade
	pm.color_ramp = ft
	p.process_material = pm
	var q := QuadMesh.new()
	q.size = Vector2(1.0, 1.0)
	var m := StandardMaterial3D.new()
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.shading_mode = BaseMaterial3D.SHADING_MODE_PER_PIXEL
	m.diffuse_mode = BaseMaterial3D.DIFFUSE_LAMBERT_WRAP
	m.albedo_texture = _card
	m.albedo_color = Color(0.93, 0.94, 0.96, 0.55)
	m.vertex_color_use_as_albedo = true
	m.billboard_mode = BaseMaterial3D.BILLBOARD_PARTICLES
	m.billboard_keep_scale = true
	m.cull_mode = BaseMaterial3D.CULL_DISABLED
	m.disable_receive_shadows = false
	m.proximity_fade_enabled = true
	m.proximity_fade_distance = 1.5
	m.distance_fade_mode = BaseMaterial3D.DISTANCE_FADE_PIXEL_ALPHA
	m.distance_fade_min_distance = 0.5
	m.distance_fade_max_distance = 3.0
	q.material = m
	p.draw_pass_1 = q
	return p


# leaves coming down through a box that rides the camera
func _leaf_fall(amount: int) -> GPUParticles3D:
	var p := GPUParticles3D.new()
	p.name = "Leaves"
	p.amount = amount
	p.lifetime = 9.0
	p.preprocess = 9.0
	p.randomness = 1.0
	p.local_coords = false
	p.visibility_aabb = AABB(Vector3(-30, -30, -30), Vector3(60, 45, 60))
	p.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	var pm := ParticleProcessMaterial.new()
	pm.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	pm.emission_box_extents = Vector3(24.0, 2.0, 24.0)
	pm.direction = Vector3(0.3, -1.0, 0.1)
	pm.spread = 25.0
	pm.initial_velocity_min = 0.5
	pm.initial_velocity_max = 1.4
	pm.gravity = Vector3(0.5, -0.9, 0.2)
	pm.angular_velocity_min = -160.0
	pm.angular_velocity_max = 160.0
	pm.angle_min = 0.0
	pm.angle_max = 360.0
	pm.turbulence_enabled = true
	pm.turbulence_noise_strength = 0.6
	pm.turbulence_noise_scale = 3.0
	pm.scale_min = 0.6
	pm.scale_max = 1.3
	var tint := Gradient.new()
	tint.set_color(0, Color(0.42, 0.36, 0.12))
	tint.set_color(tint.get_point_count() - 1, Color(0.30, 0.20, 0.08))
	var tt := GradientTexture1D.new()
	tt.gradient = tint
	pm.color_initial_ramp = tt
	p.process_material = pm
	var q := QuadMesh.new()
	q.size = Vector2(0.07, 0.045)
	var m := StandardMaterial3D.new()
	m.cull_mode = BaseMaterial3D.CULL_DISABLED
	m.vertex_color_use_as_albedo = true
	m.roughness = 0.8
	m.backlight_enabled = true
	m.backlight = Color(0.25, 0.22, 0.08)
	q.material = m
	p.draw_pass_1 = q
	return p
