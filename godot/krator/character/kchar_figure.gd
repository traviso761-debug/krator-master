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
	_after_clip(-1.0)


# ---- holding props (data/props.json; the twin of hold() in 50-figure.js) ----
# hold({"R": "sword", "L": "shield", "both": false}): each prop's GLB under a BoneAttachment3D on its hand bone, at the
# grip frame skeleton.json 'hands' gives (the props are modelled in it); that hand's fingers close round it every
# frame in the prop's grip style (fist, trigger, wide). both: the left hand takes hold of the right's prop too, at its
# support (_two_hands). A prop with a string (the bow) gets it drawn live, and an arrow while the right hand draws
var held := {"R": null, "L": null, "both": false}
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
	for side in ["R", "L"]:
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
			holder.add_child(_scene("%s/pieces/props/%s.glb" % [dir, id]))
			if side == "L" and props.get(id, {}).has("string"):
				_make_bow(holder, props[id])
	_after_clip(-1.0)


func _after_clip(dt: float) -> void:
	_grip()
	_two_hands(dt)
	_bow_string()


func _grip() -> void:
	if not skel.has("hands"):
		return
	var J: Array = skel["joints"]
	for side in ["R", "L"]:
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
	_after_clip(dt)
