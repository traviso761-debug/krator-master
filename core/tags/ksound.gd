# core/tags' sound record in GDScript: the twin of KTAGS.soundLevel and KTAGS.soundAt (opt/54-core-tags-sound.js; H9). A record's
# tags.sound as the export carries it (KTAGS.sound filled it on the page, its detune drawn there), read by Godot's audio: how
# loud, and at what pitches, for a wind. ksound_test.gd checks it against golden-sound.json, which test-sound.js writes.
#   KSound.level(snd, wind: {speed, dir}, o: {T}) -> {on, gain, pitch, u, partials: [[Hz, amp], ...]}
#   KSound.at(snd, at: [x,y,z], listener: [x,y,z], wind, o) -> the same, with gain times the fall with distance, and dist
extends RefCounted


static func _d(v, x: float) -> float:
	return x if v == null else float(v)


static func _sm(a: float, b: float, v: float) -> float:
	var t := clampf((v - a) / (b - a), 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)


static func level(s: Dictionary, wind: Dictionary, o: Dictionary = {}) -> Dictionary:
	var sp := _d(wind.get("speed"), 0.0)
	var u := sp if s.get("axis") == null else sp * absf(sin(_d(wind.get("dir"), 0.0) - float(s["axis"])))
	var c := 331.3 * sqrt(1.0 + _d(o.get("T"), 15.0) / 273.15)
	var det := 1.0 + float(s["detune"])
	var g := _d(s.get("gain"), 1.0) * _sm(float(s["on"]), float(s["full"]), u)
	var parts := []
	var mode := str(s["mode"])
	if mode == "edge":
		var f := 0.2 * u / float(s["d"]) * det
		parts.append([clampf(f, float(s["lo"]), float(s["hi"])), 1.0])
	elif mode == "pipe":
		var f0 := c / (4.0 * (float(s["L"]) + 0.6 * _d(s.get("r"), 0.0))) * det
		var n := int(_d(s.get("partials"), 3.0))
		var lift := _sm(float(s["on"]), float(s["full"]) * 1.5, u) * float(n - 1)
		for i in n:
			var a := 1.0 - absf(float(i) - lift) / 1.5
			parts.append([float(2 * i + 1) * f0, a if a > 0.0 else 0.0])
	else:
		var r := float(s["r"])
		var area := PI * r * r
		var le := _d(s.get("neck"), 0.0) + 1.7 * r
		parts.append([c / TAU * sqrt(area / (float(s["V"]) * le)) * det, 1.0])
	var best := 0
	for j in range(1, parts.size()):
		if float(parts[j][1]) > float(parts[best][1]):
			best = j
	return {"on": g > 0.0, "gain": g, "pitch": parts[best][0], "u": u, "partials": parts}


static func at(s: Dictionary, p: Array, listener: Array, wind: Dictionary, o: Dictionary = {}) -> Dictionary:
	var L := level(s, wind, o)
	var dx := float(listener[0]) - float(p[0])
	var dy := float(listener[1]) - float(p[1])
	var dz := float(listener[2]) - float(p[2])
	var dist := sqrt(dx * dx + dy * dy + dz * dz)
	var ref := _d(s.get("ref"), 1.0)
	var rng := float(s["range"])
	var fall := (1.0 if dist <= ref else ref / dist) * (1.0 - _sm(rng * 0.75, rng, dist))
	L["gain"] = float(L["gain"]) * fall
	L["on"] = float(L["gain"]) > 0.0
	L["dist"] = dist
	return L
