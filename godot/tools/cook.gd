# Cook a case ahead of time (krator/cook.gd; GODOT-LOOK-PLAN.md section 11, N2 and N3): every world under a folder is
# built once through the importer with the cook on, so its world.glb (parsed, levels of detail, shadow meshes) and its
# maps (decoded, mipmapped, compressed) are in the cook's folder before the place is first walked into.
#   godot --headless --path godot --script res://tools/cook.gd -- res://data/world-oidong-highrift [more folders or world.json files]
#   godot --headless --path godot --script res://tools/cook.gd -- --stat      what the folder holds
#   godot --headless --path godot --script res://tools/cook.gd -- --clear     empty it
# The folder is user://krator-cook, or KRATOR_COOK_DIR. The maps are compressed for this machine's GPU class
# (KratorKmat.vram_mode: BC7 on a desktop, ASTC on mobile); KRATOR_VRAM=astc cooks for the other.
extends SceneTree


func _initialize() -> void:
	var C := KratorCook
	C.on = 1
	var args := OS.get_cmdline_user_args()
	if "--clear" in args:
		print("removed %d files from %s" % [C.clear(), ProjectSettings.globalize_path(C.root())])
		quit(0)
		return
	var worlds: Array[String] = []
	for a in args:
		if a.begins_with("--"):
			continue
		if a.ends_with(".json") and FileAccess.file_exists(a):
			worlds.append(a)
		else:
			_find(a.trim_suffix("/"), worlds)
	var t_all := Time.get_ticks_msec()
	var fails := 0
	for wj in worlds:
		C.reset_stats()
		var t0 := Time.get_ticks_msec()
		var w := KratorWorld.build(wj)
		var rep: Dictionary = w.get_meta("report") if w != null and w.has_meta("report") else {}
		var st: Dictionary = C.stats
		var ck: Dictionary = rep.get("cook", {})
		if rep.get("gaps", {}).has("load"):
			fails += 1
		print("%-64s %6d ms  glb %-11s  maps %d read, %d made (%.1f MB)%s" % [wj.trim_prefix("res://data/"), Time.get_ticks_msec() - t0, str(ck.get("from", "none")),
			int(st["tex_hit"]), int(st["tex_miss"]), int(st["tex_bytes"]) / 1048576.0, ("  LOAD FAILED: " + str(rep["gaps"]["load"])) if rep.get("gaps", {}).has("load") else ""])
		if w != null:
			w.free()
	if KratorGroundLayers.ensure_s4():   # the ground's layer arrays, which every streamed case shares
		print("the ground's layers: cooked")
	C.flush()
	var u := C.usage()
	print("%s: %d maps (%.1f MB), %d scenes (%.1f MB)%s" % [ProjectSettings.globalize_path(C.root()), u["tex"], int(u["tex_bytes"]) / 1048576.0, u["mesh"], int(u["mesh_bytes"]) / 1048576.0,
		"" if worlds.is_empty() else "; %d worlds in %.1f s" % [worlds.size(), (Time.get_ticks_msec() - t_all) / 1000.0]])
	quit(1 if fails > 0 else 0)


# every world.json under a folder
func _find(folder: String, out: Array[String]) -> void:
	var d := DirAccess.open(folder)
	if d == null:
		push_warning("cook: no folder %s" % folder)
		return
	if d.file_exists("world.json"):
		out.append(folder + "/world.json")
	var subs := d.get_directories()
	subs.sort()
	for s in subs:
		_find(folder + "/" + s, out)
