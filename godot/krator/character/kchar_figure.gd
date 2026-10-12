# KCharFigure: a MakeHuman character from kits/characters' pieces on one Skeleton3D. The Godot side of
# src/50-figure.js for the kit.style "mpfb" bodies.
#   var fig := KCharFigure.new()
#   fig.load_body("res://data/characters", "mpfb_male")    # <dir>/<body>/{skeleton,kit}.json, <dir>/pieces/<body>/*.glb + *.gshapes.bin
#   add_child(fig); fig.apply(KChar.stranger(7, fig.kit, people)); fig.play("walk")
# How it differs from the page, and why:
# - Morphs are blend shapes. Each piece is rebuilt once as an ArrayMesh with one shape per morph target that moves it
#   ("t<target index>", relative: Godot adds weight * offset; base normals); a character is only its weights. The meshes are shared
#   by every figure of a body (a static cache), so a crowd costs one copy of the geometry.
# - Hidden skin is regions. Godot cannot drop triangles per instance, so the skin surface is split by which items
#   cover each triangle (kit items' hide bitsets); a worn item's regions get a discard material.
# - The joints and inverse binds move as in the page: bone pose position = KChar.morph_joints t, and each bind is
#   bind0 * T(-d[bone]), so the skinned rest is exactly the morphed mesh. A bone the skeleton lacks (an exporter's
#   'neutral_bone') takes Head's bind. The feet stay on the ground from the skin's lowest vertices.
# - Skin, hair and eye colours as in the page (kit.tint): albedo = linear(colour) * gain; the eyes use kchar_eye.gdshader.
# The shapes come prebuilt from make_mpfb.py (<piece>.gshapes.bin: absolute positions per target, the skin's regions,
# the ground), so building a piece is bulk conversions, not a GDScript loop over deltas. A game would save the built
# meshes as resources.
class_name KCharFigure
extends Node3D

const EYE_SHADER := preload("res://krator/character/kchar_eye.gdshader")
const HIDDEN_SHADER := preload("res://krator/character/kchar_hidden.gdshader")

static var _cache := {}                  # piece path -> Array of built meshes (see _build)

var dir := ""
var body := ""
var kit := {}
var skel := {}
var skeleton: Skeleton3D
var player: AnimationPlayer
var record := {}
var morph := {}                          # the last KChar.morph_joints
var _live := {}                          # "key|n" -> MeshInstance3D
var _hips := -1
var _head := -1
var _clip := ""
var looping := "idle"                    # the clip a play-once clip returns to
var _hidden_mat: ShaderMaterial


func load_body(data_dir: String, body_id: String) -> void:
	dir = data_dir
	body = body_id
	skel = JSON.parse_string(FileAccess.get_file_as_string("%s/%s/skeleton.json" % [dir, body]))
	kit = JSON.parse_string(FileAccess.get_file_as_string("%s/%s/kit.json" % [dir, body]))
	skeleton = Skeleton3D.new()
	skeleton.name = "Skeleton3D"
	add_child(skeleton)
	var J: Array = skel["joints"]
	for i in J.size():
		skeleton.add_bone(J[i]["name"])
	for i in J.size():
		skeleton.set_bone_parent(i, int(J[i]["parent"]))
		skeleton.set_bone_rest(i, Transform3D(Basis(KChar._q(J[i]["r"])), KChar._v(J[i]["t"])))
	skeleton.reset_bone_poses()
	_hips = skeleton.find_bone("Hips")
	_head = skeleton.find_bone("Head")
	_hidden_mat = ShaderMaterial.new()
	_hidden_mat.shader = HIDDEN_SHADER
	player = AnimationPlayer.new()
	player.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
	add_child(player)
	var lib := AnimationLibrary.new()
	var anims := _scene("%s/pieces/%s/anims.glb" % [dir, body])
	var src: AnimationPlayer = anims.find_child("AnimationPlayer", true, false)
	if src:
		for lib_name in src.get_animation_library_list():
			var from := src.get_animation_library(lib_name)
			for nm in from.get_animation_list():
				lib.add_animation(nm, _retarget(from.get_animation(nm)))
	player.add_animation_library("", lib)
	anims.free()
	morph = KChar.morph_joints(skel, kit, KChar.morph_weights({}, kit))


static func _scene(path: String) -> Node:
	var doc := GLTFDocument.new()
	var st := GLTFState.new()
	var err := doc.append_from_file(path, st)
	assert(err == OK, "KCharFigure: cannot read " + path)
	return doc.generate_scene(st)


func _retarget(a: Animation) -> Animation:
	# anims.glb has no skin, so Godot made plain nodes and its tracks read "Character/Hips/Spine/...": the bone is
	# the last name; point the tracks at our skeleton and keep only the bones we have
	var b := a.duplicate(true) as Animation
	for i in range(b.get_track_count() - 1, -1, -1):
		var p := String(b.track_get_path(i))
		var bone := p.get_slice(":", 1) if p.contains(":") else p.get_file()
		bone = bone.trim_prefix("mixamorig_").trim_prefix("mixamorig:")
		if bone == "" or skeleton.find_bone(bone) < 0:
			b.remove_track(i)
			continue
		b.track_set_path(i, NodePath("Skeleton3D:" + bone))
	return b


# ---- reading the pieces ----

# GSH1 (tools/make_mpfb.py godot_shapes): { json header, bytes }
static func _gsh(path: String) -> Dictionary:
	var b := FileAccess.get_file_as_bytes(path)
	assert(b.size() > 8 and b.slice(0, 4).get_string_from_ascii() == "GSH1", "KCharFigure: no shapes in " + path)
	var n := b.decode_u32(4)
	return {"h": JSON.parse_string(b.slice(8, 8 + n).get_string_from_utf8()), "b": b, "base": 8 + n}


# one built mesh per MeshInstance3D of the GLB: { mesh: ArrayMesh, skin: Skin, shapes: PackedInt32Array (target per
# blend shape), regions: Array (per surface: the item bits that hide it, or 0), ground: the skin's lowest vertices or null }
static func _build(glb: String) -> Array:
	if _cache.has(glb):
		return _cache[glb]
	var g := _gsh(glb.trim_suffix(".glb") + ".gshapes.bin")
	var H: Dictionary = g["h"]
	var B: PackedByteArray = g["b"]
	var o0: int = g["base"]
	var scene := _scene(glb)
	var gen: Skeleton3D = scene.find_children("*", "Skeleton3D", true, false)[0]
	var built := []
	for mi in scene.find_children("*", "MeshInstance3D", true, false):
		var src: Mesh = mi.mesh
		var m0 := src.surface_get_material(0)
		var info: Dictionary = H["meshes"].get(m0.resource_name if m0 else "", {"shapes": [], "surfaces": []})
		var shapes := PackedInt32Array(info["shapes"])
		var mesh := ArrayMesh.new()
		mesh.blend_shape_mode = Mesh.BLEND_SHAPE_MODE_RELATIVE
		for t in shapes:
			mesh.add_blend_shape("t%d" % t)
		var regions := []
		for s in src.get_surface_count():
			var arrays := src.surface_get_arrays(s)
			var mat := src.surface_get_material(s)
			var nm := mat.resource_name if mat else ""
			var mine := []
			for sf in info["surfaces"]:
				if sf["material"] == nm:
					mine.append(sf)
			if mine.is_empty():
				mine.append({"n": arrays[Mesh.ARRAY_VERTEX].size(), "region": null, "pos": []})
			for sf in mine:
				var arr := arrays
				if sf.has("keep"):
					var keep := B.slice(o0 + int(sf["keep"]), o0 + int(sf["keep"]) + 4 * int(sf["n"])).to_int32_array()
					var tris := B.slice(o0 + int(sf["tris"][0]), o0 + int(sf["tris"][0]) + 4 * int(sf["tris"][1])).to_int32_array()
					arr = _subset(arrays, keep, tris)
				var bs := []
				for k in shapes.size():
					var sh := []
					sh.resize(Mesh.ARRAY_MAX)
					if k < sf["pos"].size():
						var off: int = o0 + int(sf["pos"][k])
						sh[Mesh.ARRAY_VERTEX] = B.slice(off, off + 12 * int(sf["n"])).to_vector3_array()
					else:
						var zero := PackedVector3Array()
						zero.resize(arr[Mesh.ARRAY_VERTEX].size())
						sh[Mesh.ARRAY_VERTEX] = zero
					# relative shapes add weight * normal before normalising: the base's own normal leaves it as it is
					sh[Mesh.ARRAY_NORMAL] = arr[Mesh.ARRAY_NORMAL]
					if arr[Mesh.ARRAY_TANGENT] != null:
						sh[Mesh.ARRAY_TANGENT] = arr[Mesh.ARRAY_TANGENT]
					bs.append(sh)
				var flags := 0
				if arr[Mesh.ARRAY_BONES] != null and arr[Mesh.ARRAY_BONES].size() == arr[Mesh.ARRAY_VERTEX].size() * 8:
					flags |= Mesh.ARRAY_FLAG_USE_8_BONE_WEIGHTS
				mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr, bs, {}, flags)
				if mat:
					mesh.surface_set_material(mesh.get_surface_count() - 1, mat)
				mesh.surface_set_name(mesh.get_surface_count() - 1, nm)
				regions.append(int(sf["region"]) if sf["region"] != null else 0)
		var skin: Skin = mi.skin.duplicate(true) if mi.skin else null
		if skin:
			for k in skin.get_bind_count():
				var bn := skin.get_bind_name(k)
				if bn == "":
					bn = gen.get_bone_name(skin.get_bind_bone(k))
				skin.set_bind_name(k, bn.trim_prefix("mixamorig:").trim_prefix("mixamorig_"))
		var ground = null                 # the skin's mesh carries the ground
		for sf in info["surfaces"]:
			if sf.get("region") != null:
				ground = H.get("ground")
		built.append({"mesh": mesh, "skin": skin, "shapes": shapes, "regions": regions, "ground": ground})
	scene.free()
	_cache[glb] = built
	return built


# a region of a surface: the vertices it keeps (in the order the shapes were written), its triangles renumbered
static func _subset(arrays: Array, keep: PackedInt32Array, tris: PackedInt32Array) -> Array:
	var ix: PackedInt32Array = arrays[Mesh.ARRAY_INDEX]
	var nv: int = arrays[Mesh.ARRAY_VERTEX].size()
	var remap := PackedInt32Array()
	remap.resize(nv)
	for i in keep.size():
		remap[keep[i]] = i
	var nix := PackedInt32Array()
	nix.resize(tris.size() * 3)
	for k in tris.size():
		var t := 3 * tris[k]
		nix[3 * k] = remap[ix[t]]
		nix[3 * k + 1] = remap[ix[t + 1]]
		nix[3 * k + 2] = remap[ix[t + 2]]
	var out := []
	out.resize(Mesh.ARRAY_MAX)
	for a in Mesh.ARRAY_MAX:
		if a == Mesh.ARRAY_INDEX:
			out[a] = nix
		elif arrays[a] != null:
			out[a] = _pick(arrays[a], keep, nv)
	return out


static func _pick(arr, keep: PackedInt32Array, nv: int):
	var stride: int = arr.size() / nv
	var out = arr.duplicate()
	out.resize(keep.size() * stride)
	if stride == 1:
		for i in keep.size():
			out[i] = arr[keep[i]]
	else:
		for i in keep.size():
			var a := keep[i] * stride
			for s in stride:
				out[i * stride + s] = arr[a + s]
	return out


# ---- a character ----

func _live_meshes(part: Dictionary) -> Array:
	var built := _build("%s/pieces/%s.glb" % [dir, part["key"]])
	var out := []
	for n in built.size():
		var id: String = part["key"] + "|" + str(n)
		if not _live.has(id):
			var b: Dictionary = built[n]
			var mi := MeshInstance3D.new()
			mi.name = id.replace("|", "__").replace("/", "_")
			mi.mesh = b["mesh"]
			if b["skin"]:
				var skin: Skin = b["skin"].duplicate(true)
				var bind0 := []
				var head_bind = null
				for k in skin.get_bind_count():
					if skin.get_bind_name(k) == "Head":
						head_bind = skin.get_bind_pose(k)
				for k in skin.get_bind_count():
					var bone := skeleton.find_bone(skin.get_bind_name(k))
					if bone < 0:          # a bone we lack ('neutral_bone'): ride the head, with its bind
						bone = _head
						skin.set_bind_name(k, "Head")
						if head_bind != null:
							skin.set_bind_pose(k, head_bind)
					skin.set_bind_bone(k, bone)
					bind0.append(skin.get_bind_pose(k))
				mi.skin = skin
				mi.set_meta("bind0", bind0)
			mi.set_meta("part", part)
			mi.set_meta("built", b)
			skeleton.add_child(mi)
			mi.skeleton = NodePath("..")
			_live[id] = mi
		out.append(_live[id])
	return out


func apply(rec: Dictionary) -> void:
	record = rec
	var want := {}
	for p in KChar.parts(rec, kit):
		for mi in _live_meshes(p):
			want[mi] = true
	for id in _live:
		_live[id].visible = want.has(_live[id])
	var w := KChar.morph_weights(rec, kit)
	morph = KChar.morph_joints(skel, kit, w)
	var d: Array = morph["d"]
	for i in skeleton.get_bone_count():
		if i != _hips:
			skeleton.set_bone_pose_position(i, morph["t"][i])
	# the items worn, as bits of kit.items: their skin regions hide
	var worn := 0
	var items: Array = kit["items"]
	for i in items.size():
		var it = KChar.item(rec, kit, items[i]["slot"])
		if it != null and it["id"] == items[i]["id"]:
			worn |= 1 << i
	var roles: Dictionary = kit.get("tint", {}).get("roles", {})
	var gain: Dictionary = kit.get("tint", {}).get("gain", {})
	skeleton.position.y = 0.0
	for mi in want:
		var b: Dictionary = mi.get_meta("built")
		var shapes: PackedInt32Array = b["shapes"]
		for s in shapes.size():
			mi.set_blend_shape_value(s, w[shapes[s]])
		if mi.skin:
			var bind0: Array = mi.get_meta("bind0")
			for k in mi.skin.get_bind_count():
				var bone: int = mi.skin.get_bind_bone(k)
				mi.skin.set_bind_pose(k, bind0[k] * Transform3D(Basis(), -d[bone]))
		var part: Dictionary = mi.get_meta("part")
		for s in mi.mesh.get_surface_count():
			var region: int = b["regions"][s]
			if region & worn:
				mi.set_surface_override_material(s, _hidden_mat)
				continue
			mi.set_surface_override_material(s, _tinted(mi.mesh.surface_get_material(s), roles.get(mi.mesh.surface_get_name(s), ""), part, rec, gain))
		if b["ground"] != null:
			var G: Dictionary = b["ground"]
			var low := INF
			for k in G["y0"].size():
				var y: float = G["y0"][k]
				for s in shapes.size():
					var col = G["dy"].get(str(shapes[s]))
					if col != null:
						y += w[shapes[s]] * float(col[k])
				low = minf(low, y)
			skeleton.position.y = float(G["y0"][0]) - low
	if _clip == "":
		rest_pose()


func _lin(hex: String, g: float) -> Color:
	var c := Color(hex).srgb_to_linear()
	return Color(c.r * g, c.g * g, c.b * g).linear_to_srgb()


func _tinted(mat: Material, role: String, part: Dictionary, rec: Dictionary, gain: Dictionary) -> Material:
	if mat == null:
		return null
	if role == "eye":
		var sm := ShaderMaterial.new()
		sm.shader = EYE_SHADER
		sm.set_shader_parameter("tex", (mat as BaseMaterial3D).albedo_texture)
		var c := Color(rec.get("eye_color") if rec.get("eye_color") != null else "#5a3a22").srgb_to_linear()
		var g := float(gain.get("eye", 1.0))
		sm.set_shader_parameter("tint", Vector3(c.r * g, c.g * g, c.b * g))
		return sm
	var m2 := mat.duplicate() as BaseMaterial3D
	if role == "skin":
		m2.albedo_color = _lin(rec.get("skin") if rec.get("skin") != null else "#d6ad8f", float(gain.get("skin", 1.0)))
	elif role == "hair":
		m2.albedo_color = _lin(rec.get("hair_color") if rec.get("hair_color") != null else "#4a3424", float(gain.get("hair", 1.0)))
	else:
		var dye = rec.get("dye", {}).get(part["slot"]) if part["role"] == "armour" else null
		m2.albedo_color = Color(dye) if dye != null else Color.WHITE
	return m2


func rest_pose() -> void:
	var J: Array = skel["joints"]
	for i in J.size():
		skeleton.set_bone_pose_rotation(i, KChar._q(J[i]["r"]))
	skeleton.set_bone_pose_position(_hips, morph["t"][_hips])
	_grip()


# ---- holding props (data/props.json; the twin of hold() in 50-figure.js) ----
# hold({"R": "sword", "L": "shield"}): each prop's GLB under a BoneAttachment3D on its hand bone, at the grip frame
# skeleton.json 'hands' gives (the props are modelled in it); that hand's fingers close round it every frame
var held := {"R": null, "L": null}
var _holders := {}


func hold(want: Dictionary) -> void:
	if not skel.has("hands"):
		return
	for side in ["R", "L"]:
		var id = want.get(side)
		if held[side] == id:
			continue
		held[side] = id
		if not _holders.has(side):
			var h: Dictionary = skel["hands"][side]
			var att := BoneAttachment3D.new()
			att.name = "Hold" + side
			skeleton.add_child(att)
			att.bone_idx = int(h["bone"])
			var g := Node3D.new()
			var gr: Array = h["grip"]
			g.transform = Transform3D(Basis(Quaternion(gr[3], gr[4], gr[5], gr[6])), Vector3(gr[0], gr[1], gr[2]))
			att.add_child(g)
			_holders[side] = g
		var holder: Node3D = _holders[side]
		for ch in holder.get_children():
			ch.queue_free()
		if id != null:
			holder.add_child(_scene("%s/pieces/props/%s.glb" % [dir, id]))
	_grip()


func _grip() -> void:
	if not skel.has("hands"):
		return
	var J: Array = skel["joints"]
	for side in ["R", "L"]:
		if held[side] == null:
			continue
		for c in skel["hands"][side]["curl"]:
			var i: int = int(c[0])
			skeleton.set_bone_pose_rotation(i, KChar._q(J[i]["r"]) * Quaternion(c[1], c[2], c[3], c[4]))


func play(clip: String) -> void:
	_clip = clip
	if clip == "" or not player.has_animation(clip):
		_clip = ""
		player.stop()
		rest_pose()
		return
	# skeleton.json's clip list says which play once (an attack, a fall): those go back to the last loop when done
	var once := false
	for c in skel.get("clips", []):
		if c["name"] == clip:
			once = c.get("loop", true) == false
	if not once:
		looping = clip
	player.get_animation(clip).loop_mode = Animation.LOOP_NONE if once else Animation.LOOP_LINEAR
	player.play(clip, 0.25)


func _process(dt: float) -> void:
	if _clip == "":
		return
	player.advance(dt)
	if not player.is_playing() and _clip != looping:
		play(looping)
		return
	# the clip writes the hips where the base body's are; the morph moves them
	skeleton.set_bone_pose_position(_hips, skeleton.get_bone_pose_position(_hips) + morph["d"][_hips])
	_grip()
