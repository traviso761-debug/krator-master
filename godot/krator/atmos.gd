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

# presets.waves (89-atmos-0p-presets.js), the open-water wave field: shaders/atmos_waves.gdshaderinc bakes these numbers
# in (tools/atmos_waves.js writes it); wave_height/wave_slope below are its CPU twin. load_presets() overwrites
const WAVES := {"period": 600, "amp": 0.22, "tilt": 1.77, "warpAmp": 6,
	"chop": [[0.24, 0.18, 86, 0.5], [-0.16, 0.27, 117, 0.32], [0.44, -0.31, 162, 0.18]],
	"mid": [[0.1015, 0.0369, 62, 0.45], [-0.0248, 0.1406, 72, 0.33], [0.0735, -0.0515, 79, 0.22]],
	"swell": [[0.0364, 0.0209, 44, 0.46], [-0.0119, 0.0328, 38, 0.33], [0.024, 0.0343, 50, 0.21]],
	"group": [[0.021, 0.013, 14], [-0.011, 0.024, 11], [0.0152, -0.0262, 17]],
	"warp": [[0.0141, -0.0083, 9], [0.0067, 0.0126, 7]],
	"gain": {"chop": 1, "mid": 4, "swell": 2}, "groupMix": {"chop": [0.55, 0.9], "mid": [0.45, 0.75], "swell": [0.5, 0.8]},
	"crestMix": {"chop": [0.35, 0.65], "mid": [0.32, 0.58], "swell": [0, 0.45]}, "crestNorm": 0.72, "skip": 0.01,
	"fade": {"chop": [150, 480], "mid": [420, 1100], "swell": [1400, 3000]}}
var waves: Dictionary = WAVES.duplicate(true)

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
	if p.has("waves"):
		waves = p["waves"]
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
	waves = WAVES.duplicate(true)
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


# THE WAVE FIELD's CPU twin (89-atmos-a-waves.js: ATMOS.waveWrap, waveHeight, waveSlope), for buoyancy and tests.
# A wave is [kx, kz, c, a]; in turns [kx/TAU, kz/TAU, c/period], and phase = TAU*(fract(x*k0)+fract(z*k1)+fract(t*k2)),
# so every argument stays small. t is the module clock (wrapped here); x, z world metres. All in 64-bit floats (no
# Vector2/Vector3 inside: they are 32-bit), so the twin matches the JavaScript to the last few bits.
func wave_wrap(tt: float) -> float:
	var p := float(waves["period"])
	return fmod(fmod(tt, p) + p, p)


static func _fr(x: float) -> float:
	return x - floor(x)


func _wph(x: float, z: float, tt: float, w: Array) -> float:
	return TAU * (_fr(x * (float(w[0]) / TAU)) + _fr(z * (float(w[1]) / TAU)) + _fr(tt * (float(w[2]) / float(waves["period"]))))


func _wwarp(x: float, z: float, tt: float) -> PackedFloat64Array:
	var a := _wph(x, z, tt, waves["warp"][0])
	var b := _wph(x, z, tt, waves["warp"][1])
	var wa := float(waves["warpAmp"])
	return PackedFloat64Array([x + wa * (sin(a) + 0.6 * cos(b)), z + wa * (sin(b) - 0.6 * cos(a))])


func _wgroup(x: float, z: float, tt: float) -> float:
	var G: Array = waves["group"]
	return 0.52 + 0.48 * sin(_wph(x, z, tt, G[0])) * (0.62 * sin(_wph(x, z, tt, G[1])) + 0.38 * sin(_wph(x, z, tt, G[2])))


# one family at a point, per unit amplitude: (crest, dh/dx, dh/dz)
func _wfam(F: Array, x: float, z: float, tt: float) -> PackedFloat64Array:
	var c := 0.0
	var sx := 0.0
	var sz := 0.0
	for w in F:
		var p := _wph(x, z, tt, w)
		c += sin(p) * float(w[3])
		sx += cos(p) * float(w[3]) * float(w[0])
		sz += cos(p) * float(w[3]) * float(w[1])
	return PackedFloat64Array([c, sx, sz])


# metres above the still water at world (x, z), module clock tt: the swell, plus the chop where chop_w > 0
func wave_height(x: float, z: float, tt: float, chop_w := 0.0) -> float:
	var G: Dictionary = waves["gain"]
	var M: Dictionary = waves["groupMix"]
	var amp := float(waves["amp"])
	tt = wave_wrap(tt)
	var q := _wwarp(x, z, tt)
	var g := _wgroup(q[0], q[1], tt)
	var h := _wfam(waves["swell"], q[0], q[1], tt)[0] * amp * float(G["swell"]) * (float(M["swell"][0]) + float(M["swell"][1]) * g)
	if chop_w > 0.0:
		h += _wfam(waves["chop"], x, z, tt)[0] * amp * float(G["chop"]) * chop_w * (float(M["chop"][0]) + float(M["chop"][1]) * g)
	return h


# [dh/dx, dh/dz, crest] seen from camera distance d: each family faded by d; crest 0.5 is still water
func wave_slope(x: float, z: float, tt: float, d: float) -> PackedFloat64Array:
	tt = wave_wrap(tt)
	var fams := ["chop", "mid", "swell"]
	var wt := {}
	var any := false
	var skip := float(waves["skip"])
	for f in fams:
		var fd: Array = waves["fade"][f]
		wt[f] = 1.0 - _ss(float(fd[0]), float(fd[1]), d)
		if wt[f] > skip:
			any = true
	var o := PackedFloat64Array([0.0, 0.0, 0.0])
	if any:
		var q := _wwarp(x, z, tt)
		var g := _wgroup(q[0], q[1], tt)
		for f in fams:
			if wt[f] > skip:
				var r := _wfam(waves["chop"], x, z, tt) if f == "chop" else _wfam(waves[f], q[0], q[1], tt)
				var M: Array = waves["groupMix"][f]
				var C: Array = waves["crestMix"][f]
				var k := float(waves["amp"]) * float(waves["gain"][f]) * float(wt[f]) * (float(M[0]) + float(M[1]) * g)
				o[0] += r[1] * k
				o[1] += r[2] * k
				o[2] += r[0] * float(wt[f]) * (float(C[0]) + float(C[1]) * g)
	o[2] = o[2] * float(waves["crestNorm"]) * 0.5 + 0.5
	return o


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
	RenderingServer.global_shader_parameter_set("atm_wave_t", wave_wrap(t))
	RenderingServer.global_shader_parameter_set("atm_wave_amp", float(waves["amp"]))
