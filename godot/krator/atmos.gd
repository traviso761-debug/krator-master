# The Atmos autoload (core/atmos/GODOT.md): the CPU side of core/atmos (the module clock, night(), the veering
# wind) setting the global shader parameters every frame. A port of 89-atmos-0-core.js's tick; the weather state
# machine (89-atmos-4-weather.js) is not ported yet: rain, fog and flash stay where set.
# With no presets loaded (a biome tile) it runs on the defaults below, which are core/atmos's own.
extends Node

var t := 0.0              # the module clock, seconds (A.clock.t); not the wall clock
var scale := 1.0          # A.clock.scale
var hour := 12.0          # world time, 0..24 (the host's clock)
var hour_rate := 0.0      # hours per real second; 0 holds the hour
var paused := false
var rain := 0.0
var fog := 0.0
var flash := 0.0
var wind_scale := 1.0     # A.windScale (the weather raises it)
var wind_off := Vector2.ZERO
var sun_dir := Vector3(0.45, 0.72, -0.52)

# presets.clock and presets.wind, as core/atmos ships them (89-atmos-0p-presets.js); load_presets() overwrites
var clock := {"dawn": [5.5, 7.2], "dusk": [17.2, 18.8], "nightDim": 0.82}
var wind := {"base": [0.8, 0.35], "gustAmp": 0.55, "veer": [0.22, 0.021, 0.1, 0.057]}
var loaded_from := ""


func load_presets(export: Dictionary) -> void:
	var p: Dictionary = export.get("presets", {})
	if p.has("clock"):
		clock = p["clock"]
	if p.has("wind"):
		wind = p["wind"]
	if export.has("wind") and export["wind"].has("base"):
		wind["base"] = export["wind"]["base"]
	if export.has("clock"):
		t = float(export["clock"].get("t", 0.0))
		scale = float(export["clock"].get("scale", 1.0))
	loaded_from = "atmos export"


func reset_defaults() -> void:
	clock = {"dawn": [5.5, 7.2], "dusk": [17.2, 18.8], "nightDim": 0.82}
	wind = {"base": [0.8, 0.35], "gustAmp": 0.55, "veer": [0.22, 0.021, 0.1, 0.057]}
	loaded_from = ""


static func _ss(a: float, b: float, x: float) -> float:
	var k: float = clamp((x - a) / (b - a), 0.0, 1.0)
	return k * k * (3.0 - 2.0 * k)


func night(h: float) -> float:
	var dawn: Array = clock["dawn"]
	var dusk: Array = clock["dusk"]
	return clamp(1.0 - _ss(float(dawn[0]), float(dawn[1]), h) + _ss(float(dusk[0]), float(dusk[1]), h), 0.0, 1.0)


# a light's [on, off] hours (atm_lit in atmos.gdshaderinc): lit from on in the evening to off next morning.
# The export's convention adds two cases core/atmos/GODOT.md's atm_lit leaves out: on=0 is always lit, on<0 follows night()
func lit(h: float, on: float, off: float) -> float:
	if on == 0.0:
		return 1.0
	if on < 0.0:
		return night(h)
	var hh := h + 24.0 if h < 12.0 else h
	return smoothstep(on, on + 0.3, hh) * (1.0 - smoothstep(off - 0.3, off, hh))


func wind_now() -> Vector2:
	var v: Array = wind.get("veer", [0, 1, 0, 1])
	var veer := float(v[0]) * sin(t * float(v[1])) + float(v[2]) * sin(t * float(v[3]) + 1.7)
	var b: Array = wind["base"]
	var bx := float(b[0])
	var bz := float(b[1])
	return Vector2(bx * cos(veer) - bz * sin(veer), bx * sin(veer) + bz * cos(veer)) * wind_scale


func _process(delta: float) -> void:
	if not paused:
		t += delta * scale
		hour = fmod(hour + delta * hour_rate + 24.0, 24.0)
	var w := wind_now()
	wind_off += w * delta
	var n := night(hour)
	RenderingServer.global_shader_parameter_set("atm_time", t)
	RenderingServer.global_shader_parameter_set("atm_hour", hour)
	RenderingServer.global_shader_parameter_set("atm_night", n)
	RenderingServer.global_shader_parameter_set("atm_light", 1.0 - float(clock.get("nightDim", 0.82)) * n)
	RenderingServer.global_shader_parameter_set("atm_wind", w)
	RenderingServer.global_shader_parameter_set("atm_gust_amp", float(wind.get("gustAmp", 0.55)))
	RenderingServer.global_shader_parameter_set("atm_wind_off", wind_off)
	RenderingServer.global_shader_parameter_set("atm_rain", rain)
	RenderingServer.global_shader_parameter_set("atm_fog", fog)
	RenderingServer.global_shader_parameter_set("atm_flash", flash)
	RenderingServer.global_shader_parameter_set("atm_sun_dir", sun_dir.normalized())
