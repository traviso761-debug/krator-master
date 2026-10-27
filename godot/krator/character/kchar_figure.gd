# KCharFigure: a MakeHuman character from core/charactermodels' pieces on one Skeleton3D. The Godot side of
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
const FUR_SHADER := preload("res://krator/character/kchar_fur.gdshader")

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
var body_fix_off := false                # tools: the clip without _body_fix
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
	# a giant (kit.scale, core/charactermodels/tools/giant.py) plays the man's clips (kit.anims), slower by the square root
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
	if FileAccess.file_exists(dir + "/clips.json"):
		var cj: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir + "/clips.json"))
		for c in cj.get("clips", []):
			clip_data[c["key"]] = c
		var fcs: Dictionary = cj.get("faces", {})
		faces = fcs.get(kit.get("body", ""), fcs.get("mpfb_male", {}))
	if FileAccess.file_exists(dir + "/fur.json"):
		fur = JSON.parse_string(FileAccess.get_file_as_string(dir + "/fur.json"))
	if FileAccess.file_exists(dir + "/posture.json"):
		var pj: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir + "/posture.json"))
		var pb: Dictionary = pj["bodies"]
		var pk: String = kit.get("body", "") if pb.has(kit.get("body", "")) else "mpfb_male"
		posture = pb.get(pk, {})
		posture_joint = pj.get("frame", "figure") == "joint"
		var pc: Dictionary = pj.get("clips", {})
		for c in pc:
			if pc[c].has(pk):
				posture_clips[c] = pc[c][pk]


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
		# a shape the piece itself carries (a therian's lids: 'blink', tools/heads.py), after the morphs' (_blinks)
		var blink := -1
		var am := src as ArrayMesh
		if am != null:
			for i in am.get_blend_shape_count():
				if am.get_blend_shape_name(i) == "blink":
					blink = i
		if blink >= 0:
			mesh.add_blend_shape("blink")
		var regions := []                 # per surface: whether it is the joined skin (hidden by region)
		var joined := {}
		var verts0 = null                 # the first surface's positions and shapes (the cloth chains' rest)
		var y_lo := INF
		var y_hi := -INF
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
				# each vertex's rest height (CUSTOM1), and the piece's lowest and highest: the fur shells' band (_fur)
				var pv: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
				var ys := PackedFloat32Array()
				ys.resize(pv.size())
				for q in pv.size():
					ys[q] = pv[q].y
					y_lo = minf(y_lo, pv[q].y)
					y_hi = maxf(y_hi, pv[q].y)
				arr[Mesh.ARRAY_CUSTOM1] = ys
				flags |= Mesh.ARRAY_CUSTOM_R_FLOAT << Mesh.ARRAY_FORMAT_CUSTOM1_SHIFT
				if verts0 == null:
					verts0 = arr[Mesh.ARRAY_VERTEX]
					for sh in bs:
						offs0.append(sh[Mesh.ARRAY_VERTEX])
				if blink >= 0:
					var sb: Array = src.surface_get_blend_shape_arrays(s)[blink]
					var dv: PackedVector3Array = sb[Mesh.ARRAY_VERTEX]
					var v0: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
					if am.blend_shape_mode == Mesh.BLEND_SHAPE_MODE_NORMALIZED:
						dv = dv.duplicate()
						for q in dv.size():
							dv[q] -= v0[q]
					var shb := []
					shb.resize(Mesh.ARRAY_MAX)
					if whole:
						var wv := v0.duplicate()
						for q in wv.size():
							wv[q] += dv[q]
						shb[Mesh.ARRAY_VERTEX] = wv
					else:
						shb[Mesh.ARRAY_VERTEX] = dv
					shb[Mesh.ARRAY_NORMAL] = arr[Mesh.ARRAY_NORMAL]
					if arr[Mesh.ARRAY_TANGENT] != null:
						shb[Mesh.ARRAY_TANGENT] = arr[Mesh.ARRAY_TANGENT]
					bs.append(shb)
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
			"whole": whole, "cover": H.get("cover", []), "y_lo": y_lo, "y_hi": y_hi, "joined": joined.get("arr"),
			"blink": shapes.size() if blink >= 0 else -1})
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
	var hide_parts := KChar.hidden_parts(rec, kit)
	var roles: Dictionary = kit.get("tint", {}).get("roles", {})
	var gain: Dictionary = kit.get("tint", {}).get("gain", {})
	four_arms = KChar.arms(rec, kit) >= 4          # a mod's second pair (core/charactermodels/tools/mods.py)
	# a tail and an animal head's jaw (mods with tail, jaw) are driven after each clip (_tail, _jaw)
	var wt = null
	_jaw_spec = {}
	for m in KChar.mods(rec, kit):
		if m.has("tail"):
			wt = m
		if m.has("jaw"):
			_jaw_spec = m["jaw"]
	if wt == null or _tl.is_empty() or _tl["spec"] != wt["tail"]:
		_tail_setup(wt)
	skeleton.position.y = 0.0
	# a lizard's head draws the body's skin in its scales (kit item skin_detail: that material's maps, tiled; the twin
	# of skinDetail in 50-figure.js)
	var det := {}
	for m in KChar.mods(rec, kit):
		if m.has("skin_detail"):
			det = m["skin_detail"]
	var det_tex := []
	# a lizard's crest down the neck under a worn item that covers the skin there (kit item crest_neck) is left out
	var crest_out := ""
	for m in KChar.mods(rec, kit):
		if m.has("crest_neck"):
			var hid := KChar.hidden(rec, kit)
			for t in m["crest_neck"]["under"]:
				if int(t) < hid.size() and hid[int(t)] != 0:
					crest_out = m["crest_neck"]["material"]
	if not det.is_empty():
		for mi in want:
			for s in mi.mesh.get_surface_count():
				var dm := mi.mesh.surface_get_material(s) as BaseMaterial3D
				if mi.mesh.surface_get_name(s) == det["material"] and dm != null:
					det_tex = [dm.albedo_texture, dm.normal_texture]
	# a legs item's fur lies between the top of the boots and the lowest hem of the top (_fur)
	var feet_top := -1000.0
	var hem := 1000.0
	for mi in want:
		var pt: Dictionary = mi.get_meta("part")
		if pt["role"] == "armour" and pt["slot"] == "feet":
			feet_top = maxf(feet_top, float(mi.get_meta("built")["y_hi"]))
		elif pt["role"] == "armour" and pt["slot"] == "torso":
			hem = minf(hem, float(mi.get_meta("built")["y_lo"]))
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
			if part["role"] == "base" and (hide_parts.has(mi.mesh.surface_get_name(s)) or _coat_hides(rec).has(mi.mesh.surface_get_name(s))):
				m = _nothing()          # the nipples under a top (kit hide_parts) or a coat
			elif crest_out != "" and mi.mesh.surface_get_name(s) == crest_out:
				m = _nothing()
			elif part["role"] == "base" and mi.mesh.surface_get_name(s) == "Human.nipple" and not det_tex.is_empty():
				# in a lizard's scales as the skin round them is (the skin has holes under them)
				var nm := m as BaseMaterial3D
				nm.albedo_texture = det_tex[0]
				nm.normal_enabled = det_tex[1] != null
				nm.normal_texture = det_tex[1]
				nm.uv1_scale = Vector3(float(det["repeat"]), float(det["repeat"]), 1.0)
			if b["regions"][s]:
				var nreg: int = maxi(1, b["cover"].size())
				var hide := Image.create(nreg, 1, false, Image.FORMAT_R8)
				for r in b["cover"].size():
					for i in b["cover"][r]:
						if worn.has(int(i)):
							hide.set_pixel(r, 0, Color(1, 0, 0))
				m = _skin_mat(m as BaseMaterial3D, hide)
				if not det_tex.is_empty():
					var dsm := m as ShaderMaterial
					dsm.set_shader_parameter("detail_tex", det_tex[0])
					dsm.set_shader_parameter("detail_ntex", det_tex[1])
					dsm.set_shader_parameter("detail_repeat", float(det["repeat"]))
				# the coat's edge: the hide without a furred mod's (a therian's head carries the fur on: coatShells)
				var edge := hide
				var furred := []
				for x in KChar.mods(rec, kit):
					if x.get("furred", false):
						furred.append(items.find(x))
				if not furred.is_empty():
					edge = Image.create(nreg, 1, false, Image.FORMAT_R8)
					for r in b["cover"].size():
						for i in b["cover"][r]:
							if worn.has(int(i)) and not furred.has(int(i)):
								edge.set_pixel(r, 0, Color(1, 0, 0))
				_coat(m, b, mi, rec, gain, hide, edge)
			if part["role"] == "armour" or part["role"] == "mod":
				var legs: bool = part["slot"] == "legs"
				var fmt: int = mi.mesh.surface_get_format(s)
				_fur(m, _item_of(part), Vector2(feet_top if legs else -1000.0, hem if legs else 1000.0),
					(fmt & Mesh.ARRAY_FORMAT_TEX_UV2) != 0, (fmt & Mesh.ARRAY_FORMAT_COLOR) != 0)
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
	if part["role"] == "armour" and part["slot"] == "feet":
		return _garment(m2, part, rec)                  # boots: the squeeze under a long robe, no push
	if role == "skin":
		m2.albedo_color = _lin(rec.get("skin") if rec.get("skin") != null else "#d6ad8f", float(gain.get("skin", 1.0)))
	elif role == "hair":
		m2.albedo_color = _lin(rec.get("hair_color") if rec.get("hair_color") != null else "#4a3424", float(gain.get("hair", 1.0)))
	elif role == "coat":                 # a therian's head (tools/heads.py): its shades times the coat's colour
		m2.albedo_color = _lin(rec.get("hair_color") if rec.get("hair_color") != null else "#4a3424", float(gain.get("coat", gain.get("hair", 1.0))))
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
var clip_data := {}                      # data/clips.json clips by key: hold, two_hands, face, nock, lead_left
var faces := {}                          # data/clips.json faces for this body (the man's for a body without its own)
var face_w := 0.0                        # how far _to_face took the clip's hand to the face (0..1)
var blade_need: Array = []               # _blade_clear: how deep the blade was in, per pass (tools, tests)
var reach := 0.0                         # how far short of its hold the left hand fell (_two_hands)
var drawn := false                       # the bow string is pulled
var _holders := {}
var _bow := {}
var _hangs := {}                         # side -> {pivot, axis}: a prop that hangs or stands level (_hang)
var _blade_kept := {}                    # side -> the wrist's turn kept from the frame before (_blade_clear)
var _face_off := {}                      # face point -> its offset in the head joint's frame
var _saved: Array[Quaternion] = []
var _hold2 := 1.0
var _two_y := 0                          # the two-hand hold's thumb side, chosen once per clip (_two_hands)
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
		_hangs.erase(side)
		if id != null:
			var m := _scene("%s/pieces/props/%s.glb" % [dir, id])
			holder.add_child(m)
			# a prop that hangs (a bucket, a lantern) or stands level (a bowl) turns on a pivot at the grip (_hang)
			var hg = props.get(id, {}).get("hang")
			if hg != null and side.length() == 1 and m is Node3D:
				var pv := Node3D.new()
				holder.remove_child(m)
				pv.add_child(m)
				holder.add_child(pv)
				_hangs[side] = {"pivot": pv, "axis": Vector3(hg[0], hg[1], hg[2]).normalized()}
			# in a lower hand a prop with low_turn turns about its handle (the shield stands up and faces out)
			var turn := float(props.get(id, {}).get("low_turn", 0))
			if side.length() > 1 and turn != 0.0 and m is Node3D:
				(m as Node3D).rotation.y = (1.0 if side[0] == "L" else -1.0) * deg_to_rad(turn)
			if side == "L" and props.get(id, {}).has("string"):
				_make_bow(holder, props[id])
	_after_clip(-1.0)


# posture (50-figure.js posture): after each clip Spine, Spine1, Spine2, Neck and Head are pitched (degrees in the
# skeleton's frame, negative forward) and the shoulders dropped and drawn back, by data/posture.json's entry for this
# body (the man's when it has none), plus the playing clip's own change ('clips', under the same body), eased in over
# the 0.25 s cross-fade as the page's mixer weights blend it. The upper arms keep the way the clip points them
const SLOT_RANK := {"legs": 0, "torso": 1, "head": 2}
const POSTURE_JOINTS := ["Spine", "Spine1", "Spine2", "Neck", "Head"]
const POSTURE_KEYS := ["Spine", "Spine1", "Spine2", "Neck", "Head", "drop", "back"]
const POSTURE_FADE := 0.25
var posture := {}
var posture_joint := false              # 'frame': 'joint' (the side axis as the clip turned the parent from rest)
var posture_clips := {}                 # clip -> degrees added while it plays
var _pose_from := {}                    # the clip change when the last play() began
var _pose_fade := POSTURE_FADE          # clip seconds since then


func _pose_change() -> Dictionary:
	var t := clampf(_pose_fade / POSTURE_FADE, 0.0, 1.0)
	var to: Dictionary = posture_clips.get(_clip, {})
	var out := {}
	for k in POSTURE_KEYS:
		out[k] = lerpf(float(_pose_from.get(k, 0.0)), float(to.get(k, 0.0)), t)
	return out


func _posture(force := false) -> void:
	if posture.is_empty() or (not force and (player == null or not player.is_playing())):
		return                              # the rest pose (the A-pose clothes are fitted in) stays as it is
	var ch := {} if force else _pose_change()     # forced (the chains' rest): the body's angles alone
	var p := {}
	for k in POSTURE_KEYS:
		p[k] = float(posture.get(k, 0.0)) + float(ch.get(k, 0.0))
	var arms := {}
	for n in ["LeftArm", "RightArm"]:
		var ai := skeleton.find_bone(n)
		if ai >= 0:
			arms[ai] = _gp(ai).basis.get_rotation_quaternion()
	for n in POSTURE_JOINTS:
		var b := skeleton.find_bone(n)
		var a := deg_to_rad(float(p[n]))
		if b >= 0 and a != 0.0:
			var ax := Vector3(1, 0, 0)
			var par := skeleton.get_bone_parent(b)
			if posture_joint and par >= 0:
				ax = (_gp(par).basis.get_rotation_quaternion() * skeleton.get_bone_global_rest(par).basis.get_rotation_quaternion().inverse()) * ax
			_turn(b, Quaternion(ax.normalized(), -a))
	for sh in [["LeftShoulder", 1.0], ["RightShoulder", -1.0]]:
		var b := skeleton.find_bone(sh[0])
		if b < 0:
			continue
		_turn(b, Quaternion(Vector3(0, 0, 1), -sh[1] * deg_to_rad(float(p["drop"]))))
		_turn(b, Quaternion(Vector3(0, 1, 0), sh[1] * deg_to_rad(float(p["back"]))))
	for ai in arms:
		var par := skeleton.get_bone_parent(ai)
		skeleton.set_bone_pose_rotation(ai, (_gp(par).basis.get_rotation_quaternion().inverse() * arms[ai]).normalized())


func _after_clip(dt: float) -> void:
	_posture()
	_arms2(dt)
	_body_fix()
	_toes_flat()
	_grip()
	_blade_clear(dt)
	_two_hands(dt)
	_to_face()
	_stand_up()
	_cloth_step(dt)
	if dt > 0.0:
		_nh_t += dt
	_tail(dt)
	_jaw()
	_leg_caps()
	_bow_string(dt)
	_hang()


func _grip() -> void:
	if not skel.has("hands"):
		return
	_slide()
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
		if style == "flat":
			continue                        # an open hand under a bowl: the clip's own fingers
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
# twin of toesFlat in 50-figure.js: a foot on its ball (the heel up) rolls there, its toe joint turned up until a point
# TOE ahead of it along the toes' rest direction is no lower than the ground (they went into it, and a sole with them)
const TOE := 0.06
var _toe_local := {}


func _toes_flat() -> void:
	if player == null or not player.is_playing():
		return
	if _toe_local.is_empty():
		for sd in ["Left", "Right"]:
			var ti := skeleton.find_bone(sd + "ToeBase")
			var fi := skeleton.find_bone(sd + "Foot")
			if ti < 0 or fi < 0:
				continue
			var rt := skeleton.get_bone_global_rest(ti)
			var fwd := rt.origin - skeleton.get_bone_global_rest(fi).origin
			fwd.y = 0.0
			_toe_local[sd] = rt.basis.get_rotation_quaternion().inverse() * fwd.normalized()
	var ground := 0.004 / size - skeleton.position.y
	for sd in _toe_local:
		var b := skeleton.find_bone(sd + "ToeBase")
		var g := _gp(b)
		var d: Vector3 = g.basis.get_rotation_quaternion() * (_toe_local[sd] as Vector3)
		var dy := (ground - g.origin.y) / TOE
		if g.origin.y + d.y * TOE >= ground or absf(dy) >= 1.0:
			continue
		var t := Vector3(d.x, 0.0, d.z)
		if t.length_squared() < 1e-8:
			continue
		t = t.normalized() * sqrt(1.0 - dy * dy)
		t.y = dy
		_turn(b, Quaternion(d.normalized(), t.normalized()))


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
		_two_y = 0
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
	if _lead_left():
		A = R * -Vector3(sp[0], sp[1], sp[2])
		B = A
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
	# the thumb side is the clip's at the hold's first frame, kept while the clip plays (chosen afresh each frame it
	# flipped the hand half a turn round the hilt in Two-handed parry)
	if _two_y == 0:
		_two_y = -1 if M.basis.y.dot(Y) < 0.0 else 1
	if _two_y < 0:
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


# the playing clip's data/clips.json entry
func _clip_info() -> Dictionary:
	return clip_data.get(_clip, {}) if _clip != "" else {}


# twin of leadLeft and slide in 50-figure.js: a clip with lead_left takes a prop with a one-point support the other
# way round (the prop slides half the support's offset up through the right hand; the left hand holds above it)
func _lead_left() -> bool:
	var sp := _support()
	return sp.size() == 6 and bool(_clip_info().get("lead_left", false)) and sp[0] == sp[3] and sp[1] == sp[4] and sp[2] == sp[5]


func _slide() -> void:
	if not _holders.has("R") or _holders["R"].get_child_count() == 0:
		return
	var m := _holders["R"].get_child(0) as Node3D
	if m == null:
		return
	if _lead_left():
		var sp := _support()
		m.position = Vector3(sp[0], sp[1], sp[2]) * -0.5
	else:
		m.position = Vector3.ZERO


# the face's points (data/clips.json faces, metres from the head joint in the skeleton's frame at rest): turned with
# the head. Returns [point, radius] (the radius 0 when the entry has none), or [] for a point the body lacks
func _face_point(nm: String) -> Array:
	if not faces.has(nm) or _head < 0:
		return []
	var o: Array = faces[nm]
	if not _face_off.has(nm):
		_face_off[nm] = skeleton.get_bone_global_rest(_head).basis.get_rotation_quaternion().inverse() * Vector3(o[0], o[1], o[2])
	var h := _gp(_head)
	return [h.origin + h.basis.get_rotation_quaternion() * (_face_off[nm] as Vector3), float(o[3]) if o.size() > 3 else 0.0]


# twin of bladeClear: a weapon's striking part (props.json blade) swung through the head, the neck or the trunk turns
# the wrist until it passes them, pushing on from the turn kept from the frame before (easing back to the clip's)
const NECK_R := 0.065
const EDGE := 0.035
const RELAX := 0.3


func _blade_clear(dt: float) -> void:
	blade_need = []
	var neck := skeleton.find_bone("Neck")
	var hips_i := skeleton.find_bone("Hips")
	var sp1 := skeleton.find_bone("Spine1")
	for side in ["R", "L"]:
		var id = held[side]
		var bl = props.get(id, {}).get("blade") if id != null else null
		if bl == null or not _holders.has(side) or _holders[side].get_child_count() == 0 or _clip == "" or neck < 0:
			_blade_kept.erase(side)
			continue
		var m := _holders[side].get_child(0) as Node3D
		var hand: int = int(skel["hands"][side]["bone"])
		var kept: Quaternion = _blade_kept.get(side, Quaternion())
		if dt > 0.0:
			kept = kept.slerp(Quaternion(), 1.0 - exp(-dt / RELAX))
		var q0 := skeleton.get_bone_pose_rotation(hand)
		skeleton.set_bone_pose_rotation(hand, (q0 * kept).normalized())
		var trunk := []
		for cp in _caps:
			if cp.get("pa") == null and (cp["a"] == hips_i or cp["a"] == sp1):
				trunk.append(cp)
		for k in 3:
			var fp := _face_point("head")
			if fp.is_empty() or float(fp[1]) <= 0.0:
				break
			var M := _gp(hand) * _grip_t(side) * m.transform
			var A := M * Vector3(0, float(bl[0]), 0)
			var U := M * Vector3(0, float(bl[1]), 0) - A
			var spheres := []
			var N := _gp(neck).origin
			for q in 5:
				spheres.append([N.lerp(fp[0], q / 4.0), lerpf(NECK_R, float(fp[1]), q / 4.0) + EDGE])
			for cp in trunk:
				var ea := _gp(cp["a"]).origin
				var eb := _gp(cp["b"]).origin
				for q in 5:
					spheres.append([ea.lerp(eb, q / 4.0), float(cp["r"]) + EDGE])
			var need := 0.0
			var P := Vector3.ZERO
			var E := Vector3.ZERO
			for sph in spheres:
				var c: Vector3 = sph[0]
				var s := clampf((c - A).dot(U) / maxf(1e-9, U.length_squared()), 0.0, 1.0)
				var w := A + U * s
				var d := w.distance_to(c)
				if float(sph[1]) - d > need and d > 1e-6:
					need = float(sph[1]) - d
					P = w
					E = c
			blade_need.append(need)
			if need <= 0.0:
				break
			var K := P - _gp(hand).origin
			var X := K.cross(P - E)
			if K.length() < 1e-4 or X.length_squared() < 1e-12:
				break
			_turn(hand, Quaternion(X.normalized(), minf(0.8, need / K.length())))
		_blade_kept[side] = (q0.inverse() * skeleton.get_bone_pose_rotation(hand)).normalized()


# twin of toFace: a clip that brings a hand to the face (clips.json face) has the hand's point moved onto the face's
# point by the arm's two-bone solve, the hand keeping its turn: in the spans face.when (eased), or as near as the clip
# brings it (face.near); face.level caps a bow's arrow pitch (the bow arm lowers)
const NEAR := [0.12, 0.3]


func _face_weight(fc: Dictionary, t: float, dur: float, d: float) -> float:
	if fc.has("when"):
		var e := float(fc.get("ease", 0.2))
		var w := 0.0
		for s in fc["when"]:
			var a := 1.0 if float(s[0]) <= 0.0 else smoothstep(float(s[0]), float(s[0]) + e, t)
			var b := 1.0 if float(s[1]) >= dur - 1e-3 else 1.0 - smoothstep(float(s[1]), float(s[1]) + e, t)
			w = maxf(w, minf(a, b))
		return w
	var n: Array = fc.get("near", NEAR)
	return smoothstep(0.0, float(n[1]) - float(n[0]), float(n[1]) - d)


func _to_face() -> void:
	face_w = 0.0
	var fc = _clip_info().get("face")
	if fc == null or not skel.has("hands") or not skel["hands"].has(fc["hand"]):
		return
	var h: Dictionary = skel["hands"][fc["hand"]]
	if not h.has("arm"):
		return
	var fp := _face_point(fc["at"])
	if fp.is_empty():
		return
	var pt: Array = fc.get("point", [0, 0, 0])
	var P := (_gp(int(h["bone"])) * _grip_t(fc["hand"])) * Vector3(pt[0], pt[1], pt[2])
	var T: Vector3 = fp[0]
	var w := _face_weight(fc, player.current_animation_position, player.current_animation_length, P.distance_to(T))
	face_w = w
	if w <= 0.0:
		return
	var arm: Array = h["arm"]
	var hand := int(arm[2])
	var ht := _gp(hand)
	_reach_arm(int(arm[0]), int(arm[1]), hand, ht.origin + (T - P) * w, ht.basis.get_rotation_quaternion())
	if fc.get("level") != null and fc["hand"] == "R" and held["L"] != null and _holders.has("L"):
		_level(float(fc["level"]) + (1.0 - w) * 90.0)


# the bow arm lowers (about its shoulder) until the arrow, string hand to bow hand, points up no more than deg
func _level(deg: float) -> void:
	var arm = skel["hands"]["L"].get("arm")
	if arm == null:
		return
	var up := int(arm[0])
	for k in 2:
		var A := (_gp(int(skel["hands"]["R"]["bone"])) * _grip_t("R")).origin
		var B := (_gp(int(skel["hands"]["L"]["bone"])) * _grip_t("L")).origin
		var U := B - A
		var ln := U.length()
		var pitch := asin(clampf(U.y / maxf(ln, 1e-6), -1.0, 1.0))
		var over := pitch - deg_to_rad(deg)
		if over <= 1e-3:
			return
		var K := B - _gp(up).origin
		var X := K.cross(Vector3(0, -1, 0))
		if X.length_squared() < 1e-10:
			return
		var drop := ln * (sin(pitch) - sin(pitch - over))
		var lever := maxf(0.1, Vector2(K.x, K.z).length())
		_turn(up, Quaternion(X.normalized(), minf(0.6, drop / lever)))


# twin of carry: a prop with props.json carry (a bowl) is held in front of the belly: the wrist goes to carry (metres
# from the lower spine joint in the skeleton's frame, mirrored for the left hand) by the arm's two-bone solve
func _carry() -> void:
	var spine := skeleton.find_bone("Spine")
	if spine < 0:
		return
	for side in ["R", "L"]:
		var id = held[side]
		var c = props.get(id, {}).get("carry") if id != null else null
		if c == null or not skel["hands"].has(side) or not skel["hands"][side].has("arm"):
			continue
		var arm: Array = skel["hands"][side]["arm"]
		var hand := int(arm[2])
		var target := _gp(spine).origin + Vector3((1.0 if side == "R" else -1.0) * float(c[0]), float(c[1]), float(c[2]))
		_reach_arm(int(arm[0]), int(arm[1]), hand, target, _gp(hand).basis.get_rotation_quaternion())


# twin of standUp: a prop with props.json upright (a cup's mouth, a bowl's opening) turns the wrist so that axis points
# up, as far as the hand is not at the face (_to_face's weight); first a carried prop's arm (_carry)
func _stand_up() -> void:
	_carry()
	var fc = _clip_info().get("face")
	for side in ["R", "L"]:
		var id = held[side]
		var up = props.get(id, {}).get("upright") if id != null else null
		if up == null or not _holders.has(side):
			continue
		var w := 1.0 - (face_w if fc != null and fc["hand"] == side else 0.0)
		if w <= 0.0:
			continue
		var gq := (_gp(int(skel["hands"][side]["bone"])) * _grip_t(side)).basis.get_rotation_quaternion()
		var q := Quaternion(gq * Vector3(up[0], up[1], up[2]).normalized(), Vector3.UP)
		if w < 1.0:
			q = Quaternion().slerp(q, w)
		_turn(int(skel["hands"][side]["bone"]), q)


# twin of hang: a prop with props.json hang turns about the grip so that axis points down
func _hang() -> void:
	for side in _hangs:
		var h: Dictionary = _hangs[side]
		var gq := (_gp(int(skel["hands"][side]["bone"])) * _grip_t(side)).basis.get_rotation_quaternion()
		(h["pivot"] as Node3D).quaternion = Quaternion(h["axis"], gq.inverse() * Vector3(0, -1, 0))


# twin of bowString: the string between the bow's limb tips through the drawing hand while it is behind the bow, the
# bow turned about its handle to face that hand, and an arrow; when the arrow is on the string comes from the clip
# (clips.json nock spans; without them, a guess from the hand's place). The bow is canted about the arrow's line:
# at full draw toward upright (but for LEAN), and until its limbs are out of the legs
const LIMB := [0.12, 0.24, 0.36, 0.48, 0.6, 0.72]
const CLEAR := 0.045                     # the trousers and the limb's thickness round the legs' capsules
const HEAD := 0.05                       # the arrow's head stays this far in front of the bow at full draw
const LEAN := 15.0 * PI / 180.0


func _make_bow(holder: Node3D, p: Dictionary) -> void:
	var pivot := Node3D.new()
	var cant := Node3D.new()
	for ch in holder.get_children():
		holder.remove_child(ch)
		cant.add_child(ch)
	pivot.add_child(cant)
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
	_bow = {"top": Vector3(s[0], s[1], s[2]), "bot": Vector3(s[3], s[4], s[5]), "pivot": pivot, "cant": cant, "cant_a": 0.0,
		"in_legs": 0.0, "turn": 0.0, "a": MeshInstance3D.new(), "c": MeshInstance3D.new(), "arrow": null}
	for k in ["a", "c"]:
		_bow[k].mesh = cyl
		cant.add_child(_bow[k])
	if p.has("arrow"):
		var ar := _scene("%s/pieces/props/%s.glb" % [dir, p["arrow"]]) as Node3D
		ar.visible = false
		cant.add_child(ar)
		_bow["arrow"] = ar


func bow_state() -> Dictionary:
	return {} if _bow.is_empty() else {"turn": _bow["turn"], "cant": _bow["cant_a"], "in_legs": _bow["in_legs"],
		"arrow": _bow["arrow"] != null and _bow["arrow"].visible, "ahead": _bow.get("ahead")}


func _span(m: MeshInstance3D, a: Vector3, b: Vector3) -> void:
	var d := b - a
	var n := maxf(d.length(), 1e-4)
	m.transform = Transform3D(Basis(Quaternion(Vector3.UP, d / n)) * Basis.from_scale(Vector3(1, n, 1)), (a + b) * 0.5)


# whether the clip has the arrow on the string now: 1, 0, or -1 when the clip gives no spans
func _nocked() -> int:
	var n = _clip_info().get("nock")
	if n == null:
		return -1
	var t := player.current_animation_position
	for w in n:
		if t >= float(w[0]) and t <= float(w[1]):
			return 1
	return 0


func _cap_depth(p: Vector3, cp: Dictionary, pad := 0.0) -> float:
	var e := _cap_ends(cp)
	var ab: Vector3 = e[1] - e[0]
	var t := clampf((p - e[0]).dot(ab) / maxf(1e-9, ab.length_squared()), 0.0, 1.0)
	return float(cp["r"]) + pad + 0.012 - p.distance_to(e[0] + ab * t)


func _upright(ax: Vector3, PV: Transform3D) -> float:
	var b := PV.basis.get_rotation_quaternion().inverse() * Vector3.UP
	var a := Vector3.UP - ax * ax.y
	b -= ax * b.dot(ax)
	if a.length_squared() < 1e-8 or b.length_squared() < 1e-8:
		return 0.0
	var ang := atan2(a.cross(b).dot(ax), a.dot(b))
	if absf(ang) > PI / 2.0:
		ang -= signf(ang) * PI                   # the bow is the same either way up: the nearer
	return signf(ang) * maxf(0.0, absf(ang) - LEAN)


func _cant_for(ax: Vector3, full: bool, PV: Transform3D) -> float:
	var base := _upright(ax, PV) * face_w if full else 0.0
	_bow["in_legs"] = 0.0
	var leg_bones := [skeleton.find_bone("LeftUpLeg"), skeleton.find_bone("LeftLeg"), skeleton.find_bone("RightUpLeg"), skeleton.find_bone("RightLeg")]
	var legs := []
	for cp in _caps:
		if cp.get("pa") == null and cp["a"] in leg_bones:
			legs.append(cp)
	if legs.is_empty():
		return base
	var best := base
	var least := INF
	var cants := [0.0]
	for d in range(10, 81, 10):
		cants.append(float(d))
		cants.append(-float(d))
	for c in cants:
		var a: float = base + deg_to_rad(c)
		var M := PV * Transform3D(Basis(ax, a), Vector3.ZERO)
		var sum := 0.0
		for y in LIMB:
			for sg in [1.0, -1.0]:
				var w := M * Vector3(0, sg * y, -0.09 * (y / 0.72) * (y / 0.72))
				for cp in legs:
					sum += maxf(0.0, _cap_depth(w, cp, CLEAR))
		if sum <= 0.0:
			return a
		if sum < least - 1e-6:
			least = sum
			best = a
	_bow["in_legs"] = least
	return best


# the bow's arrow is props.json arrow_arm times the bow arm's length (shoulder to wrist): a long-armed draw (about 1.5
# arms) leaves its head in front of the bow
func _arrow_length() -> float:
	var p: Dictionary = props.get(held["L"], {})
	var arm = skel["hands"]["L"].get("arm")
	if not p.has("arrow_arm") or arm == null:
		return float(props.get(p.get("arrow", ""), {}).get("length", 0.78))
	var a := _gp(int(arm[0])).origin
	var e := _gp(int(arm[1])).origin
	var h := _gp(int(arm[2])).origin
	return float(p["arrow_arm"]) * (a.distance_to(e) + e.distance_to(h))


func _bow_string(dt: float) -> void:
	drawn = false
	if _bow.is_empty():
		return
	var top: Vector3 = _bow["top"]
	var bot: Vector3 = _bow["bot"]
	var rest := (top.z + bot.z) * 0.5
	var pivot: Node3D = _bow["pivot"]
	var nk := _nocked()
	var lh := _gp(int(skel["hands"]["L"]["bone"])) * _grip_t("L")
	var rp := _gp(int(skel["hands"]["R"]["bone"])) * _grip_t("R").origin
	var p := lh.affine_inverse() * rp                          # the drawing hand in the bow hand's grip frame
	# the arrow's length follows the bow arm; nocked, the string hand draws at most HEAD short of it
	var ln := _arrow_length()
	var over := p.length() - (ln - HEAD)
	var r_arm = skel["hands"]["R"].get("arm")
	if nk == 1 and over > 0.0 and r_arm != null:
		var rh := int(r_arm[2])
		var rt := _gp(rh)
		_reach_arm(int(r_arm[0]), int(r_arm[1]), rh, rt.origin + (lh.origin - rp).normalized() * over, rt.basis.get_rotation_quaternion())
		rp = _gp(int(skel["hands"]["R"]["bone"])) * _grip_t("R").origin
		p = lh.affine_inverse() * rp
	var n := Vector2(p.x, p.z).length()
	var turn := 0.0
	var near_mid := absf(p.y) < 0.35 and n > 0.12 and n < 0.95
	if (near_mid if nk < 0 else (nk == 1 and n > 0.05)):
		turn = atan2(-p.x, -p.z)
	_bow["turn"] = turn
	pivot.transform = Transform3D(Basis(Vector3.UP, turn), Vector3.ZERO)
	p = p.rotated(Vector3.UP, -turn)
	drawn = turn != 0.0 and p.z < rest - 0.02
	_bow["ahead"] = ln - p.length() if drawn else null      # how far the arrow's head is in front of the bow
	# the cant, about the arrow's line (through the string hand, so the string stays in it), eased while playing
	var ax := p.normalized() if drawn else Vector3(0, 0, -1)
	var want := _cant_for(ax, drawn, lh * pivot.transform) if _clip != "" else 0.0
	var ca: float = _bow["cant_a"]
	_bow["cant_a"] = ca + (want - ca) * (1.0 - exp(-dt / 0.12)) if dt > 0.0 else want
	(_bow["cant"] as Node3D).transform = Transform3D(Basis(ax, float(_bow["cant_a"])), Vector3.ZERO)
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
		ar.visible = drawn and (p.z < -0.2 if nk < 0 else true)
		if ar.visible:
			var to := (Vector3(0, 0.04 * (signf(p.y) if p.y != 0.0 else 1.0), 0) - p).normalized()
			var alen := float(props.get(props.get(held["L"], {}).get("arrow", ""), {}).get("length", 0.78))
			ar.transform = Transform3D(Basis(Quaternion(Vector3.BACK, to)) * Basis.from_scale(Vector3(1, 1, ln / alen)), p)


# ---- cloth (the twin of the cloth section of 50-figure.js) ----
# A garment's hanging parts are bone chains (kit item 'cloth', make_mpfb.py cloth_bones), added to the skeleton when
# the garment is first built; each chain's points are vertices of the garment, so their rest follows the morph (read
# from the blend shapes). Every frame each point is a Verlet particle pulled to its rigid rest by the part's
# stiffness, under Krator's gravity and the dense air's drag (and the wind of a loop's root_speed), kept to its
# length, near its neighbours, out of the body's capsules and above the floor; each bone turns to the next particle
var cloth := true
# the spike (REPORT.md): Godot's SpringBoneSimulator3D drives the chains instead of the Verlet below. Set before
# apply(): each chain gets a tip bone, and one simulator (a setting per chain, the capsules as collision children)
# is rebuilt on every apply. Off by default: the Verlet path is the twin of the page's
var spring_sim := false
var spring_opts := {}                    # the spike's switches: collide (bool), stiff_k, gravity, drag, radius
var _sim: SpringBoneSimulator3D = null
var _sim_caps := []                      # per collider: {cp, cap, sa, sb} (the capsule and its end spheres)
const C_GRAV := 7.4
const C_DRAG := 1.6
const C_DAMP := 0.04
const C_STEP := 1.0 / 60.0
const C_PAD := 0.022
var _cloth := {}                         # part key -> {item, by_name, chains, parts, meshes, on, reset, ring}
var _caps := []
var _binds := {}


# a capsule's ends in the skeleton's space: its joints, or (the seat's) rest points riding them
func _cap_ends(cp: Dictionary) -> Array:
	if cp.get("pa") == null or not _binds.has(cp["a"]) or not _binds.has(cp["b"]):
		return [_gp(cp["a"]).origin, _gp(cp["b"]).origin]
	return [(_gp(cp["a"]) * (_binds[cp["a"]] as Transform3D)) * (cp["pa"] as Vector3),
		(_gp(cp["b"]) * (_binds[cp["b"]] as Transform3D)) * (cp["pb"] as Vector3)]
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
		var rec := {"parent": skeleton.find_bone(ch["parent"]), "pts": ch["pts"], "bw": ch.get("bw"), "bones": list,
			"p": [], "r": [], "rest": [], "len": [], "x": [], "xp": [], "tw": [], "q0": Quaternion(), "stiff": 0.1}
		if spring_sim:
			# the simulator's joints are bone origins, so the chain's last point needs a bone of its own (bound to nothing)
			var tb := skeleton.get_bone_count()
			skeleton.add_bone("cloth_%s_%d_tip" % [it["id"], g])
			skeleton.set_bone_parent(tb, list[list.size() - 1])
			rec["tip"] = tb
		c["chains"].append(rec)
	# a layer within its slot's: a legs item's chains under a torso item's, under a head item's (as clothOf in 50-figure.js)
	# (an item worn over a higher slot's under-layers ranks with it: kit item over, pteruges)
	var rank: int = 3 * int(SLOT_RANK.get(it.get("over", it.get("slot", "")), 0))
	for pt in c["parts"]:
		for g in pt["chains"]:
			c["chains"][int(g)]["stiff"] = float(pt["stiff"])
			c["chains"][int(g)]["layer"] = rank + int(pt.get("layer", 0))
	_cloth[part["key"]] = c
	return c


# the chains' rest from the morphed garment (base positions plus the blend shapes' offsets)
func _cloth_rest(want: Dictionary, w: PackedFloat64Array) -> void:
	_caps = KChar.colliders(skel, w)
	# the joints' binds (morphed), for the seat's capsules: their rest ends ride a joint as a garment's chains do
	_binds = {}
	for m in want:
		var mm := m as MeshInstance3D
		if mm != null and mm.skin != null:
			for k in mm.skin.get_bind_count():
				_binds[mm.skin.get_bind_bone(k)] = mm.skin.get_bind_pose(k)
			break
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
			var bones: Array = ch["bones"].duplicate()
			if ch.has("tip"):
				bones.append(ch["tip"])
			for k in bones.size():
				for m in c["meshes"]:
					for q in m.skin.get_bind_count():
						if m.skin.get_bind_bone(q) == bones[k]:
							m.skin.set_bind_pose(q, Transform3D(Basis(), -P[k]))
			ch["pbind"] = pbind[ch["parent"]]
			ch["binds"] = pbind
		# a chain wholly above the hip joint follows the body point by point; one reaching below it, by its top point
		var hip_y: float = (pbind[skeleton.find_bone("Hips")] as Transform3D).affine_inverse().origin.y
		for ch in c["chains"]:
			ch["whole"] = true
			for q in ch["p"]:
				if (q as Vector3).y <= hip_y:
					ch["whole"] = false
		_posed_rests(c, pbind)
		c["posed"] = null
		_place_chains(c, player != null and player.is_playing())
	if spring_sim:
		_sim_build()


# ---- the spike: Godot's SpringBoneSimulator3D on the chains (REPORT.md) ----
# One simulator under the skeleton, a setting per chain (root: the chain's first bone, end: its tip bone), the
# Verlet's numbers mapped onto Godot's model, which pulls each joint a fixed distance a second along its rest
# direction, damps its velocity by a fraction a frame (drag) and adds gravity as a displacement a second (not an
# acceleration). The Verlet's lerp to the rigid rest is spring and damper at once, so the two are matched on their
# linearised dynamics, a point displaced u from rest, over one SIM_FPS frame (two Verlet steps of C_STEP):
#   Verlet, a step:  u' = (1 - s)(2 - D) u - (1 - s)(1 - D) u_prev      s = stiff, D = C_DAMP + C_DRAG h
#   Godot, a frame:  u' = (2 - drag - k) u - (1 - drag) u_prev           k = stiffness dt / L
# so drag = 1 - b1^2 and k = 2 - drag - 2 b1 cos(2 t1), with b1 = (1 - s)(1 - D) and cos t1 = (1 - s)(2 - D) / (2 sqrt b1):
# the same decay and period a frame. Gravity gives the same sag at rest (g h^2 / s = gravity dt / k), and the root
# speed's wind is external_force. The drag is a fraction a frame, so this holds at SIM_FPS only: Godot's model is
# frame-rate dependent.
# The colliders are its children: a capsule per collider (radius r, as the Verlet's), placed on the capsule's
# joint a and moved each frame to the live ends (_cap_ends: the seat's ride the hips, the trunk's span a bent
# spine); a plane at the ground. spring_opts.ends adds a sphere at each end with the push shader's end radii (ra,
# rb): the chest's and hips' are so much wider than r that they throw a mantle off the back (REPORT.md)
const SIM_FPS := 30.0
func _sim_build() -> void:
	if _sim != null:
		_sim.queue_free()
		_sim = null
	_sim_caps = []
	var chains := []
	for key in _cloth:
		if _cloth[key]["on"]:
			for ch in _cloth[key]["chains"]:
				if ch.has("tip"):
					chains.append(ch)
	if chains.is_empty():
		return
	skeleton.modifier_callback_mode_process = Skeleton3D.MODIFIER_CALLBACK_MODE_PROCESS_MANUAL
	_sim = SpringBoneSimulator3D.new()
	_sim.name = "KClothSim"
	skeleton.add_child(_sim)
	# no joint radius: with the Verlet's pad (C_PAD) too many rest points lie inside the trunk and thigh capsules, and
	# this solver (push out, then clamp to length) walks a mantle off the back and bells a skirt from them (REPORT.md)
	var jr: float = float(spring_opts.get("radius", 0.0)) / size
	var stiff_k: float = float(spring_opts.get("stiff_k", 1.0))
	for cp in (_caps if spring_opts.get("collide", true) else []):
		if spring_opts.get("noarms", false) and skeleton.get_bone_name(cp["a"]).contains("Arm"):
			continue
		var cap := SpringBoneCollisionCapsule3D.new()
		cap.bone_name = skeleton.get_bone_name(cp["a"])
		cap.radius = float(cp["r"])
		_sim.add_child(cap)
		var ends := []
		for e in [["sa", "ra"], ["sb", "rb"]]:
			var s: SpringBoneCollisionSphere3D = null
			if spring_opts.get("ends", false) and absf(float(cp[e[1]]) - float(cp["r"])) > 1e-4:
				s = SpringBoneCollisionSphere3D.new()
				s.bone_name = cap.bone_name
				s.radius = float(cp[e[1]])
				_sim.add_child(s)
			ends.append(s)
		_sim_caps.append({"cp": cp, "cap": cap, "sa": ends[0], "sb": ends[1]})
	if spring_opts.get("collide", true):
		var floor := SpringBoneCollisionPlane3D.new()
		floor.position = Vector3(0, 0.008 - skeleton.position.y - jr, 0)   # the joints' radius above it: the Verlet's height
		_sim.add_child(floor)
	_sim.set_setting_count(chains.size())
	for i in chains.size():
		var ch: Dictionary = chains[i]
		_sim.set_root_bone(i, ch["bones"][0])
		_sim.set_end_bone(i, ch["tip"])
		_sim.set_extend_end_bone(i, false)
		# one value a chain (its joints are listed on a deferred update, so per-joint values cannot be set here)
		_sim.set_individual_config(i, false)
		var s := float(ch["stiff"])
		var D := C_DAMP + C_DRAG * C_STEP
		var b1 := (1.0 - s) * (1.0 - D)
		var t1 := acos(clampf((1.0 - s) * (2.0 - D) / (2.0 * sqrt(b1)), -1.0, 1.0))
		var drag := 1.0 - b1 * b1
		var k := 2.0 - drag - 2.0 * b1 * cos(2.0 * t1)
		var mean := 0.0
		for L in ch["len"]:
			mean += float(L) / ch["len"].size()
		_sim.set_radius(i, jr)
		_sim.set_drag(i, float(spring_opts.get("drag", drag)))
		_sim.set_gravity(i, float(spring_opts.get("gravity", C_GRAV * C_STEP * C_STEP * SIM_FPS * k / s)) / size)
		_sim.set_gravity_direction(i, Vector3.DOWN)
		_sim.set_stiffness(i, k * mean * SIM_FPS * stiff_k)
		if _sim.get_root_bone(i) < 0 or _sim.get_end_bone(i) < 0:
			push_warning("KCharFigure: the simulator cannot see the chain's bones (is the figure in the tree? skeleton %s, root %d/%s end %d/%s)" % [_sim.get_skeleton(), _sim.get_root_bone(i), _sim.get_root_bone_name(i), _sim.get_end_bone(i), _sim.get_end_bone_name(i)])
	_sim.reset()


func _sim_step(dt: float, wind: Vector3) -> void:
	if _sim == null:
		return
	if dt < 0.0 or not cloth:                # a still pose, or cloth off: the chains hang rigid
		for key in _cloth:
			for ch in _cloth[key]["chains"]:
				for k in ch["bones"].size():
					skeleton.set_bone_pose_rotation(ch["bones"][k], ch["q0"] if k == 0 else Quaternion())
		if _sim.active:                      # (setting it resets the simulation: only on a change)
			_sim.active = false
		if dt < 0.0:
			_sim.reset()
		return
	if not _sim.active:
		_sim.active = true
	for e in _sim_caps:
		var cp: Dictionary = e["cp"]
		var ends := _cap_ends(cp)
		var inv: Transform3D = _gp(cp["a"]).affine_inverse()
		var la: Vector3 = inv * (ends[0] as Vector3)
		var lb: Vector3 = inv * (ends[1] as Vector3)
		var cap: SpringBoneCollisionCapsule3D = e["cap"]
		var d := lb - la
		cap.position_offset = (la + lb) * 0.5
		cap.rotation_offset = Quaternion(Vector3.UP, d.normalized()) if d.length() > 1e-6 else Quaternion()
		cap.height = d.length() + 2.0 * cap.radius
		if e["sa"] != null:
			e["sa"].position_offset = la
		if e["sb"] != null:
			e["sb"].position_offset = lb
	_sim.external_force = wind * C_DRAG * C_STEP
	skeleton.advance(dt)


# the chains' rest in the postured pose (as posedRests in 50-figure.js; HANDOFF-CLOTHING.md, 1): the skeleton at its
# bind pose, postured; each chain point skinned by the garment's own body weights (kit bw) and carried back rigidly with
# its chain's parent joint. The binds stay at the A-pose points
func _posed_rests(c: Dictionary, pbind: Dictionary) -> void:
	var any := false
	for ch in c["chains"]:
		any = any or ch.get("bw") != null
	if not any:
		for ch in c["chains"]:
			ch["r"] = ch["p"]
		return
	var saved := []
	for i in skeleton.get_bone_count():
		saved.append(skeleton.get_bone_pose_rotation(i))
		skeleton.set_bone_pose_rotation(i, skeleton.get_bone_rest(i).basis.get_rotation_quaternion())
	_posture(true)
	for ch in c["chains"]:
		if ch.get("bw") == null:
			ch["r"] = ch["p"]
			continue
		var Mi: Transform3D = (_gp(ch["parent"]) * (pbind[ch["parent"]] as Transform3D)).affine_inverse()
		var R := []
		for k in ch["p"].size():
			var p: Vector3 = ch["p"][k]
			var v := Vector3.ZERO
			var tot := 0.0
			for nw in ch["bw"][k]:
				var j := skeleton.find_bone(String(nw[0]))
				if j < 0 or not pbind.has(j):
					continue
				v += float(nw[1]) * ((_gp(j) * (pbind[j] as Transform3D)) * p)
				tot += float(nw[1])
			R.append(Mi * (v / tot) if tot > 0.0 else p)
		ch["r"] = R
	for i in skeleton.get_bone_count():
		skeleton.set_bone_pose_rotation(i, saved[i])


# the chains' bones at the postured rest while a clip plays, at the A-pose's otherwise (no posture there); the ring's
# rest distances with them
func _place_chains(c: Dictionary, posed: bool) -> void:
	if c.get("posed") == posed:
		return
	c["posed"] = posed
	for ch in c["chains"]:
		var R: Array = ch["r"] if posed else ch["p"]
		ch["rest"] = R
		ch["len"] = []
		for k in range(1, R.size()):
			ch["len"].append((R[k] - R[k - 1]).length())
		var bones: Array = ch["bones"].duplicate()
		if ch.has("tip"):
			bones.append(ch["tip"])              # the spring-bone spike's tip bone (REPORT.md)
		for k in bones.size():
			var t: Transform3D
			if k == 0:
				t = (ch["pbind"] as Transform3D) * Transform3D(Basis(), R[0])
				ch["q0"] = t.basis.get_rotation_quaternion()
			else:
				t = Transform3D(Basis(), R[k] - R[k - 1])
			skeleton.set_bone_rest(bones[k], t)
			skeleton.set_bone_pose_position(bones[k], t.origin)
			skeleton.set_bone_pose_rotation(bones[k], t.basis.get_rotation_quaternion())
	c["ring"] = []
	for pt in c["parts"]:
		var g: Array = pt["chains"]
		var n := g.size()
		for a in (n if pt["closed"] else n - 1):
			var A: Dictionary = c["chains"][int(g[a])]
			var Bc: Dictionary = c["chains"][int(g[(a + 1) % n])]
			for k in range(1, mini(A["rest"].size(), Bc["rest"].size())):
				c["ring"].append([A, Bc, k, (A["rest"][k] - Bc["rest"][k]).length()])
	c["reset"] = true


const LEGJ := ["UpLeg", "Leg", "Foot", "Toe"]


# twin of rigidTargets in 50-figure.js: riding the parent joint; while a clip plays, a chain's rest is where the
# garment's own body weights (kit bw, not the legs') put its points in this pose (a chain wholly above the hip joint),
# or its top point (one reaching below: the rest keeps the shape it hangs in from its parent and moves with that point)
func _rigid(ch: Dictionary) -> Transform3D:
	var M: Transform3D = _gp(ch["parent"]) * (ch["pbind"] as Transform3D)
	var tw := []
	for p in ch["rest"]:
		tw.append(M * (p as Vector3))
	if ch.get("bw") == null or player == null or not player.is_playing():
		ch["tw"] = tw
		return M
	var binds: Dictionary = ch["binds"]
	var n: int = ch["p"].size() if ch["whole"] else 1
	for k in n:
		var v := Vector3.ZERO
		var tot := 0.0
		for nw in ch["bw"][k]:
			var nm := String(nw[0])
			var leg := false
			for l in LEGJ:
				leg = leg or (k > 0 and nm.contains(l))   # the top point with all its weights: it is the cloth's own vertex
			var j := skeleton.find_bone(nm)
			if leg or j < 0 or not binds.has(j):
				continue
			v += float(nw[1]) * ((_gp(j) * (binds[j] as Transform3D)) * (ch["p"][k] as Vector3))
			tot += float(nw[1])
		if tot > 0.0:
			tw[k] = v / tot
	var F := M
	# a loose chain above the hips hangs: its fitted shape from its top point, turned with the hips' heading only, by how
	# loose it is (rigidTargets in 50-figure.js: the Chichani tilma's front stood off like a shelf in the idle's lean)
	var gw := clampf((0.3 - float(ch["stiff"])) / 0.2, 0.0, 1.0)
	if ch["whole"] and gw > 0.0:
		var hz: Vector3 = (_gp(skeleton.find_bone("Hips")) * (binds[skeleton.find_bone("Hips")] as Transform3D)).basis.z
		var hb := Basis(Vector3.UP, atan2(hz.x, hz.z)).scaled(Vector3.ONE * hz.length())
		var g: Vector3 = tw[0]
		for k in range(1, tw.size()):
			g += hb * ((ch["p"][k] as Vector3) - (ch["p"][k - 1] as Vector3))
			tw[k] = (tw[k] as Vector3).lerp(g, gw)
	if not ch["whole"]:
		# the shape it was fitted in, turned with the hips, from its top point (turned with the spine joint it hangs
		# from, which the clips pitch hard, a cape's hem swung 0.7 m off the body: the fold; rigidTargets in 50-figure.js)
		var hi := skeleton.find_bone("Hips")
		F = _gp(hi) * (binds[hi] as Transform3D)
		# placed by the hips, turned with their heading only; the top point's own offset (the chest leans ahead of the
		# hips) fades out down to the hip joint (rigidTargets in 50-figure.js: a back panel sank into the buttocks and the
		# layering threw it out in front, through the body)
		var fz: Vector3 = F.basis.z
		var hb := Basis(Vector3.UP, atan2(fz.x, fz.z)).scaled(Vector3.ONE * fz.length())
		var hm: Vector3 = (binds[hi] as Transform3D).affine_inverse().origin
		F = Transform3D(hb, _gp(hi).origin - hb * hm)
		var off: Vector3 = (tw[0] as Vector3) - F * (ch["p"][0] as Vector3)
		var y0: float = (ch["p"][0] as Vector3).y
		for k in range(1, tw.size()):
			var fk := clampf(((ch["p"][k] as Vector3).y - hm.y) / maxf(1e-4, y0 - hm.y), 0.0, 1.0)
			tw[k] = F * (ch["p"][k] as Vector3) + off * fk
	ch["tw"] = tw
	# the root joint where its point is
	skeleton.set_bone_pose_position(ch["bones"][0], _gp(ch["parent"]).affine_inverse() * (tw[0] as Vector3))
	return F


func _cloth_step(dt: float) -> void:
	var items := []
	for key in _cloth:
		if _cloth[key]["on"] and _cloth[key]["chains"].size():
			items.append(_cloth[key])
	if items.is_empty():
		return
	if spring_sim:
		var w0 := Vector3.ZERO
		for cm in skel.get("clips", []):
			if cm["name"] == _clip and cm.get("loop", true) and cm.has("root_speed"):
				w0 = -KChar._v(cm["root_speed"])
		_sim_step(dt, w0)
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
		if "Arm" in String(skel["joints"][int(cp["a"])]["name"]):
			continue                        # not the arms (an elbow at the waist pushed one chain of a cape out as a spike)
		var ends := _cap_ends(cp)
		var nm := skeleton.get_bone_name(cp["a"])
		W.append({"a": ends[0], "b": ends[1], "r": float(cp["r"]) + C_PAD / size, "r0": float(cp["r"]),
			"leg": nm.contains("Leg") or nm.contains("Foot") or nm.contains("Toe"), "seat": cp.get("pa") != null})
	# the seat's two upright capsules as one across the buttocks, for the chains (a skirt's point at the back between them
	# went out of one toward the other, sideways: the fold; clothStep in 50-figure.js)
	var seats := W.filter(func(e): return e.get("seat", false))
	if seats.size() == 2:
		W = W.filter(func(e): return not e.get("seat", false))
		W.append({"a": (seats[0]["a"] + seats[0]["b"]) * 0.5, "b": (seats[1]["a"] + seats[1]["b"]) * 0.5, "r": seats[0]["r"], "leg": false})
	var ground := 0.008 - skeleton.position.y
	var wind := Vector3.ZERO
	for cm in skel.get("clips", []):
		if cm["name"] == _clip and cm.get("loop", true) and cm.has("root_speed"):
			wind = -KChar._v(cm["root_speed"])
	var grav := Vector3(0, -C_GRAV / size, 0)            # in the skeleton's units: a giant's are twice a metre
	for c in items:
		_place_chains(c, player != null and player.is_playing())
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
	# across the hips, level: the side a leg's capsule lies on
	var lat := _gp(skeleton.find_bone("LeftUpLeg")).origin - _gp(skeleton.find_bone("RightUpLeg")).origin
	lat.y = 0.0
	lat = lat.normalized()
	for k in range(1, x.size()):
		var p: Vector3 = x[k]
		var up: Vector3 = x[k - 1]
		var rw: Vector3 = ch["tw"][k]
		for cp in W:
			var ab: Vector3 = cp["b"] - cp["a"]
			var lsq := maxf(1e-9, ab.length_squared())
			# no further out than the point's own rest lies (a chain's root inside the trunk threw the point below it out
			# sideways: the fold; collide() in 50-figure.js), but out of a leg at least to the bare limb (a skirt's rest
			# follows the hips, and a thigh swung forward over it would take the cloth in)
			var rq: Vector3 = cp["a"] + ab * clampf((rw - cp["a"]).dot(ab) / lsq, 0.0, 1.0)
			var r := minf(float(cp["r"]), maxf(rw.distance_to(rq), float(cp.get("r0", 0.0)) if cp.get("leg", false) else 0.0))
			var t := clampf((p - cp["a"]).dot(ab) / lsq, 0.0, 1.0)
			var q: Vector3 = cp["a"] + ab * t
			var dd := p.distance_to(q)
			if dd < r and dd > 1e-6:
				# across a limb nearer level than upright (a seated thigh, a raised arm), out on the side of the point
				# above, so the chain drapes over it; along an upright one, out the side away from the body's axis
				# (collide() in 50-figure.js)
				var d := p - q
				var ax := ab.normalized()
				var o := (up - q) - ax * (up - q).dot(ax)
				if absf(ax.y) < 0.7 and o.length() > 1e-4:
					o = o.normalized()
				elif cp.get("leg", false) and (rw - q).dot(lat) * signf((q - hip).dot(lat)) > -0.5 * float(cp["r"]):
					# the legs only (on the trunk's, the chest leaning forward of the hips, it threw a mantle's points at
					# the back of the neck through the body to the front), and not for a point whose rest lies on the
					# thigh's inner side, between the legs (a skirt's back centre, thrown out through the thigh: the fold)
					o = Vector3(q.x - hip.x, 0.0, q.z - hip.z)
					o = o.normalized() if o.length_squared() > 9e-4 else Vector3.ZERO
				else:
					o = Vector3.ZERO
				var sd := d.dot(o)
				if sd < 0.0:
					d -= 2.0 * sd * o
				p = q + d.normalized() * r
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


func _item_of(part: Dictionary) -> Dictionary:
	for x in kit["items"]:
		if "pieces/%s.glb" % part["key"] == x["glb"]:
			return x
	return {}


func _is_loose(part: Dictionary) -> bool:
	return _item_of(part).get("loose", false)


# a top or trousers as kchar_push.gdshader: the imported material's look, and the push and tuck (pushOut in 50-figure.js)
const TUCK := 0.025
const TUCK_UP := "Spine1"
const SQUEEZE := 0.008
const SQUEEZE_FEET := 0.014
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
	# a loose top pushes 2 cm further, so a robe's hem lies over the skirt it covers, and 3.5 cm more over trousers
	# (PAD_TOP, PAD_OVER in 50-figure.js)
	var pad := 0.0
	var slot0: String = _item_of(part).get("over", part["slot"])     # pteruges push as the top they hang over does
	if loose and slot0 == "torso":
		pad = 0.02
		if part["slot"] == "torso" and legs != null:          # not the pteruges themselves
			pad += 0.035 if not legs.get("loose", false) else 0.02
	elif loose:
		pad = 0.02           # a skirt, as a robe (PAD_SKIRT): at 0 a run's knee came through a wrap skirt
	pm.set_shader_parameter("kcP", pad)
	pm.set_shader_parameter("kcT", TUCK if slot0 == "legs" and top != null and top.get("tucks", false) else 0.0)
	# trousers under a loose top are drawn in to the legs (SQUEEZE in 50-figure.js): all the way under one that reaches
	# below the knees, else down to its hem (kit item hem)
	var squeeze: bool = slot0 == "legs" and top != null and top.get("loose", false) \
		and legs != null and not legs.get("loose", false)
	# boots under one, whatever the legs wear (SQUEEZE_FEET)
	var long_top: bool = top != null and top.get("loose", false) and top.get("long", false)
	pm.set_shader_parameter("kcS", SQUEEZE if squeeze else SQUEEZE_FEET if part["slot"] == "feet" and long_top else 0.0)
	pm.set_shader_parameter("kcSH", float(top.get("hem", 0.0)) if squeeze and not long_top else 1000.0)
	_push_mats.append(pm)
	return pm


# ---- fur (data/fur.json; kit items' fur: the twin of furShells in 50-figure.js) ----
# a garment's fur rows drawn as shells: fur.layers ShaderMaterials (kchar_fur.gdshader) chained after its material
# (next_pass), layer k of n standing k/n of the pile out; each takes the garment's look and, on a pushed garment, its
# push (the capsules each frame with the push materials). band: the rest heights a legs item's fur lies between
var fur := {}


# uv2: the piece carries its own fur cover and metres per UV in UV2 (a therian's head: the shells run as a coat's,
# kchar_fur.gdshader mode 2); colored: it has vertex colours, which the shells take
func _fur(m: Material, it: Dictionary, band: Vector2, uv2 := false, colored := false) -> void:
	var rows: Array = it.get("fur", [])
	if fur.is_empty() or rows.is_empty() or m == null:
		return
	var scale := float(fur.get("items", {}).get(it["id"], {}).get("pile", 1.0))
	if scale <= 0.0:
		return
	var n0 := int(fur.get("layers", 12))
	var kinds: Dictionary = fur["kinds"]
	var by_kind := {}
	for r in rows:
		if kinds.has(r[2]):
			if not by_kind.has(r[2]):
				by_kind[r[2]] = []
			by_kind[r[2]].append(r)
	var pushed := m is ShaderMaterial and (m as ShaderMaterial).shader == PUSH_SHADER
	var last := m
	for kind in by_kind:
		var K: Dictionary = kinds[kind]
		var rs: Array = by_kind[kind].slice(0, 4)
		var pile := float(K["pile"]) * scale
		var n := int(K.get("layers", n0)) if uv2 else n0
		var R := []
		for k in 4:
			R.append(Vector4(rs[k][0], rs[k][1], rs[k][3], rs[k][4]) if k < rs.size() else Vector4(2, 2, 0, 0))
		for k in range(1, n + 1):
			var t := float(k) / n
			var fm := ShaderMaterial.new()
			fm.shader = FUR_SHADER
			if pushed:
				for p in ["tex", "albedo", "kcL", "kcP", "kcT", "kcS", "kcSH"]:
					fm.set_shader_parameter(p, m.get_shader_parameter(p))
				_push_mats.append(fm)
			elif m is BaseMaterial3D:
				fm.set_shader_parameter("tex", (m as BaseMaterial3D).albedo_texture)
				fm.set_shader_parameter("albedo", (m as BaseMaterial3D).albedo_color)
			fm.set_shader_parameter("kfH", pile * t)
			fm.set_shader_parameter("kfC", float(K.get("comb", 0.0)) * pile * t * t)
			fm.set_shader_parameter("kfT", t)
			fm.set_shader_parameter("kfR", R)
			fm.set_shader_parameter("kfS", float(K["strand"]))
			fm.set_shader_parameter("kfW", float(K["thick"]))
			fm.set_shader_parameter("kfL", float(K.get("clump", 0.0)))
			fm.set_shader_parameter("kfSh", float(K.get("shade", 1.0)))
			fm.set_shader_parameter("kfTp", float(K.get("tip", 1.0)))
			fm.set_shader_parameter("kfV", float(K.get("vary", 0.0)))
			fm.set_shader_parameter("kfF", band)
			fm.set_shader_parameter("mode", 2 if uv2 else 0)
			fm.set_shader_parameter("kfDir", Vector3(0.0, -0.45, -0.9).normalized() if uv2 else Vector3(0.0, -1.0, 0.0))   # back along a head (furShells COMB_BACK)
			fm.set_shader_parameter("use_color", colored)
			fm.set_shader_parameter("kfU0", 1.0 if uv2 and k == 1 and K.get("undercoat", false) else 0.0)
			last.next_pass = fm
			last = fm


# ---- coats: a furred body (data/fur.json coats, a record's coat: the twin of coatShells in 50-figure.js) ----
# the joined skin's fur: each vertex's cover (its joints' covers summed by its weights, less the face, palms and soles in
# the rest pose) faded in over COAT_FADE rings from a hidden region, and the metres one unit of UV spans there, written
# to a texture (RG, a texel per vertex, read by VERTEX_ID) that kchar_fur.gdshader's body mode reads; the shells chained
# after the skin's material. A UV seam's halves (and a region border's) are one vertex for the rings (by position)
const COAT_FADE := 3
const EYE := [0.42, 0.48, 0.3, 0.22]       # the eyes and the mouth on the face's ellipse (coatBuild)
const MOUTH := [0.0, -0.3, 0.4, 0.2]


func _coat_hides(rec: Dictionary) -> Dictionary:
	var out := {}
	var c = fur.get("coats", {}).get(rec.get("coat") if rec.get("coat") != null else "", null)
	if c != null:
		for p in c.get("hide_parts", []):
			out[p] = true
	return out


static func _side_less(n: String) -> String:
	for p in ["Left2", "Right2", "Left", "Right"]:
		if n.begins_with(p):
			return n.substr(p.length())
	return n


func _cover_of(coat: Dictionary, n: String) -> float:
	var c: Dictionary = coat.get("cover", {})
	if c.has(n):
		return float(c[n])
	for f in ["HandIndex", "HandMiddle", "HandPinky", "HandRing", "HandThumb"]:
		if n.begins_with(f) and c.has("fingers"):
			return float(c["fingers"])
	return float(c.get("*", 1.0))


func _smooth(a: float, b: float, x: float) -> float:
	var t := clampf((x - a) / (b - a), 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)


# the coat's cover, the metres per UV and the rings' graph, once per built skin and coat
func _coat_static(b: Dictionary, mi: MeshInstance3D, id: String, coat: Dictionary) -> Dictionary:
	var cache: Dictionary = b.get_or_add("coats", {})
	if cache.has(id):
		return cache[id]
	var A: Array = b["joined"]
	var P: PackedVector3Array = A[Mesh.ARRAY_VERTEX]
	var N: PackedVector3Array = A[Mesh.ARRAY_NORMAL]
	var U: PackedVector2Array = A[Mesh.ARRAY_TEX_UV]
	var BI: PackedInt32Array = A[Mesh.ARRAY_BONES]
	var BW: PackedFloat32Array = A[Mesh.ARRAY_WEIGHTS]
	var IX: PackedInt32Array = A[Mesh.ARRAY_INDEX]
	var n := P.size()
	var per := BI.size() / n
	var names := []
	for k in mi.skin.get_bind_count():
		names.append(_side_less(mi.skin.get_bind_name(k)))
	var bare := {}
	for x in coat.get("bare", []):
		bare[x] = true
	var C := PackedFloat32Array()
	C.resize(n)
	var hw := PackedFloat32Array()
	hw.resize(n)
	var aw := PackedFloat32Array()
	aw.resize(n)
	var fw := PackedFloat32Array()
	fw.resize(n)
	var y0 := INF
	var y1 := -INF
	var x0 := INF
	var x1 := -INF
	var zs := 0.0
	var zn := 0
	for i in n:
		for k in per:
			var w := BW[i * per + k]
			if w <= 0.0:
				continue
			var nm: String = names[BI[i * per + k]] if BI[i * per + k] < names.size() else ""
			C[i] += w * _cover_of(coat, nm)
			if nm == "Head":
				hw[i] += w
			elif nm == "Hand" or (nm.begins_with("Hand") and nm != "Hand"):
				aw[i] += w
			elif nm == "Foot" or nm == "ToeBase":
				fw[i] += w
		if hw[i] > 0.5:
			y0 = minf(y0, P[i].y)
			y1 = maxf(y1, P[i].y)
			x0 = minf(x0, P[i].x)
			x1 = maxf(x1, P[i].x)
			zs += P[i].z
			zn += 1
	# the face: an ellipse on the head's front (coatBuild)
	var zc := zs / zn if zn > 0 else 0.0
	var xc := (x0 + x1) * 0.5
	var hh := maxf(y1 - y0, 1e-6)
	var fy := y0 + 0.37 * hh
	var ay := 0.37 * hh
	var ax := 0.3 * (x1 - x0)
	for i in n:
		var f := 0.0
		if hw[i] > 0.0 and P[i].z > zc:
			var ex := (P[i].x - xc) / ax
			var ey := (P[i].y - fy) / ay
			if bare.has("face"):
				f = maxf(f, hw[i] * (1.0 - _smooth(0.85, 1.15, sqrt(ex * ex + ey * ey))))
			if bare.has("eyes"):           # a furred face's eyes and mouth (coatBuild EYE, MOUTH)
				var e := minf(Vector2((ex - EYE[0]) / EYE[2], (ey - EYE[1]) / EYE[3]).length(), Vector2((ex + EYE[0]) / EYE[2], (ey - EYE[1]) / EYE[3]).length())
				f = maxf(f, hw[i] * (1.0 - _smooth(0.8, 1.2, e)))
			if bare.has("mouth"):
				f = maxf(f, hw[i] * (1.0 - _smooth(0.8, 1.2, Vector2((ex - MOUTH[0]) / MOUTH[2], (ey - MOUTH[1]) / MOUTH[3]).length())))
		if bare.has("palms"):
			f = maxf(f, aw[i] * _smooth(0.1, 0.45, -N[i].y))
		if bare.has("soles"):
			f = maxf(f, fw[i] * _smooth(0.3, 0.6, -N[i].y))
		C[i] = clampf(C[i] * (1.0 - f), 0.0, 1.0)
	var M := PackedFloat32Array()
	M.resize(n)
	var mc := PackedInt32Array()
	mc.resize(n)
	for t in range(0, IX.size(), 3):
		var l3 := 0.0
		var l2 := 0.0
		for k in 3:
			var a := IX[t + k]
			var c := IX[t + (k + 1) % 3]
			l3 += P[a].distance_to(P[c])
			l2 += U[a].distance_to(U[c])
		if l2 > 1e-9:
			for k in 3:
				M[IX[t + k]] += l3 / l2
				mc[IX[t + k]] += 1
	for i in n:
		M[i] = M[i] / mc[i] if mc[i] > 0 else 1.0
	var key := {}
	var src := PackedInt32Array()
	src.resize(n)
	for i in n:
		var q := Vector3i(roundi(P[i].x * 1e5), roundi(P[i].y * 1e5), roundi(P[i].z * 1e5))
		if not key.has(q):
			key[q] = key.size()
		src[i] = key[q]
	var nb := []
	for i in key.size():
		nb.append({})
	for t in range(0, IX.size(), 3):
		for k in 3:
			var p := src[IX[t + k]]
			var q := src[IX[t + (k + 1) % 3]]
			nb[p][q] = true
			nb[q][p] = true
	var out := {"C": C, "M": M, "src": src, "nb": nb, "ns": key.size()}
	cache[id] = out
	return out


func _coat(m: Material, b: Dictionary, mi: MeshInstance3D, rec: Dictionary, gain: Dictionary, hide: Image, edge: Image = null) -> void:
	var coats: Dictionary = fur.get("coats", {})
	var id = rec.get("coat")
	if id == null or not coats.has(id) or b.get("joined") == null:
		return
	var coat: Dictionary = coats[id]
	var K: Dictionary = fur["kinds"].get(coat.get("kind", ""), {})
	if K.is_empty():
		return
	var S := _coat_static(b, mi, id, coat)
	var A: Array = b["joined"]
	var R: PackedFloat32Array = A[Mesh.ARRAY_CUSTOM0]
	var n: int = S["C"].size()
	var src: PackedInt32Array = S["src"]
	var d := PackedFloat32Array()
	d.resize(S["ns"])
	d.fill(INF)
	var front := []
	for i in n:
		if (edge if edge != null else hide).get_pixel(int(R[i * 4] + 0.5), 0).r > 0.5 and d[src[i]] > 0.0:
			d[src[i]] = 0.0
			front.append(src[i])
	for r in range(1, COAT_FADE + 1):
		var next := []
		for v in front:
			for q in S["nb"][v]:
				if d[q] > r:
					d[q] = r
					next.append(q)
		front = next
	var W := 1024
	var img := Image.create(W, (n + W - 1) / W, false, Image.FORMAT_RGF)
	for i in n:
		img.set_pixel(i % W, i / W, Color(S["C"][i] * minf(1.0, d[src[i]] / COAT_FADE), S["M"][i], 0.0))
	var tex := ImageTexture.create_from_image(img)
	var layers := int(K.get("layers", fur.get("layers", 12)))
	var pile := float(K["pile"])
	var col := _lin(rec.get("hair_color") if rec.get("hair_color") != null else "#4a3424", float(gain.get("hair", 1.0)))
	var last := m
	while last.next_pass != null:
		last = last.next_pass
	for k in range(1, layers + 1):
		var t := float(k) / layers
		var fm := ShaderMaterial.new()
		fm.shader = FUR_SHADER
		fm.set_shader_parameter("mode", 1)
		fm.set_shader_parameter("fur_tex", tex)
		fm.set_shader_parameter("fur_w", W)
		fm.set_shader_parameter("albedo", col)
		fm.set_shader_parameter("kfU0", 1.0 if k == 1 and K.get("undercoat", false) else 0.0)
		fm.set_shader_parameter("kfH", pile * t)
		fm.set_shader_parameter("kfC", float(K.get("comb", 0.0)) * pile * t * t)
		fm.set_shader_parameter("kfT", t)
		fm.set_shader_parameter("kfS", float(K["strand"]))
		fm.set_shader_parameter("kfW", float(K["thick"]))
		fm.set_shader_parameter("kfL", float(K.get("clump", 0.0)))
		fm.set_shader_parameter("kfSh", float(K.get("shade", 1.0)))
		fm.set_shader_parameter("kfTp", float(K.get("tip", 1.0)))
		fm.set_shader_parameter("kfV", float(K.get("vary", 0.0)))
		last.next_pass = fm
		last = fm


# a surface left out: a part of the base drawn over the skin that a worn item covers (KChar.hidden_parts)
static var _nothing_mat: ShaderMaterial = null


static func _nothing() -> ShaderMaterial:
	if _nothing_mat == null:
		var sh := Shader.new()
		sh.code = "shader_type spatial;
render_mode unshaded;
void fragment() { discard; }
"
		_nothing_mat = ShaderMaterial.new()
		_nothing_mat.shader = sh
	return _nothing_mat


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
	var R := PackedFloat32Array()
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
		var re := 0.0
		for cp in _caps:
			if cp["a"] == ca and cp["b"] == cb:
				# the radius at each end (a foot takes its shin's at the ankle, all along); an arm keeps one radius
				# (its taper measured the deltoid, and the hard push crushed a tunic and its mantle together)
				r = float(cp["r"] if i >= 6 else cp["rb"] if foot else cp["ra"]) + 0.01
				re = float(cp["r"] if i >= 6 else cp["rb"]) + 0.01
		if b < 0 or a < 0 or (i >= 10 and not four_arms):        # no such joints, or a two-armed giant's lower pair
			r = 0.0
			re = 0.0
			a = maxi(a, 0)
			b = a
		var pa := _gp(a).origin
		var pb := _gp(b).origin
		A.append(Vector4(pa.x, pa.y, pa.z, r))
		Bv.append(Vector4(pb.x, pb.y, pb.z, 1.0 if i >= 6 else 0.0))
		R.append(re)
	# the seat (14, 15): soft, like the legs'
	var seat := []
	for cp in _caps:
		if cp.get("pa") != null:
			seat.append(cp)
	for q in 2:
		if q < seat.size():
			var ends := _cap_ends(seat[q])
			A.append(Vector4(ends[0].x, ends[0].y, ends[0].z, float(seat[q]["r"]) + 0.01))
			Bv.append(Vector4(ends[1].x, ends[1].y, ends[1].z, 0.0))
			R.append(float(seat[q]["r"]) + 0.01)
		else:
			A.append(Vector4(0, 0, 0, 0)); Bv.append(Vector4(0, 0, 0, 0)); R.append(0.0)
	var hip := _gp(_hips).origin
	# the trunk's up for the tuck (kcU, as legCaps in 50-figure.js): the way from the hips to TUCK_UP turned from its
	# rest way, applied to +y; in a forward bend the band at the small of the back came out through a T-shirt
	var up := Vector3.UP
	var sp := skeleton.find_bone(TUCK_UP)
	if sp >= 0:
		var r0 := (skeleton.get_bone_global_rest(sp).origin - skeleton.get_bone_global_rest(_hips).origin).normalized()
		var r1 := (_gp(sp).origin - hip).normalized()
		if r0.dot(r1) < 0.99999:
			up = Quaternion(r0, r1) * Vector3.UP
	for pm in _push_mats:
		pm.set_shader_parameter("kcA", A)
		pm.set_shader_parameter("kcB", Bv)
		pm.set_shader_parameter("kcR", R)
		pm.set_shader_parameter("kcH", hip)
		pm.set_shader_parameter("kcU", up)


# twin of bodyFix in 50-figure.js: each limb a segment with its capsule's radius (the body's tapered ra to rb, an arm
# one radius) kept BF clear of the others'. A leg in the top of an upper arm swings the thigh out to its side at the
# hip (LEGSWING at most; a knee before the belly is left be); two thighs that overlap each turn out by half; then each
# upper arm turns at the shoulder (against the trunk its elbow's end only, UPLOW on, and not the top of the chest),
# and the forearm and hand to the knuckles at the elbow, out of the trunk (above the pelvis the chain through
# skel.trunk) and both legs (a giant's lower arm out of its side's upper arm too), twice over
const BF := 0.008
const LEGSWING := 0.35
const UPLOW := 0.7
const BFRELAX := 0.25                    # the kept turns ease back to the clip's over this much clip time
const BFSPEED := 2.5                     # a push turns a bone at most this many radians a clip second
const BFARM := 1.2                       # an arm's kept turn at most (a thigh's LEGSWING)
var _bf_kept := {}                       # bone name -> Quaternion: the turns kept from the frame before
var _bf_clip := {}                       # bone name -> the clip's turn this frame, before bodyFix
var _bf_last := -1.0
var _bf_step := 1e9
var _near := {"s": 0.0, "t": 0.0, "d": 0.0, "c1": Vector3.ZERO, "c2": Vector3.ZERO}


# the closest points of segments p1-q1 and p2-q2 (c1 at s along the first, c2 at t along the second)
func _closest(p1: Vector3, q1: Vector3, p2: Vector3, q2: Vector3) -> Dictionary:
	var d1 := q1 - p1
	var d2 := q2 - p2
	var r := p1 - p2
	var a := d1.dot(d1)
	var e := d2.dot(d2)
	var f := d2.dot(r)
	var s := 0.0
	var t := 0.0
	if a > 1e-12 and e > 1e-12:
		var c := d1.dot(r)
		var bb := d1.dot(d2)
		var den := a * e - bb * bb
		s = clampf((bb * f - c * e) / den, 0.0, 1.0) if den > 1e-12 else 0.0
		t = (bb * s + f) / e
		if t < 0.0:
			t = 0.0
			s = clampf(-c / a, 0.0, 1.0)
		elif t > 1.0:
			t = 1.0
			s = clampf((bb - c) / a, 0.0, 1.0)
	elif e > 1e-12:
		t = clampf(f / e, 0.0, 1.0)
	elif a > 1e-12:
		s = clampf(-d1.dot(r) / a, 0.0, 1.0)
	_near["c1"] = p1 + d1 * s
	_near["c2"] = p2 + d2 * t
	_near["s"] = s
	_near["t"] = t
	_near["d"] = (_near["c1"] as Vector3).distance_to(_near["c2"])
	return _near


# turn bone b about its origin so that its point p moves by d along way
func _push_turn(b: int, p: Vector3, way: Vector3, d: float) -> void:
	var from := p - _gp(b).origin
	if from.length() < 1e-4:
		return
	var nm := skeleton.get_bone_name(b)
	if not _bf_clip.has(nm):
		_bf_clip[nm] = skeleton.get_bone_pose_rotation(b)
	var q := Quaternion(from.normalized(), (from + way * d).normalized())
	var a := 2.0 * acos(minf(1.0, absf(q.w)))
	if a > _bf_step:                      # at most BFSPEED a clip second; the kept turn carries it on
		q = q.slerp(Quaternion(), 1.0 - _bf_step / a)
	_turn(b, q)


# a capsule's radius at t along it; a trunk section's (an ellipse, o.ell) the way the limb lies from its axis (the gap
# c2 to c1 that _closest just found)
func _rad(o: Dictionary, t: float) -> float:
	if not o.has("ell"):
		return float(o["ra"]) + (float(o["rb"]) - float(o["ra"])) * t
	var e: Dictionary = o["ell"]
	var a := lerpf(e["w0"], e["w1"], t)
	var b := lerpf(e["d0"], e["d1"], t)
	var g: Vector3 = _near["c1"] - _near["c2"]
	var x := g.dot((e["S0"] as Vector3).lerp(e["S1"], t).normalized())
	var z := g.dot((e["F0"] as Vector3).lerp(e["F1"], t).normalized())
	var n := sqrt(x * x + z * z)
	return a * b / sqrt(b * b * x * x / (n * n) + a * a * z * z / (n * n)) if n > 1e-9 else b


func _ends(o: Dictionary) -> Dictionary:
	o["A"] = _gp(o["a"]).origin
	o["B"] = _gp(o["b"]).origin
	return o


func _cap_of(bone: String) -> Dictionary:
	var i := skeleton.find_bone(bone)
	for cp in _caps:
		if cp.get("pa") == null and int(cp["a"]) == i:
			return cp
	return {}


# a leg's point (c1 = c2 + gap) swings out to its side along the hips' side axis (always out: the push never jumps
# from one side to the other between frames) by the depth over how far out the gap already points (at least 0.35),
# which falls to nothing as the leg clears; the kept turn is held to LEGSWING
func _leg_out(o: Dictionary, R: float, side: Vector3) -> void:
	var way := side * (1.0 if String(o["n"]).begins_with("Left") else -1.0)
	var gap: Vector3 = _near["c1"] - _near["c2"]
	var g := gap.length()
	var k := (R - g) / maxf(0.35, gap.dot(way) / g if g > 1e-6 else 0.0)
	var thigh := skeleton.find_bone(String(o["n"]).trim_suffix("UpLeg").trim_suffix("Leg") + "UpLeg")
	if k > 0.0:
		_push_turn(thigh, _near["c1"], way, k)


func _body_fix() -> void:
	if _caps.is_empty() or _clip == "" or body_fix_off:
		_bf_kept = {}
		_bf_last = -1.0
		return
	# the turns kept from the frame before, easing back to the clip's as the clip moves on (by its own time)
	var tc := player.current_animation_position
	var dur := player.current_animation_length
	var mv := 1e9 if _bf_last < 0.0 else absf(tc - _bf_last)
	if mv > dur / 2.0 and _bf_last >= 0.0:
		mv = maxf(0.0, dur - mv)
	_bf_last = tc
	var relax := 1.0 - exp(-mv / BFRELAX)
	_bf_step = mv * BFSPEED
	_bf_clip = {}
	for nm in _bf_kept:
		var bi := skeleton.find_bone(nm)
		_bf_clip[nm] = skeleton.get_bone_pose_rotation(bi)
		_bf_kept[nm] = (_bf_kept[nm] as Quaternion).slerp(Quaternion(), relax)
		skeleton.set_bone_pose_rotation(bi, (_bf_clip[nm] as Quaternion) * (_bf_kept[nm] as Quaternion))
	var trunk := []
	var legs := []
	var chest = null
	var hips_i := skeleton.find_bone("Hips")
	var sp1 := skeleton.find_bone("Spine1")
	for cp in _caps:
		if cp.get("pa") != null:            # the seat: the trunk's capsule stands for the pelvis here
			continue
		var n := skeleton.get_bone_name(int(cp["a"]))
		var o := {"a": int(cp["a"]), "b": int(cp["b"]), "ra": float(cp["ra"]), "rb": float(cp["rb"]), "r": float(cp["r"]), "n": n}
		if o["a"] == hips_i or o["a"] == sp1:
			trunk.append(o)
			if o["a"] == sp1:
				chest = o
		elif n in ["LeftUpLeg", "RightUpLeg", "LeftLeg", "RightLeg"]:
			legs.append(o)
	var lu := skeleton.find_bone("LeftUpLeg")
	var ru := skeleton.find_bone("RightUpLeg")
	var side := (_gp(lu).origin - _gp(ru).origin).normalized() if lu >= 0 and ru >= 0 else Vector3.ZERO
	var arms := [["LeftArm", "LeftForeArm", "LeftHand", "LeftHandMiddle1", ""], ["RightArm", "RightForeArm", "RightHand", "RightHandMiddle1", ""],
			["Left2Arm", "Left2ForeArm", "Left2Hand", "Left2HandMiddle1", "Left"], ["Right2Arm", "Right2ForeArm", "Right2Hand", "Right2HandMiddle1", "Right"]]
	if not four_arms:                         # a body without the mod carries the lower arms' joints unused
		arms.resize(2)
	# the legs, out of the top of each upper arm
	if side != Vector3.ZERO:
		for arm in arms:
			var cu := _cap_of(arm[0])
			if cu.is_empty():
				continue
			for o in legs:
				_ends(o)
				var s0 := _gp(skeleton.find_bone(arm[0])).origin
				var top := s0.lerp(_gp(skeleton.find_bone(arm[1])).origin, 0.3)
				var hit := _closest(o["A"], o["B"], s0, top)
				var R := float(cu["r"]) + _rad(o, hit["s"]) + BF
				if R > float(hit["d"]):
					_leg_out(o, R, side)
	# two thighs that overlap: closest points of the two segments
	var tl = null
	var tr = null
	for o in legs:
		if o["n"] == "LeftUpLeg":
			tl = o
		if o["n"] == "RightUpLeg":
			tr = o
	if tl != null and tr != null:
		var hl := _gp(tl["a"]).origin
		var kl := _gp(tl["b"]).origin
		var hr := _gp(tr["a"]).origin
		var kr := _gp(tr["b"]).origin
		var need := float(tl["r"]) + float(tr["r"]) + 0.004
		var gap := kl.distance_to(kr)
		if gap < need:
			var sep := kl - kr
			sep.y = 0.0
			if sep.length_squared() < 1e-8:
				sep = Vector3(1, 0, 0)
			sep = sep.normalized() * ((need - gap) / 2.0)
			_turn(tl["a"], Quaternion((kl - hl).normalized(), (kl + sep - hl).normalized()))
			_turn(tr["a"], Quaternion((kr - hr).normalized(), (kr - sep - hr).normalized()))
	# the arms, out of the trunk and the legs as these now stand. Above the pelvis the trunk is the chain through
	# skel.trunk (each spine joint's cross-section, an ellipse whose middle lies forward of the joint), scaled as the
	# chest capsule's radius by the morph; the hand keeps the wrist's radius
	for o in trunk:
		_ends(o)
	for o in legs:
		_ends(o)
	var tr_pts: Array = skel.get("trunk", [])
	if chest != null and tr_pts.size() > 1:
		var kk := 1.0
		for c in skel.get("colliders", []):
			if int(c["a"]) == int(chest["a"]) and int(c["b"]) == int(chest["b"]) and not c.has("pa"):
				kk = float(chest["r"]) / float(c["r"])
		var pts := []
		for t in tr_pts:
			var j := int(t["j"])
			var g := _gp(j)
			var w := g.basis.get_rotation_quaternion() * skeleton.get_bone_global_rest(j).basis.get_rotation_quaternion().inverse()
			var F := w * Vector3(0, 0, 1)
			pts.append({"p": g.origin + F * (float(t["f"]) * kk), "F": F, "S": w * Vector3(1, 0, 0), "w": float(t["w"]) * kk, "d": float(t["d"]) * kk})
		trunk.erase(chest)
		for i in range(1, pts.size()):
			var u: Dictionary = pts[i - 1]
			var v: Dictionary = pts[i]
			trunk.append({"A": u["p"], "B": v["p"], "n": "", "top": i == pts.size() - 1,
				"ell": {"w0": u["w"], "w1": v["w"], "d0": u["d"], "d1": v["d"], "F0": u["F"], "F1": v["F"], "S0": u["S"], "S1": v["S"]}})
	var skull := {}
	var fp := _face_point("head")
	if fp.size() > 1 and float(fp[1]) > 0.0:
		skull = {"A": fp[0], "B": fp[0], "ra": float(fp[1]), "rb": float(fp[1]), "n": "", "head": true}
	for arm in arms:
		var b0 := skeleton.find_bone(arm[0])
		var b1 := skeleton.find_bone(arm[1])
		var b2 := skeleton.find_bone(arm[2])
		var b3 := skeleton.find_bone(arm[3])
		var cu := _cap_of(arm[0])
		var cf := _cap_of(arm[1])
		if b0 < 0 or cu.is_empty() or cf.is_empty():
			continue
		var obs := trunk + legs
		# the skull: the upper arm from 0.4 of its length keeps out of it (the forearm and hand may come to it)
		if not skull.is_empty():
			obs.append(skull)
		if arm[4] != "":                      # a giant's lower arm: its side's upper arm too
			for cp in _caps:
				if cp.get("pa") == null and (int(cp["a"]) == skeleton.find_bone(arm[4] + "Arm") or int(cp["a"]) == skeleton.find_bone(arm[4] + "ForeArm")):
					obs.append(_ends({"a": int(cp["a"]), "b": int(cp["b"]), "ra": float(cp["r"]), "rb": float(cp["r"]), "r": float(cp["r"]), "n": ""}))
		for it in 2:
			var sA := _gp(b0).origin
			var sB := _gp(b1).origin
			var low := sA.lerp(sB, UPLOW)
			var worst := 0.0
			var p := Vector3.ZERO
			var way := Vector3.ZERO
			for o in obs:
				# against the trunk only the elbow's end at its own (tapering) radius, and not the top of the chest
				var on_trunk: bool = trunk.has(o) and not o.has("head")
				if on_trunk and o.get("top", false):
					continue
				var hit := _closest(low if on_trunk else (sA.lerp(sB, 0.4) if o.has("head") else sA), sB, o["A"], o["B"])
				var r_up := float(cu["ra"]) + (float(cu["rb"]) - float(cu["ra"])) * (UPLOW + (1.0 - UPLOW) * float(hit["s"])) if on_trunk else float(cu["r"])
				var dep := r_up + _rad(o, hit["t"]) + BF - float(hit["d"])
				if dep > worst and float(hit["d"]) > 1e-6:
					worst = dep
					p = hit["c1"]
					way = ((hit["c1"] as Vector3) - (hit["c2"] as Vector3)) / float(hit["d"])
			if worst > 0.0:
				_push_turn(b0, p, way, worst)
			var eA := _gp(b1).origin
			var eB := _gp(b2).origin
			worst = 0.0
			for o in obs:
				if o.has("head"):
					continue
				for k in 2:
					if k == 1 and b3 < 0:
						continue
					var hit := _closest(eB if k == 1 else eA, _gp(b3).origin if k == 1 else eB, o["A"], o["B"])
					var dep := float(cf["rb"] if k == 1 else cf["r"]) + _rad(o, hit["t"]) + BF - float(hit["d"])
					if dep > worst and float(hit["d"]) > 1e-6:
						worst = dep
						p = hit["c1"]
						way = ((hit["c1"] as Vector3) - (hit["c2"] as Vector3)) / float(hit["d"])
			# a point at the elbow is the upper arm's to clear
			if worst > 0.0 and p.distance_to(eA) > 0.05:
				_push_turn(b1, p, way, worst)
	# what this frame turned, kept for the next (a thigh's at most LEGSWING, an arm's BFARM)
	for nm in _bf_clip:
		var bi := skeleton.find_bone(nm)
		var k: Quaternion = (_bf_clip[nm] as Quaternion).inverse() * skeleton.get_bone_pose_rotation(bi)
		var lim := LEGSWING if String(nm).ends_with("UpLeg") else BFARM
		var ang := 2.0 * acos(minf(1.0, absf(k.w)))
		if ang > lim:
			k = k.slerp(Quaternion(), 1.0 - lim / ang)
			skeleton.set_bone_pose_rotation(bi, (_bf_clip[nm] as Quaternion) * k)
		_bf_kept[nm] = k


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


# ---- the tail and an animal head's jaw (the twin of tail() and jaw() in 50-figure.js; core/charactermodels/tools/mods.py) ----
# The tail's joints (Tail1..., tools/tail.py) are on every skeleton; no clip moves them. Each frame, when a mod with a
# tail is worn, they run as a spring chain at 60 Hz: each point pulled toward its rest carried by the hips (swayed about
# the hips' up axis, kit tail.sway) by its stiffness (kit tail.stiff), a little gravity and damping, segment lengths
# kept, out of the thighs' and shins' capsules by its radius plus pad and above the floor; the joints then turn to the
# points. A head with a jaw opens it about its hinge (kit jaw.pivot, Head's frame) now and then, as a breath.
var _tl := {}                            # {spec, ids, x, xp, tw, rest, acc, reset} while a tail is worn
var _jaw_spec := {}
var _nh_t := 0.0
var jaw_open = null                      # 0..1 holds the jaw open (tools, tests)


func _tail_setup(it) -> void:
	if it == null or not it.has("tail"):
		if not _tl.is_empty():
			for i in _tl["ids"]:
				skeleton.set_bone_pose_rotation(i, KChar._q(skel["joints"][i]["r"]))
		_tl = {}
		return
	var ids := []
	for n in it["tail"]["joints"]:
		var i := skeleton.find_bone(n)
		if i < 0:
			_tl = {}
			return
		ids.append(i)
	_tl = {"spec": it["tail"], "ids": ids, "x": [], "xp": [], "tw": [], "rest": [], "acc": 0.0, "reset": true}


func _tail_rest() -> void:
	var r := []
	var p := Vector3.ZERO
	for i in _tl["ids"]:
		p += skeleton.get_bone_pose_position(i)
		r.append(p)
	var last: int = _tl["ids"][-1]
	var lr := KChar._v(skel["joints"][last]["t"]).length()
	var k := skeleton.get_bone_pose_position(last).length() / lr if lr > 1e-6 else 1.0
	r.append(p + KChar._v(_tl["spec"]["tip"]) * k)
	_tl["rest"] = r


func _tail_targets(sway: float) -> Array:
	var H := _gp(_hips)
	var sw: Dictionary = _tl["spec"].get("sway", {})
	var deg: float = float(sw.get("deg", 0.0)) * sway
	var root: float = float(sw.get("root", 0.0))
	var R: Array = _tl["rest"]
	var n := R.size()
	var out := []
	for k in n:
		var a := deg * (root + (1.0 - root) * float(k) / float(n - 1)) * PI / 180.0
		out.append(H * ((R[k] - R[0]).rotated(Vector3.UP, a) + R[0]))
	return out


func _tail(dt: float) -> void:
	if _tl.is_empty():
		return
	_tail_rest()
	var spec: Dictionary = _tl["spec"]
	var per := float(spec.get("sway", {}).get("period", 3.0))
	var playing := _clip != ""
	_tl["tw"] = _tail_targets(sin(2.0 * PI * _nh_t / per) if playing else 0.0)
	var tw: Array = _tl["tw"]
	var n := tw.size()
	var rad: Array = spec["radius"]
	var pad := float(spec.get("pad", 0.0))
	var floor_y := -skeleton.position.y / size
	if dt < 0.0 or _tl["reset"] or _tl["x"].size() != n or (_tl["x"][0] - tw[0]).length() > 0.4:
		_tl["x"] = tw.duplicate()
		_tl["xp"] = tw.duplicate()
		_tl["reset"] = false
		_tl["acc"] = 0.0
	# the legs' capsules (thighs and shins: not the seat, which the tail's root lies in), in the skeleton's space
	var W := []
	for cp in _caps:
		var nm := skeleton.get_bone_name(cp["a"])
		if cp.get("pa") != null or not (nm.contains("Leg") or nm.contains("Foot") or nm.contains("Toe")):
			continue
		var ends := _cap_ends(cp)
		W.append({"a": ends[0], "b": ends[1], "ra": float(cp.get("ra", cp["r"])), "rb": float(cp.get("rb", cp["r"]))})
	var L := []
	for k in range(1, n):
		L.append((tw[k] - tw[k - 1]).length())
	var x: Array = _tl["x"]
	var xp: Array = _tl["xp"]
	var stiff: Array = spec["stiff"]
	var grav := float(spec.get("grav", 0.0)) / size
	var damp := float(spec.get("damp", 0.0))
	var h := C_STEP
	_tl["acc"] = minf(float(_tl["acc"]) + dt, 4 * C_STEP) if dt > 0.0 else 0.0
	while _tl["acc"] >= h:
		_tl["acc"] -= h
		x[0] = tw[0]
		xp[0] = tw[0]
		for k in range(1, n):
			var v: Vector3 = x[k] - xp[k]
			xp[k] = x[k]
			var q: Vector3 = x[k] + v * (1.0 - damp)
			q.y -= grav * h * h
			x[k] = q.lerp(tw[k], 1.0 - pow(1.0 - float(stiff[mini(k, stiff.size() - 1)]), h * 60.0))
		_tail_constrain(x, W, L, rad, pad, floor_y)
	if dt < 0.0:
		_tail_constrain(x, W, L, rad, pad, floor_y)
	# the joints turn to the points: each segment's rest direction (no sway) onto its direction now
	var rest := _tail_targets(0.0)
	var hq := _gp(_hips).basis.get_rotation_quaternion()
	var prev := hq
	var ids: Array = _tl["ids"]
	for k in ids.size():
		var a: Vector3 = (rest[k + 1] - rest[k]).normalized()
		var b: Vector3 = (x[k + 1] - x[k]).normalized()
		var wq := Quaternion(a, b) * hq
		skeleton.set_bone_pose_rotation(ids[k], prev.inverse() * wq)
		prev = wq


func _tail_constrain(x: Array, W: Array, L: Array, rad: Array, pad: float, floor_y: float) -> void:
	var n := x.size()
	for it in 2:
		for k in range(1, n):
			var d: Vector3 = x[k] - x[k - 1]
			if d.length() > 1e-9:
				x[k] = x[k - 1] + d * (float(L[k - 1]) / d.length())
			var r := float(rad[mini(k, rad.size() - 1)]) + pad
			for w in W:
				var ab: Vector3 = w["b"] - w["a"]
				var t := clampf((x[k] - w["a"]).dot(ab) / ab.length_squared(), 0.0, 1.0) if ab.length_squared() > 1e-12 else 0.0
				var c: Vector3 = w["a"] + ab * t
				var want: float = w["ra"] + (w["rb"] - w["ra"]) * t + r
				var o: Vector3 = x[k] - c
				var q := o.length()
				if q < want:
					if q < 1e-6:
						o = Vector3(0, 0, -1)
						q = 1.0
					x[k] = c + o * (want / q)
			var fl := floor_y + float(rad[mini(k, rad.size() - 1)])
			if x[k].y < fl:
				x[k].y = fl


func tail_state() -> Dictionary:
	return _tl


func _jaw() -> void:
	var j := skeleton.find_bone("face_jaw")
	if j < 0:
		return
	if _jaw_spec.is_empty():
		skeleton.set_bone_pose_rotation(j, KChar._q(skel["joints"][j]["r"]))
		skeleton.set_bone_pose_position(j, morph["t"][j])
		return
	var per := float(_jaw_spec.get("period", 5.0))
	var hold := float(_jaw_spec.get("hold", 0.35))
	var ph := fmod(_nh_t, per) / per
	var o := 0.0
	if jaw_open != null:
		o = float(jaw_open)
	elif _clip != "" and ph < hold:
		o = pow(sin(PI * ph / hold), 2)
	var q := Quaternion(Vector3.RIGHT, o * float(_jaw_spec.get("deg", 0.0)) * PI / 180.0)
	skeleton.set_bone_pose_rotation(j, KChar._q(skel["joints"][j]["r"]) * q)
	# about the hinge: the joint's rest place, moved so the pivot stays put
	var pv := KChar._v(_jaw_spec["pivot"])
	skeleton.set_bone_pose_position(j, morph["t"][j] + pv - q * pv)


func play(clip: String) -> void:
	_two_y = 0
	_pose_from = _pose_change() if _clip != "" else posture_clips.get(clip, {})
	_pose_fade = 0.0
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


# ---- blinks (the twin of blinks in 50-figure.js): a piece's 'blink' shape shut every few seconds, a fifth of a second
# each, at intervals from the figure's own count; blink() starts one now, blink_hold (0 to 1) holds the lids there
var _blink_at := 2.0
var _blink_n := 0
var _blink_t := 0.0
var blink_hold = null


func blink() -> void:
	_blink_at = _blink_t


func _blinks(dt: float) -> void:
	_blink_t += dt
	if _blink_t > _blink_at + 0.18:
		_blink_n += 1
		_blink_at = _blink_t + 2.5 + 3.5 * fmod(_blink_n * 0.6180339887, 1.0)
	var t := _blink_t - _blink_at
	var b := 0.0
	if blink_hold != null:
		b = float(blink_hold)
	elif t >= 0.0:
		b = t / 0.07 if t < 0.07 else (1.0 if t < 0.1 else (1.0 - (t - 0.1) / 0.08 if t < 0.18 else 0.0))
	for id in _live:
		var mi: MeshInstance3D = _live[id]
		if mi.visible and mi.has_meta("built"):
			var k := int(mi.get_meta("built").get("blink", -1))
			if k >= 0:
				mi.set_blend_shape_value(k, b)


func _process(dt: float) -> void:
	_blinks(dt)
	if _clip == "":
		return
	# the hips start from the base body's rest (a clip without a hips position track leaves them there), so the
	# morph delta below is added once, not once a frame
	skeleton.set_bone_pose_position(_hips, KChar._v(skel["joints"][_hips]["t"]))
	player.advance(dt * cadence)
	_pose_fade += dt * cadence
	if not player.is_playing() and _clip != looping:
		play(looping)
		return
	# the clip writes the hips where the base body's are; the morph moves them
	skeleton.set_bone_pose_position(_hips, skeleton.get_bone_pose_position(_hips) + morph["d"][_hips])
	_after_clip(dt)
