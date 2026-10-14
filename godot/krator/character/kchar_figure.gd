# KCharFigure: a MakeHuman character from kits/characters' pieces on one Skeleton3D. The Godot side of
# src/50-figure.js for the kit.style "mpfb" bodies.
#   var fig := KCharFigure.new()
#   fig.load_body("res://data/characters", "mpfb_male")    # <dir>/<body>/{skeleton,kit}.json, <dir>/pieces/<body>/*.glb + *.gshapes.bin
#   add_child(fig); fig.apply(KChar.stranger(7, fig.kit, people)); fig.play("walk")
# How it differs from the page, and why:
# - Morphs are blend shapes. Each piece is rebuilt once as an ArrayMesh with one shape per morph target that moves it
#   ("t<target index>", relative: Godot adds weight * offset; base normals); a character is only its weights. The meshes are shared
#   by every figure of a body (a static cache), so a crowd costs one copy of the geometry.
# - Hidden skin is regions. Godot cannot drop triangles per instance, so the skin's triangles are grouped by which
#   items cover them (kit items' hide bitsets) and each vertex carries its group; kchar_skin.gdshader draws the groups a
#   worn item covers as nothing (one surface, one draw call).
# - The joints and inverse binds move as in the page: bone pose position = KChar.morph_joints t, and each bind is
#   bind0 * T(-d[bone]), so the skinned rest is exactly the morphed mesh. A bone the skeleton lacks (an exporter's
#   'neutral_bone') takes Head's bind. The feet stay on the ground from the skin's lowest vertices.
# - Skin, hair and eye colours as in the page (kit.tint): albedo = linear(colour) * gain; the eyes use kchar_eye.gdshader.
# The shapes come prebuilt from make_mpfb.py (<piece>.gshapes.bin: each target's positions and normals whole, blended
# NORMALIZED so a reshaped body's normals turn as the page's do; the skin's regions; the ground), so building a piece
# is bulk conversions, not a GDScript loop over deltas. A game would save the built
# meshes as resources.
class_name KCharFigure
extends Node3D

const EYE_SHADER := preload("res://krator/character/kchar_eye.gdshader")
const SKIN_SHADER := preload("res://krator/character/kchar_skin.gdshader")
const PUSH_SHADER := preload("res://krator/character/kchar_push.gdshader")

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
var size := 1.0                          # kit.scale: a giant's whole figure
var cadence := 1.0                       # how fast clips play: 1 / sqrt(size)
var four_arms := false                   # a mod gives it a second pair of arms (KChar.arms)


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
	player = AnimationPlayer.new()
	player.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
	add_child(player)
	var lib := AnimationLibrary.new()
	# a giant (kit.scale, kits/characters/tools/giant.py) plays the man's clips (kit.anims), slower by the square root
	# of its scale; the whole skeleton is scaled, and everything below works in its (unscaled) space
	size = float(kit.get("scale", 1.0))
	cadence = 1.0 / sqrt(size)
	skeleton.scale = Vector3.ONE * size
	var anims := _scene("%s/pieces/%s/anims.glb" % [dir, kit.get("anims", body)])
	var src: AnimationPlayer = anims.find_child("AnimationPlayer", true, false)
	if src:
		for lib_name in src.get_animation_library_list():
			var from := src.get_animation_library(lib_name)
			for nm in from.get_animation_list():
				lib.add_animation(nm, _retarget(from.get_animation(nm)))
	player.add_animation_library("", lib)
	anims.free()
	morph = KChar.morph_joints(skel, kit, KChar.morph_weights({}, kit))
	_low_setup()
	if FileAccess.file_exists(dir + "/props.json"):
		for p in JSON.parse_string(FileAccess.get_file_as_string(dir + "/props.json"))["props"]:
			props[p["id"]] = p


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
# blend shape), regions: Array (per surface: whether it is the joined skin), cover: per skin region the kit.items indices
# that hide it, ground: the skin's lowest vertices or null }
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
		# whole shapes (make_mpfb.py godot_shapes): NORMALIZED blends base * (1 - sum w) + sum w * shape, so the
		# normals blend linearly too; an older file has offsets, blended RELATIVE with the base's normals
		var whole: bool = H.get("whole", false)
		mesh.blend_shape_mode = Mesh.BLEND_SHAPE_MODE_NORMALIZED if whole else Mesh.BLEND_SHAPE_MODE_RELATIVE
		for t in shapes:
			mesh.add_blend_shape("t%d" % t)
		var regions := []                 # per surface: whether it is the joined skin (hidden by region)
		var joined := {}
		var verts0 = null                 # the first surface's positions and shapes (the cloth chains' rest)
		var offs0 := []
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
					elif whole:
						sh[Mesh.ARRAY_VERTEX] = arr[Mesh.ARRAY_VERTEX]
					else:
						var zero := PackedVector3Array()
						zero.resize(arr[Mesh.ARRAY_VERTEX].size())
						sh[Mesh.ARRAY_VERTEX] = zero
					if whole and k < sf.get("nrm", []).size():
						var offn: int = o0 + int(sf["nrm"][k])
						sh[Mesh.ARRAY_NORMAL] = B.slice(offn, offn + 12 * int(sf["n"])).to_vector3_array()
					else:
						# the base's own normal: no turn either way (RELATIVE adds weight * normal before normalising)
						sh[Mesh.ARRAY_NORMAL] = arr[Mesh.ARRAY_NORMAL]
					if arr[Mesh.ARRAY_TANGENT] != null:
						sh[Mesh.ARRAY_TANGENT] = arr[Mesh.ARRAY_TANGENT]
					bs.append(sh)
				if sf.has("keep"):
					# a region of the skin: joined to the others below, each vertex carrying its region (CUSTOM0)
					_join(joined, arr, bs, int(sf["region"]))
					joined["mat"] = mat
					joined["name"] = nm
					continue
				var flags := 0
				if arr[Mesh.ARRAY_BONES] != null and arr[Mesh.ARRAY_BONES].size() == arr[Mesh.ARRAY_VERTEX].size() * 8:
					flags |= Mesh.ARRAY_FLAG_USE_8_BONE_WEIGHTS
				if verts0 == null:
					verts0 = arr[Mesh.ARRAY_VERTEX]
					for sh in bs:
						offs0.append(sh[Mesh.ARRAY_VERTEX])
				mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr, bs, {}, flags)
				if mat:
					mesh.surface_set_material(mesh.get_surface_count() - 1, mat)
				mesh.surface_set_name(mesh.get_surface_count() - 1, nm)
				regions.append(false)
		if joined.has("arr"):
			var ja: Array = joined["arr"]
			var flags := Mesh.ARRAY_CUSTOM_RGBA_FLOAT << Mesh.ARRAY_FORMAT_CUSTOM0_SHIFT
			if ja[Mesh.ARRAY_BONES] != null and ja[Mesh.ARRAY_BONES].size() == ja[Mesh.ARRAY_VERTEX].size() * 8:
				flags |= Mesh.ARRAY_FLAG_USE_8_BONE_WEIGHTS
			mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, ja, joined["bs"], {}, flags)
			if joined["mat"]:
				mesh.surface_set_material(mesh.get_surface_count() - 1, joined["mat"])
			mesh.surface_set_name(mesh.get_surface_count() - 1, joined["name"])
			regions.append(true)
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
		built.append({"mesh": mesh, "skin": skin, "shapes": shapes, "regions": regions, "ground": ground, "verts0": verts0, "offs0": offs0,
			"whole": whole, "cover": H.get("cover", [])})
	scene.free()
	_cache[glb] = built
	return built


# the skin's regions as one surface: each region's arrays and shapes appended, its indices moved past the vertices
# before it, and its region number in every vertex's CUSTOM0 (kchar_skin.gdshader draws a covered region as nothing:
# one draw call for the skin instead of one per region)
static func _join(J: Dictionary, arr: Array, bs: Array, region: int) -> void:
	var nv: int = arr[Mesh.ARRAY_VERTEX].size()
	var c := PackedFloat32Array()
	c.resize(nv * 4)
	c.fill(float(region))
	if not J.has("arr"):
		# copies of every array: packed arrays are shared by reference (a shape's tangents are the surface's own)
		var a0 := arr.duplicate(true)
		a0[Mesh.ARRAY_CUSTOM0] = c
		J["arr"] = a0
		J["bs"] = []
		for sh in bs:
			J["bs"].append(sh.duplicate(true))
		return
	var A: Array = J["arr"]
	var base: int = A[Mesh.ARRAY_VERTEX].size()
	var ix: PackedInt32Array = arr[Mesh.ARRAY_INDEX].duplicate()
	for k in ix.size():
		ix[k] += base
	for a in Mesh.ARRAY_MAX:
		if A[a] == null:
			continue
		var x = A[a]
		if a == Mesh.ARRAY_INDEX:
			x.append_array(ix)
		elif a == Mesh.ARRAY_CUSTOM0:
			x.append_array(c)
		elif arr[a] != null:
			x.append_array(arr[a])
		A[a] = x
	for k in bs.size():
		var S: Array = J["bs"][k]
		for a in [Mesh.ARRAY_VERTEX, Mesh.ARRAY_NORMAL, Mesh.ARRAY_TANGENT]:
			if S[a] != null and bs[k][a] != null:
				var y = S[a]
				y.append_array(bs[k][a])
				S[a] = y


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
				var cl := _cloth_of(part)
				for k in skin.get_bind_count():
					var bone := skeleton.find_bone(skin.get_bind_name(k))
					if bone < 0 and not cl.is_empty():      # a garment's cloth joint: its chain bone
						bone = int(cl["by_name"].get(_cloth_key(skin.get_bind_name(k)), -1))
					if bone < 0:          # a bone we lack ('neutral_bone'): ride the head, with its bind
						bone = _head
						skin.set_bind_name(k, "Head")
						if head_bind != null:
							skin.set_bind_pose(k, head_bind)
					skin.set_bind_bone(k, bone)
					bind0.append(skin.get_bind_pose(k))
				mi.skin = skin
				mi.set_meta("bind0", bind0)
				if not cl.is_empty():
					cl["meshes"].append(mi)
			mi.set_meta("part", part)
			mi.set_meta("built", b)
			skeleton.add_child(mi)
			mi.skeleton = NodePath("..")
			_live[id] = mi
		out.append(_live[id])
	return out


func apply(rec: Dictionary) -> void:
	record = rec
	_push_mats.clear()
	var want := {}
	for p in KChar.parts(rec, kit):
		for mi in _live_meshes(p):
			want[mi] = true
	for id in _live:
		_live[id].visible = want.has(_live[id])
	var w := KChar.morph_weights(rec, kit)
	morph = KChar.morph_joints(skel, kit, w)
	var d: Array = morph["d"]
	for i in skel["joints"].size():
		if i != _hips:
			skeleton.set_bone_pose_position(i, morph["t"][i])
	# the items worn, by index in kit.items: the skin regions they cover hide
	var worn := {}
	var items: Array = kit["items"]
	for i in items.size():
		var it = KChar.item(rec, kit, items[i]["slot"])
		if it != null and it["id"] == items[i]["id"]:
			worn[i] = true
	for m in KChar.mods(rec, kit):            # a mod that replaces part of the body covers its skin too
		var mi := items.find(m)
		if mi >= 0:
			worn[mi] = true
	var roles: Dictionary = kit.get("tint", {}).get("roles", {})
	var gain: Dictionary = kit.get("tint", {}).get("gain", {})
	four_arms = KChar.arms(rec, kit) >= 4          # a mod's second pair (kits/characters/tools/mods.py)
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
				if bone < d.size():                  # a cloth chain's bind is set by _cloth_rest
					mi.skin.set_bind_pose(k, bind0[k] * Transform3D(Basis(), -d[bone]))
		var part: Dictionary = mi.get_meta("part")
		for s in mi.mesh.get_surface_count():
			var m := _tinted(mi.mesh.surface_get_material(s), roles.get(mi.mesh.surface_get_name(s), ""), part, rec, gain)
			if b["regions"][s]:
				var nreg: int = maxi(1, b["cover"].size())
				var hide := Image.create(nreg, 1, false, Image.FORMAT_R8)
				for r in b["cover"].size():
					for i in b["cover"][r]:
						if worn.has(int(i)):
							hide.set_pixel(r, 0, Color(1, 0, 0))
				m = _skin_mat(m as BaseMaterial3D, hide)
			mi.set_surface_override_material(s, m)
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
			skeleton.position.y = (float(G["y0"][0]) - low) * size
	_cloth_rest(want, w)
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
	if part["role"] == "armour" and (part["slot"] == "torso" or part["slot"] == "legs"):
		var dye0 = rec.get("dye", {}).get(part["slot"])
		m2.albedo_color = Color(dye0) if dye0 != null else Color.WHITE
		return _garment(m2, part, rec)
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
	_after_clip(-1.0)


# ---- holding props (data/props.json; the twin of hold() in 50-figure.js) ----
# hold({"R": "sword", "L": "shield", "both": false}): each prop's GLB under a BoneAttachment3D on its hand bone, at the
# grip frame skeleton.json 'hands' gives (the props are modelled in it); that hand's fingers close round it every
# frame in the prop's grip style (fist, trigger, wide). both: the left hand takes hold of the right's prop too, at its
# support (_two_hands). A prop with a string (the bow) gets it drawn live, and an arrow while the right hand draws
var held := {"R": null, "L": null, "R2": null, "L2": null, "both": false}
var props := {}                          # data/props.json by id
var reach := 0.0                         # how far short of its hold the left hand fell (_two_hands)
var drawn := false                       # the bow string is pulled
var _holders := {}
var _bow := {}
var _saved: Array[Quaternion] = []
var _hold2 := 1.0
const GAP := 0.1
const MOVE := 0.45


func _holder(side: String) -> Node3D:
	if not _holders.has(side):
		var h: Dictionary = skel["hands"][side]
		var att := BoneAttachment3D.new()
		att.name = "Hold" + side
		skeleton.add_child(att)
		att.bone_idx = int(h["bone"])
		var g := Node3D.new()
		g.transform = _grip_t(side)
		att.add_child(g)
		_holders[side] = g
	return _holders[side]


func _grip_t(side: String) -> Transform3D:
	var gr: Array = skel["hands"][side]["grip"]
	return Transform3D(Basis(Quaternion(gr[3], gr[4], gr[5], gr[6])), Vector3(gr[0], gr[1], gr[2]))


func hold(want: Dictionary) -> void:
	if not skel.has("hands"):
		return
	held["both"] = bool(want.get("both", false))
	for side in _hands():
		var id = want.get(side)
		if held[side] == id:
			continue
		held[side] = id
		var holder := _holder(side)
		for ch in holder.get_children():
			holder.remove_child(ch)
			ch.queue_free()
		if side == "L":
			_bow = {}
		if id != null:
			var m := _scene("%s/pieces/props/%s.glb" % [dir, id])
			holder.add_child(m)
			# in a lower hand a prop with low_turn turns about its handle (the shield stands up and faces out)
			var turn := float(props.get(id, {}).get("low_turn", 0))
			if side.length() > 1 and turn != 0.0 and m is Node3D:
				(m as Node3D).rotation.y = (1.0 if side[0] == "L" else -1.0) * deg_to_rad(turn)
			if side == "L" and props.get(id, {}).has("string"):
				_make_bow(holder, props[id])
	_after_clip(-1.0)


# posture (50-figure.js posture): after each clip the spine is bent forward (degrees per joint, negative forward, the
# neck taking back "neck" of it) and the shoulders dropped and drawn back, in the skeleton's frame (the figure's)
const POSTURE := {"spine": {"Spine": -6.0, "Spine1": -8.0, "Spine2": -8.0}, "neck": 0.5, "drop": 9.0, "back": 10.0}


func _posture() -> void:
	if player == null or not player.is_playing():
		return                              # the rest pose (the A-pose clothes are fitted in) stays as it is
	# the upper arms keep the way the clip points them: the torso straightens under them, and a thrust or a held
	# spear aims where the clip aims it
	var arms := {}
	for n in ["LeftArm", "RightArm"]:
		var a := skeleton.find_bone(n)
		if a >= 0:
			arms[a] = _gp(a).basis.get_rotation_quaternion()
	var lean := 0.0
	for n in POSTURE["spine"]:
		var b := skeleton.find_bone(n)
		if b < 0:
			continue
		var a := deg_to_rad(float(POSTURE["spine"][n]))
		lean += a
		_turn(b, Quaternion(Vector3(1, 0, 0), -a))
	var neck := skeleton.find_bone("Neck")
	if neck >= 0:
		_turn(neck, Quaternion(Vector3(1, 0, 0), lean * float(POSTURE["neck"])))
	for sh in [["LeftShoulder", 1.0], ["RightShoulder", -1.0]]:
		var b := skeleton.find_bone(sh[0])
		if b < 0:
			continue
		_turn(b, Quaternion(Vector3(0, 0, 1), -sh[1] * deg_to_rad(float(POSTURE["drop"]))))
		_turn(b, Quaternion(Vector3(0, 1, 0), sh[1] * deg_to_rad(float(POSTURE["back"]))))
	for a in arms:
		var par := skeleton.get_bone_parent(a)
		skeleton.set_bone_pose_rotation(a, (_gp(par).basis.get_rotation_quaternion().inverse() * arms[a]).normalized())


func _after_clip(dt: float) -> void:
	_posture()
	_arms2(dt)
	_body_fix()
	_grip()
	_two_hands(dt)
	_cloth_step(dt)
	_leg_caps()
	_bow_string()


func _grip() -> void:
	if not skel.has("hands"):
		return
	var J: Array = skel["joints"]
	for side in _hands():
		if side.length() > 1 and _holders.has(side):
			_holders[side].visible = four_arms
		var id = held[side]
		if id == null and side == "L" and _support().size() > 0:
			id = held["R"]
		if id == null:
			continue
		var h: Dictionary = skel["hands"][side]
		var style: String = props.get(id, {}).get("grip", "fist") if held[side] != null else "fist"
		var curl: Array = h["curls"].get(style, h["curls"]["fist"]) if h.has("curls") else h["curl"]
		for c in curl:
			var i: int = int(c[0])
			skeleton.set_bone_pose_rotation(i, KChar._q(J[i]["r"]) * Quaternion(c[1], c[2], c[3], c[4]))


# a bone's pose in the skeleton's space, from the local poses (Skeleton3D's global cache refreshes on its own time)
func _gp(b: int) -> Transform3D:
	var t := skeleton.get_bone_pose(b)
	var p := skeleton.get_bone_parent(b)
	while p >= 0:
		t = skeleton.get_bone_pose(p) * t
		p = skeleton.get_bone_parent(p)
	return t


func _support() -> Array:
	if not held["both"] or held["R"] == null or not _holders.has("R"):
		return []
	return props.get(held["R"], {}).get("support", [])


# turn bone b by q (in the skeleton's space) about its own origin
func _turn(b: int, q: Quaternion) -> void:
	var par := skeleton.get_bone_parent(b)
	var pq := _gp(par).basis.get_rotation_quaternion() if par >= 0 else Quaternion()
	skeleton.set_bone_pose_rotation(b, (pq.inverse() * q * pq * skeleton.get_bone_pose_rotation(b)).normalized())


# twin of twoHands in 50-figure.js: the left hand onto the right's prop at the point of its support segment nearest
# where the clip has it (within the arm's reach, a hand's width from the right hand), its handle axis along the
# segment, fingers away from the shoulder; the right arm brings the prop in when the left cannot reach; a clip that
# keeps the hands too far apart eases the arms back to its own pose
func _two_hands(dt: float) -> void:
	var sp := _support()
	if sp.is_empty():
		_hold2 = 1.0
		return
	var h: Dictionary = skel["hands"]["L"]
	var arm: Array = h["arm"]
	var r_arm: Array = skel["hands"]["R"]["arm"]
	var up: int = int(arm[0])
	var fore: int = int(arm[1])
	var hand: int = int(arm[2])
	var all := arm + r_arm
	_saved.clear()
	for b in all:
		_saved.append(skeleton.get_bone_pose_rotation(int(b)))
	var R := _gp(int(skel["hands"]["R"]["bone"])) * _grip_t("R")
	var A := R * Vector3(sp[0], sp[1], sp[2])
	var B := R * Vector3(sp[3], sp[4], sp[5])
	var O := R.origin
	var gl := _grip_t("L")
	var M := _gp(hand) * gl
	var S := _gp(up).origin
	var l1 := _gp(fore).origin.distance_to(S)
	var l2 := _gp(hand).origin.distance_to(_gp(fore).origin)
	var far := l1 + l2 + 0.05
	var Y := B - A
	var L := Y.length()
	var t := 0.0
	if L < 1e-4:
		Y = R.basis.y.normalized()
	else:
		Y /= L
		t = clampf((M.origin - A).dot(Y), 0.0, L)
		var ts := (S - A).dot(Y)
		var off := ((S - A) - Y * ts).length()
		if off < far:
			var hw := sqrt(far * far - off * off)
			t = clampf(t, ts - hw, ts + hw)
		var o := (O - A).dot(Y)
		if absf(t - o) < GAP:
			t = o + GAP if (o + GAP <= L if t >= o else o - GAP < 0.0) else o - GAP
		t = clampf(t, 0.0, L)
	var P := A + Y * t
	if M.basis.y.dot(Y) < 0.0:
		Y = -Y
	var Z := (P - S) + M.basis.z.normalized() * 0.3
	Z -= Y * Z.dot(Y)
	if Z.length_squared() < 1e-8:
		Z = R.basis.z
	Z = Z.normalized()
	var X := Y.cross(Z)
	var target := Transform3D(Basis(X, Y, Z), P) * gl.affine_inverse()
	var W := target.origin
	var qa := target.basis.get_rotation_quaternion()
	var dW := W.distance_to(S)
	if dW > l1 + l2 - 0.01:
		var d := (S - W).normalized() * minf(dW - (l1 + l2 - 0.01), MOVE)
		var rh: int = int(r_arm[2])
		var rt := _gp(rh)
		_reach_arm(int(r_arm[0]), int(r_arm[1]), rh, rt.origin + d, rt.basis.get_rotation_quaternion())
		W += d
	_reach_arm(up, fore, hand, W, qa)
	reach = _gp(hand).origin.distance_to(W)
	var want := clampf((0.16 - reach) / 0.1, 0.0, 1.0)
	_hold2 = want if dt < 0.0 else _hold2 + clampf(want - _hold2, -dt * 4.0, dt * 4.0)
	if _hold2 < 1.0:
		for k in all.size():
			skeleton.set_bone_pose_rotation(int(all[k]), _saved[k].slerp(skeleton.get_bone_pose_rotation(int(all[k])), _hold2))


# the two-bone solve: the elbow opens or closes to the distance, the upper arm swings onto the target with the elbow
# turned back to the side it was on, and the hand turns to q (all in the skeleton's space)
func _reach_arm(up: int, fore: int, hand: int, w: Vector3, q: Quaternion) -> void:
	var S := _gp(up).origin
	var E := _gp(fore).origin
	var T := _gp(hand).origin
	var l1 := E.distance_to(S)
	var l2 := T.distance_to(E)
	var d := clampf(w.distance_to(S), absf(l1 - l2) + 1e-3, l1 + l2 - 1e-3)
	var u := S - E
	var v := T - E
	var cur := u.angle_to(v)
	var want := acos(clampf((l1 * l1 + l2 * l2 - d * d) / (2.0 * l1 * l2), -1.0, 1.0))
	var k := u.cross(v)
	if k.length_squared() < 1e-10:
		k = Vector3(0, 0, 1).cross(u)
	_turn(fore, Quaternion(k.normalized(), want - cur))
	var pole := E
	T = _gp(hand).origin
	_turn(up, Quaternion((T - S).normalized(), (w - S).normalized()))
	E = _gp(fore).origin
	var ax := (w - S).normalized()
	var eu := (E - S) - ax * ax.dot(E - S)
	var pu := (pole - S) - ax * ax.dot(pole - S)
	if eu.length_squared() > 1e-8 and pu.length_squared() > 1e-8:
		var a := eu.angle_to(pu)
		if eu.cross(pu).dot(ax) < 0.0:
			a = -a
		_turn(up, Quaternion(ax, a))
	var par := skeleton.get_bone_parent(hand)
	skeleton.set_bone_pose_rotation(hand, (_gp(par).basis.get_rotation_quaternion().inverse() * q).normalized())


# twin of bowString: the string between the bow's limb tips through the drawing hand while it is behind the bow and
# near its middle, the bow turned about its handle to face that hand, and an arrow once the string is pulled
func _make_bow(holder: Node3D, p: Dictionary) -> void:
	var pivot := Node3D.new()
	for ch in holder.get_children():
		holder.remove_child(ch)
		pivot.add_child(ch)
	holder.add_child(pivot)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.85, 0.80, 0.68)
	mat.roughness = 0.9
	var cyl := CylinderMesh.new()
	cyl.top_radius = 0.0025
	cyl.bottom_radius = 0.0025
	cyl.height = 1.0
	cyl.radial_segments = 4
	cyl.material = mat
	var s: Array = p["string"]
	_bow = {"top": Vector3(s[0], s[1], s[2]), "bot": Vector3(s[3], s[4], s[5]), "pivot": pivot, "a": MeshInstance3D.new(),
		"c": MeshInstance3D.new(), "arrow": null}
	for k in ["a", "c"]:
		_bow[k].mesh = cyl
		pivot.add_child(_bow[k])
	if p.has("arrow"):
		var ar := _scene("%s/pieces/props/%s.glb" % [dir, p["arrow"]]) as Node3D
		ar.visible = false
		pivot.add_child(ar)
		_bow["arrow"] = ar


func _span(m: MeshInstance3D, a: Vector3, b: Vector3) -> void:
	var d := b - a
	var n := maxf(d.length(), 1e-4)
	m.transform = Transform3D(Basis(Quaternion(Vector3.UP, d / n)) * Basis.from_scale(Vector3(1, n, 1)), (a + b) * 0.5)


func _bow_string() -> void:
	drawn = false
	if _bow.is_empty():
		return
	var top: Vector3 = _bow["top"]
	var bot: Vector3 = _bow["bot"]
	var rest := (top.z + bot.z) * 0.5
	var pivot: Node3D = _bow["pivot"]
	var lh := _gp(int(skel["hands"]["L"]["bone"])) * _grip_t("L")
	var rp := _gp(int(skel["hands"]["R"]["bone"])) * _grip_t("R").origin
	var p := lh.affine_inverse() * rp                          # the drawing hand in the bow hand's grip frame
	var n := Vector2(p.x, p.z).length()
	var turn := 0.0
	if absf(p.y) < 0.35 and n > 0.12 and n < 0.95:
		turn = atan2(-p.x, -p.z)
	pivot.transform = Transform3D(Basis(Vector3.UP, turn), Vector3.ZERO)
	p = p.rotated(Vector3.UP, -turn)
	drawn = turn != 0.0 and p.z < rest - 0.02
	var hR: Dictionary = skel["hands"]["R"]
	if drawn and held["R"] == null and hR.has("curls") and hR["curls"].has("draw"):
		var J: Array = skel["joints"]
		for cq in hR["curls"]["draw"]:
			skeleton.set_bone_pose_rotation(int(cq[0]), KChar._q(J[int(cq[0])]["r"]) * Quaternion(cq[1], cq[2], cq[3], cq[4]))
	if drawn:
		_span(_bow["a"], top, p)
		_span(_bow["c"], p, bot)
	else:
		_span(_bow["a"], top, bot)
	_bow["c"].visible = drawn
	var ar = _bow["arrow"]
	if ar != null:
		ar.visible = drawn and p.z < -0.2
		if ar.visible:
			var to := (Vector3(0, 0.04 * (signf(p.y) if p.y != 0.0 else 1.0), 0) - p).normalized()
			ar.transform = Transform3D(Basis(Quaternion(Vector3.BACK, to)), p)


# ---- cloth (the twin of the cloth section of 50-figure.js) ----
# A garment's hanging parts are bone chains (kit item 'cloth', make_mpfb.py cloth_bones), added to the skeleton when
# the garment is first built; each chain's points are vertices of the garment, so their rest follows the morph (read
# from the blend shapes). Every frame each point is a Verlet particle pulled to its rigid rest by the part's
# stiffness, under Krator's gravity and the dense air's drag (and the wind of a loop's root_speed), kept to its
# length, near its neighbours, out of the body's capsules and above the floor; each bone turns to the next particle
var cloth := true
const C_GRAV := 7.4
const C_DRAG := 1.6
const C_DAMP := 0.04
const C_STEP := 1.0 / 60.0
const C_PAD := 0.022
var _cloth := {}                         # part key -> {item, by_name, chains, parts, meshes, on, reset, ring}
var _caps := []
var _cacc := 0.0


static func _cloth_key(n: String) -> String:
	return n.replace(":", "_").replace("/", "_")


func _cloth_of(part: Dictionary) -> Dictionary:
	if _cloth.has(part["key"]):
		return _cloth[part["key"]]
	var it = null
	for x in kit["items"]:
		if "pieces/%s.glb" % part["key"] == x["glb"] and x.has("cloth"):
			it = x
	if it == null:
		return {}
	var c := {"item": it, "by_name": {}, "chains": [], "parts": it["cloth"]["parts"], "meshes": [], "on": false, "reset": true, "ring": []}
	var chs: Array = it["cloth"]["chains"]
	for g in chs.size():
		var ch: Dictionary = chs[g]
		var list := []
		for k in ch["pts"].size() - 1:
			var nm := "cloth_%s_%d_%d" % [it["id"], g, k]
			var b := skeleton.get_bone_count()
			skeleton.add_bone(nm)
			skeleton.set_bone_parent(b, skeleton.find_bone(ch["parent"]) if k == 0 else list[k - 1])
			c["by_name"][nm] = b
			list.append(b)
		c["chains"].append({"parent": skeleton.find_bone(ch["parent"]), "pts": ch["pts"], "bones": list, "p": [], "len": [],
			"x": [], "xp": [], "tw": [], "q0": Quaternion(), "stiff": 0.1})
	for pt in c["parts"]:
		for g in pt["chains"]:
			c["chains"][int(g)]["stiff"] = float(pt["stiff"])
			c["chains"][int(g)]["layer"] = int(pt.get("layer", 0))
	_cloth[part["key"]] = c
	return c


# the chains' rest from the morphed garment (base positions plus the blend shapes' offsets)
func _cloth_rest(want: Dictionary, w: PackedFloat64Array) -> void:
	_caps = KChar.colliders(skel, w)
	for key in _cloth:
		var c: Dictionary = _cloth[key]
		var mi: MeshInstance3D = null
		for m in c["meshes"]:
			if want.has(m):
				mi = m
		c["on"] = mi != null
		if mi == null:
			continue
		var b: Dictionary = mi.get_meta("built")
		var shapes: PackedInt32Array = b["shapes"]
		var base: PackedVector3Array = b["verts0"]
		var offs: Array = b["offs0"]
		var pbind := {}
		for k in mi.skin.get_bind_count():
			pbind[mi.skin.get_bind_bone(k)] = mi.skin.get_bind_pose(k)
		for ch in c["chains"]:
			var P := []
			for i in ch["pts"]:
				var v: Vector3 = base[int(i)]
				for s in shapes.size():
					if w[shapes[s]] != 0.0:
						var o: Vector3 = (offs[s] as PackedVector3Array)[int(i)]
						v += w[shapes[s]] * (o - base[int(i)] if b.get("whole", false) else o)
				P.append(v)
			ch["p"] = P
			ch["len"] = []
			for k in range(1, P.size()):
				ch["len"].append((P[k] - P[k - 1]).length())
			var bones: Array = ch["bones"]
			for k in bones.size():
				var t: Transform3D
				if k == 0:
					t = (pbind[ch["parent"]] as Transform3D) * Transform3D(Basis(), P[0])
					ch["q0"] = t.basis.get_rotation_quaternion()
				else:
					t = Transform3D(Basis(), P[k] - P[k - 1])
				skeleton.set_bone_rest(bones[k], t)
				skeleton.set_bone_pose_position(bones[k], t.origin)
				skeleton.set_bone_pose_rotation(bones[k], t.basis.get_rotation_quaternion())
				for m in c["meshes"]:
					for q in m.skin.get_bind_count():
						if m.skin.get_bind_bone(q) == bones[k]:
							m.skin.set_bind_pose(q, Transform3D(Basis(), -P[k]))
			ch["pbind"] = pbind[ch["parent"]]
		c["ring"] = []
		for pt in c["parts"]:
			var g: Array = pt["chains"]
			var n := g.size()
			for a in (n if pt["closed"] else n - 1):
				var A: Dictionary = c["chains"][int(g[a])]
				var Bc: Dictionary = c["chains"][int(g[(a + 1) % n])]
				for k in range(1, mini(A["p"].size(), Bc["p"].size())):
					c["ring"].append([A, Bc, k, (A["p"][k] - Bc["p"][k]).length()])
		c["reset"] = true


func _rigid(ch: Dictionary) -> Transform3D:
	var M: Transform3D = _gp(ch["parent"]) * (ch["pbind"] as Transform3D)
	var tw := []
	for p in ch["p"]:
		tw.append(M * (p as Vector3))
	ch["tw"] = tw
	return M


func _cloth_step(dt: float) -> void:
	var items := []
	for key in _cloth:
		if _cloth[key]["on"] and _cloth[key]["chains"].size():
			items.append(_cloth[key])
	if items.is_empty():
		return
	if dt < 0.0:                         # a still pose: the chains hang rigid
		for c in items:
			for ch in c["chains"]:
				for k in ch["bones"].size():
					skeleton.set_bone_pose_rotation(ch["bones"][k], ch["q0"] if k == 0 else Quaternion())
			c["reset"] = true
		return
	var W := []
	for cp in _caps:
		W.append({"a": _gp(cp["a"]).origin, "b": _gp(cp["b"]).origin, "r": float(cp["r"]) + C_PAD / size})
	var ground := 0.008 - skeleton.position.y
	var wind := Vector3.ZERO
	for cm in skel.get("clips", []):
		if cm["name"] == _clip and cm.get("loop", true) and cm.has("root_speed"):
			wind = -KChar._v(cm["root_speed"])
	var grav := Vector3(0, -C_GRAV / size, 0)            # in the skeleton's units: a giant's are twice a metre
	for c in items:
		for ch in c["chains"]:
			_rigid(ch)
			if c["reset"] or ch["x"].size() != ch["p"].size() or (ch["tw"][0] - ch["x"][0]).length() > 0.4:
				ch["x"] = ch["tw"].duplicate()
				ch["xp"] = ch["tw"].duplicate()
		c["reset"] = false
	# cloth off: no swing; each frame starts from the rigid rest and only the collisions move the chains
	_cacc = minf(_cacc + dt, 4 * C_STEP) if cloth else C_STEP
	var h := C_STEP
	while _cacc >= h:
		_cacc -= h
		for c in items:
			for ch in c["chains"]:
				var kS := 1.0 - pow(1.0 - float(ch["stiff"]), h * 60.0)
				var x: Array = ch["x"]
				var xp: Array = ch["xp"]
				if not cloth:
					for k in x.size():
						x[k] = ch["tw"][k]
						xp[k] = ch["tw"][k]
					continue
				x[0] = ch["tw"][0]
				xp[0] = ch["tw"][0]
				for k in range(1, x.size()):
					var v: Vector3 = x[k] - xp[k]
					var acc: Vector3 = (wind * h - v) * (C_DRAG * h) + grav * h * h
					xp[k] = x[k]
					var nx: Vector3 = x[k] + v * (1.0 - C_DAMP) + acc
					x[k] = nx.lerp(ch["tw"][k], kS)
			for it in 2:
				for ch in c["chains"]:
					_keep_len(ch)
				for r in c["ring"]:
					var xa: Array = r[0]["x"]
					var xb: Array = r[1]["x"]
					var k: int = r[2]
					var d: float = (xa[k] - xb[k]).length()
					var lo: float = r[3] * 0.6
					var hi: float = r[3] * 1.2
					if d > hi or (d < lo and d > 1e-6):
						var want := hi if d > hi else lo
						var mv: Vector3 = (xb[k] - xa[k]) * ((d - want) / d * 0.5)
						xa[k] += mv
						xb[k] -= mv
				for ch in c["chains"]:
					_collide(ch, W, ground)
			for ch in c["chains"]:
				_keep_len(ch)
				_collide(ch, W, ground)
			_layered(c, items)
	for c in items:
		for ch in c["chains"]:
			var M := _rigid(ch)
			var rq := M.basis.get_rotation_quaternion()
			var prev := _gp(ch["parent"]).basis.get_rotation_quaternion()
			var bones: Array = ch["bones"]
			for k in bones.size():
				var r0: Vector3 = (ch["tw"][k + 1] - ch["tw"][k]).normalized()
				var r1: Vector3 = (ch["x"][k + 1] - ch["x"][k]).normalized()
				var wq := (Quaternion(r0, r1) if r0.dot(r1) < 0.99999 else Quaternion()) * rq
				skeleton.set_bone_pose_rotation(bones[k], (prev.inverse() * wq).normalized())
				prev = wq


func _collide(ch: Dictionary, W: Array, ground: float) -> void:
	var x: Array = ch["x"]
	var hip := _gp(_hips).origin
	for k in range(1, x.size()):
		var p: Vector3 = x[k]
		var up: Vector3 = x[k - 1]
		for cp in W:
			var ab: Vector3 = cp["b"] - cp["a"]
			var t := clampf((p - cp["a"]).dot(ab) / maxf(1e-9, ab.length_squared()), 0.0, 1.0)
			var q: Vector3 = cp["a"] + ab * t
			var dd := p.distance_to(q)
			if dd < cp["r"] and dd > 1e-6:
				# across a limb nearer level than upright (a seated thigh, a raised arm), out on the side of the point
				# above, so the chain drapes over it; along an upright one, out the side away from the body's axis
				# (collide() in 50-figure.js)
				var d := p - q
				var ax := ab.normalized()
				var o := (up - q) - ax * (up - q).dot(ax)
				if absf(ax.y) < 0.7 and o.length() > 1e-4:
					o = o.normalized()
				else:
					o = Vector3(q.x - hip.x, 0.0, q.z - hip.z)
					o = o.normalized() if o.length_squared() > 1e-8 else Vector3.ZERO
				var sd := d.dot(o)
				if sd < 0.0:
					d -= 2.0 * sd * o
				p = q + d.normalized() * float(cp["r"])
		if p.y < ground:
			p.y = ground
		x[k] = p


# a cape or mantle (layer 2) stays outside a hem or flap (1), which stays outside a skirt (0): measured out from the
# body's vertical axis, against the lower layers' chain segments near it (as layered() in 50-figure.js)
func _layered(c: Dictionary, items: Array) -> void:
	var hip := _gp(_hips).origin
	var segs := []
	for o in items:
		for ch in o["chains"]:
			for k in ch["x"].size() - 1:
				segs.append([ch["x"][k], ch["x"][k + 1], int(ch.get("layer", 0))])
	for ch in c["chains"]:
		var L: int = int(ch.get("layer", 0))
		if L == 0:
			continue
		var x: Array = ch["x"]
		for k in range(1, x.size()):
			var p: Vector3 = x[k]
			var best = null
			var bd := 0.14
			for sg in segs:
				if sg[2] >= L:
					continue
				var ab: Vector3 = sg[1] - sg[0]
				var t := clampf((p - sg[0]).dot(ab) / maxf(1e-9, ab.length_squared()), 0.0, 1.0)
				var q: Vector3 = sg[0] + ab * t
				var d := p.distance_to(q)
				if d < bd:
					bd = d
					best = q
			if best == null:
				continue
			var r := Vector2(p.x - hip.x, p.z - hip.z).length()
			var rq := Vector2(best.x - hip.x, best.z - hip.z).length() + 0.03
			if r < rq and r > 1e-4:
				p.x = hip.x + (p.x - hip.x) / r * rq
				p.z = hip.z + (p.z - hip.z) / r * rq
				x[k] = p


# ---- loose garments pushed out of the legs (kchar_push.gdshader), and the body kept out of itself ----
var _push_mats := []


func _is_loose(part: Dictionary) -> bool:
	for x in kit["items"]:
		if "pieces/%s.glb" % part["key"] == x["glb"]:
			return x.get("loose", false)
	return false


# a top or trousers as kchar_push.gdshader: the imported material's look, and the push and tuck (pushOut in 50-figure.js)
const TUCK := 0.025
const SQUEEZE := 0.006
func _garment(m2: BaseMaterial3D, part: Dictionary, rec: Dictionary) -> ShaderMaterial:
	var pm := ShaderMaterial.new()
	pm.shader = PUSH_SHADER
	pm.set_shader_parameter("tex", m2.albedo_texture)
	pm.set_shader_parameter("albedo", m2.albedo_color)
	if m2.transparency == BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR:
		pm.set_shader_parameter("alpha_cut", m2.alpha_scissor_threshold)
	if m2.normal_enabled and m2.normal_texture != null:
		pm.set_shader_parameter("ntex", m2.normal_texture)
		pm.set_shader_parameter("nscale", m2.normal_scale)
	pm.set_shader_parameter("rough", m2.roughness)
	pm.set_shader_parameter("metal", m2.metallic)
	var loose := _is_loose(part)
	pm.set_shader_parameter("kcL", 1.0 if loose else 0.0)
	var top = null
	var legs = null
	for x in kit["items"]:
		if x["id"] == rec.get("armour", {}).get("torso"):
			top = x
		if x["id"] == rec.get("armour", {}).get("legs"):
			legs = x
	# a loose top pushes 1.2 cm further, so a robe's hem lies over the skirt it covers, and 2 cm more over trousers
	# (PAD_TOP, PAD_OVER in 50-figure.js)
	var pad := 0.0
	if loose and part["slot"] == "torso":
		pad = 0.012 + (0.02 if legs != null and not legs.get("loose", false) else 0.0)
	pm.set_shader_parameter("kcP", pad)
	pm.set_shader_parameter("kcT", TUCK if part["slot"] == "legs" and top != null and top.get("tucks", false) else 0.0)
	# trousers under a loose top that reaches below the knees are drawn in to the legs (SQUEEZE in 50-figure.js)
	var squeeze: bool = part["slot"] == "legs" and top != null and top.get("loose", false) and top.get("long", false) \
		and legs != null and not legs.get("loose", false)
	pm.set_shader_parameter("kcS", SQUEEZE if squeeze else 0.0)
	_push_mats.append(pm)
	return pm


# the joined skin: the material's look (as _garment's) and, per region, whether a worn item hides it (a texel each)
func _skin_mat(m2: BaseMaterial3D, hide: Image) -> ShaderMaterial:
	var sm := ShaderMaterial.new()
	sm.shader = SKIN_SHADER
	sm.set_shader_parameter("tex", m2.albedo_texture)
	sm.set_shader_parameter("albedo", m2.albedo_color)
	if m2.normal_enabled and m2.normal_texture != null:
		sm.set_shader_parameter("ntex", m2.normal_texture)
		sm.set_shader_parameter("nscale", m2.normal_scale)
	sm.set_shader_parameter("rough", m2.roughness)
	sm.set_shader_parameter("hide_tex", ImageTexture.create_from_image(hide))
	return sm


func _leg_caps() -> void:
	if _push_mats.is_empty() or _caps.is_empty():
		return
	var A := []
	var Bv := []
	var legs := [["LeftUpLeg", "LeftLeg"], ["RightUpLeg", "RightLeg"], ["LeftLeg", "LeftFoot"], ["RightLeg", "RightFoot"],
		["LeftFoot", "LeftToeBase"], ["RightFoot", "RightToeBase"], ["LeftArm", "LeftForeArm"], ["RightArm", "RightForeArm"],
		["LeftForeArm", "LeftHand"], ["RightForeArm", "RightHand"],
		["Left2Arm", "Left2ForeArm"], ["Right2Arm", "Right2ForeArm"], ["Left2ForeArm", "Left2Hand"], ["Right2ForeArm", "Right2Hand"]]
	for i in legs.size():
		var a := skeleton.find_bone(legs[i][0])
		var b := skeleton.find_bone(legs[i][1])
		# a foot has no collider of its own: it takes its shin's radius; the arms' capsules (6-9) are hard
		var foot: bool = i == 4 or i == 5
		var ca := skeleton.find_bone(legs[i - 2][0]) if foot else a
		var cb := a if foot else b
		var r := 0.0
		for cp in _caps:
			if cp["a"] == ca and cp["b"] == cb:
				r = float(cp["r"]) + 0.01
		if b < 0 or a < 0 or (i >= 10 and not four_arms):        # no such joints, or a two-armed giant's lower pair
			r = 0.0
			a = maxi(a, 0)
			b = a
		var pa := _gp(a).origin
		var pb := _gp(b).origin
		A.append(Vector4(pa.x, pa.y, pa.z, r))
		Bv.append(Vector4(pb.x, pb.y, pb.z, 1.0 if i >= 6 else 0.0))
	var hip := _gp(_hips).origin
	for pm in _push_mats:
		pm.set_shader_parameter("kcA", A)
		pm.set_shader_parameter("kcB", Bv)
		pm.set_shader_parameter("kcH", hip)


# an elbow or hand inside the pelvis, chest or its own thigh turns its upper arm or forearm out; two thighs that
# overlap each turn out by half (as bodyFix() in 50-figure.js)
func _body_fix() -> void:
	if _caps.is_empty() or _clip == "":
		return
	var hips_i := skeleton.find_bone("Hips")
	var sp1 := skeleton.find_bone("Spine1")
	for arm in [["LeftArm", "LeftForeArm", "LeftHand", "LeftUpLeg", ""], ["RightArm", "RightForeArm", "RightHand", "RightUpLeg", ""],
			["Left2Arm", "Left2ForeArm", "Left2Hand", "LeftUpLeg", "Left"], ["Right2Arm", "Right2ForeArm", "Right2Hand", "RightUpLeg", "Right"]]:
		var b0 := skeleton.find_bone(arm[0])
		var b1 := skeleton.find_bone(arm[1])
		var b2 := skeleton.find_bone(arm[2])
		var th := skeleton.find_bone(arm[3])
		if b0 < 0:
			continue
		# a giant's lower arm keeps out of its side's upper arm and forearm too
		var ua := skeleton.find_bone(arm[4] + "Arm") if arm[4] != "" else -2
		var uf := skeleton.find_bone(arm[4] + "ForeArm") if arm[4] != "" else -2
		for pr in [[b0, b1], [b1, b2]]:
			var pivot := _gp(pr[0]).origin
			var p := _gp(pr[1]).origin
			var worst := 0.0
			var way := Vector3.ZERO
			for cp in _caps:
				if cp["a"] != hips_i and cp["a"] != sp1 and cp["a"] != th and cp["a"] != ua and cp["a"] != uf:
					continue
				var a := _gp(cp["a"]).origin
				var ab := _gp(cp["b"]).origin - a
				var t := clampf((p - a).dot(ab) / maxf(1e-9, ab.length_squared()), 0.0, 1.0)
				var q := a + ab * t
				var d := p.distance_to(q)
				var dd := float(cp["r"]) + 0.012 - d
				if dd > worst:
					worst = dd
					way = (p - q) / maxf(d, 1e-6)
			if worst <= 0.0:
				continue
			var to := p + way * worst
			_turn(pr[0], Quaternion((p - pivot).normalized(), (to - pivot).normalized()))
	var tl = null
	var tr = null
	for cp in _caps:
		if cp["a"] == skeleton.find_bone("LeftUpLeg"):
			tl = cp
		if cp["a"] == skeleton.find_bone("RightUpLeg"):
			tr = cp
	if tl == null or tr == null:
		return
	var hl := _gp(tl["a"]).origin
	var kl := _gp(tl["b"]).origin
	var hr := _gp(tr["a"]).origin
	var kr := _gp(tr["b"]).origin
	var need := float(tl["r"]) + float(tr["r"]) + 0.004
	var gap := kl.distance_to(kr)
	if gap >= need:
		return
	var sep := kl - kr
	sep.y = 0.0
	if sep.length_squared() < 1e-8:
		sep = Vector3(1, 0, 0)
	sep = sep.normalized() * ((need - gap) / 2.0)
	_turn(tl["a"], Quaternion((kl - hl).normalized(), (kl + sep - hl).normalized()))
	_turn(tr["a"], Quaternion((kr - hr).normalized(), (kr - sep - hr).normalized()))


func _keep_len(ch: Dictionary) -> void:
	var x: Array = ch["x"]
	for k in range(1, x.size()):
		var d: Vector3 = x[k] - x[k - 1]
		var l := d.length()
		if l > 1e-9:
			x[k] = x[k - 1] + d * (float(ch["len"][k - 1]) / l)


# ---- the lower arms of a body with a second pair (a mod; the twin of arms2() in 50-figure.js) ----
# No clip moves Left2Arm...: each frame they take a pose from the upper pair's: in most clips a guard pose of their own
# (GUARD) plus a share of the upper arms' motion (SHARE by clip group), in climbing, swimming and falling the upper
# arms' motion whole; with no clip they hang as the upper pair does. They follow with a lag; _body_fix keeps them out
# of the body and the upper arms; the empty hands close loosely while they guard
const LOW_LAG := 0.09
const GUARD := {"Arm": {"add": 0.0, "flex": 6.0}, "ForeArm": {"flex": 72.0}}
const COPY := {"climb": true, "swim": true, "hurt": true}
const SHARE := {"idle": 0.4, "move": 0.55, "melee": 0.3, "ranged": 0.2, "defend": 0.6, "life": 0.25, "work": 0.35}
const CLOSE := 0.45
var _low := []
var _low_w := 0.0


func _hands() -> Array:
	var out := []
	for sd in ["R", "L", "R2", "L2"]:
		if skel.has("hands") and skel["hands"].has(sd):
			out.append(sd)
	return out


func _low_setup() -> void:
	_low = []
	var J: Array = skel["joints"]
	var wq := []
	var wp := []
	for i in J.size():
		var q := KChar._q(J[i]["r"])
		var t := KChar._v(J[i]["t"])
		var par := int(J[i]["parent"])
		if par >= 0:
			t = wp[par] + wq[par] * t
			q = wq[par] * q
		wq.append(q)
		wp.append(t)
	for i in J.size():
		var nm: String = J[i]["name"]
		var side := "Left" if nm.begins_with("Left2") else "Right" if nm.begins_with("Right2") else ""
		if side == "":
			continue
		var part := nm.substr(side.length() + 1)
		var s := skeleton.find_bone(side + part)
		if s < 0:
			continue
		var sx := 1.0 if side == "Left" else -1.0
		var R := Quaternion()
		if GUARD.has(part):
			var g: Dictionary = GUARD[part]
			var dir := Vector3(sx, -1, 0).normalized()
			for k in J.size():
				if int(J[k]["parent"]) == i:
					dir = (wp[k] - wp[i]).normalized()
					break
			if g.get("add", 0.0) != 0.0:
				R = Quaternion(Vector3(0, 0, 1), deg_to_rad(-sx * g["add"])) * R
			if g.has("flex") and part == "Arm":
				R = Quaternion(Vector3(1, 0, 0), deg_to_rad(-g["flex"])) * R
			elif g.has("flex"):
				R = Quaternion(dir.cross(Vector3(0, 0, 1)).normalized(), deg_to_rad(g["flex"])) * R
		var rest := KChar._q(J[i]["r"])
		_low.append({"s": s, "d": i, "rest": rest, "rest_s": KChar._q(J[s]["r"]), "guard": wq[i].inverse() * R * wq[i], "cur": rest})


func _arms2(dt: float) -> void:
	if _low.is_empty() or not four_arms:
		return
	var group := ""
	for c in skel.get("clips", []):
		if c["name"] == _clip:
			group = c.get("group", "")
	var copy: bool = COPY.has(group)
	var want := 0.0 if _clip == "" or copy else 1.0
	var k := 1.0 if _clip == "" or copy else float(SHARE.get(group, 0.4))
	var a := 1.0 if dt < 0.0 else 1.0 - exp(-dt / LOW_LAG)
	var aw := 1.0 if dt < 0.0 else 1.0 - exp(-dt / 0.3)
	_low_w += (want - _low_w) * aw
	for L in _low:
		var delta: Quaternion = L["rest_s"].inverse() * skeleton.get_bone_pose_rotation(L["s"])
		var target: Quaternion = L["rest"] * Quaternion().slerp(L["guard"], _low_w) * Quaternion().slerp(delta, k)
		L["cur"] = (L["cur"] as Quaternion).slerp(target.normalized(), a)
		skeleton.set_bone_pose_rotation(L["d"], L["cur"])
	for sd in ["L2", "R2"]:
		if not skel.get("hands", {}).has(sd) or held.get(sd) != null or _low_w <= 0.0:
			continue
		var h: Dictionary = skel["hands"][sd]
		for c in (h["curls"]["fist"] if h.has("curls") else h["curl"]):
			var i: int = int(c[0])
			skeleton.set_bone_pose_rotation(i, skeleton.get_bone_pose_rotation(i) * Quaternion().slerp(Quaternion(c[1], c[2], c[3], c[4]), CLOSE * _low_w))


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
	# the hips start from the base body's rest (a clip without a hips position track leaves them there), so the
	# morph delta below is added once, not once a frame
	skeleton.set_bone_pose_position(_hips, KChar._v(skel["joints"][_hips]["t"]))
	player.advance(dt * cadence)
	if not player.is_playing() and _clip != looping:
		play(looping)
		return
	# the clip writes the hips where the base body's are; the morph moves them
	skeleton.set_bone_pose_position(_hips, skeleton.get_bone_pose_position(_hips) + morph["d"][_hips])
	_after_clip(dt)
