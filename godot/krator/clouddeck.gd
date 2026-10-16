# The cloud deck node (core/atmos/GODOT.md, "The cloud deck"): one 'clouddeck' record of a krator-atmos export drawn
# with shaders/clouddeck.gdshader. The same grid the page builds (presets.clouddeck.mesh: `cells` a side over +-radius,
# denser near the middle by |s|^1.6), moved to the camera in steps of `snap` so the billows never swim; at each step the
# ground's height round the camera is sampled into clear_tex (presets.clouddeck.clear) so the deck thins where the
# ground rises through it. The ground is the scene's heightfield (KData.heightfield's node, found by its "grid" meta);
# with none, the deck is drawn whole.
extends MeshInstance3D

const SHADER := preload("res://shaders/clouddeck.gdshader")

var y := 1120.0
var P: Dictionary = {}
var ground_node: Node3D = null
var _img: Image
var _tex: ImageTexture
var _cx := INF
var _cz := INF
var _lo := 0.0
var _range := 160.0


func setup(record: Dictionary, presets: Dictionary) -> void:
	P = presets
	y = float(record.get("y", 1120.0))
	name = str(record.get("id", "clouddeck"))
	var M: Dictionary = P["mesh"]
	var n := int(M["cells"])
	var R := float(M["radius"])
	var pos := PackedVector3Array()
	pos.resize((n + 1) * (n + 1))
	for j in n + 1:
		for i in n + 1:
			pos[j * (n + 1) + i] = Vector3(_map(i / float(n) * 2.0 - 1.0, R), 0.0, _map(j / float(n) * 2.0 - 1.0, R))
	var idx := PackedInt32Array()
	for j in n:
		for i in n:
			var a := j * (n + 1) + i
			var b := a + n + 1
			idx.append_array([a, a + 1, b, b, a + 1, b + 1])
	var arr := []
	arr.resize(Mesh.ARRAY_MAX)
	arr[Mesh.ARRAY_VERTEX] = pos
	arr[Mesh.ARRAY_INDEX] = idx
	var am := ArrayMesh.new()
	am.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	mesh = am
	# the deck's shape is the shader's: the culling box must hold it wherever it is lifted
	custom_aabb = AABB(Vector3(-R, y - float(P["down"]) - 1.0, -R), Vector3(2.0 * R, float(P["up"]) + float(P["down"]) + 2.0, 2.0 * R))
	var mat := ShaderMaterial.new()
	mat.shader = SHADER
	var sun: Array = record.get("sun", [-0.6, 0.55, -0.4])
	mat.set_shader_parameter("deck_y", y)
	mat.set_shader_parameter("sun_dir", Vector3(sun[0], sun[1], sun[2]))
	mat.set_shader_parameter("top_col", Color(P["top"][0], P["top"][1], P["top"][2]))
	mat.set_shader_parameter("shade_col", Color(P["shade"][0], P["shade"][1], P["shade"][2]))
	mat.set_shader_parameter("ground_fade", Vector2(P["ground"][0], P["ground"][1]))
	_lo = y - float(P["down"]) - 30.0
	_range = float(P["up"]) + float(P["down"]) + 90.0
	mat.set_shader_parameter("clear_lo", _lo)
	mat.set_shader_parameter("clear_range", _range)
	var S := int(P["clear"]["size"])
	_img = Image.create(S, S, false, Image.FORMAT_R8)
	_tex = ImageTexture.create_from_image(_img)
	mat.set_shader_parameter("clear_tex", _tex)
	material_override = mat
	cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF


static func _map(s: float, R: float) -> float:
	return signf(s) * R * pow(absf(s), 1.6)


func _ready() -> void:
	if ground_node == null:
		for c in get_tree().root.find_children("*", "Node3D", true, false):
			if c.has_meta("grid"):
				ground_node = c
				break
	(material_override as ShaderMaterial).set_shader_parameter("has_clear", ground_node != null)


func _process(_delta: float) -> void:
	var cam := get_viewport().get_camera_3d()
	if cam == null or P.is_empty():
		return
	var snap := float(P["mesh"]["snap"])
	var sx := roundf(cam.global_position.x / snap) * snap
	var sz := roundf(cam.global_position.z / snap) * snap
	if sx == _cx and sz == _cz:
		return
	_cx = sx
	_cz = sz
	global_position = Vector3(sx, 0.0, sz)
	if ground_node == null:
		return
	var span := float(P["clear"]["span"])
	var S := _img.get_width()
	var x0 := sx - span * 0.5
	var z0 := sz - span * 0.5
	for j in S:
		for i in S:
			var g := KData.height_at(ground_node, x0 + (i + 0.5) / S * span, z0 + (j + 0.5) / S * span)
			_img.set_pixel(i, j, Color(clampf((g - _lo) / _range, 0.0, 1.0), 0.0, 0.0))
	_tex.update(_img)
	(material_override as ShaderMaterial).set_shader_parameter("clear_win", Vector4(x0, z0, 1.0 / span, 0.0))
