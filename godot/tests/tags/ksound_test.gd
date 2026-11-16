# The Godot side of the sound record's golden test: KTAGS.soundLevel and soundAt's vectors (golden-sound.json, written by
# test-sound.js) run on ksound.gd.
#   godot --headless --path godot --script res://tests/tags/ksound_test.gd       exits 0 when every vector matches
extends SceneTree

const KSound := preload("ksound.gd")
const EPS := 1e-9


func _diff(a: Dictionary, b: Dictionary) -> float:
	var w := absf(float(a["gain"]) - float(b["gain"])) + absf(float(a["pitch"]) - float(b["pitch"])) + absf(float(a["u"]) - float(b["u"]))
	if bool(a["on"]) != bool(b["on"]) or a["partials"].size() != b["partials"].size():
		return INF
	for i in a["partials"].size():
		w = maxf(w, absf(float(a["partials"][i][0]) - float(b["partials"][i][0])) + absf(float(a["partials"][i][1]) - float(b["partials"][i][1])))
	return w


func _init() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(get_script().resource_path.get_base_dir() + "/golden-sound.json"))
	var worst := 0.0
	for c in g["cases"]:
		var s: Dictionary = g["recs"][int(c["rec"])]
		worst = maxf(worst, _diff(KSound.level(s, c["wind"], c["o"]), c["level"]))
		var n := KSound.at(s, c["at"], c["listener"], c["wind"], c["o"])
		worst = maxf(worst, _diff(n, c["near"]) + absf(float(n["dist"]) - float(c["near"]["dist"])))
	var pass_ := worst <= EPS
	print(("PASS  " if pass_ else "FAIL  ") + "%d cases, worst %s" % [g["cases"].size(), str(worst)])
	# the negative: the gjár's fissure 10 m deeper must sound lower
	var s0: Dictionary = g["recs"][1].duplicate()
	var w := {"speed": 15.0, "dir": PI / 2.0}
	var deeper := s0.duplicate()
	deeper["L"] = float(s0["L"]) + 10.0
	var neg := float(KSound.level(deeper, w)["partials"][0][0]) < float(KSound.level(s0, w)["partials"][0][0])
	print(("PASS  " if neg else "FAIL  ") + "a deeper fissure sounds lower (the negative)")
	var bad := (0 if pass_ else 1) + (0 if neg else 1)
	print("ksound: %s" % ("all passed" if bad == 0 else "%d FAILED" % bad))
	quit(1 if bad else 0)
