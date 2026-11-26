# Desert heat shimmer & grazing-angle inferior mirage (shaders/shimmer.gdshader; twin of core/atmos/fx/89-atmos-fx-shimmer.js).
#   - Thermal boil: upward-drifting turbulent refraction over warm ground (KTHERM raster or low-altitude desert basins).
#   - Inferior mirage: shimmering inverted sky/ridge reflection at grazing view angles (< 1.25 deg) over hot flats & salt pans.
# Automatically disables its full-screen quad (`visible = false`, zero GPU/backbuffer cost) in rain, gale, whiteout, or night.
class_name KratorShimmerFx
extends Node3D

const SHIMMER_SHADER := preload("res://shaders/shimmer.gdshader")

# Weather presets: [boil_strength, mirage_strength]
const WEATHER_SHIMMER := {
	"clear": [0.45, 0.58],
	"deadheat": [1.05, 1.00],
	"duststorm_season": [0.20, 0.22],
	"dust": [0.0, 0.0],
	"gale": [0.0, 0.0],
	"whiteout": [0.0, 0.0],
	"monsoon": [0.0, 0.0],
}

var cam: Camera3D
var fx: Node
var sun: DirectionalLight3D
var quad: MeshInstance3D
var mat: ShaderMaterial
var enabled := true
var master_scale := 1.0
var time_s := 0.0
var current_boil := 0.0
var current_mirage := 0.0


func _init() -> void:
	name = "ShimmerFx"
	var q := QuadMesh.new()
	q.size = Vector2(2.0, 2.0)
	mat = ShaderMaterial.new()
	mat.shader = SHIMMER_SHADER
	mat.render_priority = 126   # after opaque, water, and dust_slab (125)
	quad = MeshInstance3D.new()
	quad.name = "ShimmerQuad"
	quad.mesh = q
	quad.material_override = mat
	quad.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	quad.custom_aabb = AABB(Vector3(-1e7, -1e7, -1e7), Vector3(2e7, 2e7, 2e7))
	quad.layers = 1
	quad.visible = false
	add_child(quad)


func bind(c: Camera3D, f: Node = null, s: DirectionalLight3D = null) -> void:
	cam = c
	fx = f
	sun = s


# Bind an explicit KTHERM field Dictionary {x0, z0, cell, nx, nz, T (PackedFloat32Array or Array of degC)}
func set_thermal_field(field: Dictionary, t0 := 25.0, t1 := 70.0) -> void:
	var nx := int(field.get("nx", 0))
	var nz := int(field.get("nz", 0))
	var cell := float(field.get("cell", 0.0))
	var temps = field.get("T", [])
	if nx < 2 or nz < 2 or cell <= 0.0 or temps.size() != nx * nz:
		mat.set_shader_parameter("has_heat_tex", false)
		return
	var bytes := shimmer_bytes(field, t0, t1)
	var img := Image.create_from_data(nx, nz, false, Image.FORMAT_RGBA8, bytes)
	var tex := ImageTexture.create_from_image(img)
	mat.set_shader_parameter("heat_tex", tex)
	mat.set_shader_parameter("heat_box", Vector4(float(field.get("x0", 0.0)), float(field.get("z0", 0.0)), float(nx - 1) * cell, float(nz - 1) * cell))
	mat.set_shader_parameter("heat_dims", Vector2(float(nx), float(nz)))
	mat.set_shader_parameter("has_heat_tex", true)


static func _ss(a: float, b: float, x: float) -> float:
	var t := clampf((x - a) / maxf(b - a, 1e-6), 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)


# Pure CPU twin of ATMOS.shimmerBytes (core/atmos/fx/89-atmos-fx-shimmer.js)
static func shimmer_bytes(field: Dictionary, t0 := 25.0, t1 := 70.0) -> PackedByteArray:
	var nx := int(field["nx"])
	var nz := int(field["nz"])
	var temps = field["T"]
	var out := PackedByteArray()
	out.resize(nx * nz * 4)
	for j in nz:
		for i in nx:
			var k := (j * nx + i) * 4
			var v := int(roundf(_ss(t0, t1, float(temps[j * nx + i])) * 255.0))
			out[k] = v
			out[k + 1] = 0
			out[k + 2] = 0
			out[k + 3] = 255
	return out


# Pure CPU twin of ATMOS.shimmerK (core/atmos/fx/89-atmos-fx-shimmer.js)
static func shimmer_k(field: Dictionary, x: float, z: float, dist: float, t0 := 25.0, t1 := 70.0, near_m := 6.0, far_m := 90.0) -> float:
	var nx := int(field["nx"])
	var nz := int(field["nz"])
	var cell := float(field["cell"])
	var u := clampf((x - float(field.get("x0", 0.0))) / cell, 0.0, float(nx - 1))
	var v := clampf((z - float(field.get("z0", 0.0))) / cell, 0.0, float(nz - 1))
	var i := mini(nx - 2, int(floorf(u)))
	var j := mini(nz - 2, int(floorf(v)))
	var fu := u - float(i)
	var fv := v - float(j)
	var B := shimmer_bytes(field, t0, t1)
	var b00 := float(B[(j * nx + i) * 4]) / 255.0
	var b10 := float(B[(j * nx + i + 1) * 4]) / 255.0
	var b01 := float(B[((j + 1) * nx + i) * 4]) / 255.0
	var b11 := float(B[((j + 1) * nx + i + 1) * 4]) / 255.0
	var h := (b00 * (1.0 - fu) + b10 * fu) * (1.0 - fv) + (b01 * (1.0 - fu) + b11 * fu) * fv
	return h * _ss(near_m, far_m, dist)


# Pure CPU twin of the grazing-angle inferior desert mirage factor (0..1)
static func mirage_k(cam_pos: Vector3, hit_pos: Vector3, hot_top_y := 2400.0, near_m := 160.0, far_m := 1800.0, max_grazing_sin := 0.022) -> float:
	var dv := hit_pos - cam_pos
	var dist := dv.length()
	if dist < 1e-3:
		return 0.0
	var ray := dv / dist
	var graze := (1.0 - smoothstep(0.0015, maxf(max_grazing_sin, 0.003), absf(ray.y))) \
		* smoothstep(near_m, far_m, dist) * (1.0 - smoothstep(35000.0, 120000.0, dist))
	var low_eye := 1.0 - smoothstep(80.0, 420.0, maxf(0.0, cam_pos.y - hit_pos.y))
	var low_boost := 1.0 + 0.35 * (1.0 - smoothstep(-1200.0, 200.0, hit_pos.y))
	var h_k := clampf((1.0 - smoothstep(hot_top_y - 700.0, hot_top_y + 900.0, hit_pos.y)) * low_boost, 0.0, 1.0)
	return graze * low_eye * h_k


func _process(dt: float) -> void:
	if not enabled or master_scale <= 0.001:
		quad.visible = false
		return
	time_s += dt
	var target_boil := 0.45
	var target_mir := 0.55
	if fx != null and "kind" in fx:
		var pair: Array = WEATHER_SHIMMER.get(String(fx.kind), [0.0, 0.0])
		target_boil = float(pair[0])
		target_mir = float(pair[1])
	# Scale by sun elevation so shimmer peaks under midday/afternoon sun and vanishes at night
	var sun_k := 1.0
	if sun != null:
		var sdir := sun.global_transform.basis.z.normalized()
		sun_k = smoothstep(0.05, 0.42, sdir.y)
	target_boil *= sun_k * master_scale
	target_mir *= sun_k * master_scale

	current_boil = move_toward(current_boil, target_boil, dt * 0.6)
	current_mirage = move_toward(current_mirage, target_mir, dt * 0.6)
	var active := current_boil > 0.003 or current_mirage > 0.003
	quad.visible = active
	if not active:
		return
	mat.set_shader_parameter("shimmer_params", Vector4(current_boil, 0.0035, 1.2, 34.0))
	mat.set_shader_parameter("shimmer_ramp", Vector4(6.0, 120.0, 2400.0, time_s))
	mat.set_shader_parameter("mirage_params", Vector4(current_mirage, 160.0, 1800.0, 0.022))
