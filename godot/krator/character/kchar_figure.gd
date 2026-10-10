# KCharFigure: a character from kits/characters' pieces on one Skeleton3D. The Godot side of src/50-figure.js.
#   var fig := KCharFigure.new()
#   fig.load_dir("res://data/characters")      # skeleton.json, sliders.json, outfits.json, pieces/*.glb
#   add_child(fig); fig.apply(record); fig.play("walk")
# The bones come from skeleton.json (rest = the bind pose every piece was fitted to). Each piece is the glTF's mesh
# under this skeleton with its own copy of the Skin; a slider's skin scale goes into that skin's bind pose,
# bind[k] = scale(s[bone]) * bind0[k], so it scales only that bone's vertices, in its own frame, and is not inherited:
# the same as boneInverses in the three.js page. Clips play through an AnimationPlayer advanced by hand, so the hips'
# lift is added after the clip has written them.
class_name KCharFigure
extends Node3D

var data := {}
var skeleton: Skeleton3D
var player: AnimationPlayer
var pose := {}
var record := {}
var _pieces := {}      # outfit -> mesh name -> { mesh, skin }
var _live := {}        # "outfit|mesh" -> MeshInstance3D
var _hips := -1
var _clip := ""


func load_dir(dir: String) -> void:
	for k in ["skeleton", "sliders", "outfits"]:
		data[k] = JSON.parse_string(FileAccess.get_file_as_string(dir + "/" + k + ".json"))
	skeleton = Skeleton3D.new()
	skeleton.name = "Skeleton3D"
	add_child(skeleton)
	var J: Array = data["skeleton"]["joints"]
	for i in J.size():
		skeleton.add_bone(J[i]["name"])
	for i in J.size():
		skeleton.set_bone_parent(i, int(J[i]["parent"]))
		var rest := Transform3D(Basis(KChar._q(J[i]["r"])), KChar._v(J[i]["t"]))
		skeleton.set_bone_rest(i, rest)
	skeleton.reset_bone_poses()
	_hips = skeleton.find_bone("Hips")
	for o in data["outfits"]["outfits"]:
		_pieces[o["id"]] = _meshes(_scene(dir + "/" + o["glb"]))
	player = AnimationPlayer.new()
	player.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
	add_child(player)
	var lib := AnimationLibrary.new()
	var anims := _scene(dir + "/pieces/anims.glb")
	var src: AnimationPlayer = anims.find_child("AnimationPlayer", true, false)
	if src:
		for lib_name in src.get_animation_library_list():
			var from := src.get_animation_library(lib_name)
			for nm in from.get_animation_list():
				lib.add_animation(nm, _retarget(from.get_animation(nm)))
	player.add_animation_library("", lib)
	anims.free()
	pose = KChar.pose(data["skeleton"], data["sliders"], {})


func _scene(path: String) -> Node:
	var doc := GLTFDocument.new()
	var st := GLTFState.new()
	var err := doc.append_from_file(path, st)
	assert(err == OK, "KCharFigure: cannot read " + path)
	return doc.generate_scene(st)


func _meshes(scene: Node) -> Dictionary:
	# Godot's importer orders its own Skeleton3D breadth-first, and a skin's bind indices point into that order;
	# rebind each by name onto ours (skeleton.json order)
	var out := {}
	var gen: Skeleton3D = scene.find_children("*", "Skeleton3D", true, false)[0]
	for mi in scene.find_children("*", "MeshInstance3D", true, false):
		var skin: Skin = mi.skin.duplicate(true)
		for k in skin.get_bind_count():
			var nm := skin.get_bind_name(k)
			if nm == "":
				nm = gen.get_bone_name(skin.get_bind_bone(k))
			skin.set_bind_name(k, nm)
			skin.set_bind_bone(k, skeleton.find_bone(nm))
		out[String(mi.name)] = {"mesh": mi.mesh, "skin": skin}
	scene.free()
	return out


func _retarget(a: Animation) -> Animation:
	# the glTF's tracks name its own skeleton node; point them at ours, keep only the bones we have
	var b := a.duplicate(true) as Animation
	for i in range(b.get_track_count() - 1, -1, -1):
		# a skinned glTF's tracks read "Skeleton3D:Bone"; anims.glb has no skin, so Godot made plain nodes and its
		# tracks read "Character/Hips/Spine/...": the bone is the last name either way
		var p := String(b.track_get_path(i))
		var bone := p.get_slice(":", 1) if p.contains(":") else p.get_file()
		if bone == "" or skeleton.find_bone(bone) < 0:
			b.remove_track(i)
			continue
		b.track_set_path(i, NodePath("Skeleton3D:" + bone))
	return b


func _mesh(outfit: String, name: String) -> MeshInstance3D:
	var key := outfit + "|" + name
	if _live.has(key):
		return _live[key]
	if not _pieces.has(outfit) or not _pieces[outfit].has(name):
		return null
	var p: Dictionary = _pieces[outfit][name]
	var mi := MeshInstance3D.new()
	mi.name = key.replace("|", "__").replace("~", "-")
	mi.mesh = p["mesh"]
	var skin: Skin = p["skin"].duplicate(true)
	mi.set_meta("bind0", [])
	for k in skin.get_bind_count():
		mi.get_meta("bind0").append(skin.get_bind_pose(k))
	mi.skin = skin
	mi.set_meta("slot", name.get_slice("~", 0))
	skeleton.add_child(mi)
	mi.skeleton = NodePath("..")
	_live[key] = mi
	return mi


func apply(rec: Dictionary) -> void:
	record = rec
	var want := {}
	for v in KChar.visible(rec, data["outfits"]):
		var mi := _mesh(v["outfit"], v["mesh"])
		if mi:
			want[mi] = true
	for k in _live:
		_live[k].visible = want.has(_live[k])
	var face = null
	for o in data["outfits"]["outfits"]:
		if o["id"] == rec["slots"].get("head"):
			face = o["face"]
	pose = KChar.pose(data["skeleton"], data["sliders"], rec.get("sliders", {}), face)
	for i in skeleton.get_bone_count():
		if i != _hips:
			skeleton.set_bone_pose_position(i, pose["t"][i])
	scale = Vector3.ONE * float(pose["root"])
	for mi in want:
		_skin_scale(mi)
		var dye = rec.get("dye", {}).get(mi.get_meta("slot"))
		var mat = mi.mesh.surface_get_material(0)
		if dye and mat:
			var m2: BaseMaterial3D = mat.duplicate()
			m2.albedo_color = Color(dye)
			mi.set_surface_override_material(0, m2)
		else:
			mi.set_surface_override_material(0, null)
	if _clip == "":
		rest_pose()


func _skin_scale(mi: MeshInstance3D) -> void:
	var skin: Skin = mi.skin
	var bind0: Array = mi.get_meta("bind0")
	for k in skin.get_bind_count():
		var bone := skin.get_bind_bone(k)
		var s: Vector3 = pose["s"][bone] if bone >= 0 else Vector3.ONE
		skin.set_bind_pose(k, Transform3D(Basis.from_scale(s), Vector3.ZERO) * bind0[k])


func rest_pose() -> void:
	var J: Array = data["skeleton"]["joints"]
	for i in J.size():
		skeleton.set_bone_pose_rotation(i, KChar._q(J[i]["r"]))
	skeleton.set_bone_pose_position(_hips, pose["t"][_hips] + Vector3(0, pose["lift"], 0))


func play(clip: String) -> void:
	_clip = clip
	if clip == "" or not player.has_animation(clip):
		_clip = ""
		player.stop()
		rest_pose()
		return
	player.play(clip, 0.25)
	player.get_animation(clip).loop_mode = Animation.LOOP_LINEAR


func _process(dt: float) -> void:
	if _clip == "":
		return
	player.advance(dt)
	var p := skeleton.get_bone_pose_position(_hips)
	skeleton.set_bone_pose_position(_hips, p + Vector3(0, pose["lift"], 0))
