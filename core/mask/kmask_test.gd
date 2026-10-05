# The Godot side of core/mask's golden test: golden.json's ops replayed by kmask.gd must give its hash.
#   godot --headless --path godot --script res://tests/mask/kmask_test.gd       exits 0 on a match
extends SceneTree

const KMask := preload("kmask.gd")


func _init() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(get_script().resource_path.get_base_dir() + "/golden.json"))
	var t0 := Time.get_ticks_msec()
	var b := KMask.replay(g["ops"], int(g["width"]), int(g["height"]))
	var got := KMask.hash(b)
	print("kmask: %d ops on %dx%d in %d ms, hash %s, expected %s: %s" % [g["ops"].size(), g["width"], g["height"], Time.get_ticks_msec() - t0, got, g["hash"], "PASS" if got == g["hash"] else "FAIL"])
	quit(0 if got == g["hash"] else 1)
