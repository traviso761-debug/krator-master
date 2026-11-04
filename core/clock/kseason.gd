# core/clock's season in GDScript: the twin of KCLOCK.season (20-core-clock.js; biomes/hyperjungle/PLAN-LANDS.md, gap H7).
# Where a world day falls in the sky model's year (krator/sky_model.gd's yearD, startDay, solsticeDay; day 0 is game
# start's date), as plain numbers. kseason_test.gd checks it against golden-season.json, which test-clock.js writes.
#
#   KSeason.season(day, hour, o) -> {yearDay, phase, summer, wet, dry, quarter, name}
#   o: {latitude, lagD, sharp, wetIn, year: {yearD, startDay, solsticeDay}}: the same keys as the JavaScript
extends RefCounted

const YEAR := {"yearD": 365.0, "startDay": 259.0, "solsticeDay": 350.0}
const NAMES := ["summer", "autumn", "winter", "spring"]


static func _frac(x: float) -> float:
	return x - floor(x)


static func season(day: float, hour: float, o: Dictionary = {}) -> Dictionary:
	var y: Dictionary = o.get("year", YEAR)
	var yd_n := float(y["yearD"])
	var t := day + hour / 24.0
	var yd := yd_n * _frac((float(y["startDay"]) + t) / yd_n)
	var north: bool = o.get("latitude") != null and float(o["latitude"]) > 0.0
	var half := 0.5 if north else 0.0
	var lag := float(o.get("lagD", 0.0))
	var sh := float(o.get("sharp", 0.0))
	var sol := float(y["solsticeDay"])
	var ph := _frac((yd - sol) / yd_n + half)
	var lw := cos(TAU * _frac((yd - sol - lag) / yd_n + half))
	if o.get("wetIn") == "winter":
		lw = -lw
	var wet := 0.5 + 0.5 * tanh(sh * lw) / tanh(sh) if sh > 0.0 else 0.5 + 0.5 * lw
	var q := int(floor(_frac(ph + 0.125) * 4.0)) % 4
	return {"yearDay": yd, "phase": ph, "summer": cos(TAU * ph), "wet": wet, "dry": 1.0 - wet, "quarter": q, "name": NAMES[q]}


static func _sm(a: float, b: float, v: float) -> float:
	var t := clampf((v - a) / (b - a), 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)


# KCLOCK.flush's twin (opt/21-core-clock-flush.js): the copper flush, a pulse keyed to the day the wet last rose through one half.
#   KSeason.flush(day, hour, o) -> {flush (0..1), since (days since the rains began)}; o adds rise (5), hold (18), fade (12) days
static func flush(day: float, hour: float, o: Dictionary = {}) -> Dictionary:
	var y: Dictionary = o.get("year", YEAR)
	var yd_n := float(y["yearD"])
	var s := season(day, hour, o)
	var north: bool = o.get("latitude") != null and float(o["latitude"]) > 0.0
	var lag := float(o.get("lagD", 0.0)) if o.get("lagD") != null else 0.0
	var arg := (float(s["yearDay"]) - float(y["solsticeDay"]) - lag) / yd_n + (0.5 if north else 0.0)
	var a0 := 0.25 if o.get("wetIn") == "winter" else 0.75
	var since := yd_n * _frac(arg - a0)
	var rise := float(o.get("rise", 5.0)) if o.get("rise") != null else 5.0
	var hold := float(o.get("hold", 18.0)) if o.get("hold") != null else 18.0
	var fade := float(o.get("fade", 12.0)) if o.get("fade") != null else 12.0
	return {"flush": _sm(0.0, rise, since) * (1.0 - _sm(rise + hold, rise + hold + fade, since)), "since": since}


# the leaf shader's two global uniforms (godot/shaders/lib/season.gdshaderinc) from a world day and hour: season_dry from
# season(), season_flush from flush(). o: the season's options, and the flush's (rise, hold, fade). Call it each frame.
static func set_globals(day: float, hour: float, o: Dictionary = {}) -> void:
	RenderingServer.global_shader_parameter_set("season_dry", float(season(day, hour, o)["dry"]))
	RenderingServer.global_shader_parameter_set("season_flush", float(flush(day, hour, o)["flush"]))
