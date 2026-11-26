# The Godot side of core/mask's distance golden: golden-distance.json's ops replayed by kmask.gd, then KMask.distance,
# must give its hash and its samples, compared as their IEEE 754 bytes (test-mask-distance.js writes it).
#   godot --headless --path godot --script res://tests/mask/kmask_distance_test.gd       exits 0 on a match
extends SceneTree

const KMask := preload("kmask.gd")


func _init() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(get_script().resource_path.get_base_dir() + "/golden-distance.json"))
	var w := int(g["width"])
	var h := int(g["height"])
	var b := KMask.replay(g["ops"], w, h)
	var mh := KMask.hash(b)
	var t0 := Time.get_ticks_msec()
	var d2 := KMask.distance(b, w, h)
	var got := KMask.distance_hash(d2)
	var good: bool = mh == g["mask_hash"] and got == g["hash"]
	for s in g["samples"]:
		var v := KMask.distance_sample(d2, w, h, s[0], s[1])
		var hx := PackedFloat64Array([v]).to_byte_array().hex_encode()
		if hx != s[3]:
			print("  sample (%s, %s): %s (%s), expected %s (%s)" % [s[0], s[1], v, hx, s[2], s[3]])
			good = false
	print("kmask distance: %dx%d in %d ms, mask %s (%s), hash %s, expected %s, %d samples: %s" % [w, h, Time.get_ticks_msec() - t0, mh, g["mask_hash"], got, g["hash"], g["samples"].size(), "PASS" if good else "FAIL"])
	quit(0 if good else 1)
