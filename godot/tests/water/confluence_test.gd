# core/water's confluence (ext/55, 2026-10-27) in GDScript (krator/water.gd: KWater.confluence_at, confluence_ribbon_fade) against WATER's own:
# the export's group record read back at points over the disc, and the ribbons' fade. Each check has a negative.
#   godot --headless --path godot --script res://tests/water/confluence_test.gd     exits 0 when all pass
# (the golden: node godot/tools/water_confluence_golden.js)
extends SceneTree

const KEYS := ["y", "vx", "vz", "slope", "bank", "fade", "meetV"]

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


static func sci(v: float) -> String:
	if v == 0.0:
		return "0"
	var e := floori(log(absf(v)) / log(10.0))
	return "%.1fe%d" % [v / pow(10.0, e), e]


func _initialize() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/water/confluence_golden.json"))
	var C: Dictionary = g["rec"]
	var e := 0.0
	var et := 0.0
	var ef := 0.0
	for s in g["samples"]:
		for k in KEYS:
			var v := KWater.confluence_at(C, float(s["x"]), float(s["z"]), k)
			e = maxf(e, absf(v - float(s[k])))
			var tk: String = "meet" if k == "meetV" else k
			et = maxf(et, absf(v - float(s["twin"][tk])))
		ef = maxf(ef, absf(KWater.confluence_ribbon_fade(C, float(s["x"]), float(s["z"])) - float(s["rib"])))
	ok(C["kind"] == "confluence" and e < 1e-9, "confluence_at reads the export's grid as the mesh interpolates it (%d samples x %d values, %s)" % [g["samples"].size(), KEYS.size(), sci(e)])
	ok(et < 2e-4, "...and lands within the export's rounding of WATER's own C.at (%s)" % sci(et))
	ok(ef < 1e-12, "confluence_ribbon_fade equals 1 - C.fadeAt (%s)" % sci(ef))
	var at: Array = C["at"]
	ok(KWater.confluence_ribbon_fade(C, float(at[0]), float(at[1])) == 0.0 and KWater.confluence_at(C, float(at[0]) + 2.0, float(at[1]), "bank") > 0.0 and KWater.confluence_at(C, float(at[0]) + 10.0, float(at[1]) + 12.0, "bank") < 0.0,
		"...negative: no ribbon at the mouth, water at the mouth, land in the corner beyond it")
	print("confluence_test: %s" % ("all passed" if fails == 0 else "%d FAILED" % fails))
	quit(1 if fails else 0)
