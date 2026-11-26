# The Catch's own weather, in Godot: the layer core/atmos/fx/ is in the browser (ATMOS.airLoad, ATMOS.gale,
# ATMOS.dustSeason) and krator/atmos.gd is not. atmos.gd ports core/atmos's own state machine -- auto, clear, rain,
# storm, fog -- and this sits on top of it with the kinds this region needs and nothing else does:
#
#   clear             the default
#   dust              THE BLACK STORM: the Catch's spring karaburan (core/atmos/fx/89-atmos-fx-airload.js, written for
#                     this region by name, the owner 2026-10-26). Ochre-brown, the fog thickened, the sun dimmed, and
#                     THE WALLS GO FIRST -- which is the thing the page's own host said it was for.
#   gale              THE GOD-BORE: the SE outer wall's nocturnal katabatic, 80-130 km/h down the Godsgate. Wind, not
#                     murk: the air stays clear and everything that can move moves.
#   whiteout          the Godsgate's barometric whiteout and freezing rime fog, its winter window [300, 60]. White,
#                     near-opaque, and the one that hides a Stalker (core/region/53-region-ambush.js `hiddenIn`).
#   duststorm_season  ATMOS.dustSeason: the floor hazy for weeks rather than hours. Thin, flat, permanent.
#   deadheat          the Bowl's high summer, too hot to work (BOWL_TUNE.calendar.windows.deadheat): a shimmer and a
#                     bleached sky, no murk at all.
#   monsoon           Mantis's pocket, 1,553 mm on a hot-desert shore: the one wet place in the region.
#
# HOW IT DRAWS THEM, and what it does not do. Every kind here is a set of numbers on the WorldEnvironment's fog and the
# sun, plus atmos.gd's own wind scale and rain -- no new gdshader. That is deliberate for a first pass: it reads as the
# condition from inside it, costs nothing, and does not fork core/atmos's shaders before the region is even cut. What it
# therefore lacks, and what a later pass owes: the dust as particles riding the camera (krator/weather_fx.gd's rain box
# is the shape to copy), the spindrift of a gale, and the sky pass's own zenith and haze browning, which in the browser
# is 89y-host-storm.js. The visibility numbers are the real ones: KHAZ.sight's Koschmieder, so `visibility_km` here and
# core/hazard's agree.
class_name KratorAtmosFx
extends Node

signal changed(kind: String)

const KINDS := {
	# clear air over high desert: 200 km, which is what the Catch's own pages assume when they draw crests 240 km off
	# (biomes/catch's station 1 sees the Godthrone at 451 km). The first pass had 60 km here and the region was a flat
	# wash from any height worth flying at -- correctly, because these densities are the honest ones, but it made the
	# host useless for looking at the country. The weather kinds below keep their real, short visibilities.
	"clear": {
		"name": "Clear", "fog": 0.000015, "colour": Color(0.72, 0.66, 0.55), "sun": 1.0, "wind": 1.0,
		"rain": 0.0, "sky": 1.0, "visibility_km": 200.0, "hides": false,
	},
	"dust": {
		"name": "Black storm", "fog": 0.0024, "colour": Color(0.36, 0.26, 0.15), "sun": 0.22, "wind": 2.3,
		"rain": 0.0, "sky": 0.3, "visibility_km": 0.4, "hides": true,
	},
	"gale": {
		"name": "The God-Bore", "fog": 0.00012, "colour": Color(0.62, 0.60, 0.58), "sun": 0.85, "wind": 3.2,
		"rain": 0.0, "sky": 0.9, "visibility_km": 20.0, "hides": false,
	},
	"whiteout": {
		"name": "Rime whiteout", "fog": 0.0045, "colour": Color(0.88, 0.90, 0.92), "sun": 0.35, "wind": 2.0,
		"rain": 0.0, "sky": 0.6, "visibility_km": 0.15, "hides": true,
	},
	"duststorm_season": {
		"name": "Dust season", "fog": 0.00035, "colour": Color(0.58, 0.49, 0.35), "sun": 0.7, "wind": 1.3,
		"rain": 0.0, "sky": 0.7, "visibility_km": 8.0, "hides": false,
	},
	"deadheat": {
		"name": "Dead heat", "fog": 0.00009, "colour": Color(0.80, 0.78, 0.70), "sun": 1.25, "wind": 0.6,
		"rain": 0.0, "sky": 1.15, "visibility_km": 35.0, "hides": false,
	},
	"monsoon": {
		"name": "Mantis's monsoon", "fog": 0.0008, "colour": Color(0.50, 0.55, 0.55), "sun": 0.45, "wind": 1.8,
		"rain": 0.9, "sky": 0.5, "visibility_km": 2.0, "hides": false,
	},
}

const DUST_SLAB_SHADER := preload("res://shaders/dust_slab.gdshader")
const SLAB_FLOOR_RINGS := [0.0, 1500.0, 4500.0]

var kind := "clear"
var _kind := "clear"
var env: WorldEnvironment
var sun: DirectionalLight3D
var sky_host: Node = null
var host_ground: Node = null
var slab_quad: MeshInstance3D
var slab_mat: ShaderMaterial
var _floor_y := 0.0
var _floor_target := 0.0
var _floor_set := false
var _floor_cam := Vector3(1e12, 0.0, 1e12)
var _wind_off := Vector2.ZERO
var _sun0 := 1.0
var _blend := 1.0          # 0 just switched, 1 settled: the switch eases over `ease_s` seconds
var ease_s := 2.5
# a multiplier on every kind's fog, for a host that wants the country bare (catch_bowl.gd's --nofog). It is NOT a
# weather kind: the kinds keep their honest densities, and this only lets a viewer turn the air off to look at ground.
var fog_scale := 1.0
var _from := {}
# The clear sky this region draws when nothing is in the air: a high-desert zenith at 1.23 atm, which is darker and
# less blue than sea level, over a horizon already carrying the dust that never quite settles out of the Catch.
const SKY_TOP := Color(0.26, 0.42, 0.66)
const SKY_HORIZON := Color(0.68, 0.70, 0.70)
const GROUND_HORIZON := Color(0.62, 0.56, 0.46)
const GROUND_BOTTOM := Color(0.42, 0.36, 0.29)
# the fog density at which the sky has gone over entirely to the weather's own colour. 0.0008 is the monsoon's, so the
# black storm and the whiteout saturate well before it and the gale and the dust season sit part way up.
const SKY_MURK_FULL := 0.0008

# THE GRADE, per kind: contrast, saturation, brightness, and how warm the ramp runs.
#   [contrast, saturation, brightness, warmth]  warmth: 0 neutral, 1 shadows cool and highlights warm
const GRADE := {
	"clear": [1.14, 0.90, 1.0, 0.75],
	"dust": [0.92, 0.72, 1.02, 0.30],          # a storm flattens everything; the colour is the dust's, not the sun's
	"gale": [1.18, 0.86, 1.0, 0.60],           # clear air, hard light, the wind does not change what you see
	"whiteout": [0.80, 0.42, 1.05, 0.10],      # near-monochrome, which is what a whiteout is
	"duststorm_season": [1.02, 0.80, 1.0, 0.55],
	"deadheat": [1.22, 0.72, 1.04, 0.90],      # bleached and glaring: the saturation goes, the contrast stays
	"monsoon": [1.04, 0.95, 0.96, 0.15],       # the one wet kind: cooler, and the only one that gains saturation
}

# Height-bounded dust slab parameters per kind: [salt_dens (1/m), salt_h (m), storm_dens (1/m), storm_h (m), mie_w]
const SLAB := {
	"clear": [0.00008, 36.0, 0.0, 850.0, 0.45],
	"dust": [0.00085, 55.0, 0.0022, 850.0, 0.78],
	"gale": [0.00042, 65.0, 0.00004, 600.0, 0.55],
	"whiteout": [0.0, 40.0, 0.0, 600.0, 0.25],
	"duststorm_season": [0.00022, 45.0, 0.00038, 1250.0, 0.68],
	"deadheat": [0.00005, 32.0, 0.00004, 950.0, 0.55],
	"monsoon": [0.0, 35.0, 0.0, 700.0, 0.20],
}

# the order the panel shows them in: clear first, then the three the plans call hazards, then the seasons
static func order() -> Array:
	return ["clear", "dust", "gale", "whiteout", "duststorm_season", "deadheat", "monsoon"]


# Pure CPU twin of dust_slab.gdshader's ray-integrated exponential dust optical depth
static func slab_optical_depth(dens0: float, floor_y: float, scale_h: float, cam_y: float, hit_y: float, dist: float) -> float:
	if dens0 <= 1e-8 or dist <= 0.01:
		return 0.0
	var sh := maxf(scale_h, 1.0)
	var at_cam := exp(clampf((floor_y - cam_y) / sh, -28.0, 2.5))
	var t := clampf((hit_y - cam_y) / sh, -28.0, 28.0)
	var mean := (1.0 - exp(-t)) / t if absf(t) > 0.001 else (1.0 - 0.5 * t)
	return maxf(0.0, dens0 * at_cam * mean * dist)


func _ready() -> void:
	_from = KINDS["clear"].duplicate(true)
	var q := QuadMesh.new()
	q.size = Vector2(2.0, 2.0)
	slab_mat = ShaderMaterial.new()
	slab_mat.shader = DUST_SLAB_SHADER
	slab_mat.render_priority = 125
	slab_quad = MeshInstance3D.new()
	slab_quad.name = "DustSlab"
	slab_quad.mesh = q
	slab_quad.material_override = slab_mat
	slab_quad.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	slab_quad.custom_aabb = AABB(Vector3(-1e7, -1e7, -1e7), Vector3(2e7, 2e7, 2e7))
	slab_quad.layers = 1
	slab_quad.visible = false
	add_child(slab_quad)


func bind(e: WorldEnvironment, s: DirectionalLight3D, sk: Node = null, h_node: Node = null) -> void:
	env = e
	sun = s
	sky_host = sk
	host_ground = h_node
	if sun:
		_sun0 = maxf(sun.light_energy, 1.0)
	_apply(1.0)


# set_kind("dust"); unknown kinds are ignored rather than crashing a host mid-flight
func set_kind(k: String) -> void:
	if not KINDS.has(k) or k == kind:
		return
	_from = _now()
	_from["_kind"] = kind
	kind = k
	_kind = k
	_blend = 0.0
	var A := get_node_or_null("/root/Atmos")
	if A:
		# the base machine keeps its own modes; the monsoon is its `rain` and everything else is handled here
		A.set_weather("rain" if k == "monsoon" else "clear")
	changed.emit(k)


func row() -> Dictionary:
	return KINDS.get(kind, KINDS["clear"])


# what the condition looks like right now, mid-ease: the numbers a readout or a test should take
func _now() -> Dictionary:
	var a: Dictionary = _from
	var b: Dictionary = KINDS.get(kind, KINDS["clear"])
	var t: float = clampf(_blend, 0.0, 1.0)
	var sa: Array = SLAB.get(String(a.get("_kind", kind)), SLAB["clear"])
	var sb: Array = SLAB.get(kind, SLAB["clear"])
	return {
		"fog": lerpf(float(a.get("fog", 0.0)), float(b["fog"]), t),
		"colour": Color(a.get("colour", Color.WHITE)).lerp(b["colour"], t),
		"sun": lerpf(float(a.get("sun", 1.0)), float(b["sun"]), t),
		"wind": lerpf(float(a.get("wind", 1.0)), float(b["wind"]), t),
		"rain": lerpf(float(a.get("rain", 0.0)), float(b["rain"]), t),
		"sky": lerpf(float(a.get("sky", 1.0)), float(b["sky"]), t),
		"visibility_km": lerpf(float(a.get("visibility_km", 60.0)), float(b["visibility_km"]), t),
		"hides": bool(b.get("hides", false)),
		"name": String(b.get("name", kind)),
		"salt_dens": lerpf(float(sa[0]), float(sb[0]), t),
		"salt_h": lerpf(float(sa[1]), float(sb[1]), t),
		"storm_dens": lerpf(float(sa[2]), float(sb[2]), t),
		"storm_h": lerpf(float(sa[3]), float(sb[3]), t),
		"mie_w": lerpf(float(sa[4]), float(sb[4]), t),
	}


func _sample_basin_floor(at: Vector3) -> float:
	if host_ground == null or not host_ground.has_method("height_at"):
		return 0.0
	var lo := INF
	for ri in SLAB_FLOOR_RINGS.size():
		var r: float = SLAB_FLOOR_RINGS[ri]
		var cnt := 1 if r == 0.0 else 8
		for k in cnt:
			var ang := TAU * float(k) / float(cnt) + 0.35 * float(ri)
			var h: float = host_ground.height_at(at.x + cos(ang) * r, at.z + sin(ang) * r)
			if is_finite(h):
				lo = minf(lo, h)
	return lo if is_finite(lo) else 0.0


func _process(delta: float) -> void:
	if _blend < 1.0:
		_blend = minf(1.0, _blend + delta / maxf(0.01, ease_s))
	var A := get_node_or_null("/root/Atmos")
	var w_vec: Vector2 = A.wind_now() if (A and A.has_method("wind_now")) else Vector2(0.80, -0.60)
	_wind_off += w_vec * delta
	var vp := get_viewport()
	var cam := vp.get_camera_3d() if vp else null
	if cam != null and host_ground != null:
		var cp := cam.global_position
		if not _floor_set or Vector2(cp.x - _floor_cam.x, cp.z - _floor_cam.z).length() > 800.0:
			_floor_cam = cp
			_floor_target = _sample_basin_floor(cp)
			if not _floor_set:
				_floor_y = _floor_target
				_floor_set = true
		_floor_y = lerpf(_floor_y, _floor_target, clampf(delta * 0.8, 0.0, 1.0))
	_apply(_blend)


func _apply(_t: float) -> void:
	var n := _now()
	var vp := get_viewport()
	var cam := vp.get_camera_3d() if vp else null
	var cam_y := cam.global_position.y if cam else 0.0
	# When the dust slab carries the basin-floor karaburan, thin uniform Environment fog above the ceiling so high walls stand clear
	var is_dust_slab := slab_quad != null and host_ground != null and (float(n["storm_dens"]) > 1e-6 or float(n["salt_dens"]) > 1e-6)
	var high_relief := exp(-maxf(0.0, cam_y - (_floor_y + float(n["storm_h"]) * 1.4)) / 2400.0) if (is_dust_slab and kind in ["dust", "duststorm_season"]) else 1.0

	if env and env.environment:
		var e := env.environment
		e.fog_enabled = fog_scale > 0.0
		var base_fog_scale := 0.35 * high_relief if (is_dust_slab and kind in ["dust", "duststorm_season"]) else 1.0
		e.fog_density = float(n["fog"]) * fog_scale * base_fog_scale
		e.fog_light_color = n["colour"]
		e.fog_sky_affect = (1.0 - float(n["sky"]) * 0.5) if sky_host == null else 0.0
		e.fog_aerial_perspective = 1.0
		if sky_host == null:
			e.ambient_light_energy = float(n["sky"])
			e.ambient_light_color = Color(0.62, 0.66, 0.74).lerp(n["colour"], 0.6)
		else:
			e.ambient_light_energy = clampf(0.55 + 0.45 * float(n["sky"]), 0.35, 1.15)
		_paint_sky(e, n)
		_grade(e)
	if sun and sky_host == null:
		sun.light_energy = _sun0 * float(n["sun"])
		sun.light_color = Color(1.0, 1.0, 1.0).lerp(n["colour"], 0.55 * (1.0 - float(n["sun"])))

	# Update height-bounded dust slab post-pass
	if slab_quad != null:
		var s_dens := float(n["salt_dens"]) * fog_scale * (1.0 if _floor_y < 2600.0 else 0.0)
		var st_dens := float(n["storm_dens"]) * fog_scale
		var show_slab := fog_scale > 0.0 and host_ground != null and (s_dens > 1e-7 or st_dens > 1e-7)
		slab_quad.visible = show_slab
		if show_slab:
			slab_mat.set_shader_parameter("salt_slab", Vector4(s_dens, _floor_y, float(n["salt_h"]), 0.38))
			slab_mat.set_shader_parameter("storm_slab", Vector4(st_dens, _floor_y, float(n["storm_h"]), 0.96))
			slab_mat.set_shader_parameter("dust_colour", n["colour"])
			var sdir := sun.global_transform.basis.z.normalized() if sun != null else Vector3(0.51, 0.56, 0.65)
			slab_mat.set_shader_parameter("sun_scatter", Vector4(sdir.x, sdir.y, sdir.z, float(n["mie_w"])))
			slab_mat.set_shader_parameter("sun_colour", sun.light_color if sun != null else Color(1.0, 0.88, 0.68))
			slab_mat.set_shader_parameter("wind_offset", _wind_off)

	var A := get_node_or_null("/root/Atmos")
	var w_vec := Vector2(0.80, -0.60)
	if A:
		A.wind_scale = float(n["wind"])
		A.rain = float(n["rain"])
		A.fog = clampf(float(n["fog"]) / 0.0045, 0.0, 1.0)
		if A.has_method("wind_now"):
			w_vec = A.wind_now()
	# Sync arid surface weathering (sand skirts, dust pockets, desert varnish; wet darkening in monsoon)
	var wet_now := clampf(float(n["rain"]) * 0.85, 0.0, 1.0)
	var arid_now := clampf(1.0 - float(n["rain"]) * 0.85 - (0.5 if kind == "whiteout" else 0.0), 0.0, 1.0)
	KratorWeather.set_climate(1.0, wet_now, arid_now, w_vec)


# THE SKY'S OWN BROWNING: supports both KratorSky (sky.gd + sky.gdshader, keeping the gas giant, rings, 6 moons & cloud
# shadows while 89y-host-storm.js browns the horizon walls first) AND ProceduralSkyMaterial fallback.
func _paint_sky(e: Environment, n: Dictionary) -> void:
	var c: Color = n["colour"]
	var murk: float = clampf(float(n["fog"]) / SKY_MURK_FULL, 0.0, 1.0)
	var lit: float = maxf(clampf(float(n["sky"]), 0.0, 2.0), 0.6)
	if sky_host != null and "storm_murk" in sky_host:
		sky_host.storm_murk = murk
		sky_host.storm_colour = c
		sky_host.storm_sun_dim = float(n["sun"])
		sky_host.storm_sky_lit = lit
		if sky_host.has_method("_update"):
			sky_host._update()
		# Preserve KratorAtmosFx's fog settings after sky_host._update() writes standard sky fog
		var high_k := 0.35 if (slab_quad != null and slab_quad.visible and kind in ["dust", "duststorm_season"]) else 1.0
		e.fog_enabled = fog_scale > 0.0
		e.fog_density = float(n["fog"]) * fog_scale * high_k
		e.fog_light_color = c
		e.fog_sky_affect = 0.0
		e.fog_aerial_perspective = 1.0
		return
	var sky: Sky = e.sky
	if sky == null or not (sky.sky_material is ProceduralSkyMaterial):
		return
	var m: ProceduralSkyMaterial = sky.sky_material
	m.sky_top_color = SKY_TOP.lerp(c, murk) * lit
	m.sky_horizon_color = SKY_HORIZON.lerp(c, minf(1.0, murk * 1.6)) * lit
	m.ground_horizon_color = GROUND_HORIZON.lerp(c, minf(1.0, murk * 1.6)) * lit
	m.ground_bottom_color = GROUND_BOTTOM.lerp(c, murk) * lit
	m.sun_angle_max = lerpf(1.2, 18.0, murk)
	m.sun_curve = lerpf(0.12, 0.6, murk)


# The colour grade. Godot's adjustments take a 1D ramp for colour correction, so the warmth is a ramp built once:
# dark end a little cool, bright end a little warm, which is the oldest trick in outdoor grading and still the one
# that makes sun read as sun. The three scalars ease with the weather like everything else.
var _ramp: GradientTexture1D
var _ramp_warm := -1.0


func _grade(e: Environment) -> void:
	var a: Array = GRADE.get(kind, GRADE["clear"])
	var b: Array = GRADE.get(String(_from.get("_kind", kind)), a)
	var t: float = clampf(_blend, 0.0, 1.0)
	e.adjustment_enabled = true
	e.adjustment_contrast = lerpf(float(b[0]), float(a[0]), t)
	e.adjustment_saturation = lerpf(float(b[1]), float(a[1]), t)
	e.adjustment_brightness = lerpf(float(b[2]), float(a[2]), t)
	var warm: float = lerpf(float(b[3]), float(a[3]), t)
	if absf(warm - _ramp_warm) > 0.02 or _ramp == null:
		_ramp_warm = warm
		var gr := Gradient.new()
		# A CURVE, NOT A MULTIPLIER. adjustment_color_correction maps input to output per channel, so the ramp has
		# to run from black to white with the tint carried along it. The first pass set both ends near 1.0 -- a
		# multiplier's idea of neutral -- which mapped every input to white and the whole region rendered blown out.
		gr.set_color(0, Color(0.0, 0.012 * warm, 0.045 * warm))                           # shadows toward blue
		gr.set_color(1, Color(1.0, 1.0 - 0.035 * warm, 1.0 - 0.10 * warm))                # highlights toward amber
		_ramp = GradientTexture1D.new()
		_ramp.gradient = gr
		_ramp.width = 256
	e.adjustment_color_correction = _ramp
