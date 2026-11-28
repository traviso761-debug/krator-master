# What is actually in the air, drawn: the dust of the Catch's black storm, the spindrift of the God-Bore, and the rime
# of the Godsgate's whiteout. krator/atmos_fx.gd's own header listed this as the thing it owed -- "the dust as
# particles riding the camera (krator/weather_fx.gd's rain box is the shape to copy), the spindrift of a gale" -- and
# this is that, on the same shape: one GPUParticles3D box that rides the camera, its density the kind's `grit` and its
# direction the kind's wind.
#
# WHY A BOX THAT RIDES THE CAMERA, over a region 1,284 km across. Grit is only ever seen within a few hundred metres;
# filling the region with it would cost everything and show nothing. The box is sized from the kind's own Koschmieder
# visibility, so in a 400 m black storm the grit fills the 400 m you can see and stops, and in the 20 km God-Bore it
# is a thin streaming at the edges of vision. The fog behind it is what carries the distance; this only gives the air
# something to be.
#
# It draws nothing for the kinds that have no grit (clear, dead heat, the monsoon -- the monsoon is rain, which is
# weather_fx.gd's box, not this one).
class_name KratorGritFx
extends Node3D

var cam: Camera3D
var fx: KratorAtmosFx
var _p: GPUParticles3D
var _pm: ParticleProcessMaterial
var _mat: StandardMaterial3D
var _box := 300.0
var _rng := RandomNumberGenerator.new()
# SALTATION: the sand that is always moving. Separate from the storm grit, because it is not weather -- a dune field
# in clear air is never still, it is a sheet of grains hopping downwind a few centimetres off the surface, and that
# low streaming is most of what tells you the wind is blowing at all. It hugs the ground, so it only emits when the
# camera is low enough to be in it, and its speed and density follow the kind's wind.
const SALT_SHADER := preload("res://shaders/saltation.gdshader")
const KRand := preload("res://tests/rand/krand.gd")
const DEVIL_COUNT := 3
const DEVIL_CELL := 1100.0
const DEVIL_SEED := 9187

var _salt: GPUParticles3D
var _salt_pm: ParticleProcessMaterial
var _salt_mat: ShaderMaterial
var _devils: Array[GPUParticles3D] = []
var _devil_mats: Array[ShaderMaterial] = []
var _devil_t := 0.0
var host: Node3D

# grit by kind: how much is in the air, what size a mote is, and what colour. The numbers follow the kinds' own
# visibilities and winds in atmos_fx.gd rather than being chosen to look nice.
const GRIT := {
	"dust": {"amount": 1.0, "size": 7.0, "fall": 2.0, "tint": Color(0.60, 0.44, 0.26)},
	"duststorm_season": {"amount": 0.3, "size": 5.0, "fall": 1.2, "tint": Color(0.68, 0.58, 0.42)},
	"gale": {"amount": 0.45, "size": 3.0, "fall": 0.6, "tint": Color(0.86, 0.84, 0.80)},
	"whiteout": {"amount": 0.75, "size": 2.0, "fall": 3.0, "tint": Color(0.97, 0.98, 1.00)},
}


func _ready() -> void:
	_p = GPUParticles3D.new()
	_p.amount = 7000
	_p.lifetime = 2.4
	_p.preprocess = 2.4
	_p.local_coords = false
	_p.visibility_aabb = AABB(Vector3(-_box, -_box, -_box), Vector3(_box, _box, _box) * 2.0)
	_pm = ParticleProcessMaterial.new()
	_pm.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	_pm.emission_box_extents = Vector3(_box, _box * 0.6, _box)
	_pm.direction = Vector3(1, -0.1, 0)
	_pm.spread = 25.0
	_pm.gravity = Vector3.ZERO
	_pm.initial_velocity_min = 20.0
	_pm.initial_velocity_max = 40.0
	_pm.particle_flag_align_y = false
	_p.process_material = _pm
	var q := QuadMesh.new()
	q.size = Vector2(6.0, 6.0)
	_mat = StandardMaterial3D.new()
	_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_mat.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	_mat.billboard_keep_scale = true
	_mat.albedo_color = Color(0.5, 0.4, 0.25, 0.5)
	_mat.albedo_texture = _puff()
	_mat.no_depth_test = false
	_mat.disable_receive_shadows = true
	q.material = _mat
	_p.draw_pass_1 = q
	_p.emitting = false
	add_child(_p)

	# SALTATION: ground-hugging blown sand ribbons lit by forward sun scatter (shaders/saltation.gdshader)
	_salt = GPUParticles3D.new()
	_salt.name = "Saltation"
	_salt.amount = 420
	_salt.lifetime = 1.6
	_salt.preprocess = 1.6
	_salt.local_coords = false
	_salt.visibility_aabb = AABB(Vector3(-180.0, -35.0, -180.0), Vector3(360.0, 100.0, 360.0))
	_salt_pm = ParticleProcessMaterial.new()
	_salt_pm.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	_salt_pm.emission_box_extents = Vector3(140.0, 1.2, 140.0)   # saltation is a low sheet centimetres to a metre deep
	_salt_pm.direction = Vector3(1, 0.04, 0)
	_salt_pm.spread = 8.0
	_salt_pm.gravity = Vector3(0, -0.5, 0)
	_salt_pm.initial_velocity_min = 6.5
	_salt_pm.initial_velocity_max = 14.0
	_salt_pm.particle_flag_align_y = true
	_salt.process_material = _salt_pm
	var sq := QuadMesh.new()
	sq.size = Vector2(0.42, 1.30)
	_salt_mat = ShaderMaterial.new()
	_salt_mat.shader = SALT_SHADER
	_salt_mat.set_shader_parameter("is_streak", true)
	_salt_mat.set_shader_parameter("billboard_kind", 0)   # aligned along velocity vector via particle_flag_align_y
	_salt_mat.set_shader_parameter("mie_gain", 0.45)
	sq.material = _salt_mat
	_salt.draw_pass_1 = sq
	_salt.emitting = false
	add_child(_salt)

	# DUST DEVILS: 3 pooled helical thermal columns drifting across hot flat basins in clear / deadheat afternoons
	for i in DEVIL_COUNT:
		var dv := _make_dust_devil(i)
		add_child(dv)
		_devils.append(dv)


func _make_dust_devil(idx: int) -> GPUParticles3D:
	var p := GPUParticles3D.new()
	p.name = "DustDevil%d" % idx
	p.amount = 140
	p.lifetime = 4.2
	p.preprocess = 4.2
	p.local_coords = true
	p.visibility_aabb = AABB(Vector3(-60.0, -10.0, -60.0), Vector3(120.0, 190.0, 120.0))
	p.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	var pm := ParticleProcessMaterial.new()
	pm.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_RING
	pm.emission_ring_axis = Vector3.UP
	pm.emission_ring_height = 6.0
	pm.emission_ring_radius = 6.5
	pm.emission_ring_inner_radius = 2.2
	pm.direction = Vector3(0.05, 1.0, 0.03)
	pm.spread = 8.0
	pm.initial_velocity_min = 18.0
	pm.initial_velocity_max = 28.0
	pm.gravity = Vector3(0.8, 2.2, 0.3)
	pm.orbit_velocity_min = 0.55
	pm.orbit_velocity_max = 0.95
	pm.radial_velocity_min = 1.2
	pm.radial_velocity_max = 3.4
	var grow := Curve.new()
	grow.add_point(Vector2(0.0, 0.45))
	grow.add_point(Vector2(0.55, 1.25))
	grow.add_point(Vector2(1.0, 2.35))
	var gt := CurveTexture.new()
	gt.curve = grow
	pm.scale_curve = gt
	var fade := Gradient.new()
	fade.set_color(0, Color(1, 1, 1, 0.0))
	fade.add_point(0.14, Color(1, 1, 1, 0.55))
	fade.add_point(0.72, Color(1, 1, 1, 0.32))
	fade.set_color(fade.get_point_count() - 1, Color(1, 1, 1, 0.0))
	var ft := GradientTexture1D.new()
	ft.gradient = fade
	pm.color_ramp = ft
	p.process_material = pm
	var q := QuadMesh.new()
	q.size = Vector2(9.5, 9.5)
	var sm := ShaderMaterial.new()
	sm.shader = SALT_SHADER
	sm.set_shader_parameter("is_streak", false)
	sm.set_shader_parameter("billboard_kind", 2)
	sm.set_shader_parameter("mie_gain", 0.65)
	sm.set_shader_parameter("base_tint", Vector4(0.78, 0.66, 0.46, 0.34))
	q.material = sm
	p.draw_pass_1 = q
	p.emitting = false
	_devil_mats.append(sm)
	return p


# a round, soft-edged mote: alpha 1 at the centre falling to 0 at the rim, squared so the edge is gentle
static func _puff(n := 64) -> ImageTexture:
	var img := Image.create(n, n, false, Image.FORMAT_RGBAF)
	var c := (n - 1) * 0.5
	for y in n:
		for x in n:
			var d: float = sqrt(pow(x - c, 2.0) + pow(y - c, 2.0)) / c
			var a: float = clampf(1.0 - d, 0.0, 1.0)
			img.set_pixel(x, y, Color(1.0, 1.0, 1.0, a * a))
	return ImageTexture.create_from_image(img)


func bind(c: Camera3D, f: KratorAtmosFx, h: Node3D = null) -> void:
	cam = c
	fx = f
	host = h


# the grit the current kind puts in the air, mid-ease like everything else atmos_fx reports
func row() -> Dictionary:
	if fx == null:
		return {}
	return GRIT.get(fx.kind, {})


func _process(dt: float) -> void:
	if cam == null or fx == null:
		return
	_devil_t += dt
	_salt_tick()
	_devils_tick()
	_p.global_position = cam.global_position
	var g: Dictionary = row()
	if g.is_empty():
		_p.emitting = false
		return
	var n: Dictionary = fx._now()
	var vis: float = maxf(60.0, float(n.get("visibility_km", 1.0)) * 1000.0)
	var want: float = clampf(vis * 0.55, 80.0, 900.0)
	if absf(want - _box) > 20.0:
		_box = want
		_pm.emission_box_extents = Vector3(_box, _box * 0.6, _box)
		_p.visibility_aabb = AABB(Vector3(-_box, -_box, -_box), Vector3(_box, _box, _box) * 2.0)
	_p.emitting = true
	_p.amount_ratio = clampf(float(g["amount"]), 0.0, 1.0)
	var wind: float = float(n.get("wind", 1.0))
	var w := Vector2(1.0, 0.25)
	var A := get_node_or_null("/root/Atmos")
	if A and A.has_method("wind_now"):
		w = A.wind_now()
	_pm.direction = Vector3(w.x, -float(g["fall"]) / maxf(1.0, wind * 8.0), w.y).normalized()
	_pm.initial_velocity_min = 8.0 * wind
	_pm.initial_velocity_max = 22.0 * wind
	var tint: Color = g["tint"]
	var dim: float = 0.45 + 0.55 * clampf(float(n.get("sun", 1.0)), 0.0, 1.5)
	_mat.albedo_color = Color(tint.r * dim, tint.g * dim, tint.b * dim,
		clampf(0.08 + 0.17 * float(g["amount"]), 0.0, 0.34))
	var qm: QuadMesh = _p.draw_pass_1
	var sz: float = float(g["size"]) * clampf(_box / 300.0, 0.6, 3.0)
	if absf(qm.size.x - sz) > 0.01:
		qm.size = Vector2(sz, sz)


# The blown sand (saltation), which is on in any weather with wind over dry desert sand, boosted along dune crests.
func _salt_tick() -> void:
	var c := cam.global_position
	var g: float = 0.0
	var rain_mm: float = 18.0
	if host and host.has_method("height_at"):
		g = host.height_at(c.x, c.z)
	if host and host.has_method("rain_mm_at"):
		rain_mm = float(host.rain_mm_at(c.x, c.z))
	var up: float = c.y - g
	var low: float = 1.0 - clampf((up - 18.0) / 75.0, 0.0, 1.0)
	var n: Dictionary = fx._now()
	var wind: float = float(n.get("wind", 1.0))
	var arid_ground: float = clampf(1.0 - (rain_mm - 880.0) / 220.0, 0.0, 1.0)
	var sandy: float = clampf(1.0 - (g - 2300.0) / 900.0, 0.0, 1.0) * (1.0 - float(n.get("rain", 0.0))) * arid_ground
	var w := Vector2(0.80, -0.60)
	var A := get_node_or_null("/root/Atmos")
	if A and A.has_method("wind_now"):
		w = A.wind_now()
	var wn := w.normalized() if w.length_squared() > 1e-5 else Vector2(0.80, -0.60)
	# Dune-crest blow-off modulation: stronger plumes streaming off transverse crests (spacing 260 m, brink at 0.72)
	var crest_phase := fposmod(Vector2(c.x, c.z).dot(wn) / 260.0, 1.0)
	var db := (crest_phase - 0.72) / 0.18
	var crest_boost := 0.85 + 0.35 * exp(-db * db)
	var amt: float = clampf(low * sandy * clampf(wind * 0.50, 0.0, 1.0) * crest_boost, 0.0, 1.0)
	_salt.emitting = amt > 0.03
	if not _salt.emitting:
		return
	_salt.global_position = Vector3(c.x, g + 0.8, c.z)
	_salt.amount_ratio = amt
	_salt_pm.direction = Vector3(wn.x, 0.04, wn.y).normalized()
	_salt_pm.initial_velocity_min = 6.0 * wind
	_salt_pm.initial_velocity_max = 13.5 * wind
	var dim: float = 0.5 + 0.5 * clampf(float(n.get("sun", 1.0)), 0.0, 1.3)
	_salt_mat.set_shader_parameter("base_tint", Vector4(0.76 * dim, 0.64 * dim, 0.44 * dim, 0.06 + 0.08 * amt))


# Deterministic helical dust devils wandering across flat warm dry basins in clear, deadheat & duststorm_season weather
func _devils_tick() -> void:
	if host == null or not host.has_method("height_at") or _devils.is_empty():
		return
	var k := String(fx.kind)
	var active_weather := k in ["clear", "deadheat", "duststorm_season"]
	if not active_weather:
		for dv in _devils:
			dv.emitting = false
		return
	var cp := cam.global_position
	var up: float = cp.y - float(host.height_at(cp.x, cp.z))
	if up > 6500.0:
		for dv in _devils:
			dv.emitting = false
		return
	var cx := int(floor(cp.x / DEVIL_CELL))
	var cz := int(floor(cp.z / DEVIL_CELL))
	var offsets: Array[Vector2i] = [Vector2i(1, 0), Vector2i(-1, 1), Vector2i(0, -1)]
	var weather_k := 1.0 if k == "deadheat" else (0.72 if k == "clear" else 0.55)
	for i in DEVIL_COUNT:
		var dv := _devils[i]
		var cell_ix: int = cx + offsets[i].x
		var cell_iz: int = cz + offsets[i].y
		var h0 := KRand.cell(DEVIL_SEED + i * 31, cell_ix, cell_iz)
		if KRand.unit(h0) < 0.32:
			dv.emitting = false
			continue
		var bx := (float(cell_ix) + 0.2 + 0.6 * KRand.unit(KRand.mix32(h0 + 1))) * DEVIL_CELL
		var bz := (float(cell_iz) + 0.2 + 0.6 * KRand.unit(KRand.mix32(h0 + 2))) * DEVIL_CELL
		# Slow drift along thermal track
		var ph := KRand.unit(KRand.mix32(h0 + 3)) * TAU + _devil_t * 0.08
		var wx := bx + cos(ph) * 140.0
		var wz := bz + sin(ph * 0.7) * 140.0
		var gy: float = host.height_at(wx, wz)
		var rain_here: float = float(host.rain_mm_at(wx, wz)) if host.has_method("rain_mm_at") else 18.0
		var sx: float = absf(host.height_at(wx + 250.0, wz) - host.height_at(wx - 250.0, wz)) / 500.0
		var sz: float = absf(host.height_at(wx, wz + 250.0) - host.height_at(wx, wz - 250.0)) / 500.0
		if gy > 2400.0 or (sx + sz) > 0.08 or rain_here > 880.0:
			dv.emitting = false
			continue
		dv.global_position = Vector3(wx, gy, wz)
		dv.emitting = true
		dv.amount_ratio = weather_k
		var gt: Color = host.surface_tint_at(wx, wz) if host.has_method("surface_tint_at") else Color(0.78, 0.66, 0.46)
		_devil_mats[i].set_shader_parameter("base_tint", Vector4(gt.r, gt.g, gt.b, 0.24 * weather_k))
