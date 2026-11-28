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
const PATTERN_SHADER := preload("res://krator/character/kchar_pattern.gdshader")
# a frog's pattern kinds (kit item pattern, record pattern; KP_KIND in 50-figure.js)
const KP_KIND := {"none": 0, "spots": 1, "net": 2, "marble": 3}
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
		look = cj.get("look", {})
	if FileAccess.file_exists(dir + "/fur.json"):
		fur = JSON.parse_string(FileAccess.get_file_as_string(dir + "/fur.json"))
	if FileAccess.file_exists(dir + "/posture.json"):
		var pj: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir + "/posture.json"))
		var pb: Dictionary = pj["bodies"]
		var pk: String = kit.get("body", "") if pb.has(kit.get("body", "")) else "mpfb_male"
		posture = pb.get(pk, {})
		posture_frame = pj.get("frame", "figure")
		posture_clip_frames = pj.get("clipFrames", {})
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
				# each vertex's rest height and rest distance from the axis (CUSTOM1), and the piece's lowest and highest:
				# the fur shells' band (_fur), the hull (kc_push)
				var pv: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
				var ys := PackedFloat32Array()
				ys.resize(pv.size() * 2)
				for q in pv.size():
					ys[q * 2] = pv[q].y
					ys[q * 2 + 1] = Vector2(pv[q].x, pv[q].z).length()
					y_lo = minf(y_lo, pv[q].y)
					y_hi = maxf(y_hi, pv[q].y)
				arr[Mesh.ARRAY_CUSTOM1] = ys
				flags |= Mesh.ARRAY_CUSTOM_RG_FLOAT << Mesh.ARRAY_FORMAT_CUSTOM1_SHIFT
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
	_eye_mats.clear()
	_look_chest = null
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
	var wd = null
	_jaw_spec = {}
	for m in KChar.mods(rec, kit):
		if m.has("tail"):
			wt = m
		if m.has("jaw"):
			_jaw_spec = m["jaw"]
		if m.has("digitigrade"):
			wd = m
	if wt == null or _tl.is_empty() or _tl["spec"] != wt["tail"]:
		_tail_setup(wt)
	if wt != null and wt["tail"].has("rest") and not _tl.is_empty():
		var t_ids: Array = _tl["ids"]
		var own_r: Array = wt["tail"]["rest"]
		var hq0 := KChar._q(skel["joints"][_hips]["r"])
		var acc_t := Vector3.ZERO
		for k in own_r.size():
			if k + 1 >= t_ids.size():
				break
			var ti: int = t_ids[k + 1]
			var l0 := KChar._v(skel["joints"][ti]["t"]).length()
			var l1 := (morph["t"][ti] as Vector3).length()
			var sk := (l1 / l0 - 1.0) if l0 > 1e-6 else 0.0
			acc_t += hq0 * (KChar._v(own_r[k]) * sk)
			d[ti] = (d[t_ids[0]] as Vector3) + acc_t
	if wd == null or _dg.is_empty() or _dg["spec"] != wd["digitigrade"]:
		_digi_setup(wd)
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
	var mask_tex: Texture2D = null          # a frog's pattern over the body (kit item skin_detail mask)
	if not det.is_empty():
		for mi in want:
			for s in mi.mesh.get_surface_count():
				var dm := mi.mesh.surface_get_material(s) as BaseMaterial3D
				if mi.mesh.surface_get_name(s) == det["material"] and dm != null:
					det_tex = [dm.albedo_texture, dm.normal_texture]
				if det.has("mask") and mi.mesh.surface_get_name(s) == det["mask"] and dm != null:
					mask_tex = dm.albedo_texture
	# a legs item's fur lies between the top of the boots and the lowest hem of the top (_fur)
	var feet_top := -1000.0
	var hem := 1000.0
	# every loose layer takes the hull from the lowest hem worn: from its own, a gown left a skirt's tent to come through it
	_hem_low = 1000.0
	for mi in want:
		var pt: Dictionary = mi.get_meta("part")
		if pt["role"] == "armour" and _is_loose(pt):
			_hem_low = minf(_hem_low, float(mi.get_meta("built")["y_lo"]))
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
					if mask_tex != null:
						dsm.set_shader_parameter("mask_tex", mask_tex)
						dsm.set_shader_parameter("pattern_on", 1.0)
						_pattern_set(dsm, rec, gain)
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
		_eye_mats.append(sm)                 # the gaze (_gaze) sets its turn every frame
		return sm
	if role == "pattern":                # a frog's skin (tools/amphibian.py): the record's colours by its pattern
		var bm := mat as BaseMaterial3D
		var pm := ShaderMaterial.new()
		pm.shader = PATTERN_SHADER
		pm.set_shader_parameter("tex", bm.albedo_texture)
		if bm.normal_enabled and bm.normal_texture != null:
			pm.set_shader_parameter("ntex", bm.normal_texture)
			pm.set_shader_parameter("nscale", bm.normal_scale)
		pm.set_shader_parameter("rough", bm.roughness)
		_pattern_set(pm, rec, gain)
		return pm
	var m2 := mat.duplicate() as BaseMaterial3D
	if role == "iris":                   # an animal's eye (amphibian.iris_texture): its texture tinted by the eye colour
		var pat := _pattern_of(rec)
		var ec = rec.get("eye_color") if rec.get("eye_color") != null else pat.get("eye_color", "#5a3a22")
		m2.albedo_color = _lin(ec, 1.0)
		return m2
	if part["role"] == "armour" and (part["slot"] == "torso" or part["slot"] == "legs"):
		var dye0 = rec.get("dye", {}).get(part["slot"])
		m2.albedo_color = Color(dye0) if dye0 != null else Color.WHITE
		return _garment(m2, part, rec)
	if part["role"] == "armour" and part["slot"] == "feet":
		return _garment(m2, part, rec)                  # boots: the squeeze under a long robe, no push
	if role == "skin":
		var sk = _pattern_colours(rec)["skin"] if not _pattern_of(rec).is_empty() else (rec.get("skin") if rec.get("skin") != null else "#d6ad8f")
		m2.albedo_color = _lin(sk, float(gain.get("skin", 1.0)))
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
var stock_need: Array = []               # _blade_clear: how deep a gun's stock was in the upper arms, per pass
var off_need := 0.0                      # _off_hand: how deep the empty hand still is in the other hand's blade
var reach := 0.0                         # how far short of its hold the left hand fell (_two_hands)
var jaw_need := 0.0                      # how deep the support arm is still in the jaw or skull (_elbow_down)
var drawn := false                       # the bow string is pulled
var _holders := {}
var _bow := {}
var _hangs := {}                         # side -> {pivot, axis}: a prop that hangs or stands level (_hang)
var _blade_kept := {}                    # side -> the wrist's turn kept from the frame before (_blade_clear)
var _face_off := {}                      # face point -> its offset in the head joint's frame
var _saved: Array[Quaternion] = []
var _hold2 := 1.0
const GAP := 0.1
const MOVE := 0.45
const TWIST := 0.5                      # the share of the hand's twist about the forearm the forearm takes (_untwist)
var _h_ax := Vector3.ZERO                # the left hand's axis (wrist to knuckles) in its grip frame (_two_hands)


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
			if not _bow.is_empty() and _bow.get("hand_arrow") != null and (_bow["hand_arrow"] as Node3D).get_parent() != null:
				(_bow["hand_arrow"] as Node3D).get_parent().remove_child(_bow["hand_arrow"])
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
				var ax := Vector3(hg[0], hg[1], hg[2]).normalized()
				var e1 := Vector3.UP.cross(ax)
				if e1.length_squared() < 1e-8:
					e1 = Vector3.RIGHT.cross(ax)
				e1 = e1.normalized()
				_hangs[side] = {"pivot": pv, "axis": ax, "e1": e1, "e2": ax.cross(e1), "clear": props.get(id, {}).get("hang_clear")}
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
const POSTURE_KEYS := ["Spine", "Spine1", "Spine2", "Neck", "Head", "drop", "back", "pelvis", "lean", "nTurn", "nSide", "fHead", "uHead", "fSpine", "fSpine1", "fSpine2", "fNeck"]
const POSTURE_SHIFT := ["Spine", "Spine1", "Spine2", "Neck"]
const POSTURE_FADE := 0.25
var posture := {}
var posture_frame := "figure"           # 'frame': 'self' (a spine joint's own side axis as the clip turned it), 'joint' (the parent's), 'figure'
var posture_clip_frames := {}           # 'clipFrames': per clip, the frame it takes instead
var posture_self := false
var posture_joint := false
var posture_clips := {}                 # clip -> degrees added while it plays
var _pose_from := {}                    # the clip change when the last play() began
var _pose_fade := POSTURE_FADE          # clip seconds since then
var _shifted := []                      # [bone, position before, position set] of the joints shifted last frame


# a joint moved forward or back (fSpine...fNeck: centimetres, positive forward, in the skeleton's frame) with the
# joints above it held where they were, so only its own stretch of the body moves (50-figure.js shiftJoint)
func _shift_joint(n: String, cm: float, up := false, carry := false) -> void:
	var b := skeleton.find_bone(n)
	if b < 0 or cm == 0.0:
		return
	var kids := PackedInt32Array() if carry else skeleton.get_bone_children(b)
	var held := {}
	for c in kids:
		held[c] = _gp(c).origin
	_shifted.append([b, skeleton.get_bone_pose_position(b), Vector3()])
	for c in kids:
		_shifted.append([c, skeleton.get_bone_pose_position(c), Vector3()])
	var par := skeleton.get_bone_parent(b)
	var to := _gp(b).origin + (Vector3(0, cm / 100.0, 0) if up else Vector3(0, 0, cm / 100.0))
	skeleton.set_bone_pose_position(b, _gp(par).affine_inverse() * to)
	var bt := _gp(b).affine_inverse()
	for c in kids:
		skeleton.set_bone_pose_position(c, bt * held[c])
	var at := _shifted.size() - kids.size() - 1
	for i in range(at, _shifted.size()):
		_shifted[i][2] = skeleton.get_bone_pose_position(_shifted[i][0])


# the clips turn bones and never place them: the shifted joints go back first each frame, unless something else (a
# morph) has placed them since
func _unshift() -> void:
	for i in range(_shifted.size() - 1, -1, -1):
		var e: Array = _shifted[i]
		if skeleton.get_bone_pose_position(e[0]).is_equal_approx(e[2]):
			skeleton.set_bone_pose_position(e[0], e[1])
	_shifted.clear()


func _turned(b: int) -> Quaternion:
	return _gp(b).basis.get_rotation_quaternion() * skeleton.get_bone_global_rest(b).basis.get_rotation_quaternion().inverse()


func _pose_change() -> Dictionary:
	var t := clampf(_pose_fade / POSTURE_FADE, 0.0, 1.0)
	var to: Dictionary = posture_clips.get(_clip, {})
	var out := {}
	for k in POSTURE_KEYS:
		out[k] = lerpf(float(_pose_from.get(k, 0.0)), float(to.get(k, 0.0)), t)
	return out


func _posture(force := false) -> void:
	_unshift()
	if posture.is_empty() or (not force and (player == null or not player.is_playing())):
		return                              # the rest pose (the A-pose clothes are fitted in) stays as it is
	var ch := {} if force else _pose_change()     # forced (the chains' rest): the body's angles alone
	var pf: String = posture_frame if force else str(posture_clip_frames.get(_clip, posture_frame))
	posture_self = pf == "self"
	posture_joint = pf == "joint"
	var p := {}
	for k in POSTURE_KEYS:
		p[k] = float(posture.get(k, 0.0)) + float(ch.get(k, 0.0))
	var arms := {}
	for n in ["LeftArm", "RightArm"]:
		var ai := skeleton.find_bone(n)
		if ai >= 0:
			arms[ai] = _gp(ai).basis.get_rotation_quaternion()
	# the pelvis tilts about the skeleton's side axis (pelvis: negative forward); the thighs keep the way the clip points
	# them and the lumbar the way it faced (50-figure.js posture)
	# the lean: everything above the legs tipped about the hip joints (lean: negative forward), the thighs keeping the
	# way the clip points them and the hip joints where they were (50-figure.js posture)
	var ll := skeleton.find_bone("LeftUpLeg")
	var rl := skeleton.find_bone("RightUpLeg")
	if p["lean"] != 0.0 and ll >= 0 and rl >= 0:
		var lq := _gp(ll).basis.get_rotation_quaternion()
		var rq := _gp(rl).basis.get_rotation_quaternion()
		var pivot := (_gp(ll).origin + _gp(rl).origin) * 0.5
		var q := Quaternion(Vector3(1, 0, 0), -deg_to_rad(float(p["lean"])))
		var hp := pivot + q * (skeleton.get_bone_pose_position(_hips) - pivot)
		_turn(_hips, q)
		skeleton.set_bone_pose_position(_hips, hp)
		skeleton.set_bone_pose_rotation(ll, (_gp(skeleton.get_bone_parent(ll)).basis.get_rotation_quaternion().inverse() * lq).normalized())
		skeleton.set_bone_pose_rotation(rl, (_gp(skeleton.get_bone_parent(rl)).basis.get_rotation_quaternion().inverse() * rq).normalized())
	var sp := skeleton.find_bone("Spine")
	if p["pelvis"] != 0.0 and sp >= 0:
		var keep := {}
		for n in ["Spine", "LeftUpLeg", "RightUpLeg"]:
			var li := skeleton.find_bone(n)
			if li >= 0:
				keep[li] = _gp(li).basis.get_rotation_quaternion()
		_turn(_hips, Quaternion(Vector3(1, 0, 0), -deg_to_rad(float(p["pelvis"]))))
		for li in keep:
			skeleton.set_bone_pose_rotation(li, (_gp(skeleton.get_bone_parent(li)).basis.get_rotation_quaternion().inverse() * keep[li]).normalized())
	for n in POSTURE_JOINTS:
		var b := skeleton.find_bone(n)
		var a := deg_to_rad(float(p[n]))
		if b >= 0 and a != 0.0:
			var ax := Vector3(1, 0, 0)
			var par := skeleton.get_bone_parent(b)
			if posture_self and n.begins_with("Spine"):
				ax = _turned(b) * ax              # a spine joint's own side axis as the clip turned it (50-figure.js 'self')
			elif (posture_joint or posture_self) and par >= 0:
				ax = (_gp(par).basis.get_rotation_quaternion() * skeleton.get_bone_global_rest(par).basis.get_rotation_quaternion().inverse()) * ax
			_turn(b, Quaternion(ax.normalized(), -a))
	# the neck turned (nTurn: positive to the figure's left) and tilted to the side (nSide: positive, the left ear to the
	# left shoulder), about the up and forward axes as the frame takes them (50-figure.js posture)
	var nk := skeleton.find_bone("Neck")
	for r in [["nTurn", Vector3(0, 1, 0), 1.0], ["nSide", Vector3(0, 0, 1), -1.0]]:
		var na := deg_to_rad(float(p[r[0]]))
		if nk < 0 or na == 0.0:
			continue
		var nax: Vector3 = r[1]
		if posture_joint or posture_self:
			var npar := skeleton.get_bone_parent(nk)
			nax = (_gp(npar).basis.get_rotation_quaternion() * skeleton.get_bone_global_rest(npar).basis.get_rotation_quaternion().inverse()) * nax
		_turn(nk, Quaternion(nax.normalized(), float(r[2]) * na))
	for sh in [["LeftShoulder", 1.0], ["RightShoulder", -1.0]]:
		var b := skeleton.find_bone(sh[0])
		if b < 0:
			continue
		_turn(b, Quaternion(Vector3(0, 0, 1), -sh[1] * deg_to_rad(float(p["drop"]))))
		_turn(b, Quaternion(Vector3(0, 1, 0), sh[1] * deg_to_rad(float(p["back"]))))
	for ai in arms:
		var par := skeleton.get_bone_parent(ai)
		skeleton.set_bone_pose_rotation(ai, (_gp(par).basis.get_rotation_quaternion().inverse() * arms[ai]).normalized())
	for n in POSTURE_SHIFT:
		_shift_joint(n, float(p["f" + n]))
	# the head moved whole, forward (fHead) or up (uHead), the neck stretching to it (50-figure.js posture)
	_shift_joint("Head", float(p["fHead"]), false, true)
	_shift_joint("Head", float(p["uHead"]), true, true)


func _after_clip(dt: float) -> void:
	_posture()
	_look(dt)
	_arms2(dt)
	_body_fix()
	_toes_flat()
	_grip()
	_blade_clear(dt)
	_stock_arm(dt)
	_on_ground()
	_two_hands(dt)
	_off_hand(dt)
	_to_face()
	_stand_up()
	if dt > 0.0:
		_nh_t += dt
	_digitigrade(dt)
	_cloth_step(dt)
	_tail(dt)
	_jaw()
	_leg_caps()
	_bow_string(dt)
	_hang(dt)


# twin of look in 50-figure.js: the head and the eyes turned toward a target ahead (clips.json look): look.ahead metres
# in front of the hips at the chest's height at rest (the Spine2 joint, morphed), or look_at (a point in the skeleton's
# space a game sets) whatever the clip. The head (Neck and Head, neck_share of it on the neck) turns head.share of the
# way, within head yaw and pitch; the eyes make up the rest within theirs (kchar_eye.gdshader turns each eyeball about
# its centre, faces eyes). A target further off the chest's forward than off[0] degrees is looked toward less, none
# past off[1]; the weight eases over LOOK_EASE s as clips change. All in the skeleton's (unscaled) space
const LOOK_EASE := 0.2
var look := {}                           # data/clips.json look
var look_at = null                       # a target point (skeleton space), or null for the data's
var look_state := {"w": 0.0, "off": 0.0, "head": [0.0, 0.0], "eyes": [0.0, 0.0]}
var _look_w := 0.0
var _look_chest = null                   # the target's base (the chest at rest, over the hips), per morph
var _eye_mats := []                      # the eyes' ShaderMaterials (kchar_eye.gdshader)


func _rest_q(b: int) -> Quaternion:
	return skeleton.get_bone_global_rest(b).basis.get_rotation_quaternion()


func _look_on() -> float:
	if look.is_empty() or _clip == "" or look.get("not", []).has(_clip):
		return 0.0
	return 1.0 if look.get("groups", []).has(_clip_info().get("group", "")) or look.get("clips", []).has(_clip) else 0.0


# the target in the skeleton's space
func look_target() -> Vector3:
	if look_at != null:
		return look_at
	if _look_chest == null:
		var J: Array = skel["joints"]
		var P := []
		for i in J.size():
			var par := int(J[i]["parent"])
			var t: Vector3 = morph["t"][i]
			P.append(t if par < 0 else (P[par] as Vector3) + _rest_q(par) * t)
		var sp := skeleton.find_bone("Spine2")
		if sp < 0:
			sp = skeleton.find_bone("Spine1")
		_look_chest = Vector3((P[_hips] as Vector3).x, (P[sp] as Vector3).y, (P[_hips] as Vector3).z)
	return (_look_chest as Vector3) + Vector3(0.0, 0.0, float(look.get("ahead", 2.5)))


# the face's forward (the head's rest forward, as the clip and the passes turned it), skeleton space
func face_forward() -> Vector3:
	return _gp(_head).basis.get_rotation_quaternion() * (_rest_q(_head).inverse() * Vector3(0, 0, 1))


# the eyes' midpoint, and the head's turn from its rest (skeleton space <- the head's own figure frame)
func _look_from() -> Array:
	var e: Array = faces.get("eyes", [])
	var o := Vector3((float(e[0][0]) + float(e[1][0])) / 2.0, (float(e[0][1]) + float(e[1][1])) / 2.0, (float(e[0][2]) + float(e[1][2])) / 2.0)
	var h := _gp(_head)
	var r := h.basis.get_rotation_quaternion() * _rest_q(_head).inverse()
	return [h.origin + r * o, r]


func _look(dt: float) -> void:
	look_state = {"w": 0.0, "off": 0.0, "head": [0.0, 0.0], "eyes": [0.0, 0.0]}
	var want := 1.0 if look_at != null else _look_on()
	_look_w = want if dt < 0.0 else _look_w + (want - _look_w) * (1.0 - exp(-dt / LOOK_EASE))
	var nk := skeleton.find_bone("Neck")
	if look.is_empty() or faces.get("eyes", []).size() < 2 or _head < 0 or nk < 0 or _look_w < 1e-3:
		_gaze()
		return
	var T := look_target()
	var fr := _look_from()
	var C := skeleton.find_bone("Spine2")
	if C < 0:
		C = skeleton.find_bone("Spine1")
	var cf := _gp(C).basis.get_rotation_quaternion() * (_rest_q(C).inverse() * Vector3(0, 0, 1))
	var off := rad_to_deg(cf.angle_to(T - (fr[0] as Vector3)))
	var dh := (fr[1] as Quaternion).inverse() * (T - (fr[0] as Vector3)).normalized()
	var lo: Array = look["off"]
	var w := _look_w * (1.0 - smoothstep(float(lo[0]), float(lo[1]), off))
	look_state["w"] = w
	look_state["off"] = off
	if w < 1e-3:
		_gaze()
		return
	var hd: Dictionary = look["head"]
	var ey: Dictionary = look["eyes"]
	var yaw := atan2(dh.x, dh.z)
	var pitch := asin(clampf(dh.y, -1.0, 1.0))
	var hy := clampf(float(hd["share"]) * yaw, -deg_to_rad(float(hd["yaw"])), deg_to_rad(float(hd["yaw"]))) * w
	var hp := clampf(float(hd["share"]) * pitch, -deg_to_rad(float(hd["pitch"])), deg_to_rad(float(hd["pitch"]))) * w
	look_state["head"] = [hy, hp]
	var r: Quaternion = fr[1]
	var q := Quaternion(r * Vector3(0, 0, 1), r * Vector3(sin(hy) * cos(hp), sin(hp), cos(hy) * cos(hp)))
	var qn := Quaternion().slerp(q, float(hd["neck_share"]))
	_turn(nk, qn)
	_turn(_head, q * qn.inverse())
	fr = _look_from()
	dh = (fr[1] as Quaternion).inverse() * (T - (fr[0] as Vector3)).normalized()
	look_state["eyes"] = [clampf(atan2(dh.x, dh.z), -deg_to_rad(float(ey["yaw"])), deg_to_rad(float(ey["yaw"]))) * w,
			clampf(asin(clampf(dh.y, -1.0, 1.0)), -deg_to_rad(float(ey["pitch"])), deg_to_rad(float(ey["pitch"]))) * w]
	_gaze()


# the eye shader's uniforms: the gaze turn (given in the head's rest frame) as the head now carries it, and each eye's
# centre where the head has carried it (faces eyes, from the head joint)
func _gaze() -> void:
	if _eye_mats.is_empty() or _head < 0:
		return
	var e: Array = faces.get("eyes", [])
	var G := Basis(Vector3.UP, float(look_state["eyes"][0])) * Basis(Vector3.RIGHT, -float(look_state["eyes"][1]))
	var h := _gp(_head)
	var r := h.basis.get_rotation_quaternion() * _rest_q(_head).inverse()
	var Rb := Basis(r)
	var Gs := Rb * G * Rb.inverse()
	var el := h.origin + r * Vector3(e[0][0], e[0][1], e[0][2]) if e.size() > 1 else Vector3.ZERO
	var er := h.origin + r * Vector3(e[1][0], e[1][1], e[1][2]) if e.size() > 1 else Vector3.ZERO
	for sm in _eye_mats:
		(sm as ShaderMaterial).set_shader_parameter("gaze", Gs)
		(sm as ShaderMaterial).set_shader_parameter("eye_l", el)
		(sm as ShaderMaterial).set_shader_parameter("eye_r", er)
		(sm as ShaderMaterial).set_shader_parameter("eye_ax", r * Vector3(1, 0, 0))


# twin of onGround: a prop with props.json ground stands on the ground (a cart): the hand turned so the grip has the
# prop's +Y and +Z along ground y and z in the skeleton's frame, and lifted or lowered (the arm's two-bone solve) so the
# grip stands ground.height over the ground; the wrist turns rather than the prop, so _two_hands finds the bar
func _on_ground() -> void:
	if not skel.has("hands"):
		return
	for side in ["R", "L"]:
		var id = held[side]
		var gd = props.get(id, {}).get("ground") if id != null else null
		if gd == null or not skel["hands"].has(side) or not skel["hands"][side].has("arm") or not _holders.has(side):
			continue
		var arm: Array = skel["hands"][side]["arm"]
		var hand := int(arm[2])
		var Y := Vector3(gd["y"][0], gd["y"][1], gd["y"][2]).normalized()
		var Z := Vector3(gd["z"][0], gd["z"][1], gd["z"][2])
		Z = (Z - Y * Z.dot(Y)).normalized()
		var gt := _grip_t(side)
		var qh := Basis(Y.cross(Z), Y, Z).get_rotation_quaternion() * gt.basis.get_rotation_quaternion().inverse()
		var g := _gp(int(skel["hands"][side]["bone"])) * gt
		var at := Vector3(g.origin.x, -skeleton.position.y / size + float(gd["height"]), g.origin.z)
		_reach_arm(int(arm[0]), int(arm[1]), hand, at - qh * gt.origin, qh)


var _curled := {}                       # side -> the curl _grip set last frame


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
		var curl = null
		# an empty hand closes into a fist where the clip says so (clips.json fist), as in grip() in 50-figure.js
		if id != null or side in _clip_info().get("fist", []):
			var h: Dictionary = skel["hands"][side]
			var style: String = props.get(id, {}).get("grip", "fist") if id != null and held[side] != null else "fist"
			if style != "flat":                 # flat: an open hand under a bowl, the clip's own fingers
				curl = h["curls"].get(style, h["curls"]["fist"]) if h.has("curls") else h["curl"]
		if curl == null:
			# the fingers a curl set last frame go back to rest: a clip without finger tracks (Meshy's) does not
			# write them, so they stayed a fist after a strike (the page starts every bone from the clip each frame)
			if _curled.has(side):
				for c in _curled[side]:
					skeleton.set_bone_pose_rotation(int(c[0]), KChar._q(J[int(c[0])]["r"]))
				_curled.erase(side)
			continue
		_curled[side] = curl
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
		jaw_need = 0.0
		return
	# a clip with two_when holds with both hands only in those spans (eased over 0.25 s): Pistol quick draw
	var info := _clip_info()
	var w2 := _span_weight(info["two_when"], 0.25, player.current_animation_position, player.current_animation_length) if info.has("two_when") else 1.0
	if w2 <= 0.0:
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
	# the left grip frame is the right's mirrored (its +Y the little finger's side): Y runs back toward the butt, so
	# the left hand's index side faces the head as the right's does. Taken from the clip's left hand it came out either
	# way by body and by the clip before (the hand upside down round the haft)
	Y = -Y
	# round the handle, the roll that lays the hand's own axis (wrist to knuckles, in the grip frame) nearest the
	# forearm's line, so the wrist bends least; the forearm then takes the twist (_untwist)
	if _h_ax == Vector3.ZERO:
		_h_ax = gl.basis.get_rotation_quaternion().inverse() * skeleton.get_bone_rest(skeleton.find_bone("LeftHandMiddle1")).origin.normalized()
	var fl := (_gp(hand).origin - _gp(fore).origin).normalized()
	var Z := fl * _h_ax.z + fl.cross(Y) * _h_ax.x
	Z -= Y * Z.dot(Y)
	if Z.length_squared() < 1e-8:
		Z = P - S
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
		# a prop standing on the ground (_on_ground: the cart) comes in level, its bar kept at its height
		if held["R"] != null and props.get(held["R"], {}).get("ground") != null:
			d.y = 0.0
		var rh: int = int(r_arm[2])
		var rt := _gp(rh)
		_reach_arm(int(r_arm[0]), int(r_arm[1]), rh, rt.origin + d, rt.basis.get_rotation_quaternion())
		W += d
	_reach_arm(up, fore, hand, W, qa)
	# twin of the page: a clip with clear_jaw, the support arm in the jaw: both hands come down (twice the depth, five times over, FWD in all,
	# no further than the left arm reaches), then the elbow swings clear of what is left
	var cj := bool(_clip_info().get("clear_jaw", false))
	var still := _elbow_down(up, fore, hand, qa, false) if cj else 0.0
	var moved := 0.0
	var go := 0
	while go < 5 and still > 0.0 and moved < FWD - 1e-4:
		# no further than the left arm reaches (|W + s d - S| = l1 + l2 - 0.01), or than it already stretches
		var dn := Vector3.DOWN
		var lim2 := l1 + l2 - 0.01
		var bq := (W - S).dot(dn)
		var cq := minf(0.0, (W - S).length_squared() - lim2 * lim2)
		var smax := -bq + sqrt(bq * bq - cq)
		var step := minf(minf(2.0 * still, FWD - moved), smax)
		if step < 1e-4:
			break
		moved += step
		var dd := dn * step
		var rh2: int = int(r_arm[2])
		var rt2 := _gp(rh2)
		_reach_arm(int(r_arm[0]), int(r_arm[1]), rh2, rt2.origin + dd, rt2.basis.get_rotation_quaternion())
		W += _gp(rh2).origin - rt2.origin                 # as far as the right hand went
		_reach_arm(up, fore, hand, W, qa)
		still = _elbow_down(up, fore, hand, qa, false)
		go += 1
	jaw_need = _elbow_down(up, fore, hand, qa, true) if cj else 0.0
	if dW > l1 + l2 - 0.01 and cj:
		var rh3: int = int(r_arm[2])
		_elbow_down(int(r_arm[0]), int(r_arm[1]), rh3, _gp(rh3).basis.get_rotation_quaternion(), true)
	_untwist(fore, hand, qa)
	reach = _gp(hand).origin.distance_to(W)
	var want := clampf((0.16 - reach) / 0.1, 0.0, 1.0)
	_hold2 = want if dt < 0.0 else _hold2 + clampf(want - _hold2, -dt * 4.0, dt * 4.0)
	var hw := minf(_hold2, w2)
	if hw < 1.0:
		for k in all.size():
			skeleton.set_bone_pose_rotation(int(all[k]), _saved[k].slerp(skeleton.get_bone_pose_rotation(int(all[k])), hw))


# twin of untwist: the forearm takes TWIST of the hand's turn about the forearm's line away from its rest turn on it, and
# the hand keeps its turn q (skeleton space)
func _untwist(fore: int, hand: int, q: Quaternion) -> void:
	var J: Array = skel["joints"]
	var qg := q * (_gp(fore).basis.get_rotation_quaternion() * KChar._q(J[hand]["r"])).inverse()
	var fl := (_gp(hand).origin - _gp(fore).origin).normalized()
	var ang := 2.0 * atan2(qg.x * fl.x + qg.y * fl.y + qg.z * fl.z, qg.w)
	if ang > PI:
		ang -= TAU
	elif ang < -PI:
		ang += TAU
	_turn(fore, Quaternion(fl, ang * TWIST))
	var par := skeleton.get_bone_parent(hand)
	skeleton.set_bone_pose_rotation(hand, (_gp(par).basis.get_rotation_quaternion().inverse() * q).normalized())


# the two-bone solve: the elbow opens or closes to the distance, the upper arm swings onto the target with the elbow
# turned back to the side it was on, and the hand turns to q (all in the skeleton's space)
# pole_dir (a direction, optional): the elbow goes that way from the shoulder-to-target line instead, by pw (0..1)
func _reach_arm(up: int, fore: int, hand: int, w: Vector3, q: Quaternion, pole_dir := Vector3.ZERO, pw := 0.0) -> void:
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
		if pw > 0.0 and pole_dir != Vector3.ZERO:
			var p2 := pole_dir - ax * ax.dot(pole_dir)
			if p2.length_squared() > 1e-8:
				var a2 := eu.angle_to(p2)
				if eu.cross(p2).dot(ax) < 0.0:
					a2 = -a2
				a += pw * wrapf(a2 - a, -PI, PI)
		_turn(up, Quaternion(ax, a))
	var par := skeleton.get_bone_parent(hand)
	skeleton.set_bone_pose_rotation(hand, (_gp(par).basis.get_rotation_quaternion().inverse() * q).normalized())


# twin of elbowDown: an arm _two_hands solved has its elbow swung about the shoulder-to-wrist line (the hand stays,
# turned to q) until the upper arm, from ELB_FROM of its length to the elbow, is out of the jaw and the skull (faces
# jaw, head); away from the deepest, the way it first went while the need lasts. Returns the depth left (swing false:
# only measures it); _elb_d is from the deepest obstacle out to the arm
const ELB_FROM := 0.4
const ELB_MAX := 0.6
const FWD := 0.4
var _elb_s := {}
var _elb_d := Vector3.ZERO


func _elbow_down(up: int, fore: int, hand: int, q: Quaternion, swing: bool) -> float:
	if _head < 0:
		return 0.0
	var nm := skeleton.get_bone_name(up)
	var cu := _cap_of(nm)
	if cu.is_empty():
		return 0.0
	for k in 4:
		var S := _gp(up).origin
		var E := _gp(fore).origin
		var Wr := _gp(hand).origin
		var need := 0.0
		for n in ["jaw", "head"]:
			var fp := _face_point(n)
			if fp.size() < 2 or float(fp[1]) <= 0.0:
				continue
			var C: Vector3 = fp[0]
			var P0 := S.lerp(E, ELB_FROM)
			var seg := E - P0
			var t := clampf((C - P0).dot(seg) / maxf(1e-9, seg.length_squared()), 0.0, 1.0)
			var Pt := P0 + seg * t
			var d := float(fp[1]) + float(cu["r"]) + BF - C.distance_to(Pt)
			if d > need:
				need = d
				_elb_d = Pt - C
		if not swing:
			return maxf(0.0, need)
		if need <= 0.0:
			if k == 0:
				_elb_s.erase(nm)
			return 0.0
		if k == 3:
			return need
		var K := (Wr - S).normalized()
		var T := (E - S) - K * K.dot(E - S)
		var off := T.length()
		if off < 0.02:
			return need
		T = K.cross(T).normalized()
		if not _elb_s.has(nm):
			_elb_s[nm] = 1.0 if T.dot(_elb_d) >= 0.0 else -1.0
		_turn(up, Quaternion(K, minf(ELB_MAX, need / off) * float(_elb_s[nm])))
		var par := skeleton.get_bone_parent(hand)
		skeleton.set_bone_pose_rotation(hand, (_gp(par).basis.get_rotation_quaternion().inverse() * q).normalized())
	return 0.0


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
const STOCK_UP := 0.35                  # a gun's stock keeps out of the upper arm from this far down it (the shoulder's pocket above)


func _blade_clear(dt: float) -> void:
	blade_need = []
	stock_need = []
	var neck := skeleton.find_bone("Neck")
	var hips_i := skeleton.find_bone("Hips")
	var sp1 := skeleton.find_bone("Spine1")
	for side in ["R", "L"]:
		var id = held[side]
		var bl = props.get(id, {}).get("blade") if id != null else null
		var st = props.get(id, {}).get("stock") if id != null else null
		if (bl == null and st == null) or not _holders.has(side) or _holders[side].get_child_count() == 0 or _clip == "" or neck < 0:
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
		var arms := []
		if st != null:
			for nm in ["LeftArm", "RightArm"]:
				var ai := skeleton.find_bone(nm)
				for cp in _caps:
					if cp.get("pa") == null and cp["a"] == ai:
						arms.append(cp)
						break
		for k in 3:
			var M := _gp(hand) * _grip_t(side) * m.transform
			# groups of spheres, each against its own segment of the prop: the stock against the upper arms (from STOCK_UP
			# down from the shoulder), the blade against the neck, the skull and the trunk
			var groups := []
			if st != null:
				var sa := M * Vector3(st[0], st[1], st[2])
				var ss := []
				for cp in arms:
					var ea := _gp(cp["a"]).origin
					var eb := _gp(cp["b"]).origin
					for q in 5:
						ss.append([ea.lerp(eb, STOCK_UP + (1.0 - STOCK_UP) * q / 4.0), float(cp["r"]) + float(st[6])])
				groups.append(["stock", sa, M * Vector3(st[3], st[4], st[5]) - sa, ss])
			var fp := _face_point("head") if bl != null else []
			if not fp.is_empty() and float(fp[1]) > 0.0:
				var ba := M * Vector3(0, float(bl[0]), 0)
				var bs := []
				var N := _gp(neck).origin
				for q in 5:
					bs.append([N.lerp(fp[0], q / 4.0), lerpf(NECK_R, float(fp[1]), q / 4.0) + EDGE])
				for cp in trunk:
					var ea := _gp(cp["a"]).origin
					var eb := _gp(cp["b"]).origin
					for q in 5:
						bs.append([ea.lerp(eb, q / 4.0), float(cp["r"]) + EDGE])
				groups.append(["blade", ba, M * Vector3(0, float(bl[1]), 0) - ba, bs])
			var need := 0.0
			var P := Vector3.ZERO
			var E := Vector3.ZERO
			for g in groups:
				var A: Vector3 = g[1]
				var U: Vector3 = g[2]
				var gn := 0.0
				for sph in g[3]:
					var c: Vector3 = sph[0]
					var s := clampf((c - A).dot(U) / maxf(1e-9, U.length_squared()), 0.0, 1.0)
					var w := A + U * s
					var d := w.distance_to(c)
					gn = maxf(gn, float(sph[1]) - d)
					if float(sph[1]) - d > need and d > 1e-6:
						need = float(sph[1]) - d
						P = w
						E = c
				if g[0] == "stock":
					stock_need.append(gn)
				else:
					blade_need.append(gn)
			if need <= 0.0:
				break
			var K := P - _gp(hand).origin
			var X := K.cross(P - E)
			if K.length() < 1e-4 or X.length_squared() < 1e-12:
				break
			_turn(hand, Quaternion(X.normalized(), minf(0.8, need / K.length())))
		_blade_kept[side] = (q0.inverse() * skeleton.get_bone_pose_rotation(hand)).normalized()


# twin of stockArm: the right forearm beside a gun's stock (props.json stock: its segment along the prop's z, the keep-out's
# half thickness, the butt's half width and half height). The elbow swings about the shoulder-to-wrist line (the hand and
# the gun stay) by the least of STK_STEPS that keeps the forearm, from the elbow to STK_TO of the way to the wrist, out of
# the butt's box: of the two ways the one that lowers the elbow, then the way it went while out (never across: from +90 to
# -80 it swept back through the butt), eased, and straight at up to STK_SPEED while the eased one is still in
const STK_STEPS := 9
const STK_TO := 0.6
const STK_SPEED := 10.0
var _stk_a := 0.0
var stock_arm_need := 0.0                # tools: how deep the forearm still is in the butt
var stock_arm_swing := [0.0, 0.0]        # tools: the swing and the one it heads for


func _stock_at(up: int, fore: int, W: Vector3, q0: Quaternion, kx: Vector3, a: float, Mi: Transform3D, st: Array, rf: float, z0: float, z1: float) -> Array:
	skeleton.set_bone_pose_rotation(up, q0)
	if a != 0.0:
		_turn(up, Quaternion(kx, a))
	var E := _gp(fore).origin
	var worst := -INF
	for i in 7:
		var p := Mi * E.lerp(W, STK_TO * i / 6.0)
		var ax := absf(p.x - float(st[0])) - float(st[7])
		var ay := absf(p.y - float(st[1])) - float(st[8])
		var az := maxf(z0 - p.z, p.z - z1)
		var dist := Vector3(maxf(ax, 0.0), maxf(ay, 0.0), maxf(az, 0.0)).length() if (ax > 0.0 or ay > 0.0 or az > 0.0) else maxf(ax, maxf(ay, az))
		worst = maxf(worst, rf - dist)
	return [worst, E.y]


func _stock_arm(dt: float) -> void:
	stock_arm_need = 0.0
	var id = held["R"]
	var st = props.get(id, {}).get("stock") if id != null else null
	if st == null or (st as Array).size() < 9 or not _holders.has("R") or _holders["R"].get_child_count() == 0 or not skel["hands"]["R"].has("arm") or _clip == "":
		_stk_a = 0.0
		return
	var arm: Array = skel["hands"]["R"]["arm"]
	var up := int(arm[0])
	var fore := int(arm[1])
	var hand := int(arm[2])
	var rf := 0.035
	for cp in _caps:
		if cp.get("pa") == null and cp["a"] == fore:
			rf = float(cp["r"])
			break
	var m := _holders["R"].get_child(0) as Node3D
	var M := _gp(int(skel["hands"]["R"]["bone"])) * _grip_t("R") * m.transform
	var Mi := M.affine_inverse()
	rf /= M.basis.get_scale().x
	var z0 := minf(float(st[2]), float(st[5]))
	var z1 := maxf(float(st[2]), float(st[5]))
	var S := _gp(up).origin
	var W := _gp(hand).origin
	var qh := _gp(hand).basis.get_rotation_quaternion()
	var kx := (W - S).normalized()
	var q0 := skeleton.get_bone_pose_rotation(up)
	var side := 1 if _stk_a > 0.05 else (-1 if _stk_a < -0.05 else 0)
	var want = null
	var least := INF
	var best := 0.0
	for k in range(0, 2 * STK_STEPS + 1):
		if want != null:
			break
		var cands := []
		if k == 0:
			cands = [0]
		elif side != 0:
			cands = [side * k * 10] if k <= STK_STEPS else []
		elif k <= STK_STEPS:
			cands = [k * 10, -k * 10]
		else:
			break
		var low_y := INF
		for c in cands:
			var a := deg_to_rad(float(c))
			var r := _stock_at(up, fore, W, q0, kx, a, Mi, st, rf, z0, z1)
			if float(r[0]) <= 0.0 and float(r[1]) < low_y:
				low_y = float(r[1])
				want = a
			elif float(r[0]) > 0.0 and float(r[0]) < least:
				least = float(r[0])
				best = a
	if want == null:
		want = best
	var s0 := _stk_a
	_stk_a = s0 + (float(want) - s0) * (1.0 - exp(-dt / 0.12)) if dt > 0.0 else float(want)
	if dt > 0.0 and float(_stock_at(up, fore, W, q0, kx, _stk_a, Mi, st, rf, z0, z1)[0]) > 0.0:
		_stk_a = s0 + clampf(float(want) - s0, -STK_SPEED * dt, STK_SPEED * dt)
	stock_arm_need = maxf(0.0, float(_stock_at(up, fore, W, q0, kx, _stk_a, Mi, st, rf, z0, z1)[0]))
	stock_arm_swing = [_stk_a, float(want)]
	var par := skeleton.get_bone_parent(hand)
	skeleton.set_bone_pose_rotation(hand, (_gp(par).basis.get_rotation_quaternion().inverse() * qh).normalized())

# twin of offHand: the empty hand keeps out of the other hand's weapon (props.json blade from HILT below it to its tip,
# widened by EDGE): its forearm, hand and two fingers are tested against the blade's segment and the wrist moves out by
# the two-bone solve (the hand keeps its turn), by the depth over how far along the forearm the contact is; the move is
# kept from frame to frame and eases back over RELAX, at most OFF_MAX
const HILT := 0.12
const OFF_MAX := 0.3
const OFF_HAND := 0.03
const OFF_FINGER := 0.012
var _off_kept := {}


func _off_deepest(segs: Array, A: Vector3, B: Vector3) -> Array:
	var worst := 0.0
	var way := Vector3.ZERO
	var wf := 1.0
	for sg in segs:
		var p1 := _gp(int(sg[0])).origin
		var q1 := _gp(int(sg[1])).origin
		var cp := Geometry3D.get_closest_points_between_segments(p1, q1, A, B)
		var d := cp[0].distance_to(cp[1])
		var dep := float(sg[2]) + EDGE - d
		if dep > worst and d > 1e-6:
			worst = dep
			way = (cp[0] - cp[1]) / d
			var L2 := (q1 - p1).length_squared()
			wf = maxf(0.3, (cp[0] - p1).dot(q1 - p1) / L2) if bool(sg[3]) and L2 > 1e-12 else 1.0
	return [worst, way, wf]


func _off_hand(dt: float) -> void:
	off_need = 0.0
	for side in ["R", "L"]:
		var other := "L" if side == "R" else "R"
		var id = held[side]
		var bl = props.get(id, {}).get("blade") if id != null else null
		var hs: Dictionary = skel["hands"].get(other, {}) if skel.has("hands") else {}
		if bl == null or not _holders.has(side) or _holders[side].get_child_count() == 0 or not hs.has("arm") or held[other] != null or (other == "L" and not _support().is_empty()) or _clip == "":
			_off_kept.erase(other)
			continue
		var S := "Left" if other == "L" else "Right"
		var arm: Array = hs["arm"]
		var up := int(arm[0])
		var fore := int(arm[1])
		var hand := int(arm[2])
		var m1 := skeleton.find_bone(S + "HandMiddle1")
		var m3 := skeleton.find_bone(S + "HandMiddle3")
		var i1 := skeleton.find_bone(S + "HandIndex1")
		var i3 := skeleton.find_bone(S + "HandIndex3")
		if m1 < 0 or m3 < 0 or i1 < 0 or i3 < 0:
			continue
		var rf := 0.035
		for cp in _caps:
			if cp.get("pa") == null and cp["a"] == fore:
				rf = float(cp["r"])
				break
		var segs := [[fore, hand, rf, true], [hand, m1, OFF_HAND, false], [m1, m3, OFF_FINGER, false], [i1, i3, OFF_FINGER, false]]
		var m := _holders[side].get_child(0) as Node3D
		var kept: Vector3 = _off_kept.get(other, Vector3.ZERO)
		if dt > 0.0:
			kept *= exp(-dt / RELAX)
		var C := _gp(hand).origin
		var qh := _gp(hand).basis.get_rotation_quaternion()
		var tot := kept
		if tot.length_squared() > 1e-10:
			_reach_arm(up, fore, hand, C + tot, qh)
		var M := _gp(int(skel["hands"][side]["bone"])) * _grip_t(side) * m.transform
		var res := _off_deepest(segs, M * Vector3(0, float(bl[0]) - HILT, 0), M * Vector3(0, float(bl[1]), 0))
		for it in 3:
			if float(res[0]) <= 0.0:
				break
			tot += (res[1] as Vector3) * (float(res[0]) / float(res[2]) + 0.002)
			if tot.length() > OFF_MAX:
				tot = tot.normalized() * OFF_MAX
			_reach_arm(up, fore, hand, C + tot, qh)
			M = _gp(int(skel["hands"][side]["bone"])) * _grip_t(side) * m.transform
			res = _off_deepest(segs, M * Vector3(0, float(bl[0]) - HILT, 0), M * Vector3(0, float(bl[1]), 0))
		off_need = maxf(off_need, float(res[0]))
		_off_kept[other] = tot

# twin of toFace: a clip that brings a hand to the face (clips.json face) has the hand's point moved onto the face's
# point by the arm's two-bone solve, the hand keeping its turn: in the spans face.when (eased), or as near as the clip
# brings it (face.near); face.level caps a bow's arrow pitch (the bow arm lowers)
const NEAR := [0.12, 0.3]


# the weight of spans of clip seconds at t: easing in over e from a span's start and out over e after its end; a span
# from a loop's start or to its end runs on round the loop
func _span_weight(when: Array, e: float, t: float, dur: float) -> float:
	var w := 0.0
	for s in when:
		var a := 1.0 if float(s[0]) <= 0.0 else smoothstep(float(s[0]), float(s[0]) + e, t)
		var b := 1.0 if float(s[1]) >= dur - 1e-3 else 1.0 - smoothstep(float(s[1]), float(s[1]) + e, t)
		w = maxf(w, minf(a, b))
	return w


func _face_weight(fc: Dictionary, t: float, dur: float, d: float) -> float:
	if fc.has("when"):
		return _span_weight(fc["when"], float(fc.get("ease", 0.2)), t, dur)
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
	# a bow's string hand: the elbow back along the arrow and out, level with the line, not up, by the face's weight
	var bw := 0.0
	var bpole := Vector3.ZERO
	if fc["hand"] == "R" and held["L"] != null and props.get(held["L"], {}).has("string") and _holders.has("L"):
		bpole = ht.origin - (_gp(int(skel["hands"]["L"]["bone"])) * _grip_t("L")).origin
		bpole.y = 0.0
		if bpole.length_squared() > 1e-8:
			bpole = bpole.normalized()
			bw = w
	_reach_arm(int(arm[0]), int(arm[1]), hand, ht.origin + (T - P) * w, ht.basis.get_rotation_quaternion(), bpole, bw)
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
# from the lower spine joint in the skeleton's frame, mirrored for the left hand) by the arm's two-bone solve, the
# collarbone first brought down to at most CARRY_SHRUG above its rest elevation (Eat hiked the bowl's shoulder)
const CARRY_SHRUG := 5.0 * PI / 180.0
var _clav_rest := {}
var _clav_m = null


func _clav_down(arm: Array) -> void:
	var cl := skeleton.get_bone_parent(int(arm[0]))
	if cl < 0 or not skeleton.get_bone_name(cl).ends_with("Shoulder"):
		return
	if not is_same(_clav_m, morph) or not _clav_rest.has(cl):
		if not is_same(_clav_m, morph):
			_clav_rest = {}
			_clav_m = morph
		var P: Array = KChar.fk(skel, morph["t"])["P"]
		_clav_rest[cl] = asin(clampf(((P[int(arm[0])] as Vector3) - (P[cl] as Vector3)).normalized().y, -1.0, 1.0))
	var d := (_gp(int(arm[0])).origin - _gp(cl).origin).normalized()
	var over := asin(clampf(d.y, -1.0, 1.0)) - float(_clav_rest[cl]) - CARRY_SHRUG
	if over <= 0.0:
		return
	var K := Vector3.UP.cross(d)
	if K.length_squared() < 1e-10:
		return
	_turn(cl, Quaternion(K.normalized(), over))


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
		_clav_down(arm)
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


# twin of hang: a prop with props.json hang hangs from its bail (the grip's +Y): the forearm turns about its own length
# (at most HANG_TURN) to lay the bail level, the wrist bends (at most HANG_WRIST) for the rest, and the prop swings about
# the bail only; one with hang_clear (its body's
# radius and span along the hang axis) is kept HANG_CLEAR out of the legs by turning the arm at the shoulder so its
# deepest point goes the way out (the points inside, off their legs, weighted by depth; never in toward the other leg)
const HANG_TURN := 1.6
const HANG_RATE := 6.0                   # rad/s: the most the frame's forearm turn changes (a change of side is a turn, not a snap)
const HANG_RELAX := 0.3                  # s: the legs' push eases back to none over this
const HANG_WRIST := 0.5
const HANG_CLEAR := 0.045
const HANG_OUT := 0.6
const HANG_LEGS := ["LeftUpLeg", "LeftLeg", "RightUpLeg", "RightLeg"]
var hang_need := 0.0                     # how deep a hanging prop's body is still in the legs (tools, tests)
var _hang_w := Vector3.ZERO              # the deepest point
var _hang_n := Vector3.ZERO              # the way out: each point inside, off its leg, weighted by its depth


func _eval_hang_aim(keys: Array, u: float) -> Array:
	if keys.is_empty():
		return []
	if u <= float(keys[0][0]):
		return keys[0]
	var last: Array = keys[keys.size() - 1]
	if u >= float(last[0]):
		return last
	for i in keys.size() - 1:
		var a: Array = keys[i]
		var b: Array = keys[i + 1]
		if u <= float(b[0]):
			var s := clampf((u - float(a[0])) / maxf(1e-6, float(b[0]) - float(a[0])), 0.0, 1.0)
			var sm := s * s * (3.0 - 2.0 * s)
			var fa := float(a[4]) if a.size() > 4 else 1.0
			var fb := float(b[4]) if b.size() > 4 else 1.0
			return [u, float(a[1]) + (float(b[1]) - float(a[1])) * sm, float(a[2]) + (float(b[2]) - float(a[2])) * sm,
				float(a[3]) + (float(b[3]) - float(a[3])) * sm, fa + (fb - fa) * sm]
	return last


func _hang_turn(side: String, h: Dictionary, first: bool) -> void:
	var hs: Dictionary = skel["hands"][side]
	var pv := h["pivot"] as Node3D
	var ax: Vector3 = h["axis"]
	var ci := _clip_info()
	var aim_keys = ci.get("hang_aim")
	if aim_keys is Array and not (aim_keys as Array).is_empty() and player != null and player.current_animation != "" and player.current_animation_length > 1e-4:
		var dur := player.current_animation_length
		var pos := player.current_animation_position
		var u := clampf(fmod(pos, dur) / dur, 0.0, 1.0)
		if not bool(ci.get("loop", false)) and pos >= dur - 1e-4:
			u = 1.0
		var ak := _eval_hang_aim(aim_keys, u)
		var fl := float(ak[4]) if ak.size() > 4 else 1.0
		var aim_dir := Vector3(float(ak[1]), float(ak[2]), float(ak[3])).normalized()
		var D_aim := ((_gp(int(hs["bone"])) * _grip_t(side)).basis.get_rotation_quaternion().inverse() * aim_dir).normalized()
		pv.quaternion = Quaternion(ax, D_aim)
		pv.scale = Vector3(1.0 + (fl - 1.0) * (1.0 - absf(ax.x)), 1.0 + (fl - 1.0) * (1.0 - absf(ax.y)), 1.0 + (fl - 1.0) * (1.0 - absf(ax.z)))
		h["tot"] = 0.0
		return
	pv.scale = Vector3.ONE
	if hs.has("arm"):
		var arm: Array = hs["arm"]
		var fore := int(arm[1])
		var F := (_gp(int(arm[2])).origin - _gp(fore).origin).normalized()
		var Y := (_gp(int(hs["bone"])) * _grip_t(side)).basis.get_rotation_quaternion() * Vector3.UP
		# the bail turned about the forearm by phi has height a + b cos(phi) + c sin(phi): of the two phi that zero it, the
		# one (taken round from ref) that brings the frame's whole turn nearer the last frame's, within the cap and HANG_RATE
		# of it (chosen afresh the hand flipped half a turn in a frame: Water plants)
		var a := Y.dot(F) * F.y
		var yp := Y - F * Y.dot(F)
		var b := yp.y
		var c := F.cross(yp).y
		var R := Vector2(b, c).length()
		if R > 1e-6:
			var dl := atan2(c, b)
			var ac := acos(clampf(-a / R, -1.0, 1.0))
			var p1 := atan2(sin(dl + ac), cos(dl + ac))
			var p2 := atan2(sin(dl - ac), cos(dl - ac))
			if first:
				h["tot"] = 0.0
			var tot := float(h.get("tot", 0.0))
			var ref := float(h.get("last", 0.0)) - tot
			var q1 := ref + atan2(sin(p1 - ref), cos(p1 - ref))
			var q2 := ref + atan2(sin(p2 - ref), cos(p2 - ref))
			var lo := -HANG_TURN
			var hi := HANG_TURN
			if h.has("last") and float(h.get("dt", 0.0)) > 0.0:
				lo = maxf(lo, float(h["last"]) - HANG_RATE * float(h["dt"]))
				hi = minf(hi, float(h["last"]) + HANG_RATE * float(h["dt"]))
			var phi := clampf(q1 if absf(q1 - ref) < absf(q2 - ref) else q2, lo - tot, hi - tot)
			h["tot"] = tot + phi
			if absf(phi) > 1e-5:
				_turn(fore, Quaternion(F, phi))
		# what the forearm cannot level (the handle partly along it) the wrist bends out, at most HANG_WRIST
		var Y2 := (_gp(int(hs["bone"])) * _grip_t(side)).basis.get_rotation_quaternion() * Vector3.UP
		var Yh := Vector3(Y2.x, 0.0, Y2.z)
		if Yh.length_squared() > 1e-8 and absf(Y2.y) > 1e-4:
			var ka := Y2.cross(Yh.normalized())
			if ka.length_squared() > 1e-10:
				_turn(int(arm[2]), Quaternion(ka.normalized(), minf(HANG_WRIST, asin(minf(1.0, absf(Y2.y))))))
	var D :=(_gp(int(hs["bone"])) * _grip_t(side)).basis.get_rotation_quaternion().inverse() * Vector3(0, -1, 0)
	pv.quaternion = Quaternion(Vector3.UP, atan2(D.x, D.z) - atan2(ax.x, ax.z))


func _hang_depth(side: String, h: Dictionary) -> float:
	var c: Array = h["clear"]
	var ax: Vector3 = h["axis"]
	var G: Transform3D = (_gp(int(skel["hands"][side]["bone"])) * _grip_t(side)) * (h["pivot"] as Node3D).transform
	var worst := 0.0
	_hang_n = Vector3.ZERO
	for cp in _caps:
		if cp.get("pa") != null or not (skeleton.get_bone_name(int(cp["a"])) in HANG_LEGS):
			continue
		var A := _gp(int(cp["a"])).origin
		var Sg := _gp(int(cp["b"])).origin - A
		for z in 3:
			for k in 12:
				var ang := k * PI / 6.0
				var zz := float(c[1]) + (float(c[2]) - float(c[1])) * z / 2.0
				var rr := float(c[0]) * (1.0 - 0.15 * z / 2.0)
				var T := G * ((h["e1"] as Vector3) * (rr * cos(ang)) + (h["e2"] as Vector3) * (rr * sin(ang)) + ax * zz)
				var t := clampf((T - A).dot(Sg) / maxf(1e-9, Sg.length_squared()), 0.0, 1.0)
				var r := float(cp["ra"]) + (float(cp["rb"]) - float(cp["ra"])) * t + HANG_CLEAR
				var dist := T.distance_to(A + Sg * t)
				var d := r - dist
				if d > 0.0 and dist > 1e-6:
					_hang_n += (T - (A + Sg * t)) * (d / dist)
				if d > worst:
					worst = d
					_hang_w = T
	return worst


func _hang(dt: float) -> void:
	hang_need = 0.0
	for side in _hangs:
		var h: Dictionary = _hangs[side]
		h["dt"] = maxf(dt, 0.0)
		var hs: Dictionary = skel["hands"][side]
		var legs: bool = h.get("clear") != null and hs.has("arm") and _clip != "" and skeleton.find_bone("LeftUpLeg") >= 0
		var up := int(hs["arm"][0]) if hs.has("arm") else -1
		# the legs' push starts from the frame before's, easing back to none over HANG_RELAX of the clip's time
		if legs:
			h["q0"] = skeleton.get_bone_pose_rotation(up)
			if h.has("push"):
				if h["dt"] > 0.0:
					h["push"] = (h["push"] as Quaternion).slerp(Quaternion(), 1.0 - exp(-float(h["dt"]) / HANG_RELAX))
				skeleton.set_bone_pose_rotation(up, (h["q0"] as Quaternion) * (h["push"] as Quaternion))
		_hang_turn(side, h, true)
		if not legs:
			h["last"] = h.get("tot", 0.0)
			continue
		var sd := _gp(skeleton.find_bone("LeftUpLeg")).origin - _gp(skeleton.find_bone("RightUpLeg")).origin
		sd.y = 0.0
		sd = (sd if side[0] == "L" else -sd).normalized()      # out to the hand's own side
		var need := 0.0
		for k in 7:
			need = _hang_depth(side, h)
			if need <= 0.0 and k == 0:
				h.erase("keep")
			if need <= 0.0 or k == 6:
				break
			var out := _hang_n
			if out.dot(sd) < 0.0:                                  # never in toward the other leg
				out -= sd * out.dot(sd)
			if out.length_squared() < 1e-10:
				out = sd
			out = out.normalized()
			# and never back the way it went: the way kept from the round, or the frame, before
			if h.has("keep") and out.dot(h["keep"]) < 0.0:
				out = h["keep"]
			h["keep"] = out
			var F := (_hang_w - _gp(up).origin).cross(out)
			var lever := F.length()
			if lever < 0.05:
				break
			_turn(up, Quaternion(F / lever, minf(HANG_OUT, 1.2 * need / lever)))
			_hang_turn(side, h, false)
		hang_need = maxf(hang_need, need)
		h["last"] = h.get("tot", 0.0)
		h["push"] = ((h["q0"] as Quaternion).inverse() * skeleton.get_bone_pose_rotation(up)).normalized()


# twin of bowString: the string between the bow's limb tips through the drawing hand while it is behind the bow, the
# bow turned about its handle to face that hand, and an arrow; when the arrow is on the string comes from the clip
# (clips.json nock spans; without them, a guess from the hand's place). The bow is canted about the arrow's line:
# at full draw toward upright (but for LEAN), and until its limbs are out of the legs
const LIMB := [0.12, 0.24, 0.36, 0.48, 0.6, 0.72]
const CLEAR := 0.045                     # the trousers and the limb's thickness round the legs' capsules
const HEAD := 0.05                       # the arrow's head stays this far in front of the bow at full draw
const LEAN := 15.0 * PI / 180.0
const CANT_PAD := 0.02                    # _cant_for prefers a cant clear of the legs by this much more
const CANT_SPEED := 8.0                    # radians a second the cant turns out of a leg that came to it
const CANT_SIDE := 5.0 * PI / 180.0         # past this from upright the bow is on a side (_cant_for keeps it there)


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
		if skel["hands"].has("R"):
			var ha := _scene("%s/pieces/props/%s.glb" % [dir, p["arrow"]]) as Node3D
			ha.visible = false
			_holder("R").add_child(ha)
			_bow["hand_arrow"] = ha


func bow_state() -> Dictionary:
	return {} if _bow.is_empty() else {"turn": _bow["turn"], "cant": _bow["cant_a"], "in_legs": _bow["in_legs"],
		"arrow": _bow["arrow"] != null and _bow["arrow"].visible, "ahead": _bow.get("ahead"),
		"in_hand": _bow.get("hand_arrow") != null and (_bow["hand_arrow"] as Node3D).visible}


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


func _legs_now() -> Array:
	var leg_bones := [skeleton.find_bone("LeftUpLeg"), skeleton.find_bone("LeftLeg"), skeleton.find_bone("RightUpLeg"), skeleton.find_bone("RightLeg")]
	var legs := []
	if not _dg.is_empty():
		for di in 4:
			var ds := _digi_seg(di)
			if not ds.is_empty():
				legs.append({"a": ds["ba"], "b": ds["bb"], "r": 0.5 * (float(ds["ra"]) + float(ds["rb"]))})
	else:
		for cp in _caps:
			if cp.get("pa") == null and cp["a"] in leg_bones:
				legs.append(cp)
	return legs


# how far the limbs, canted by a about ax, are in the legs (summed over the samples)
func _limbs_in(ax: Vector3, a: float, PV: Transform3D, legs: Array, pad := 0.0) -> float:
	var M := PV * Transform3D(Basis(ax, a), Vector3.ZERO)
	var sum := 0.0
	for y in LIMB:
		for sg in [1.0, -1.0]:
			var w := M * Vector3(0, sg * y, -0.09 * (y / 0.72) * (y / 0.72))
			for cp in legs:
				sum += maxf(0.0, _cap_depth(w, cp, CLEAR + pad))
	return sum


# the steps are tried on the side of upright the bow is canted to now (cur, the eased cant) first: tried +10 before
# -10 every frame, the clear one switched sides as the leg moved and the eased cant swept back through the thigh
func _cant_for(ax: Vector3, full: bool, PV: Transform3D, cur: float) -> float:
	var base := _upright(ax, PV) * face_w if full else 0.0
	var legs := _legs_now()
	if legs.is_empty():
		return base
	var side := 1 if cur - base > CANT_SIDE else (-1 if cur - base < -CANT_SIDE else 0)
	var best := base
	var least := INF
	var clear = null
	var cants := [0.0]
	for d in range(10, 81, 10):
		cants.append(float(d))
		cants.append(-float(d))
	for k in cants.size():
		var c: float = cants[k]
		if side != 0:
			c = 0.0 if k == 0 else (float(side * k * 10) if k <= 8 else float(-side * (k - 8) * 10))
		var a: float = base + deg_to_rad(c)
		var sum := _limbs_in(ax, a, PV, legs)
		# the first clear by CANT_PAD more (a leg swinging toward a bow held still meets it later), else the first clear
		if sum <= 0.0 and _limbs_in(ax, a, PV, legs, CANT_PAD) <= 0.0:
			return a
		if sum <= 0.0 and clear == null:
			clear = a
		if sum < least - 1e-6:
			least = sum
			best = a
	return float(clear) if clear != null else best


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


# where the clip is in an arrow_hand span (0 at its start, 1 at its end), or -1 outside them
const HAND_NOCK := 0.04


func _arrow_in_hand() -> float:
	var sp = _clip_info().get("arrow_hand")
	var r := -1.0
	if sp != null:
		var t := player.current_animation_position
		for s in sp:
			if t >= float(s[0]) and t <= float(s[1]):
				r = (t - float(s[0])) / maxf(1e-3, float(s[1]) - float(s[0]))
	return r


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
	var ca: float = _bow["cant_a"]
	var want := _cant_for(ax, drawn, lh * pivot.transform, ca) if _clip != "" else 0.0
	var lg := _legs_now() if _clip != "" else []
	_bow["cant_a"] = ca + (want - ca) * (1.0 - exp(-dt / 0.12)) if dt > 0.0 else want
	# a step that would put a limb in a leg: from a clear cant the bow waits there until the way is open; from one in a
	# leg (the leg came to it) it turns to the clear one at up to CANT_SPEED
	if dt > 0.0 and not lg.is_empty() and _limbs_in(ax, float(_bow["cant_a"]), lh * pivot.transform, lg) > 0.0:
		_bow["cant_a"] = ca if _limbs_in(ax, ca, lh * pivot.transform, lg) <= 0.0 else ca + clampf(want - ca, -CANT_SPEED * dt, CANT_SPEED * dt)
	# how deep the limbs are in the legs at the cant drawn (the eased one), not the one it heads for
	_bow["in_legs"] = _limbs_in(ax, float(_bow["cant_a"]), lh * pivot.transform, lg) if not lg.is_empty() else 0.0
	(_bow["cant"] as Node3D).transform = Transform3D(Basis(ax, float(_bow["cant_a"])), Vector3.ZERO)
	# the arrow in the drawing hand before it is on the string (clips.json arrow_hand: spans of clip seconds): up out of the
	# quiver, then the way the figure faces, at the bow only for the last quarter of the span
	var ha = _bow.get("hand_arrow")
	var ah := _arrow_in_hand()
	var ar0 = _bow["arrow"]
	var ar_on: bool = ar0 != null and drawn and (p.z < -0.2 if nk < 0 else true)
	if ha != null:
		ha.visible = ah >= 0.0 and not ar_on
		if ha.visible:
			var RG := _gp(int(skel["hands"]["R"]["bone"])) * _grip_t("R")
			var to_bow := (lh.origin - RG.origin).normalized()
			var d := Vector3.UP.lerp(Vector3.BACK, smoothstep(0.0, 0.5, ah)).normalized()
			d = d.lerp(to_bow, smoothstep(0.75, 1.0, ah)).normalized()
			var dl := RG.basis.get_rotation_quaternion().inverse() * d
			var alen0 := float(props.get(props.get(held["L"], {}).get("arrow", ""), {}).get("length", 0.78))
			ha.transform = Transform3D(Basis(Quaternion(Vector3.BACK, dl)) * Basis.from_scale(Vector3(1, 1, ln / alen0)), -dl * HAND_NOCK)
	var hR: Dictionary = skel["hands"]["R"]
	if (drawn or (ha != null and ha.visible)) and held["R"] == null and hR.has("curls") and hR["curls"].has("draw"):
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
	var s0 := 0.0
	for pt in c["parts"]:
		s0 = maxf(s0, float(pt["stiff"]))
		for g in pt["chains"]:
			c["chains"][int(g)]["stiff"] = s0 if int(pt.get("layer", 0)) > 0 else float(pt["stiff"])
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
	# and the hips at their rest with the morph alone (posedRests in 50-figure.js: left where the clip had them, the
	# rests came out ulps apart from one load to the next, and a run grew that)
	var hips_at := skeleton.get_bone_pose_position(_hips)
	skeleton.set_bone_pose_position(_hips, morph["t"][_hips])
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
	skeleton.set_bone_pose_position(_hips, hips_at)


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
			var kk := mini(A["rest"].size(), Bc["rest"].size())
			for gp in pt.get("gaps", []):       # a slit's two lips part from its top down (make_mpfb.py gaps)
				if int(gp[0]) == a:
					kk = mini(kk, int(gp[1]))
			for k in range(1, kk):
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
	var hi := skeleton.find_bone("Hips")
	var HT: Transform3D = _gp(hi) * (binds[hi] as Transform3D)
	var hs := HT.basis.z.length()
	if hs <= 1e-6:
		hs = 1.0
	var hu_y := HT.basis.y.y / hs
	var hm0: Vector3 = (binds[hi] as Transform3D).affine_inverse().origin
	var hip_r := (_gp(hi).origin.y + skeleton.position.y / size) / maxf(hm0.y, 0.3)
	var upright := smoothstep(0.20, 0.65, hu_y) * smoothstep(0.25, 0.50, hip_r)
	# a loose chain above the hips hangs: its fitted shape from its top point, turned with the hips' heading only, by how
	# loose it is (rigidTargets in 50-figure.js: the Chichani tilma's front stood off like a shelf in the idle's lean)
	var gw := clampf((0.3 - float(ch["stiff"])) / 0.2, 0.0, 1.0) * upright
	if ch["whole"] and gw > 0.0:
		var hz: Vector3 = HT.basis.z
		var hx0: Vector3 = HT.basis.x
		var ux := hz.x * upright + 0.5 * (hz.x - hx0.z) * (1.0 - upright)
		var uz := hz.z * upright + 0.5 * (hz.z + hx0.x) * (1.0 - upright)
		var hb := Basis(Vector3.UP, atan2(ux, uz)).scaled(Vector3.ONE * hs)
		var g: Vector3 = tw[0]
		for k in range(1, tw.size()):
			g += hb * ((ch["p"][k] as Vector3) - (ch["p"][k - 1] as Vector3))
			tw[k] = (tw[k] as Vector3).lerp(g, gw)
	if not ch["whole"]:
		# the shape it was fitted in, turned with the hips when upright, and smoothly aligned with the 3D pelvis & thighs
		# when knocked down or rising from the floor (rigidTargets in 50-figure.js)
		var hb: Basis
		if upright >= 0.9999:
			var fz: Vector3 = HT.basis.z
			hb = Basis(Vector3.UP, atan2(fz.x, fz.z)).scaled(Vector3.ONE * hs)
		else:
			var fz2: Vector3 = HT.basis.z
			var fx2: Vector3 = HT.basis.x
			var ux2 := fz2.x * upright + 0.5 * (fz2.x - fx2.z) * (1.0 - upright)
			var uz2 := fz2.z * upright + 0.5 * (fz2.z + fx2.x) * (1.0 - upright)
			var q_pelvis := HT.basis.orthonormalized().get_rotation_quaternion()
			var lul := skeleton.find_bone("LeftUpLeg")
			var ll := skeleton.find_bone("LeftLeg")
			var rul := skeleton.find_bone("RightUpLeg")
			var rl := skeleton.find_bone("RightLeg")
			if lul >= 0 and ll >= 0 and rul >= 0 and rl >= 0:
				var p_down := q_pelvis * Vector3.DOWN
				var th_dir := (_gp(ll).origin - _gp(lul).origin).normalized() + (_gp(rl).origin - _gp(rul).origin).normalized()
				if th_dir.length_squared() > 0.04:
					th_dir = th_dir.normalized()
					if p_down.dot(th_dir) > -0.85:
						var want_down := p_down.lerp(th_dir, 0.72).normalized()
						if p_down.dot(want_down) < 0.99999:
							q_pelvis = (Quaternion(p_down, want_down) * q_pelvis).normalized()
			var q_yaw := Quaternion(Vector3.UP, atan2(ux2, uz2))
			if upright > 0.0:
				q_pelvis = q_pelvis.slerp(q_yaw, upright)
			hb = Basis(q_pelvis).scaled(Vector3.ONE * hs)
		F = Transform3D(hb, _gp(hi).origin - hb * hm0)
		var off: Vector3 = (tw[0] as Vector3) - F * (ch["p"][0] as Vector3)
		var y0: float = (ch["p"][0] as Vector3).y
		# (the fade runs to the hips whatever the offset's size: rigidTargets in 50-figure.js)
		for k in range(1, tw.size()):
			var fk := clampf(((ch["p"][k] as Vector3).y - hm0.y) / maxf(1e-4, y0 - hm0.y), 0.0, 1.0)
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
	items.sort_custom(func(a, b): return int(a["chains"][0].get("layer", 0)) < int(b["chains"][0].get("layer", 0)))
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
					if k > 0 and ch.has("rest"):     # (the step below sets each joint on its point)
						skeleton.set_bone_pose_position(ch["bones"][k], (ch["rest"][k] as Vector3) - (ch["rest"][k - 1] as Vector3))
			c["reset"] = true
		return
	var W := []
	for cp in _caps:
		var nm := skeleton.get_bone_name(cp["a"])
		var is_leg := nm.contains("Leg") or nm.contains("Foot") or nm.contains("Toe")
		if "Arm" in String(skel["joints"][int(cp["a"])]["name"]) or (not _dg.is_empty() and cp.get("pa") == null and is_leg):
			continue                        # not the arms (an elbow at the waist pushed one chain of a cape out as a spike)
		var ends := _cap_ends(cp)
		var ra := float(cp.get("ra", cp["r"]))
		var rb := float(cp.get("rb", cp["r"]))
		W.append({"a": ends[0], "b": ends[1], "aBone": int(cp["a"]), "r": float(cp["r"]) + C_PAD / size, "r0": float(cp["r"]),
			"ra": ra, "rb": rb, "leg": is_leg, "seat": cp.get("pa") != null})
	# the seat's two upright capsules as one across the buttocks, for the chains (a skirt's point at the back between them
	# went out of one toward the other, sideways: the fold; clothStep in 50-figure.js)
	var seats := W.filter(func(e): return e.get("seat", false))
	if seats.size() == 2:
		W = W.filter(func(e): return not e.get("seat", false))
		W.append({"a": (seats[0]["a"] + seats[0]["b"]) * 0.5, "b": (seats[1]["a"] + seats[1]["b"]) * 0.5, "r": seats[0]["r"], "leg": false})
	# and the feet (_foot_ends), or digitigrade leg segments when worn
	if not _dg.is_empty():
		for di in 6:
			var ds := _digi_seg(di)
			if not ds.is_empty():
				var dr := maxf(float(ds["ra"]), float(ds["rb"]))
				W.append({"a": ds["a"], "b": ds["b"], "aBone": -1, "r": dr + C_PAD / size,
					"r0": 0.5 * (float(ds["ra"]) + float(ds["rb"])), "ra": ds["ra"], "rb": ds["rb"], "leg": true, "seat": false})
	else:
		for i in 2:
			var side: String = ["Left", "Right"][i]
			var fa := skeleton.find_bone(side + "Foot")
			var ft := skeleton.find_bone(side + "ToeBase")
			var sh := skeleton.find_bone(side + "Leg")
			var ul := skeleton.find_bone(side + "UpLeg")
			for cp in _caps:
				if cp["a"] == sh and cp["b"] == fa and ft >= 0:
					var fr := _foot_r(cp)
					var fe := _foot_ends(i, fr, _gp(fa).origin, _gp(ft).origin)
					W.append({"a": fe[0], "b": fe[1], "r": fr + C_PAD / size, "r0": fr, "ra": fr, "rb": fr, "leg": true, "seat": false})
					var th_w = null
					var sh_w = null
					for w in W:
						if w.get("aBone", -1) == ul:
							th_w = w
						elif w.get("aBone", -1) == sh:
							sh_w = w
					if th_w != null and sh_w != null and absf((sh_w["b"] as Vector3).y - (sh_w["a"] as Vector3).y) < 0.7 * (sh_w["a"] as Vector3).distance_to(sh_w["b"]):
						W.append({"a": (th_w["a"] + th_w["b"]) * 0.5, "b": (sh_w["a"] + sh_w["b"]) * 0.5, "r": float(sh_w["rb"]) + C_PAD / size, "r0": float(sh_w["rb"]), "leg": true, "seat": false})
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
	var ht_up: Transform3D = _gp(_hips) * (_binds[_hips] as Transform3D) if _binds.has(_hips) else _gp(_hips)
	var hs_up := maxf(ht_up.basis.z.length(), 1e-6)
	var hu_y_up := ht_up.basis.y.y / hs_up
	var hm_up: float = ((_binds[_hips] as Transform3D).affine_inverse().origin.y if _binds.has(_hips) else skeleton.get_bone_global_rest(_hips).origin.y)
	var hip_r_up := (_gp(_hips).origin.y + skeleton.position.y / size) / maxf(hm_up, 0.3)
	var up_body := hu_y_up > 0.55 and hip_r_up > 0.60
	var max_step := 0.07 / size
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
					var vl := v.length()
					if vl > max_step:
						v *= max_step / vl
					var acc: Vector3 = (wind * h - v) * (C_DRAG * h) + grav * h * h
					xp[k] = x[k]
					var nx: Vector3 = x[k] + v * (1.0 - C_DAMP) + acc
					x[k] = nx.lerp(ch["tw"][k], kS)
		for c in items:
			for it in 2:
				if up_body:
					_layered(c, items)
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
					_collide(ch, W, ground, up_body)
			for ch in c["chains"]:
				_keep_len(ch)
				_collide(ch, W, ground, up_body)
				var x: Array = ch["x"]
				var tw_arr: Array = ch["tw"]
				var p_arr: Array = ch["p"]
				if tw_arr.size() > 1 and ((tw_arr[0] as Vector3).y - (tw_arr[tw_arr.size() - 1] as Vector3).y) > 0.45 * (p_arr[0] as Vector3).distance_to(p_arr[p_arr.size() - 1]):
					for k in range(x.size() - 2, 0, -1):
						if (x[k] as Vector3).y < (x[k + 1] as Vector3).y + 0.015:
							var p: Vector3 = x[k]
							p.y = minf((x[k - 1] as Vector3).y - 0.01, (x[k + 1] as Vector3).y + 0.015)
							x[k] = p
				_collide(ch, W, ground, up_body)
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
			if up_body:
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
				# the joint where its point is (clothStep in 50-figure.js): its rest offset turned by this frame left it up to
				# 30 cm off on the man at an idle, each joint a step: the skirts' staircase
				# (a stretched segment gives a third of the stretch to the joint: all of it fell in the blend under the joint)
				if k > 0:
					var dv: Vector3 = (ch["x"][k] as Vector3) - (ch["x"][k - 1] as Vector3)
					var dk := dv.length()
					var lk: float = ch["len"][k - 1]
					if dk > lk:
						dv *= (lk + (0.5 if int(ch.get("layer", 0)) > 0 else 0.35) * (dk - lk)) / dk
					skeleton.set_bone_pose_position(bones[k], prev.inverse() * dv)
				prev = wq


func _collide(ch: Dictionary, W: Array, ground: float, up_body := true) -> void:
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
				var ol := o.length() if absf(ax.y) < 0.7 and o.y > 0.0 else 0.0
				if ol > 1e-4:
					o /= ol
					var sd := d.dot(o)
					if sd < 0.0:
						d -= 2.0 * sd * o
				if up_body and cp.get("leg", false) and (rw - q).dot(lat) * signf((q - hip).dot(lat)) > -0.5 * float(cp["r"]):
					# the legs only (on the trunk's, the chest leaning forward of the hips, it threw a mantle's points at
					# the back of the neck through the body to the front), and not for a point whose rest lies on the
					# thigh's inner side, between the legs (a skirt's back centre, thrown out through the thigh: the fold)
					var mid := 1.0 - smoothstep(0.03, 0.11, absf((rw - hip).dot(lat)))
					o = Vector3(q.x - hip.x, 0.0, q.z - hip.z)
					o -= lat * (o.dot(lat) * mid * 0.85)
					if o.length_squared() > 9e-4:
						o = o.normalized()
						var sd := d.dot(o)
						if sd < 0.0:
							d -= 2.0 * sd * o
					if mid > 0.0:
						d += lat * (((rw - q).dot(lat) - d.dot(lat)) * mid * 0.7)
				p = q + d.normalized() * r
		if p.y < ground:
			p.y = ground
		x[k] = p


# a cape or mantle (layer 2) stays outside a hem or flap (1), which stays outside a skirt (0): measured out from the
# body's vertical axis, against the lower layers' chain segments near it (as layered() in 50-figure.js)
const LGAP := 0.042
func _layered(c: Dictionary, items: Array) -> void:
	var hip := _gp(_hips).origin
	var segs := []
	for o in items:
		for ch in o["chains"]:
			for k in ch["x"].size() - 1:
				segs.append([ch["x"][k], ch["x"][k + 1], int(ch.get("layer", 0)), bool(ch.get("whole", false))])
	for ch in c["chains"]:
		var L: int = int(ch.get("layer", 0))
		if L == 0:
			continue
		var whole := bool(ch.get("whole", false))
		var x: Array = ch["x"]
		for k in range(1, x.size()):
			var p: Vector3 = x[k]
			var rx := p.x - hip.x
			var rz := p.z - hip.z
			var r := Vector2(rx, rz).length()
			if r <= 1e-4:
				continue
			var rq := 0.0
			for sg in segs:
				if sg[2] >= L or (sg[3] and not whole):
					continue
				var ab: Vector3 = sg[1] - sg[0]
				var t := clampf((p - sg[0]).dot(ab) / maxf(1e-9, ab.length_squared()), 0.0, 1.0)
				var q: Vector3 = sg[0] + ab * t
				var d := p.distance_to(q)
				var sx := q.x - hip.x
				var sz := q.z - hip.z
				if absf(p.y - q.y) < 0.14 and d < 0.20 and rx * sx + rz * sz > 0.0:
					var sr := Vector2(sx, sz).length() + LGAP * (1.0 - 0.5 * maxf(0.0, d - 0.08) / 0.12)
					if sr > rq:
						rq = sr
			if r < rq:
				p.x = hip.x + rx / r * rq
				p.z = hip.z + rz / r * rq
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
	var ip0: Array = _item_of(part).get("cloth", {}).get("parts", [])
	pm.set_shader_parameter("kcL", 1.0 if loose else (0.25 if not ip0.is_empty() and int(ip0[0].get("layer", 0)) >= 4 else 0.0))
	pm.set_shader_parameter("kcEO", 1.0 if loose and _item_of(part).get("cloth") == null else 0.0)
	var top = KChar.item(rec, kit, "torso")
	var legs = KChar.item(rec, kit, "legs")
	var feet = KChar.item(rec, kit, "feet")
	# a loose top pushes 2 cm further, so a robe's hem lies over the skirt it covers, and up to 3.5 cm more over trousers
	# with the stride (PAD_TOP, PAD_OVER in 50-figure.js; kcM in _leg_caps)
	var pad := 0.0
	var pad_over := 0.0
	var slot0: String = _item_of(part).get("over", part["slot"])     # pteruges push as the top they hang over does
	if loose and slot0 == "torso":
		pad = 0.02
		if part["slot"] == "torso":          # not the pteruges themselves
			if legs != null and legs.get("loose", false):
				pad += 0.02
			if (legs != null and not legs.get("loose", false)) or (feet != null and top != null and top.get("long", false)):
				pad_over = 0.035
	elif loose:
		pad = 0.02           # a skirt, as a robe (PAD_SKIRT): at 0 a run's knee came through a wrap skirt
	pm.set_shader_parameter("kcP", pad)
	pm.set_shader_parameter("kcPO", pad_over)
	var slit := -1.0                        # a slit's top above the knee (kit part slit)
	for cp in _item_of(part).get("cloth", {}).get("parts", []):
		slit = maxf(slit, float(cp.get("slit", -1.0)))
	pm.set_shader_parameter("kcSl", slit)
	pm.set_shader_parameter("kcT", TUCK if slot0 == "legs" and top != null and top.get("tucks", false) else 0.0)
	# trousers under a loose top are drawn in to the legs (SQUEEZE in 50-figure.js): all the way under one that reaches
	# below the knees, else down to its hem (kit item hem)
	var squeeze: bool = slot0 == "legs" and top != null and top.get("loose", false) \
		and legs != null and (not legs.get("loose", false) or (top.get("long", false) and not top.has("cloth")))
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
				for p in ["tex", "albedo", "kcL", "kcP", "kcPO", "kcSl", "kcT", "kcS", "kcSH"]:
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


# a worn mod's skin pattern (kit item pattern: a frog's head), or {}
func _pattern_of(rec: Dictionary) -> Dictionary:
	for m in KChar.mods(rec, kit):
		if m.has("pattern"):
			return m["pattern"]
	return {}


# a colour held to a palette (kit item pattern palette): the nearest of its entries, or the colour itself (snap in
# 50-figure.js)
static func _snap(hex: String, list: Array) -> String:
	if list.is_empty():
		return hex
	var a := Color(hex)
	var best: String = list[0]
	var bd := 1e9
	for c in list:
		var b := Color(c)
		var d := (a.r - b.r) * (a.r - b.r) + (a.g - b.g) * (a.g - b.g) + (a.b - b.b) * (a.b - b.b)
		if d < bd:
			bd = d
			best = c
	return best


# the record's skin colours under a patterned head, the kit item's where it names none, held to its palette
# (patternColours in 50-figure.js)
func _pattern_colours(rec: Dictionary) -> Dictionary:
	var pat := _pattern_of(rec)
	var pal: Dictionary = pat.get("palette", {})
	return {"skin": _snap(rec.get("skin") if rec.get("skin") != null else "#d6ad8f", pal.get("skin", [])),
		"skin2": _snap(rec.get("skin2") if rec.get("skin2") != null else pat.get("skin2", "#000000"), pal.get("skin2", [])),
		"skin3": _snap(rec.get("skin3") if rec.get("skin3") != null else pat.get("skin3", "#ffffff"), pal.get("skin3", []))}


# a pattern's colours, kind and amount from the record, the kit item's where it names none (patternSet in 50-figure.js)
func _pattern_set(sm: ShaderMaterial, rec: Dictionary, gain: Dictionary) -> void:
	var pat := _pattern_of(rec)
	var pc := _pattern_colours(rec)
	var g := float(gain.get("skin", 1.0))
	sm.set_shader_parameter("c1", _lin(pc["skin"], g))
	sm.set_shader_parameter("c2", _lin(pc["skin2"], g))
	sm.set_shader_parameter("c3", _lin(pc["skin3"], g))
	sm.set_shader_parameter("kind", float(KP_KIND.get(rec.get("pattern") if rec.get("pattern") != null else pat.get("kind", "none"), 0)))
	sm.set_shader_parameter("amount", float(rec.get("pattern_amount") if rec.get("pattern_amount") != null else pat.get("amount", 0.4)))


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
	var stride := 0.0        # the most any leg joint has left hanging (kcM: how much of PAD_OVER is on)
	var legs := [["LeftUpLeg", "LeftLeg"], ["RightUpLeg", "RightLeg"], ["LeftLeg", "LeftFoot"], ["RightLeg", "RightFoot"],
		["LeftFoot", "LeftToeBase"], ["RightFoot", "RightToeBase"], ["LeftArm", "LeftForeArm"], ["RightArm", "RightForeArm"],
		["LeftForeArm", "LeftHand"], ["RightForeArm", "RightHand"],
		["Left2Arm", "Left2ForeArm"], ["Right2Arm", "Right2ForeArm"], ["Left2ForeArm", "Left2Hand"], ["Right2ForeArm", "Right2Hand"]]
	for i in legs.size():
		if not _dg.is_empty() and i < 6:
			var ds := _digi_seg(i)
			if not ds.is_empty():
				var dpa: Vector3 = ds["a"]
				var dpb: Vector3 = ds["b"]
				A.append(Vector4(dpa.x, dpa.y, dpa.z, float(ds["ra"]) + 0.01))
				Bv.append(Vector4(dpb.x, dpb.y, dpb.z, 0.0))
				R.append(float(ds["rb"]) + 0.01)
				if i < 4:
					stride = maxf(stride, 1.0 - absf(dpb.y - dpa.y) / maxf(dpa.distance_to(dpb), 1e-5))
				continue
		var a := skeleton.find_bone(legs[i][0])
		var b := skeleton.find_bone(legs[i][1])
		# a foot has no collider of its own (_foot_ends); the arms' capsules (6-9) are hard
		var foot: bool = i == 4 or i == 5
		var ca := skeleton.find_bone(legs[i - 2][0]) if foot else a
		var cb := a if foot else b
		var r := 0.0
		var re := 0.0
		var fr := 0.0
		for cp in _caps:
			if cp["a"] == ca and cp["b"] == cb:
				# the radius at each end; an arm keeps one radius
				# (its taper measured the deltoid, and the hard push crushed a tunic and its mantle together)
				fr = _foot_r(cp)
				r = float(cp["r"] if i >= 6 else fr if foot else cp["ra"]) + 0.01
				re = float(cp["r"] if i >= 6 else fr if foot else cp["rb"]) + 0.01
		if b < 0 or a < 0 or (i >= 10 and not four_arms):        # no such joints, or a two-armed giant's lower pair
			r = 0.0
			re = 0.0
			a = maxi(a, 0)
			b = a
		var pa := _gp(a).origin
		var pb := _gp(b).origin
		if foot and r > 0.0:
			var fe := _foot_ends(i - 4, fr, pa, pb)
			pa = fe[0]
			pb = fe[1]
		A.append(Vector4(pa.x, pa.y, pa.z, r))
		Bv.append(Vector4(pb.x, pb.y, pb.z, 1.0 if i >= 6 else 0.0))
		R.append(re)
		if i < 4 and r > 0.0:
			stride = maxf(stride, 1.0 - absf(pb.y - pa.y) / maxf(pa.distance_to(pb), 1e-5))
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
	var q0 := skeleton.get_bone_global_rest(_hips).basis.get_rotation_quaternion()
	var q1 := _gp(_hips).basis.get_rotation_quaternion()
	var q_delta := q1 * q0.inverse()
	var hu_y0 := (q_delta * Vector3.UP).y
	var rest_hip_y := float((morph["t"][_hips] as Vector3).y) if morph.has("t") else skeleton.get_bone_global_rest(_hips).origin.y
	var hip_r0 := (hip.y + skeleton.position.y / size) / maxf(rest_hip_y, 0.3)
	var hull_up := smoothstep(0.45, 0.65, hu_y0) * smoothstep(0.76, 0.88, hip_r0)
	# the hull's points, six a leg: mid-thigh, knee, mid-shin, lower-shin/ankle, heel, toes
	var E := []
	for e in 2:
		for q in [[e, 0.5], [e, 1.0], [2 + e, 0.5], [2 + e, 1.0], [4 + e, 0.0], [4 + e, 1.0]]:
			var ea: Vector4 = A[q[0]]
			var eb: Vector4 = Bv[q[0]]
			var ep := Vector3(ea.x, ea.y, ea.z).lerp(Vector3(eb.x, eb.y, eb.z), q[1])
			E.append(Vector4(ep.x, ep.y, ep.z, (lerpf(ea.w, R[q[0]], q[1]) if ea.w > 0.0 else 0.0) * hull_up))
	# what hangs a piece with no chains straight below the pelvis (kcTl, legCaps in 50-figure.js): the hips' whole turn from their
	# rest undone, then turned the way the feet face (from a vector it read posture as a tilt, or missed a wide stance's roll)
	var f0 := _foot_face(true)
	var f1 := _foot_face(false)
	var tq := Quaternion(Vector3.UP, atan2(f1.x, f1.z) - atan2(f0.x, f0.z)) * q_delta.inverse()
	var ta := tq.get_angle()
	if ta > TILT_MAX:          # a run's lean undone in full folded the cloth over itself across the band it turns in
		tq = Quaternion.IDENTITY.slerp(tq, TILT_MAX / ta)
	# in a stride (kcM) it eases to the turn from the way down between the hip joints now to its rest's (legCaps in 50-figure.js)
	var ll := skeleton.find_bone("LeftUpLeg")
	var rl := skeleton.find_bone("RightUpLeg")
	if ll >= 0 and rl >= 0:
		var t0: Vector3 = ((skeleton.get_bone_global_rest(ll).origin + skeleton.get_bone_global_rest(rl).origin) * 0.5 - skeleton.get_bone_global_rest(_hips).origin).normalized()
		var t1: Vector3 = ((_gp(ll).origin + _gp(rl).origin) * 0.5 - hip).normalized()
		var tv := Quaternion(t1, t0) if t0.dot(t1) < 0.99999 else Quaternion.IDENTITY
		# (how far the thighs are apart fore and aft, the way the feet face: a stride; not kcM, nor one thigh's lean)
		var sw := 0.0
		for k in 2:
			var ea: Vector4 = A[k]
			var eb: Vector4 = Bv[k]
			sw += (-1.0 if k == 1 else 1.0) * Vector3(eb.x - ea.x, eb.y - ea.y, eb.z - ea.z).normalized().dot(f1)
		tq = tq.slerp(tv, smoothstep(0.2, 0.5, absf(sw)))
	if hull_up < 1.0:
		tq = tq.slerp(Quaternion.IDENTITY, 1.0 - hull_up)
	var tilt := Basis(tq)
	for pm in _push_mats:
		pm.set_shader_parameter("kcA", A)
		pm.set_shader_parameter("kcB", Bv)
		pm.set_shader_parameter("kcR", R)
		pm.set_shader_parameter("kcH", hip)
		pm.set_shader_parameter("kcU", up)
		pm.set_shader_parameter("kcM", smoothstep(0.02, 0.1, stride) * hull_up)
		pm.set_shader_parameter("kcK", skeleton.get_bone_global_rest(skeleton.find_bone("LeftLeg")).origin.y)
		pm.set_shader_parameter("kcE", E)
		pm.set_shader_parameter("kcHm", _hem_low)
		pm.set_shader_parameter("kcTl", tilt)


var _hem_low := 0.0


# A foot's capsule (footEnds in 50-figure.js): the bones run along the top of the foot, ankle to ball, so it is moved down to
# the sole (the way the shin comes in, square to the foot) and out to the toes. pa, pb the ankle and the ball
const TILT_MAX := 0.35
const FOOT_SOLE := 0.012
const FOOT_TOE := 0.03


# the way the feet face, level: heel to toes, both feet (at rest, or now)
func _foot_face(rest: bool) -> Vector3:
	var lu := skeleton.find_bone("LeftUpLeg")
	var ru := skeleton.find_bone("RightUpLeg")
	var hL := skeleton.get_bone_global_rest(lu).origin if rest else _gp(lu).origin
	var hR := skeleton.get_bone_global_rest(ru).origin if rest else _gp(ru).origin
	var hF := Vector3(hR.z - hL.z, 0.0, hL.x - hR.x)
	hF = hF.normalized() if hF.length_squared() > 1e-8 else Vector3(0, 0, 1)
	var v := Vector3.ZERO
	for side in ["Left", "Right"]:
		var a := skeleton.find_bone(side + "Foot")
		var b := skeleton.find_bone(side + "ToeBase")
		if a < 0 or b < 0:
			continue
		var d := (skeleton.get_bone_global_rest(b).origin - skeleton.get_bone_global_rest(a).origin) if rest else (_gp(b).origin - _gp(a).origin)
		d.y = 0.0
		if d.dot(hF) > 0.02:
			v += d
	return v.normalized() if v.length_squared() > 1e-8 else hF


func _foot_r(cp: Dictionary) -> float:
	return maxf(float(cp["rb"]), 0.05)


func _foot_ends(sd: int, r: float, pa: Vector3, pb: Vector3) -> Array:
	var side: String = ["Left", "Right"][sd]
	var knee := _gp(skeleton.find_bone(side + "Leg")).origin
	var ya := skeleton.get_bone_global_rest(skeleton.find_bone("LeftFoot")).origin.y
	var yb := skeleton.get_bone_global_rest(skeleton.find_bone("LeftToeBase")).origin.y
	var n := (pa - knee).normalized()
	var f := (pb - pa).normalized()
	n = (n - f * n.dot(f)).normalized()
	return [pa + n * (ya + FOOT_SOLE - r) - f * 0.022, pb + n * (yb + FOOT_SOLE - r) + f * FOOT_TOE]


# twin of bodyFix in 50-figure.js: each limb a segment with its capsule's radius (the body's tapered ra to rb, an arm
# one radius) kept BF clear of the others'. A leg in the top of an upper arm swings the thigh out to its side at the
# hip (LEGSWING at most; a knee before the belly is left be); two thighs that overlap each turn out by half; then each
# upper arm turns at the shoulder (against the trunk its elbow's end only, UPLOW on, and not the top of the chest),
# and the forearm and hand to the knuckles at the elbow, out of the trunk (above the pelvis the chain through
# skel.trunk), both legs (a giant's lower arm out of its side's upper arm too) and the other arm of its pair (its upper
# arm and forearm), twice over
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
		# the other arm of the pair, as it stands, for the forearm only (Arms folded: each wrist sank 2.5 to 3 cm into
		# the other arm), at its narrow end's radius (the elbow's, the wrist's: one radius overstated them by 2 cm)
		var chj := skeleton.find_bone("Spine2") if skeleton.find_bone("Spine2") >= 0 else sp1
		var ch_f := Vector3(0, 0, 1)
		if chj >= 0:
			ch_f = (_gp(chj).basis.get_rotation_quaternion() * skeleton.get_bone_global_rest(chj).basis.get_rotation_quaternion().inverse()) * ch_f
		# (not while both hands hold one prop: the two-hand solve places the left arm)
		for ob in arms:
			if ob == arm or (ob[4] == "") != (arm[4] == "") or not _support().is_empty():
				continue
			for cp in _caps:
				if cp.get("pa") == null and (int(cp["a"]) == skeleton.find_bone(ob[0]) or int(cp["a"]) == skeleton.find_bone(ob[1])):
					obs.append(_ends({"a": int(cp["a"]), "b": int(cp["b"]), "ra": float(cp["rb"]), "rb": float(cp["rb"]), "r": float(cp["rb"]), "n": "", "arm": true}))
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
				if (on_trunk and o.get("top", false)) or o.has("arm"):
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
					# the other arm: the forearm to the wrist only (a hand may hold the other arm, its fingers round it)
					if k == 1 and (b3 < 0 or o.has("arm")):
						continue
					var hit := _closest(eB if k == 1 else eA, _gp(b3).origin if k == 1 else eB, o["A"], o["B"])
					var dep := float(cf["rb"] if k == 1 else cf["r"]) + _rad(o, hit["t"]) + BF - float(hit["d"])
					if o.has("arm"):
						# folded forearms lie stacked: the forearm in front of the other arm comes forward out of it
						# along the chest's forward axis, by the least that clears, and the one behind stays (each out
						# of the other in turn ratcheted both forward; the gap's way lifted the hand to the collarbone)
						var R := lerpf(float(cf["ra"]), float(cf["rb"]), float(hit["s"])) + _rad(o, hit["t"])
						var ax := ((o["B"] as Vector3) - (o["A"] as Vector3)).normalized()
						if R > float(hit["d"]) and float(hit["d"]) > 1e-6 and absf(ch_f.dot(ax)) < 0.9:
							var g: Vector3 = (hit["c1"] as Vector3) - (hit["c2"] as Vector3)
							var gf := g.dot(ch_f)
							if gf >= 0.0:
								var kk := -gf + sqrt(maxf(0.0, gf * gf - g.length_squared() + R * R))
								if kk > worst:
									worst = kk
									p = hit["c1"]
									way = ch_f
							continue
						dep = R - float(hit["d"])
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
	# (the last tail's joints back to the skeleton's rest: a species' chain (tail.rest) moved them)
	if not _tl.is_empty():
		for i in _tl["ids"]:
			skeleton.set_bone_pose_rotation(i, KChar._q(skel["joints"][i]["r"]))
			skeleton.set_bone_pose_position(i, morph["t"][i])
	if it == null or not it.has("tail"):
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
	# a species' tail (tools/tails.py) carries its own chain (tail.rest: Tail2 on, the hips' frame at bind): those
	# joints take it, scaled as the morphs scale the skeleton's own offsets (the twin of tailRest)
	var r := []
	var p := Vector3.ZERO
	var own = _tl["spec"].get("rest", null)
	var ids: Array = _tl["ids"]
	for k in ids.size():
		var i: int = ids[k]
		if own != null and k > 0 and k - 1 < own.size():
			var l0 := KChar._v(skel["joints"][i]["t"]).length()
			var l1 := (morph["t"][i] as Vector3).length()
			skeleton.set_bone_pose_position(i, KChar._v(own[k - 1]) * (l1 / l0 if l0 > 1e-6 else 1.0))
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
	if not _dg.is_empty():
		for di in 6:
			var ds := _digi_seg(di)
			if not ds.is_empty():
				W.append({"a": ds["a"], "b": ds["b"], "ra": float(ds["ra"]), "rb": float(ds["rb"])})
	else:
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


# ---- digitigrade legs (the twin of digitigrade() in 50-figure.js; core/charactermodels/tools/digitigrade.py) ----
var _dg := {}


static func _from_to(a: Vector3, b: Vector3) -> Quaternion:
	var an := a.normalized()
	var bn := b.normalized()
	var d := an.dot(bn)
	if d > 0.999999:
		return Quaternion.IDENTITY
	if d < -0.999999:
		var ortho := Vector3.RIGHT.cross(an)
		if ortho.length_squared() < 1e-6:
			ortho = Vector3.UP.cross(an)
		return Quaternion(ortho.normalized(), PI)
	return Quaternion(an, bn)


func _digi_setup(it) -> void:
	if not _dg.is_empty():
		for i in _dg["all"]:
			skeleton.set_bone_pose_rotation(i, KChar._q(skel["joints"][i]["r"]))
			skeleton.set_bone_pose_position(i, morph["t"][i])
	if it == null or not it.has("digitigrade"):
		_dg = {}
		return
	var spec: Dictionary = it["digitigrade"]
	var sides := []
	var all := []
	var bind := []
	for j in skel["joints"]:
		bind.append(KChar._v(j["t"]))
	var f0 := KChar.fk(skel, bind)
	for k in 2:
		var sd: String = ["Left", "Right"][k]
		var s := {
			"sd": sd,
			"sx": 1.0 if k == 0 else -1.0,
			"up": skeleton.find_bone(sd + "UpLeg"),
			"leg": skeleton.find_bone(sd + "Leg"),
			"foot": skeleton.find_bone(sd + "Foot"),
			"toe": skeleton.find_bone(sd + "ToeBase"),
			"dt": skeleton.find_bone(sd + "DigiThigh"),
			"ds": skeleton.find_bone(sd + "DigiShin"),
			"dh": skeleton.find_bone(sd + "DigiHock"),
			"dp": skeleton.find_bone(sd + "DigiPaw"),
		}
		for key in ["up", "leg", "foot", "toe", "dt", "ds", "dh", "dp"]:
			if int(s[key]) < 0:
				_dg = {}
				return
		var p0: Vector3 = f0["P"][s["dt"]]
		var p1: Vector3 = f0["P"][s["ds"]]
		var p2: Vector3 = f0["P"][s["dh"]]
		var p3: Vector3 = f0["P"][s["dp"]]
		s["u0"] = (p1 - p0).normalized()
		s["u1"] = (p2 - p1).normalized()
		s["u2"] = (p3 - p2).normalized()
		var ax0 := (p2 - p0).normalized()
		var pl0 := (p1 - p0)
		pl0 = (pl0 - ax0 * pl0.dot(ax0)).normalized()
		s["hinge0"] = pl0.cross(ax0).normalized()
		var hm := p2 - p3
		s["theta0"] = atan2(hm.y, maxf(1e-4, -hm.z))
		sides.append(s)
		all.append_array([s["dt"], s["ds"], s["dh"], s["dp"]])
	_dg = {
		"spec": spec,
		"sides": sides,
		"all": all,
		"morph": null,
		"hip_drop": 0.0,
		"state": [
			{"stance": 1.0, "hock_y": 0.0, "paw_y": 0.0, "hock_ang": 0.0, "stifle_ang": 0.0, "hock_fwd": -0.15, "uh": null},
			{"stance": 1.0, "hock_y": 0.0, "paw_y": 0.0, "hock_ang": 0.0, "stifle_ang": 0.0, "hock_fwd": -0.15, "uh": null},
		],
	}


func _digi_rest() -> void:
	var floor_y := -skeleton.position.y / size
	if _dg["morph"] == morph and is_equal_approx(float(_dg.get("floor_y", 1e9)), floor_y):
		return
	_dg["morph"] = morph
	_dg["floor_y"] = floor_y
	var f := KChar.fk(skel, morph["t"])
	_dg["hip_rest_h"] = (f["P"][_hips] as Vector3).y - floor_y
	var gk := 1.0
	var lu := skeleton.find_bone("LeftUpLeg")
	for c in skel.get("colliders", []):
		if not c.has("pa") and int(c["a"]) == lu:
			for lc in _caps:
				if lc.get("pa") == null and int(lc["a"]) == lu and float(c["r"]) > 1e-4:
					gk = float(lc["r"]) / float(c["r"])
	_dg["girth_k"] = gk
	for s in _dg["sides"]:
		var p0: Vector3 = f["P"][s["dt"]]
		var p1: Vector3 = f["P"][s["ds"]]
		var p2: Vector3 = f["P"][s["dh"]]
		var p3: Vector3 = f["P"][s["dp"]]
		s["l1"] = p1.distance_to(p0)
		s["l2"] = p2.distance_to(p1)
		s["l3"] = p3.distance_to(p2)
		s["ank_h"] = (f["P"][s["foot"]] as Vector3).y - floor_y
		s["ball_h"] = (f["P"][s["toe"]] as Vector3).y - floor_y
		s["paw_h"] = maxf(0.015, p3.y - floor_y)


func _digi_seg(i: int) -> Dictionary:
	if _dg.is_empty():
		return {}
	_digi_rest()
	var sd: Dictionary = _dg["sides"][i & 1]
	var kind := i >> 1
	var rad: Dictionary = _dg["spec"].get("radii", {})
	var gk := float(_dg.get("girth_k", 1.0))
	var ba: int = sd["dt"] if kind == 0 else (sd["ds"] if kind == 1 else sd["dh"])
	var bb: int = sd["ds"] if kind == 0 else (sd["dh"] if kind == 1 else sd["dp"])
	var rr: Array = rad.get("thigh", [0.08, 0.055]) if kind == 0 else (rad.get("shin", [0.052, 0.03]) if kind == 1 else rad.get("meta", [0.03, 0.038]))
	var pa := _gp(ba).origin
	var pb := _gp(bb).origin
	if kind == 2:
		pb += _gp(sd["dp"]).basis.get_rotation_quaternion() * Vector3(0.0, -0.008, 0.048)
	return {"a": pa, "b": pb, "ba": ba, "bb": bb, "ra": float(rr[0]) * gk, "rb": float(rr[1]) * gk}


func _digitigrade(dt: float) -> void:
	if _dg.is_empty():
		return
	_digi_rest()
	if _clip == "" or player == null or not player.is_playing():
		_dg["hip_drop"] = 0.0
		for st_r in _dg["state"]:
			st_r["uh"] = null
		for i in _dg["all"]:
			skeleton.set_bone_pose_rotation(i, KChar._q(skel["joints"][i]["r"]))
			skeleton.set_bone_pose_position(i, morph["t"][i])
		return
	var floor_y := float(_dg["floor_y"])
	var hip_rest_h := float(_dg["hip_rest_h"])
	var hq := _gp(_hips).basis.get_rotation_quaternion()
	var q_hd := hq * skeleton.get_bone_global_rest(_hips).basis.get_rotation_quaternion().inverse()
	var hip_up_y := (q_hd * Vector3(0, 1, 0)).y
	var pelv_up := smoothstep(0.25, 0.65, hip_up_y)
	var hip_s := q_hd * Vector3(1, 0, 0)
	hip_s.y = 0.0
	if hip_s.length_squared() < 1e-4:
		hip_s = Vector3.UP.cross(q_hd * Vector3(0, 0, 1))
		hip_s.y = 0.0
	hip_s = hip_s.normalized() if hip_s.length_squared() >= 1e-6 else Vector3(1, 0, 0)
	var st_max := 0.0
	var load_max := 0.0
	var reach_max := 0.0
	var st_arr := [0.0, 0.0]
	var up_arr := [0.0, 0.0]
	var clear_arr := [0.0, 0.0]
	for idx in 2:
		var s: Dictionary = _dg["sides"][idx]
		var h_c := _gp(s["up"]).origin
		var a_c := _gp(s["foot"]).origin
		var b_c := _gp(s["toe"]).origin
		var up_w := pelv_up
		var clear_h := minf(maxf(0.0, (a_c.y - floor_y) - float(s["ank_h"])), maxf(0.0, (b_c.y - floor_y) - float(s["ball_h"])))
		var stance := 1.0 - smoothstep(0.010, 0.110, clear_h)
		var st := stance * up_w
		st_arr[idx] = st
		up_arr[idx] = up_w
		clear_arr[idx] = clear_h
		st_max = maxf(st_max, st)
		var fore_aft := Vector2(a_c.x - h_c.x, a_c.z - h_c.z).length()
		load_max = maxf(load_max, st * (1.0 - clampf((fore_aft - 0.06) / 0.22, 0.0, 1.0)))
		reach_max = maxf(reach_max, st * clampf((fore_aft - 0.20) / 0.24, 0.0, 1.0))
	var want_drop := st_max * (0.018 + 0.014 * load_max + 0.024 * reach_max) * (hip_rest_h / 0.95)
	var k_drop := 1.0 - exp(-dt / 0.06) if dt > 0.0 else 1.0
	_dg["hip_drop"] = float(_dg["hip_drop"]) + (want_drop - float(_dg["hip_drop"])) * k_drop
	if float(_dg["hip_drop"]) > 1e-5:
		skeleton.set_bone_pose_position(_hips, skeleton.get_bone_pose_position(_hips) - Vector3(0.0, float(_dg["hip_drop"]), 0.0))
	for idx in 2:
		var s: Dictionary = _dg["sides"][idx]
		var st: float = st_arr[idx]
		var up_w: float = up_arr[idx]
		var clear_h: float = clear_arr[idx]
		var h_p := _gp(s["up"]).origin
		var k_c := _gp(s["leg"]).origin
		var a_c := _gp(s["foot"]).origin
		var b_c := _gp(s["toe"]).origin
		var q_fd := _gp(s["foot"]).basis.get_rotation_quaternion() * skeleton.get_bone_global_rest(s["foot"]).basis.get_rotation_quaternion().inverse()
		var foot_s3 := q_fd * Vector3(1, 0, 0)
		var foot_s := Vector3(foot_s3.x, 0.0, foot_s3.z)
		var side_len := foot_s.length()
		var side := hip_s
		if side_len > 0.2:
			foot_s /= side_len
			var align := clampf((foot_s.dot(hip_s) - 0.1) / 0.4, 0.0, 1.0)
			side = hip_s.lerp(foot_s, 0.65 * align).normalized()
		var fwd := side.cross(Vector3.UP).normalized()
		var shin_d := a_c - k_c
		shin_d = shin_d.normalized() if shin_d.length_squared() > 1e-8 else Vector3.DOWN
		var fwd3 := shin_d.cross(foot_s3)
		fwd3 = fwd3.normalized() if fwd3.length_squared() > 1e-8 else fwd

		var paw := a_c.lerp(b_c, 0.38)
		var fore := (paw - h_p).dot(fwd)
		paw -= fwd * (0.18 * fore * up_w)
		var eff_clear := clear_h if clear_h <= 0.16 else 0.16 + 0.45 * (clear_h - 0.16)
		var swing_lift := (1.0 - st) * up_w * 0.022 * sin(PI * clampf(clear_h / 0.15, 0.0, 1.0))
		var paw_y_up := floor_y + float(s["paw_h"]) + eff_clear + swing_lift
		paw.y = lerpf(paw.y, paw_y_up, up_w)

		var stride := (paw - h_p).dot(fwd) / 0.32
		var crouch := clampf((0.86 * hip_rest_h - (h_p.y - floor_y)) / maxf(0.28 * hip_rest_h, 1e-4), 0.0, 1.0)
		var mid_load := 1.0 - minf(1.0, absf(stride))
		var push_off := clampf(-stride, 0.0, 1.0)
		var high_kick := clampf((clear_h - 0.16) / 0.4, 0.0, 1.0)
		var theta0 := float(s["theta0"])
		var th_stance := theta0 - 0.14 * mid_load + 0.12 * push_off - 0.30 * crouch
		var th_swing := theta0 - 0.22 * (1.0 - 0.45 * push_off) - 0.22 * high_kick - 0.18 * crouch
		var theta := clampf(lerpf(th_swing, th_stance, st), 0.38, 1.22)

		var u_h := (-fwd * cos(theta) + Vector3.UP * sin(theta) - side * (0.04 * float(s["sx"]))).normalized()
		var u_hc := -fwd3 * cos(theta0) - shin_d * sin(theta0)
		u_hc = u_hc.normalized() if u_hc.length_squared() > 1e-8 else u_h
		u_h = u_h.lerp(u_hc, 1.0 - up_w).normalized()

		var st_d: Dictionary = _dg["state"][idx]
		if dt > 0.0 and st_d["uh"] != null:
			var sm: Vector3 = (st_d["uh"] as Vector3).lerp(u_h, 1.0 - exp(-dt / 0.045)).normalized()
			st_d["uh"] = sm
			u_h = sm
		else:
			st_d["uh"] = u_h

		var l1 := float(s["l1"])
		var l2 := float(s["l2"])
		var l3 := float(s["l3"])
		var max_r := l1 + l2 - 0.010
		var min_r := absf(l1 - l2) + 0.025
		var dir_hp := h_p - paw
		var d_hp := dir_hp.length()
		if d_hp > 1e-5:
			dir_hp /= d_hp
			if d_hp >= max_r + l3 - 1e-3:
				u_h = dir_hp
			else:
				var cos_min := clampf((d_hp * d_hp + l3 * l3 - max_r * max_r) / (2.0 * d_hp * l3), -1.0, 1.0)
				var cur_cos := u_h.dot(dir_hp)
				if cur_cos < cos_min:
					var perp := u_h - dir_hp * cur_cos
					if perp.length_squared() < 1e-8:
						u_h = dir_hp
					else:
						u_h = dir_hp * cos_min + perp.normalized() * sqrt(maxf(0.0, 1.0 - cos_min * cos_min))
		var hock := paw + u_h * l3
		if up_w > 0.25 and hock.y < floor_y + 0.11:
			hock.y = floor_y + 0.11
			u_h = (hock - paw).normalized()
			hock = paw + u_h * l3

		var ax := hock - h_p
		var d_hh := ax.length()
		ax = ax / d_hh if d_hh >= 1e-5 else Vector3.DOWN
		if d_hh < 1e-5:
			d_hh = min_r
		var d_cl := clampf(d_hh, min_r, max_r)
		if absf(d_cl - d_hh) > 1e-5:
			hock = h_p + ax * d_cl
		var cos_a := clampf((l1 * l1 + d_cl * d_cl - l2 * l2) / (2.0 * l1 * d_cl), -1.0, 1.0)
		var sin_a := sqrt(maxf(0.0, 1.0 - cos_a * cos_a))
		var pole := (k_c - h_p) + (fwd if up_w > 0.25 else fwd3) * 0.35
		pole -= ax * pole.dot(ax)
		if pole.length_squared() < 1e-8:
			pole = fwd - ax * fwd.dot(ax)
		if pole.length_squared() < 1e-8:
			pole = Vector3(0, 0, 1)
		pole = pole.normalized()
		var knee := h_p + ax * (l1 * cos_a) + pole * (l1 * sin_a)

		var hinge := pole.cross(ax)
		hinge = hinge.normalized() if hinge.length_squared() > 1e-8 else (s["hinge0"] as Vector3)
		var q_p := _from_to(s["hinge0"], hinge)
		var w_t := _from_to(q_p * (s["u0"] as Vector3), (knee - h_p).normalized()) * q_p
		var w_s := _from_to(q_p * (s["u1"] as Vector3), (hock - knee).normalized()) * q_p
		var w_h := _from_to(q_p * (s["u2"] as Vector3), (paw - hock).normalized()) * q_p

		var w_p := Basis(side, Vector3.UP, fwd).get_rotation_quaternion()
		var droop := 0.34 * (1.0 - st) * up_w
		if droop > 1e-4:
			w_p = Quaternion(side, droop) * w_p
		if up_w < 0.999:
			w_p = w_p.slerp(w_h, 1.0 - up_w)

		skeleton.set_bone_pose_rotation(s["dt"], (hq.inverse() * w_t).normalized())
		skeleton.set_bone_pose_rotation(s["ds"], (w_t.inverse() * w_s).normalized())
		skeleton.set_bone_pose_rotation(s["dh"], (w_s.inverse() * w_h).normalized())
		skeleton.set_bone_pose_rotation(s["dp"], (w_h.inverse() * w_p).normalized())

		var u0 := (knee - h_p).normalized()
		var u1 := (hock - knee).normalized()
		var u2 := (paw - hock).normalized()
		st_d["stance"] = st
		st_d["hock_y"] = hock.y - floor_y
		st_d["paw_y"] = paw.y - floor_y
		st_d["hock_ang"] = acos(clampf(-u1.dot(u2), -1.0, 1.0))
		st_d["stifle_ang"] = acos(clampf(-u0.dot(u1), -1.0, 1.0))
		st_d["hock_fwd"] = (hock - paw).dot(fwd)


func digi_state() -> Dictionary:
	return _dg


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


# ---- contact (the twin of contacts in 50-figure.js): a strike's or a throw's moment of touch (data/clips.json
# contact: [[t, end, target], ...] in clip seconds), emitted as the playing clip passes each, a loop's on every cycle,
# so a game times the other party's hit, fall or block to it
signal contact(clip: String, t: float, end: String, target: String)


func _contacts(clip: String, t0: float, t1: float) -> void:
	var L = clip_data.get(clip, {}).get("contact")
	if L == null or t1 == t0:
		return
	for e in L:
		var t := float(e[0])
		if (t > t0 and t <= t1) if t1 > t0 else (t > t0 or t <= t1):
			contact.emit(clip, t, String(e[1]), String(e[2]))


func _process(dt: float) -> void:
	_blinks(dt)
	if _clip == "":
		return
	# the hips start from the base body's rest (a clip without a hips position track leaves them there), so the
	# morph delta below is added once, not once a frame
	skeleton.set_bone_pose_position(_hips, KChar._v(skel["joints"][_hips]["t"]))
	var c0 := _clip
	var t0 := player.current_animation_position if player.is_playing() else -1.0
	player.advance(dt * cadence)
	if t0 >= 0.0:
		_contacts(c0, t0, player.current_animation_position if player.is_playing() else player.get_animation(c0).length)
	_pose_fade += dt * cadence
	if not player.is_playing() and _clip != looping:
		play(looping)
		return
	# the clip writes the hips where the base body's are; the morph moves them
	skeleton.set_bone_pose_position(_hips, skeleton.get_bone_pose_position(_hips) + morph["d"][_hips])
	_after_clip(dt)
