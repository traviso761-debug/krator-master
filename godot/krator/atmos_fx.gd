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

var kind := "clear"
var env: WorldEnvironment
var sun: DirectionalLight3D
var _sun0 := 1.0
var _blend := 1.0          # 0 just switched, 1 settled: the switch eases over `ease_s` seconds
var ease_s := 2.5
# a multiplier on every kind's fog, for a host that wants the country bare (catch_bowl.gd's --nofog). It is NOT a
# weather kind: the kinds keep their honest densities, and this only lets a viewer turn the air off to look at ground.
var fog_scale := 1.0
var _from := {}

# the order the panel shows them in: clear first, then the three the plans call hazards, then the seasons
static func order() -> Array:
	return ["clear", "dust", "gale", "whiteout", "duststorm_season", "deadheat", "monsoon"]


func _ready() -> void:
	_from = KINDS["clear"].duplicate(true)


func bind(e: WorldEnvironment, s: DirectionalLight3D) -> void:
	env = e
	sun = s
	if sun:
		_sun0 = sun.light_energy
	_apply(1.0)


# set_kind("dust"); unknown kinds are ignored rather than crashing a host mid-flight
func set_kind(k: String) -> void:
	if not KINDS.has(k) or k == kind:
		return
	_from = _now()
	kind = k
	_blend = 0.0
	if Engine.has_singleton("Atmos"):
		pass
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
	}


func _process(delta: float) -> void:
	if _blend < 1.0:
		_blend = minf(1.0, _blend + delta / maxf(0.01, ease_s))
	_apply(_blend)


func _apply(_t: float) -> void:
	var n := _now()
	if env and env.environment:
		var e := env.environment
		e.fog_enabled = fog_scale > 0.0
		e.fog_density = float(n["fog"]) * fog_scale
		e.fog_light_color = n["colour"]
		e.fog_sky_affect = 1.0 - float(n["sky"]) * 0.5
		e.ambient_light_energy = float(n["sky"])
	if sun:
		sun.light_energy = _sun0 * float(n["sun"])
		sun.light_color = Color(1.0, 1.0, 1.0).lerp(n["colour"], 0.55 * (1.0 - float(n["sun"])))
	var A := get_node_or_null("/root/Atmos")
	if A:
		A.wind_scale = float(n["wind"])
		A.rain = float(n["rain"])
		A.fog = clampf(float(n["fog"]) / 0.0045, 0.0, 1.0)
