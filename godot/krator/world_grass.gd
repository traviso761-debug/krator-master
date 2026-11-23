# Stage 4 GPU-Instanced 3D Grass Blade Sward & Seed-Plume Layer (godot/krator/world_grass.gd)
# Renders two concentric rings of curved 3D grass blade clumps (Near 0..36 m, Mid 34..82 m) plus flowering seed-plume
# tufts (0..46 m) around the camera on outdoor terrain and Longsong's meadows/terraces:
#   - Root color matched to underlying terrain albedo_rock_tex via MultiMesh CUSTOM_DATA (zero pop-in seam at 82 m)
#   - Grounded on exact drawn triangle height (tri_height_at) and tilted gently toward surface normal
#   - Masks out water, steep cliffs, roads, building footprints, and paved courts
class_name KratorWorldGrass
extends Node3D

const GRASS_SHADER := preload("res://shaders/grass_sward.gdshader")

const NEAR_R := 34.0
const NEAR_STEP := 0.44
const MID_R0 := 31.0
const MID_R1 := 84.0
const MID_STEP := 1.18
const PLUME_R := 46.0
const PLUME_STEP := 2.40

var near_mmi: MultiMeshInstance3D
var mid_mmi: MultiMeshInstance3D
var plume_mmi: MultiMeshInstance3D
var _near_mat: ShaderMaterial
var _mid_mat: ShaderMaterial
var _plume_mat: ShaderMaterial

var _last_cam := Vector3(1e9, 1e9, 1e9)
var _last_origin := Vector3(1e9, 1e9, 1e9)
var enabled := true
var last_build_ms := 0.0
var last_counts := {"near": 0, "mid": 0, "plume": 0}


func _init() -> void:
	name = "StreamGrass"
	KratorGroundLayers.ensure_s4()

	_near_mat = ShaderMaterial.new()
	_near_mat.shader = GRASS_SHADER
	_near_mat.set_shader_parameter("fade_start", 26.0)
	_near_mat.set_shader_parameter("fade_end", NEAR_R + 2.0)
	_near_mat.set_shader_parameter("is_plume_card", false)

	_mid_mat = ShaderMaterial.new()
	_mid_mat.shader = GRASS_SHADER
	_mid_mat.set_shader_parameter("fade_start", 60.0)
	_mid_mat.set_shader_parameter("fade_end", MID_R1)
	_mid_mat.set_shader_parameter("is_plume_card", false)

	_plume_mat = ShaderMaterial.new()
	_plume_mat.shader = GRASS_SHADER
	_plume_mat.set_shader_parameter("fade_start", 34.0)
	_plume_mat.set_shader_parameter("fade_end", PLUME_R)
	_plume_mat.set_shader_parameter("is_plume_card", true)
	if KratorGroundLayers.plume_tex != null:
		_plume_mat.set_shader_parameter("plume_tex", KratorGroundLayers.plume_tex)

	near_mmi = _make_mmi("GrassNear", _build_clump_mesh(12, 0.46, 0.035, 0.24), _near_mat)
	mid_mmi = _make_mmi("GrassMid", _build_clump_mesh(6, 0.54, 0.052, 0.34), _mid_mat)
	plume_mmi = _make_mmi("GrassPlume", _build_plume_mesh(0.62, 0.72), _plume_mat)
	add_child(near_mmi)
	add_child(mid_mmi)
	add_child(plume_mmi)


static func _make_mmi(nm: String, mesh: ArrayMesh, mat: ShaderMaterial) -> MultiMeshInstance3D:
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.use_colors = false
	mm.use_custom_data = true
	mm.mesh = mesh
	mm.instance_count = 0
	var mmi := MultiMeshInstance3D.new()
	mmi.name = nm
	mmi.multimesh = mm
	mmi.material_override = mat
	mmi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	mmi.visible = false
	return mmi


# Builds an arched 3D multi-blade grass tuft (n_blades * 3 triangles) with proper ribbon cross-normals and UV.y = 0..1
static func _build_clump_mesh(n_blades: int, base_h: float, half_w: float, spread_r: float) -> ArrayMesh:
	var verts := PackedVector3Array()
	var norms := PackedVector3Array()
	var uvs := PackedVector2Array()
	var indices := PackedInt32Array()

	for b in n_blades:
		var ang := (float(b) + 0.37 * float((b * 5) % 7)) / float(n_blades) * TAU
		var ca := cos(ang)
		var sa := sin(ang)
		var dir := Vector3(ca, 0.0, sa)
		var side := Vector3(-sa, 0.0, ca)

		var r0 := spread_r * (0.25 + 0.75 * fmod(float(b) * 0.618034, 1.0))
		var h := base_h * (0.74 + 0.52 * fmod(float(b) * 0.381966 + 0.21, 1.0))
		var arch := h * (0.26 + 0.24 * fmod(float(b) * 0.754877, 1.0))
		var hw0 := half_w * (0.85 + 0.30 * float(b & 1))
		var hw1 := hw0 * 0.58

		var base_p := dir * r0 + Vector3(0.0, -0.025, 0.0)
		var mid_p := base_p + dir * (arch * 0.38) + Vector3(0.0, h * 0.54, 0.0)
		var tip_p := base_p + dir * arch + Vector3(0.0, h, 0.0)

		var t0 := (mid_p - base_p).normalized()
		var t1 := (tip_p - mid_p).normalized()
		var n0 := side.cross(t0).normalized()
		var n1 := side.cross(t1).normalized()
		if n0.y < 0.0:
			n0 = -n0
		if n1.y < 0.0:
			n1 = -n1

		var v0 := verts.size()
		verts.append(base_p - side * hw0)
		verts.append(base_p + side * hw0)
		verts.append(mid_p - side * hw1)
		verts.append(mid_p + side * hw1)
		verts.append(tip_p)

		norms.append((n0 - side * 0.22).normalized())
		norms.append((n0 + side * 0.22).normalized())
		norms.append((n1 - side * 0.18).normalized())
		norms.append((n1 + side * 0.18).normalized())
		norms.append((n1 + Vector3(0.0, 0.35, 0.0)).normalized())

		uvs.append(Vector2(0.0, 0.0))
		uvs.append(Vector2(1.0, 0.0))
		uvs.append(Vector2(0.15, 0.54))
		uvs.append(Vector2(0.85, 0.54))
		uvs.append(Vector2(0.5, 1.0))

		indices.append_array([
			v0, v0 + 1, v0 + 2,
			v0 + 1, v0 + 3, v0 + 2,
			v0 + 2, v0 + 3, v0 + 4,
		])

	var arr := []
	arr.resize(Mesh.ARRAY_MAX)
	arr[Mesh.ARRAY_VERTEX] = verts
	arr[Mesh.ARRAY_NORMAL] = norms
	arr[Mesh.ARRAY_TEX_UV] = uvs
	arr[Mesh.ARRAY_INDEX] = indices
	var m := ArrayMesh.new()
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	return m


static func _build_plume_mesh(w: float, h: float) -> ArrayMesh:
	var verts := PackedVector3Array()
	var norms := PackedVector3Array()
	var uvs := PackedVector2Array()
	var indices := PackedInt32Array()
	var hw := w * 0.5
	for q in 2:
		var ang := float(q) * (PI * 0.5) + 0.32
		var side := Vector3(cos(ang), 0.0, sin(ang)) * hw
		var nrm := Vector3(-sin(ang), 0.35, cos(ang)).normalized()
		var v0 := verts.size()
		verts.append(Vector3(-side.x, -0.03, -side.z))
		verts.append(Vector3(side.x, -0.03, side.z))
		verts.append(Vector3(-side.x, h, -side.z))
		verts.append(Vector3(side.x, h, side.z))
		for _k in 4:
			norms.append(nrm)
		uvs.append(Vector2(0.0, 0.0))
		uvs.append(Vector2(1.0, 0.0))
		uvs.append(Vector2(0.0, 1.0))
		uvs.append(Vector2(1.0, 1.0))
		indices.append_array([v0, v0 + 1, v0 + 2, v0 + 1, v0 + 3, v0 + 2])
	var arr := []
	arr.resize(Mesh.ARRAY_MAX)
	arr[Mesh.ARRAY_VERTEX] = verts
	arr[Mesh.ARRAY_NORMAL] = norms
	arr[Mesh.ARRAY_TEX_UV] = uvs
	arr[Mesh.ARRAY_INDEX] = indices
	var m := ArrayMesh.new()
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	return m


static func _ghash(ix: int, iz: int, salt: int) -> int:
	var h := (ix * 374761393 + iz * 668265263 + salt * 1442695041) & 0x7fffffff
	h = ((h ^ (h >> 13)) * 1274126177) & 0x7fffffff
	return h ^ (h >> 16)


static func _gu01(h: int) -> float:
	return float(h & 0xffffff) / 16777216.0


static func _gpatch(x: float, z: float, cell_m: float, salt: int) -> float:
	var gx := x / cell_m
	var gz := z / cell_m
	var ix := int(floor(gx))
	var iz := int(floor(gz))
	var fx := gx - float(ix)
	var fz := gz - float(iz)
	fx = fx * fx * (3.0 - 2.0 * fx)
	fz = fz * fz * (3.0 - 2.0 * fz)
	var a := _gu01(_ghash(ix, iz, salt))
	var b := _gu01(_ghash(ix + 1, iz, salt))
	var c := _gu01(_ghash(ix, iz + 1, salt))
	var d := _gu01(_ghash(ix + 1, iz + 1, salt))
	return lerpf(lerpf(a, b, fx), lerpf(c, d, fx), fz)


func sync_origin(org: Array) -> void:
	var ov := Vector3(float(org[0]), float(org[1]), float(org[2]))
	_last_origin = ov
	_near_mat.set_shader_parameter("stream_origin", ov)
	_mid_mat.set_shader_parameter("stream_origin", ov)
	_plume_mat.set_shader_parameter("stream_origin", ov)


func clear_all() -> void:
	for mmi in [near_mmi, mid_mmi, plume_mmi]:
		if mmi != null and mmi.multimesh != null:
			mmi.multimesh.instance_count = 0
			mmi.visible = false
	last_counts = {"near": 0, "mid": 0, "plume": 0}


func update_at(stream: Node, cam_reg: Vector3, force := false) -> Dictionary:
	sync_origin(stream.origin)
	if not enabled or not stream.flora_enabled:
		clear_all()
		return last_counts
	if not force and cam_reg.distance_squared_to(_last_cam) < 18.0:
		return last_counts

	# Skip grass when flying high (> 86 m above ground) or subterranean/indoors
	var cam_gh: float = stream.height_at(cam_reg.x, cam_reg.z)
	if is_finite(cam_gh) and (cam_reg.y - cam_gh > 88.0 or cam_reg.y - cam_gh < -2.2):
		_last_cam = cam_reg
		clear_all()
		return last_counts
	var mrm: Dictionary = stream.monastery_room_at(cam_reg, 0.35)
	if not mrm.is_empty():
		_last_cam = cam_reg
		clear_all()
		return last_counts

	var t0 := Time.get_ticks_usec()
	_last_cam = cam_reg
	stream._ensure_road_and_built_caches()

	var ox := float(stream.origin[0])
	var oy := float(stream.origin[1])
	var oz := float(stream.origin[2])

	var near_buf := PackedFloat32Array()
	var mid_buf := PackedFloat32Array()
	var plume_buf := PackedFloat32Array()
	var near_n := _populate_ring(stream, cam_reg, ox, oy, oz, 0.0, NEAR_R, NEAR_STEP, 7103, 1.0, false, near_buf)
	var mid_n := _populate_ring(stream, cam_reg, ox, oy, oz, MID_R0, MID_R1, MID_STEP, 7309, 1.15, false, mid_buf)
	var plume_n := 0
	if KratorGroundLayers.plume_tex != null:
		plume_n = _populate_ring(stream, cam_reg, ox, oy, oz, 1.5, PLUME_R, PLUME_STEP, 7517, 1.0, true, plume_buf)

	_apply_buf(near_mmi, near_buf, near_n)
	_apply_buf(mid_mmi, mid_buf, mid_n)
	_apply_buf(plume_mmi, plume_buf, plume_n)

	last_build_ms = float(Time.get_ticks_usec() - t0) / 1000.0
	last_counts = {"near": near_n, "mid": mid_n, "plume": plume_n, "ms": snappedf(last_build_ms, 0.01)}
	return last_counts


static func _apply_buf(mmi: MultiMeshInstance3D, buf: PackedFloat32Array, cnt: int) -> void:
	mmi.multimesh.instance_count = cnt
	if cnt > 0:
		mmi.multimesh.buffer = buf
	mmi.visible = cnt > 0


static func _populate_ring(stream: Node, cam_reg: Vector3, ox: float, oy: float, oz: float,
		r_min: float, r_max: float, step: float, salt: int, sc_mul: float, is_plume: bool, out: PackedFloat32Array) -> int:
	var r_min2 := r_min * r_min
	var r_max2 := r_max * r_max
	var ix0 := int(floor((cam_reg.x - r_max) / step))
	var ix1 := int(floor((cam_reg.x + r_max) / step))
	var iz0 := int(floor((cam_reg.z - r_max) / step))
	var iz1 := int(floor((cam_reg.z + r_max) / step))
	var cnt := 0

	for iz in range(iz0, iz1 + 1):
		for ix in range(ix0, ix1 + 1):
			var h0 := _ghash(ix, iz, salt)
			var rx := (float(ix) + 0.12 + 0.76 * _gu01(h0)) * step
			var rz := (float(iz) + 0.12 + 0.76 * _gu01(_ghash(ix, iz, salt + 11))) * step
			var dx := rx - cam_reg.x
			var dz := rz - cam_reg.z
			var d2 := dx * dx + dz * dz
			if d2 < r_min2 or d2 > r_max2:
				continue

			var gs: Dictionary = stream.sample_grass_ground(rx, rz)
			if gs.is_empty():
				continue
			var gy: float = gs["y"]
			if dx * dx + (gy - cam_reg.y) * (gy - cam_reg.y) + dz * dz > r_max2:
				continue
			var rock_w: float = gs["rock"]
			var wet_w: float = gs["wet"]
			var slope: float = gs["slope"]
			var pave_w: float = gs["pave"]
			if wet_w >= 0.95 or pave_w > 0.25 or rock_w > 0.52 or slope > 0.36 or gy > 4150.0:
				continue

			# Natural clumping + ecological density fade toward rock, scree, and high snowline (seeded cell hash, never sin)
			var patch := _gpatch(rx, rz, 12.5, salt + 17)
			var dens := (1.0 - smoothstep(0.22, 0.52, rock_w)) * (1.0 - smoothstep(0.18, 0.36, slope)) * (1.0 - pave_w * 3.5)
			if gy > 3450.0:
				dens *= 1.0 - smoothstep(3450.0, 4150.0, gy)
			if is_plume:
				dens *= 0.42 * smoothstep(0.32, 0.78, patch)
			else:
				dens *= 0.72 + 0.28 * patch
			if _gu01(_ghash(ix, iz, salt + 23)) > dens:
				continue
			if not stream._is_clear_for_undergrowth(rx, rz, 0.45):
				continue

			var nrm: Vector3 = gs["nrm"]
			var col: Vector3 = gs["col"]
			var yaw := _gu01(_ghash(ix, iz, salt + 37)) * TAU
			var u_sc := _gu01(_ghash(ix, iz, salt + 43))
			var lush_k := (1.0 + 0.26 * clampf(wet_w, 0.0, 0.7)) * (1.0 - 0.30 * smoothstep(2600.0, 3600.0, gy))
			var sc := (0.74 + 0.58 * u_sc) * sc_mul * lush_k * (0.65 + 0.45 * patch)

			var up := Vector3.UP.lerp(nrm, 0.48).normalized()
			var fwd0 := Vector3(sin(yaw), 0.0, cos(yaw))
			var rgt := up.cross(fwd0)
			rgt = Vector3.RIGHT if rgt.length_squared() < 1e-5 else rgt.normalized()
			var fwd := rgt.cross(up).normalized()
			rgt *= sc
			up *= sc
			fwd *= sc

			# Ecological mode: 0=valley lush, 1=moist sedge, 2=High Rift steppe tussock, 3=alpine turf
			var eco := 0
			if gy > 3120.0:
				eco = 3
			elif rx > -45000.0:
				eco = 2
			elif wet_w > 0.32:
				eco = 1
			var phase := clampf(_gu01(_ghash(ix, iz, salt + 59)), 0.002, 0.996)
			var packed_a := float(eco) * 4.0 + phase

			var px := rx - ox
			var py := gy - oy
			var pz := rz - oz
			out.append(rgt.x); out.append(up.x); out.append(fwd.x); out.append(px)
			out.append(rgt.y); out.append(up.y); out.append(fwd.y); out.append(py)
			out.append(rgt.z); out.append(up.z); out.append(fwd.z); out.append(pz)
			out.append(col.x); out.append(col.y); out.append(col.z); out.append(packed_a)
			cnt += 1
	return cnt
