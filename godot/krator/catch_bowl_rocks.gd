# Rocks on the ground the sand does not cover (krator/catch_bowl.gd). The companion to the dune lines in
# shaders/catch_bowl_ground.gdshader: the shader gives the sand its relief, and this gives the scarps and the stony
# benches something with a silhouette, which no amount of shading can fake. Together they are "rocks or dune lines as
# appropriate" -- neither is drawn where the other belongs.
#
# WHY A SCATTER AND NOT MORE MESH. The heightfield is 2 km a sample: there is no geometry under a boulder's size and
# there never will be in this host. So the rocks are placed ON the sampled ground, in cells around the camera, and
# the set is rebuilt when the camera has moved far enough to matter. One MultiMesh, three boulder shapes.
#
# THE PLACEMENT IS core/rand's, not a new one. KRand.cell(seed, ix, iz) keys every cell by its own coordinates, so a
# rock is in the same place however the camera got there and whatever was drawn before it -- never a draw-order
# stream, never a sine hash (CLAUDE.md, "New placement draws from core/rand"). world_grass.gd does the same.
class_name KratorCatchBowlRocks
extends Node3D

const KRand := preload("res://tests/rand/krand.gd")
const SEED := 7731
const CELL := 420.0            # metres a cell
const REACH := 11              # cells from the camera: 11 x 420 m is about 4.6 km
const MOVED := 180.0           # rebuild once the camera has gone this far
const SAND_TOP := 2600.0       # the shader's own sand line: below it and flat, the sand has it

const ROCK_SHADER := preload("res://shaders/desert_rock.gdshader")

var host: Node3D               # catch_bowl.gd: height_at(x, z), surface_tint_at(x, z)
var cam: Camera3D
var mm: MultiMeshInstance3D
var rock_mat: ShaderMaterial
var _last := Vector3(1e12, 1e12, 1e12)
var _shapes: Array = []


func _ready() -> void:
	for i in 3:
		_shapes.append(_boulder(i))
	mm = MultiMeshInstance3D.new()
	mm.name = "Rocks"
	var m := MultiMesh.new()
	m.transform_format = MultiMesh.TRANSFORM_3D
	m.use_colors = true
	m.use_custom_data = true
	m.mesh = _shapes[0]
	m.instance_count = 0
	mm.multimesh = m
	rock_mat = ShaderMaterial.new()
	rock_mat.shader = ROCK_SHADER
	rock_mat.set_shader_parameter("family_mode", 0)
	rock_mat.set_shader_parameter("skirt_height", 3.4)
	rock_mat.set_shader_parameter("varnish_strength", 0.70)
	mm.material_override = rock_mat
	add_child(mm)


func bind_layers(ta: Texture2DArray, tn: Texture2DArray, rock_tile := 4.2, skirt_tile := 2.4) -> void:
	if rock_mat == null or ta == null or tn == null:
		return
	rock_mat.set_shader_parameter("gl_albedo", ta)
	rock_mat.set_shader_parameter("gl_nr", tn)
	rock_mat.set_shader_parameter("rock_tile_m", rock_tile)
	rock_mat.set_shader_parameter("skirt_tile_m", skirt_tile)
	rock_mat.set_shader_parameter("has_layers", true)


# A boulder: a sphere pulled about by core/rand until it is no longer a sphere. Three of them is enough variety at
# the distance any of these are ever seen from, and jittering the arrays costs nothing once.
func _boulder(k: int) -> ArrayMesh:
	var sp := SphereMesh.new()
	sp.radial_segments = 7
	sp.rings = 4
	sp.radius = 1.0
	sp.height = 2.0
	var arr: Array = sp.get_mesh_arrays()
	var vs: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
	var out := PackedVector3Array()
	out.resize(vs.size())
	for i in vs.size():
		var h := KRand.cell(SEED + k * 97, i, k)
		var r: float = 0.62 + 0.55 * KRand.unit(h)
		var v: Vector3 = vs[i]
		# squat: a boulder sits, it does not float like a ball
		out[i] = Vector3(v.x * r, v.y * r * 0.66, v.z * r)
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var idx: PackedInt32Array = arr[Mesh.ARRAY_INDEX]
	for i in idx.size():
		st.set_color(Color.WHITE)
		st.add_vertex(out[idx[i]])
	st.generate_normals()
	return st.commit()


func bind(h: Node3D, c: Camera3D) -> void:
	host = h
	cam = c
	if host and "layer_albedo_arr" in host and host.layer_albedo_arr != null:
		bind_layers(host.layer_albedo_arr, host.layer_nr_arr)


func _process(_d: float) -> void:
	if host == null or cam == null:
		return
	var p := cam.global_position
	if Vector2(p.x - _last.x, p.z - _last.z).length() < MOVED:
		return
	_last = p
	_rebuild(p)


func _rebuild(p: Vector3) -> void:
	var tf: Array[Transform3D] = []
	var cols: PackedColorArray = PackedColorArray()
	var cust: PackedColorArray = PackedColorArray()
	var has_tint := host.has_method("surface_tint_at")
	var cx := int(floor(p.x / CELL))
	var cz := int(floor(p.z / CELL))
	for dz in range(-REACH, REACH + 1):
		for dx in range(-REACH, REACH + 1):
			var ix := cx + dx
			var iz := cz + dz
			var h0 := KRand.cell(SEED, ix, iz)
			# how many in this cell: most cells have none, so a field reads as scattered rather than as gravel
			var n := 0
			var u0 := KRand.unit(h0)
			if u0 > 0.52:
				n = 2 + int(u0 * 17.0) % 4
			if n == 0:
				continue
			for j in n:
				var h := KRand.mix32(h0 + j * 2654435761)
				var ux := KRand.unit(h)
				var uz := KRand.unit(KRand.mix32(h + 1))
				var us := KRand.unit(KRand.mix32(h + 2))
				var uy := KRand.unit(KRand.mix32(h + 3))
				var x := (float(ix) + ux) * CELL
				var z := (float(iz) + uz) * CELL
				var g: float = host.height_at(x, z)
				# WHERE ROCKS BELONG: off the sand. Either the ground is above the sand line, or it is steep enough
				# that sand will not lie on it. On the flat salt below the line there is nothing but salt.
				var d := CELL * 0.75
				var sx: float = (host.height_at(x + d, z) - host.height_at(x - d, z)) / (2.0 * d)
				var sz: float = (host.height_at(x, z + d) - host.height_at(x, z - d)) / (2.0 * d)
				var slope: float = sqrt(sx * sx + sz * sz)
				if g < SAND_TOP and slope < 0.055:
					continue
				var dist := Vector2(x - p.x, z - p.z).length()
				if dist > CELL * float(REACH):
					continue
				var s: float = (6.0 + 34.0 * us * us) * (1.0 + clampf(slope * 4.0, 0.0, 1.2))
				var t := Transform3D(Basis(Vector3.UP, uy * TAU).scaled(Vector3(s, s * (0.55 + 0.4 * us), s)),
					Vector3(x, g - s * 0.16, z))   # sunk a little: a boulder is bedded, not balanced
				tf.append(t)
				var shade: float = 0.78 + 0.24 * KRand.unit(KRand.mix32(h + 4))
				cols.append(Color(0.42 * shade, 0.36 * shade, 0.31 * shade))
				var gt: Color = host.surface_tint_at(x, z) if has_tint else Color(0.55, 0.44, 0.31)
				cust.append(Color(gt.r, gt.g, gt.b, g))
	var m := mm.multimesh
	m.instance_count = tf.size()
	for i in tf.size():
		m.set_instance_transform(i, tf[i])
		m.set_instance_color(i, cols[i])
		m.set_instance_custom_data(i, cust[i])
