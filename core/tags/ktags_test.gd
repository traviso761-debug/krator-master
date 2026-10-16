# The Godot side of core/tags' uid vectors: golden.json (written by test-tags.js) run on ktags.gd.
#   godot --headless --path godot --script res://tests/tags/ktags_test.gd       exits 0 when every vector matches
extends SceneTree

const KTags := preload("ktags.gd")


func _init() -> void:
	var f := FileAccess.open(get_script().resource_path.get_base_dir() + "/golden.json", FileAccess.READ)
	var g: Dictionary = JSON.parse_string(f.get_as_text())
	var fails := 0
	for v in g["uid"]:
		var got := KTags.uid(v["class"], v["key"], v["at"])
		if got != v["uid"]:
			fails += 1
			print("FAIL uid %s %s %s: %s, expected %s" % [v["class"], v["key"], v["at"], got, v["uid"]])
	print("ktags: %d uid vectors, %s" % [g["uid"].size(), "all passed" if fails == 0 else str(fails) + " failed"])
	quit(1 if fails else 0)
