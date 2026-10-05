# The Atmos autoload (core/atmos/GODOT.md): the CPU side of core/atmos (the module clock, night(), the veering
# wind, the weather state machine of 89-atmos-4-weather.js) setting the global shader parameters every frame.
# The pure functions are line-for-line ports, checked against core/atmos's own vectors by tests/atmos/atmos_test.gd.
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

# THE WEATHER (89-atmos-4-weather.js). Off until set_weather(mode) or an export with a weather record turns it on.
# W: mode, rain, fog, wet (rises in rain, dries after), flash (lightning), wind (1 calm .. 2.4 storm: scales the wind)
const MODES := ["auto", "clear", "rain", "storm", "fog"]
var weather_on := false
var W := {"mode": "auto", "rain": 0.0, "fog": 0.0, "wet": 0.0, "flash": 0.0, "wind": 1.0}
var weather_wind := {"clear": 1.0, "rain": 1.5, "storm": 2.4, "autoRain": 0.5}   # presets.wind.weather
var reduce_motion := false        # never flash
var strike_every := [5.0, 14.0]   # seconds between strikes in a storm (the weather record's storm.strikeEvery)
var _next_strike := 6000.0        # ms on the module clock
var _t0 := -1e9
var _rng := RandomNumberGenerator.new()
signal strike(bearing: float, distance: float)   # a bolt: draw it at that bearing and distance from the camera


func load_presets(export: Dictionary) -> void:
	var p: Dictionary = export.get("presets", {})
	if p.has("clock"):
		clock = p["clock"]
	if p.has("wind"):
		wind = p["wind"]
		if wind.has("weather"):
			weather_wind = wind["weather"]
	for f in export.get("fx", []):
		if f.get("type") == "weather":
			set_weather(str(f.get("mode", "auto")))
			if f.has("storm") and f["storm"].has("strikeEvery"):
				strike_every = f["storm"]["strikeEvery"]
	if export.has("wind") and export["wind"].has("base"):
		wind["base"] = export["wind"]["base"]
	if export.has("clock"):
		t = float(export["clock"].get("t", 0.0))
		scale = float(export["clock"].get("scale", 1.0))
	loaded_from = "atmos export"


func set_weather(mode: String) -> void:
	W = weather_state(mode)
	weather_on = true
	_next_strike = t * 1000.0 + 6000.0


static func weather_state(mode: String) -> Dictionary:
	return {"mode": mode if mode != "" else "auto", "rain": 0.0, "fog": 0.0, "wet": 0.0, "flash": 0.0, "wind": 1.0}


static func weather_auto(h: float) -> Dictionary:
	return {"rain": _ss(19.5, 19.9, h) * (1.0 - _ss(21.6, 22.0, h)), "fog": 0.7 * _ss(4.3, 5.5, h) * (1.0 - _ss(8.4, 9.6, h))}


func weather_target(m: String, h: float) -> Dictionary:
	var au := weather_auto(h)
	var PW := weather_wind
	var rain_t := 0.75 if m == "rain" else (1.0 if m == "storm" else (float(au["rain"]) if m == "auto" else 0.0))
	var fog_t := 1.0 if m == "fog" else (float(au["fog"]) if m == "auto" else (0.3 if m == "storm" else 0.0))
	var wind_t: float
	if m == "storm":
		wind_t = float(PW["storm"])
	elif m == "rain":
		wind_t = float(PW["rain"])
	elif m == "auto":
		wind_t = 1.0 + float(PW["autoRain"]) * float(au["rain"])
	else:
		wind_t = float(PW["clear"])
	return {"rain": rain_t, "fog": fog_t, "wind": wind_t}


func weather_step(S: Dictionary, h: float, dt: float) -> Dictionary:
	var g := weather_target(S["mode"], h)
	S["rain"] = S["rain"] + (g["rain"] - S["rain"]) * minf(1.0, dt * 1.5)
	S["fog"] = S["fog"] + (g["fog"] - S["fog"]) * minf(1.0, dt * 0.8)
	S["wet"] = minf(1.0, maxf(0.0, S["wet"] + dt * (0.12 * S["rain"] if S["rain"] > 0.15 else -0.02)))
	S["wind"] = S["wind"] + (g["wind"] - S["wind"]) * minf(1.0, dt * 0.4)
	return S


static func flash_at(e: float) -> float:
	if e < 80.0: return 1.0
	if e < 150.0: return 0.25
	if e < 230.0: return 0.8
	if e < 600.0: return 0.8 * (1.0 - (e - 230.0) / 370.0)
	return 0.0


func reset_defaults() -> void:
	weather_on = false
	W = weather_state("auto")
	wind_scale = 1.0
	rain = 0.0
	fog = 0.0
	flash = 0.0
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


# a light's [on, off] hours (atm_lit in atmos.gdshaderinc, A.litAt): lit from on in the evening to off next morning.
# glow_lit is a halo's (atm_glow_lit): on<0 dims by day (0.25 + 0.75 night), on=0 is always lit
func glow_lit(h: float, on: float, off: float) -> float:
	if on < 0.0:
		return 0.25 + 0.75 * night(h)
	if on == 0.0:
		return 1.0
	return lit(h, on, off)


func lit(h: float, on: float, off: float) -> float:
	var hh := h + 24.0 if h < 12.0 else h
	var r := float(clock.get("ramp", 0.3))
	return _ss(on, on + r, hh) * (1.0 - _ss(off - r, off, hh))


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
	var gust := float(wind.get("gustAmp", 0.55))
	if weather_on:
		weather_step(W, hour, 0.0 if paused else delta)
		var now := t * 1000.0
		if W["mode"] == "storm" and not reduce_motion and W["rain"] > 0.6 and now > _next_strike:
			_t0 = now
			_next_strike = now + float(strike_every[0]) * 1000.0 + _rng.randf() * (float(strike_every[1]) - float(strike_every[0])) * 1000.0
			strike.emit(_rng.randf() * TAU, 700.0 + _rng.randf() * 500.0)
		W["flash"] = flash_at(now - _t0)
		wind_scale = W["wind"]
		gust = 0.55 + 0.25 * minf(1.0, W["wind"] - 1.0)
		rain = W["rain"]
		fog = W["fog"]
		flash = W["flash"]
	var w := wind_now()
	wind_off += w * delta
	var n := night(hour)
	RenderingServer.global_shader_parameter_set("atm_time", t)
	RenderingServer.global_shader_parameter_set("atm_hour", hour)
	RenderingServer.global_shader_parameter_set("atm_night", n)
	RenderingServer.global_shader_parameter_set("atm_light", 1.0 - float(clock.get("nightDim", 0.82)) * n)
	RenderingServer.global_shader_parameter_set("atm_wind", w)
	RenderingServer.global_shader_parameter_set("atm_gust_amp", gust)
	RenderingServer.global_shader_parameter_set("atm_wind_off", wind_off)
	RenderingServer.global_shader_parameter_set("atm_rain", rain)
	RenderingServer.global_shader_parameter_set("atm_fog", fog)
	RenderingServer.global_shader_parameter_set("atm_flash", flash)
	RenderingServer.global_shader_parameter_set("atm_sun_dir", sun_dir.normalized())
