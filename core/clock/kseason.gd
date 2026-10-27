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
