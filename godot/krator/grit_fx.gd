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

# grit by kind: how much is in the air, what size a mote is, and what colour. The numbers follow the kinds' own
# visibilities and winds in atmos_fx.gd rather than being chosen to look nice.
const GRIT := {
	# `size` is a mote in METRES, and they are metres wide on purpose. Grains were the first guess and they were
	# invisible: at 0.3 m a quad two hundred metres off is a fraction of a pixel, and nine thousand fractions of a
	# pixel are nothing. What a person in a karaburan sees is not grains but sheets and streamers of suspended dust
	# going past, which is metres across, so that is what these are.
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
	# A SOFT MOTE. An untextured QuadMesh is a hard-edged square, and at seven metres across that is exactly what the
	# storm looked like: a wall of brown tiles. The falloff below makes each one a puff, which is what suspended dust
	# and blown snow both actually read as.
	_mat.albedo_texture = _puff()
	# grit does not write depth: motes overlapping each other should add up, not punch holes in one another
	_mat.no_depth_test = false
	_mat.disable_receive_shadows = true
	q.material = _mat
	_p.draw_pass_1 = q
	_p.emitting = false
	add_child(_p)


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


func bind(c: Camera3D, f: KratorAtmosFx) -> void:
	cam = c
	fx = f


# the grit the current kind puts in the air, mid-ease like everything else atmos_fx reports
func row() -> Dictionary:
	if fx == null:
		return {}
	return GRIT.get(fx.kind, {})


func _process(_d: float) -> void:
	if cam == null or fx == null:
		return
	_p.global_position = cam.global_position
	var g: Dictionary = row()
	if g.is_empty():
		_p.emitting = false
		return
	var n: Dictionary = fx._now()
	# the box follows what the air lets you see: there is no point seeding grit past the fog
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
	# a mote is lit by the same dimmed sun as everything else, so it darkens with the kind rather than glowing.
	# NOT `colour * sun`: multiplying a Color scales its alpha with its channels, so in the black storm (sun 0.22)
	# that took the motes to a fifth of their opacity as well as a fifth of their brightness and the dust vanished.
	var dim: float = 0.45 + 0.55 * clampf(float(n.get("sun", 1.0)), 0.0, 1.5)
	_mat.albedo_color = Color(tint.r * dim, tint.g * dim, tint.b * dim,
		clampf(0.08 + 0.17 * float(g["amount"]), 0.0, 0.34))
	var qm: QuadMesh = _p.draw_pass_1
	var sz: float = float(g["size"]) * clampf(_box / 300.0, 0.6, 3.0)
	if absf(qm.size.x - sz) > 0.01:
		qm.size = Vector2(sz, sz)
