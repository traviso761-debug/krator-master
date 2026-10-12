# Shared decoding for Krator's exports: typed arrays ({type, n, b64}), column-major matrices, colours, data URLs,
# and three.js geometry records to Godot ArrayMesh. Conventions: biomes/GODOT.md and core/atmos/GODOT.md
# (metres, +Y up, x east, z south, right-handed: the same as Godot).
class_name KData
extends RefCounted


static func read_json(path: String) -> Variant:
	if not FileAccess.file_exists(path):
		push_error("krator: no file %s" % path)
		return null
	var text := FileAccess.get_file_as_string(path)
	if text.is_empty():
		push_error("krator: cannot read %s" % path)
		return null
	return JSON.parse_string(text)


static func raw(t: Dictionary) -> PackedByteArray:
	return Marshalls.base64_to_raw(t["b64"])


static func floats(t: Dictionary) -> PackedFloat32Array:
	if t["type"] != "Float32Array":
		push_error("krator: expected Float32Array, got %s" % t["type"])
	return raw(t).to_float32_array()


static func ints(t: Dictionary) -> PackedInt32Array:
	var b := raw(t)
	match t["type"]:
		"Uint32Array":
			return b.to_int32_array()
		"Uint16Array":
			var n: int = int(t["n"])
			var out := PackedInt32Array()
			out.resize(n)
			for i in n:
				out[i] = b.decode_u16(i * 2)
			return out
		_:
			push_error("krator: unexpected index type %s" % t["type"])
			return PackedInt32Array()


# a three.js column-major 4x4 at offset o: Basis takes the three columns, the fourth is the origin
static func mat4(m: PackedFloat32Array, o: int) -> Transform3D:
	return Transform3D(Basis(Vector3(m[o], m[o + 1], m[o + 2]), Vector3(m[o + 4], m[o + 5], m[o + 6]),
		Vector3(m[o + 8], m[o + 9], m[o + 10])), Vector3(m[o + 12], m[o + 13], m[o + 14]))


# '#rrggbb' or [r,g,b]; srgb=true converts display-space values (the atmosphere's convention) to linear
static func colour(v: Variant, srgb: bool) -> Color:
	var c := Color(1, 1, 1)
	if v is String and (v as String).begins_with("#"):
		c = Color.html(v)
	elif v is Array and (v as Array).size() >= 3:
		c = Color(float(v[0]), float(v[1]), float(v[2]))
	return c.srgb_to_linear() if srgb else c


static func texture_from_data_url(url: String) -> ImageTexture:
	var comma := url.find(",")
	if comma < 0:
		return null
	var bytes := Marshalls.base64_to_raw(url.substr(comma + 1))
	var img := Image.new()
	var err := img.load_png_from_buffer(bytes) if url.begins_with("data:image/png") else img.load_jpg_from_buffer(bytes)
	if err != OK:
		push_warning("krator: texture decode failed (%d)" % err)
		return null
	img.generate_mipmaps()
	return ImageTexture.create_from_image(img)


# A three.js geometry record ({position, normal, uv, color, index}) as an ArrayMesh surface.
# three's front faces wind counter-clockwise, Godot's clockwise: every triangle is reversed here.
# UVs are left as three wrote them (v up, image flipped on upload); the shaders flip v (see krator_uv in the shaders).
# origin is subtracted from positions (a LOD chunk's node sits at the chunk's centre).
static func array_mesh(g: Dictionary, material: Material, origin := Vector3.ZERO) -> ArrayMesh:
	var pos := floats(g["position"])
	var nv := pos.size() / 3
	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	var v3 := PackedVector3Array()
	v3.resize(nv)
	for i in nv:
		v3[i] = Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]) - origin
	arrays[Mesh.ARRAY_VERTEX] = v3
	if g.has("normal"):
		var nr := floats(g["normal"])
		var n3 := PackedVector3Array()
		n3.resize(nv)
		for i in nv:
			n3[i] = Vector3(nr[i * 3], nr[i * 3 + 1], nr[i * 3 + 2])
		arrays[Mesh.ARRAY_NORMAL] = n3
	if g.has("uv"):
		var uv := floats(g["uv"])
		var u2 := PackedVector2Array()
		u2.resize(nv)
		for i in nv:
			u2[i] = Vector2(uv[i * 2], uv[i * 2 + 1])
		arrays[Mesh.ARRAY_TEX_UV] = u2
	if g.has("color"):
		var cl := floats(g["color"])
		var size := cl.size() / nv   # three's colour attribute is rgb or rgba; the record does not say which
		var cc := PackedColorArray()
		cc.resize(nv)
		for i in nv:
			cc[i] = Color(cl[i * size], cl[i * size + 1], cl[i * size + 2], cl[i * size + 3] if size == 4 else 1.0)
		arrays[Mesh.ARRAY_COLOR] = cc
	var idx: PackedInt32Array
	if g.has("index"):
		idx = ints(g["index"])
	else:
		idx = PackedInt32Array()
		idx.resize(nv)
		for i in nv:
			idx[i] = i
	for t in range(0, idx.size() - 2, 3):
		var b := idx[t + 1]
		idx[t + 1] = idx[t + 2]
		idx[t + 2] = b
	arrays[Mesh.ARRAY_INDEX] = idx
	var m := ArrayMesh.new()
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	if material:
		m.surface_set_material(0, material)
	return m


# octahedral encoding of a unit vector into two floats (biomes/GODOT.md; decoded by oct_decode in atmos.gdshaderinc)
static func oct_encode(v: Vector3) -> Vector2:
	var l: float = abs(v.x) + abs(v.y) + abs(v.z)
	if l < 1e-8:
		return Vector2(0, 0)
	var p := Vector2(v.x / l, v.y / l)
	if v.z < 0.0:
		p = Vector2((1.0 - abs(p.y)) * (1.0 if p.x >= 0.0 else -1.0), (1.0 - abs(p.x)) * (1.0 if p.y >= 0.0 else -1.0))
	return p


# krator-heightfield (written by godot/tools/export_spike.py): a grid mesh with the spike's ground shader,
# a biome tile's ground (BIO.export's `ground`: the same grid, heights and water) as the same mesh, with a flat
# water sheet where the water stands above the ground
static func ground(g: Dictionary, look = null) -> Node3D:
	var hf := {"format": "krator-biome ground", "nx": g["nx"], "nz": g["nz"], "step": g["step"], "x0": g["x0"], "z0": g["z0"],
		"heights": g["heights"]}
	var n := _grid(hf, look)
	var wm := water_sheet(g)
	if wm:
		n.add_child(wm)
	return n


# BIO.export's ground water (waterH on the ground's grid): one flat sheet at the mean level of the wet samples, or null
static func water_sheet(g: Dictionary) -> MeshInstance3D:
	if g.has("water"):
		var w := floats(g["water"])
		var h := floats(g["heights"])
		var wet := 0
		var lvl := 0.0
		for i in w.size():
			if w[i] > h[i] + 0.01:
				wet += 1
				lvl += w[i]
		if wet > 0:
			var q := PlaneMesh.new()
			q.size = Vector2((float(g["nx"]) - 1.0) * float(g["step"]), (float(g["nz"]) - 1.0) * float(g["step"]))
			var mat := StandardMaterial3D.new()
			mat.albedo_color = Color(0.12, 0.22, 0.26, 0.75)
			mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
			mat.roughness = 0.08
			q.material = mat
			var wm := MeshInstance3D.new()
			wm.name = "Water"
			wm.mesh = q
			wm.position = Vector3(float(g["x0"]) + q.size.x * 0.5, lvl / wet, float(g["z0"]) + q.size.y * 0.5)
			wm.set_meta("krator", {"note": "one sheet at the mean water level of the wet cells (%d of %d)" % [wet, w.size()]})
			return wm
	return null


static func heightfield(path: String, look = null) -> Node3D:
	var hf = read_json(path)
	if not (hf is Dictionary):
		return null
	return _grid(hf, look)


# look: the stage's ground (KSTAGE.ground) on the same grid: per-sample uvs and colours and the page's ground material
static func _grid(hf: Dictionary, look = null) -> Node3D:
	var nx: int = int(hf["nx"])
	var nz: int = int(hf["nz"])
	var step: float = float(hf["step"])
	var x0: float = float(hf["x0"])
	var z0: float = float(hf["z0"])
	var h := floats(hf["heights"])
	var lk: Dictionary = look if look is Dictionary and int(look.get("nx", -1)) == nx and int(look.get("nz", -1)) == nz else {}
	var UV := floats(lk["uv"]) if lk.has("uv") and lk["uv"] != null else PackedFloat32Array()
	var CO := floats(lk["colour"]) if lk.has("colour") and lk["colour"] != null else PackedFloat32Array()
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for j in nz:
		for i in nx:
			var s := j * nx + i
			if UV.size() > 0:
				st.set_uv(Vector2(UV[s * 2], UV[s * 2 + 1]))
			if CO.size() > 0:
				st.set_color(Color(CO[s * 3], CO[s * 3 + 1], CO[s * 3 + 2]))
			st.add_vertex(Vector3(x0 + i * step, h[s], z0 + j * step))
	for j in nz - 1:
		for i in nx - 1:
			var a := j * nx + i
			# clockwise seen from above (+Y): Godot's front face
			st.add_index(a); st.add_index(a + 1); st.add_index(a + nx)
			st.add_index(a + 1); st.add_index(a + nx + 1); st.add_index(a + nx)
	st.generate_normals()
	var mesh := st.commit()
	mesh.surface_set_material(0, ground_material(lk, CO.size() > 0))
	var mi := MeshInstance3D.new()
	mi.name = "Terrain"
	mi.mesh = mesh
	mi.set_meta("krator", {"format": hf["format"], "step": step, "nx": nx, "nz": nz})
	mi.set_meta("grid", {"h": h, "nx": nx, "nz": nz, "x0": x0, "z0": z0, "step": step})
	return mi


# the stage's ground material (look: KSTAGE.ground) for a grid mesh, or the spike's terrain shader without one
static func ground_material(lk: Dictionary, has_colours: bool) -> ShaderMaterial:
	var mat := ShaderMaterial.new()
	if lk.has("material"):   # the page's own ground: its texture, colour and vertex colours
		var m: Dictionary = lk["material"]
		mat.shader = load("res://shaders/ground.gdshader")
		if m.get("map") != null:
			mat.set_shader_parameter("map_tex", texture_from_data_url(m["map"]))
			mat.set_shader_parameter("has_map", true)
		mat.set_shader_parameter("colour", colour(m.get("colour", "#ffffff"), false))
		var rp: Array = m.get("repeat", [1, 1])
		var of: Array = m.get("offset", [0, 0])
		mat.set_shader_parameter("uv_repeat", Vector2(float(rp[0]), float(rp[1])))
		mat.set_shader_parameter("uv_offset", Vector2(float(of[0]), float(of[1])))
		mat.set_shader_parameter("flip_v", bool(m.get("flipY", true)))
		mat.set_shader_parameter("use_vc", has_colours and bool(m.get("vertexColours", false)))
	else:
		mat.shader = load("res://shaders/terrain.gdshader")
	return mat


static func height_at(hf_node: Node3D, x: float, z: float) -> float:
	if hf_node != null and hf_node.has_meta("field"):   # a krator-field (krator/field_import.gd): sampled as the page does
		return (hf_node.get_meta("field") as KField).h(x, z)
	if hf_node == null or not hf_node.has_meta("grid"):
		return 0.0
	var g: Dictionary = hf_node.get_meta("grid")
	var h: PackedFloat32Array = g["h"]
	var nx: int = g["nx"]
	var nz: int = g["nz"]
	var fx: float = clamp((x - g["x0"]) / g["step"], 0.0, nx - 1.001)
	var fz: float = clamp((z - g["z0"]) / g["step"], 0.0, nz - 1.001)
	var i := int(fx)
	var j := int(fz)
	var u := fx - i
	var v := fz - j
	var a := lerpf(h[j * nx + i], h[j * nx + i + 1], u)
	var b := lerpf(h[(j + 1) * nx + i], h[(j + 1) * nx + i + 1], u)
	return lerpf(a, b, v)
