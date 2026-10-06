# What the Atmos weather looks like (core/atmos/89-atmos-4-weather.js, drawn in Godot): rain as a GPUParticles3D box
# that rides the camera, its density the weather's rain and its slant the wind; lightning as a jagged ribbon at the
# bearing and distance Atmos.strike gives, lit while Atmos.flash lasts. core/atmos/GODOT.md's particle table: the
# rain may later gain a collision heightfield and splashes.
extends Node3D

var cam: Camera3D
var rain: GPUParticles3D
var rain_pm: ParticleProcessMaterial
var bolt: MeshInstance3D
var bolt_mat: StandardMaterial3D
var rng := RandomNumberGenerator.new()
const BOX := 120.0          # presets.rain.box / 2


func _ready() -> void:
	rain = GPUParticles3D.new()
	rain.amount = 6000
	rain.lifetime = 2.2
	rain.preprocess = 2.2
	rain.local_coords = false
	rain.visibility_aabb = AABB(Vector3(-BOX, -BOX, -BOX), Vector3(BOX, BOX, BOX) * 2.0)
	rain_pm = ParticleProcessMaterial.new()
	rain_pm.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	rain_pm.emission_box_extents = Vector3(BOX, 2.0, BOX)
	rain_pm.direction = Vector3(0, -1, 0)
	rain_pm.spread = 2.0
	rain_pm.initial_velocity_min = 55.0
	rain_pm.initial_velocity_max = 65.0      # presets.rain.fall
	rain_pm.gravity = Vector3.ZERO
	rain_pm.particle_flag_align_y = true
	rain.process_material = rain_pm
	var q := QuadMesh.new()
	q.size = Vector2(0.03, 2.4)                # presets.rain.streak
	var m := StandardMaterial3D.new()
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.albedo_color = Color(0.75, 0.8, 0.88, 0.35)
	m.billboard_mode = BaseMaterial3D.BILLBOARD_FIXED_Y
	m.billboard_keep_scale = true
	q.material = m
	rain.draw_pass_1 = q
	rain.emitting = false
	add_child(rain)
	bolt = MeshInstance3D.new()
	bolt_mat = StandardMaterial3D.new()
	bolt_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	bolt_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	bolt_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	bolt_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	bolt_mat.albedo_color = Color(0.91, 0.93, 1.0, 0.0)
	bolt.visible = false
	add_child(bolt)
	Atmos.strike.connect(_on_strike)


func _process(_d: float) -> void:
	if cam:
		rain.global_position = cam.global_position + Vector3(0, BOX * 0.6, 0)
	var r: float = Atmos.rain
	rain.emitting = r > 0.01
	rain.amount_ratio = clampf(r, 0.0, 1.0)
	var w: Vector2 = Atmos.wind_now()
	rain_pm.direction = Vector3(w.x * 0.25, -1.0, w.y * 0.25).normalized()   # presets.rain.slant
	bolt_mat.albedo_color.a = minf(1.0, Atmos.flash * 1.5)
	bolt.visible = Atmos.flash > 0.01


func _on_strike(bearing: float, dist: float) -> void:
	var c := cam.global_position if cam else Vector3.ZERO
	var cx := c.x + cos(bearing) * dist
	var cz := c.z + sin(bearing) * dist
	var top := 380.0 + rng.randf() * 120.0
	var base := 0.0
	var sx := -sin(bearing)
	var sz := cos(bearing)
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLE_STRIP)
	var x := cx
	var z := cz
	for k in 15:
		var y := top + (base - top) * k / 14.0
		if k > 0:
			x += (rng.randf() - 0.5) * 40.0
			z += (rng.randf() - 0.5) * 40.0
		var w := 3.2 - 2.4 * k / 14.0
		st.add_vertex(Vector3(x - sx * w, y, z - sz * w))
		st.add_vertex(Vector3(x + sx * w, y, z + sz * w))
	bolt.mesh = st.commit()
	bolt.material_override = bolt_mat
