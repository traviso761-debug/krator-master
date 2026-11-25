# The Catch's own life, placed where the kit says it lives (biomes/catch/src/50-biome-catch-species.js). That file is
# the authority for every number and colour here, and its own header states the rule this follows:
#
#   "The floor gets ~18 mm of rain a year; what grows lives on GROUNDWATER: the tugai at the springs and along the
#    dead channels, the salt cedar on its sand mound, the dune shrub's broom on the sand, reeds where water stands,
#    and the halophytes on the salt."
#
# So nothing here is scattered evenly. Each species is placed against the thing it actually needs -- distance to
# water, the salt pan, the sand of an erg -- and that is what makes a desert read as a desert rather than as ground
# with plants on it: the life is in lines and patches because the water is.
#
# LIVE AND DEAD. The poplar's own harvest note: "it lives on groundwater ten metres down and dies standing when the
# water falls. Its dead stand a century." So a poplar near water is green and a poplar on a dead channel is a bare
# snag, and the snags are the commoner of the two, because the Catch has been drying for a long time. Fallen poplar
# wood ("bleached, iron-hard: the caravans burn it at the oases") lies with them.
#
# WHY PROXIES. The kit's meshes are three.js and this host is Godot, and the region is not cut, so there is no flora
# streaming to hook into. These are stand-ins at the kit's own heights and palettes -- enough to read at the distance
# this host is ever looked at, and to be replaced by the real kit when the region is cut.
class_name KratorCatchBowlFlora
extends Node3D

const KRand := preload("res://tests/rand/krand.gd")
const SEED := 4409
const CELL := 260.0
const REACH := 16
const MOVED := 160.0

# Each species: the kit's key, its height range and crown, its colour, and the ground it wants.
# H and crownR are the kit's own [min, max]; the colours are its PAL entries.
const SPECIES := {
	"poplar_live": {"h": [8.0, 16.0], "crown": [4.0, 7.5], "col": Color(0.478, 0.604, 0.290), "bark": Color(0.541, 0.510, 0.463), "trunk": true},
	"poplar_dead": {"h": [7.0, 14.0], "crown": [1.2, 2.2], "col": Color(0.784, 0.753, 0.698), "bark": Color(0.784, 0.753, 0.698), "trunk": true},
	"tamarisk": {"h": [3.0, 6.5], "crown": [2.5, 4.5], "col": Color(0.447, 0.502, 0.388), "bark": Color(0.478, 0.439, 0.388), "trunk": false},
	"broom": {"h": [0.8, 1.9], "crown": [0.7, 1.5], "col": Color(0.408, 0.541, 0.302), "bark": Color(0.408, 0.541, 0.302), "trunk": false},
	"saltbush": {"h": [0.4, 1.0], "crown": [0.6, 1.3], "col": Color(0.604, 0.659, 0.596), "bark": Color(0.604, 0.659, 0.596), "trunk": false},
	"brinelamp": {"h": [0.25, 0.5], "crown": [0.35, 0.7], "col": Color(0.541, 0.690, 0.627), "bark": Color(0.878, 0.910, 0.894), "trunk": false},
}

var host: Node3D
var cam: Camera3D
var _mm := {}
var _last := Vector3(1e12, 1e12, 1e12)
var _wd := PackedFloat32Array()     # distance to water, in samples, over the region grid
var _wn := 0
var _wz := 0
var _said := 0
var _springs: PackedVector2Array = PackedVector2Array()   # the oases, in world metres


func _ready() -> void:
	for k in SPECIES:
		var mi := MultiMeshInstance3D.new()
		mi.name = k
		var m := MultiMesh.new()
		m.transform_format = MultiMesh.TRANSFORM_3D
		m.use_colors = true
		m.mesh = _plant(k)
		m.instance_count = 0
		mi.multimesh = m
		var mat := StandardMaterial3D.new()
		mat.vertex_color_use_as_albedo = true
		mat.roughness = 1.0
		mat.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
		mi.material_override = mat
		add_child(mi)
		_mm[k] = mi


# A plant at unit scale: a trunk where the species has one, and a crown of crossed quads. Crude on purpose -- these
# are proxies for the kit's meshes, and at the distance this host is looked at a crown is a silhouette.
func _plant(key: String) -> ArrayMesh:
	var sp: Dictionary = SPECIES[key]
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var trunk: bool = sp["trunk"]
	if trunk:
		var r := 0.055
		for s in 5:
			var a0 := TAU * float(s) / 5.0
			var a1 := TAU * float(s + 1) / 5.0
			var p0 := Vector3(cos(a0) * r, 0.0, sin(a0) * r)
			var p1 := Vector3(cos(a1) * r, 0.0, sin(a1) * r)
			var q0 := Vector3(cos(a0) * r * 0.45, 0.62, sin(a0) * r * 0.45)
			var q1 := Vector3(cos(a1) * r * 0.45, 0.62, sin(a1) * r * 0.45)
			for v in [p0, p1, q1, p0, q1, q0]:
				st.add_vertex(v)
	# The crown: three crossed blades, which from any bearing gives a bushy outline. The blade is WIDEST IN THE
	# MIDDLE and narrow at both ends -- the first pass had it widest at the bottom and every tree came out as an
	# upside-down umbrella on a stick, which is the one shape no tree has.
	var base: float = 0.58 if trunk else 0.02
	var span := 1.0 - base
	# the profile of half a crown: height up the blade, and how wide it is there
	var prof := [Vector2(0.0, 0.18), Vector2(0.22, 0.72), Vector2(0.48, 1.0), Vector2(0.75, 0.86), Vector2(1.0, 0.0)]
	for b in 3:
		var a := PI * float(b) / 3.0
		var dx := cos(a)
		var dz := sin(a)
		for i in prof.size() - 1:
			var p0: Vector2 = prof[i]
			var p1: Vector2 = prof[i + 1]
			var y0: float = base + span * p0.x
			var y1: float = base + span * p1.x
			var l0: Vector3 = Vector3(-dx * p0.y, y0, -dz * p0.y)
			var r0: Vector3 = Vector3(dx * p0.y, y0, dz * p0.y)
			var l1: Vector3 = Vector3(-dx * p1.y, y1, -dz * p1.y)
			var r1: Vector3 = Vector3(dx * p1.y, y1, dz * p1.y)
			for v in [l0, r0, r1, l0, r1, l1]:
				st.add_vertex(v)
	st.generate_normals()
	return st.commit()


# THE OASES ARE THE WATER, and the model's mask does not know it. biomes/catch's own species header says the tugai
# grows "at the springs and along the dead channels", and its OASES records list five of them with pixels -- Kolli,
# Arfwai, Stair, Bitta, Lasso. But a seep and a lined well are not water BODIES, so wl.png has nothing at any of
# them, and keying the flora on the mask alone put not one poplar at an oasis: the only green in the region was
# missing from exactly the five places the region exists for. The mask still carries the real standing water; the
# springs are added to it.
const OASIS_SITES := ["Kolli", "Arfwai", "Stair", "Bitta", "Lasso"]


func bind(h: Node3D, c: Camera3D) -> void:
	host = h
	cam = c
	_water_field()
	var meta: Dictionary = h.meta if "meta" in h else {}
	var off: Array = meta.get("origin_offset_m", [0, 0])
	for st in meta.get("sites", []):
		var nm := String(st.get("name", ""))
		for o in OASIS_SITES:
			if nm.begins_with(o):
				_springs.append(Vector2(float(st["x"]) - float(off[0]), float(st["z"]) - float(off[1])))
				break
	print("  flora: %d springs from the kit's oases" % _springs.size())


# Distance to the nearest water, in grid samples, by a two-pass chamfer over the region's own water mask. One pass at
# load beats a search per plant: there are thousands of plants and 340,000 samples, and the field is the thing every
# species is placed against.
func _water_field() -> void:
	var img := Image.new()
	if img.load("res://data/catch-bowl/water.png") != OK:
		return
	_wn = img.get_width()
	_wz = img.get_height()
	_wd.resize(_wn * _wz)
	var BIG := 1.0e9
	for z in _wz:
		for x in _wn:
			_wd[z * _wn + x] = 0.0 if img.get_pixel(x, z).r > 0.5 else BIG
	for z in _wz:
		for x in _wn:
			var i := z * _wn + x
			var best: float = _wd[i]
			if x > 0:
				best = minf(best, _wd[i - 1] + 1.0)
			if z > 0:
				best = minf(best, _wd[i - _wn] + 1.0)
			if x > 0 and z > 0:
				best = minf(best, _wd[i - _wn - 1] + 1.4142)
			_wd[i] = best
	for z in range(_wz - 1, -1, -1):
		for x in range(_wn - 1, -1, -1):
			var i := z * _wn + x
			var best: float = _wd[i]
			if x < _wn - 1:
				best = minf(best, _wd[i + 1] + 1.0)
			if z < _wz - 1:
				best = minf(best, _wd[i + _wn] + 1.0)
			if x < _wn - 1 and z < _wz - 1:
				best = minf(best, _wd[i + _wn + 1] + 1.4142)
			_wd[i] = best


# km to the nearest water at a world point (the grid is 2 km a sample)
func water_km(x: float, z: float) -> float:
	if _wn == 0:
		return 999.0
	var best := 999.0
	if _wn > 0:
		var ix := clampi(int(x / 2000.0), 0, _wn - 1)
		var iz := clampi(int(z / 2000.0), 0, _wz - 1)
		best = _wd[iz * _wn + ix] * 2.0
	for sp in _springs:
		best = minf(best, Vector2(x - sp.x, z - sp.y).length() / 1000.0)
	return best


func _process(_d: float) -> void:
	if host == null or cam == null:
		return
	var p := cam.global_position
	if Vector2(p.x - _last.x, p.z - _last.z).length() < MOVED:
		return
	_last = p
	_rebuild(p)


func _rebuild(p: Vector3) -> void:
	var tf := {}
	var cols := {}
	for k in SPECIES:
		tf[k] = []
		cols[k] = PackedColorArray()
	var cx := int(floor(p.x / CELL))
	var cz := int(floor(p.z / CELL))
	for dz in range(-REACH, REACH + 1):
		for dx in range(-REACH, REACH + 1):
			var ix := cx + dx
			var iz := cz + dz
			var h0 := KRand.cell(SEED, ix, iz)
			var u0 := KRand.unit(h0)
			var x := (float(ix) + KRand.unit(KRand.mix32(h0 + 11))) * CELL
			var z := (float(iz) + KRand.unit(KRand.mix32(h0 + 12))) * CELL
			if Vector2(x - p.x, z - p.z).length() > CELL * float(REACH):
				continue
			var g: float = host.height_at(x, z)
			var d := CELL * 0.9
			var sx: float = (host.height_at(x + d, z) - host.height_at(x - d, z)) / (2.0 * d)
			var sz: float = (host.height_at(x, z + d) - host.height_at(x, z - d)) / (2.0 * d)
			var slope: float = sqrt(sx * sx + sz * sz)
			var wkm := water_km(x, z)
			var key := _species_for(g, slope, wkm, u0)
			if key == "":
				continue
			var n := 1 + int(u0 * 23.0) % 3
			for j in n:
				var h := KRand.mix32(h0 + j * 40503)
				var jx := x + (KRand.unit(h) - 0.5) * CELL * 0.8
				var jz := z + (KRand.unit(KRand.mix32(h + 1)) - 0.5) * CELL * 0.8
				var gy: float = host.height_at(jx, jz)
				var sp: Dictionary = SPECIES[key]
				var us := KRand.unit(KRand.mix32(h + 2))
				var hh: float = lerpf(sp["h"][0], sp["h"][1], us)
				var cr: float = lerpf(sp["crown"][0], sp["crown"][1], KRand.unit(KRand.mix32(h + 3)))
				var yaw := KRand.unit(KRand.mix32(h + 4)) * TAU
				var b := Basis(Vector3.UP, yaw).scaled(Vector3(cr, hh, cr))
				tf[key].append(Transform3D(b, Vector3(jx, gy, jz)))
				var sh: float = 0.82 + 0.3 * KRand.unit(KRand.mix32(h + 5))
				var c: Color = sp["col"]
				cols[key].append(Color(c.r * sh, c.g * sh, c.b * sh))
	var tally := []
	for k in SPECIES:
		var m: MultiMesh = _mm[k].multimesh
		var arr: Array = tf[k]
		m.instance_count = arr.size()
		for i in arr.size():
			m.set_instance_transform(i, arr[i])
			m.set_instance_color(i, cols[k][i])
		if arr.size() > 0:
			tally.append("%s %d" % [k, arr.size()])
	if _said < 2:
		_said += 1
		print("  flora at %d,%d: water %.1f km, %s" % [int(p.x / 2000.0), int(p.z / 2000.0),
			water_km(p.x, p.z), ", ".join(tally) if tally.size() else "NOTHING"])


# The kit's own rule, as a function. Nothing grows on rock, nothing grows on a slope, and almost nothing grows at all:
# the commonest answer is "".
func _species_for(g: float, slope: float, wkm: float, u: float) -> String:
	if slope > 0.12:
		return ""                                   # no life on the scarps
	if g < -800.0 and slope < 0.03:
		# the salt pan: halophytes only, and thinly
		if u > 0.93:
			return "brinelamp"
		if u > 0.84:
			return "saltbush"
		return ""
	if wkm < 8.0:
		# the tugai, where the groundwater still is: the only green in the region
		if u > 0.62:
			return "poplar_live"
		if u > 0.5:
			return "tamarisk"
		return ""
	if wkm < 40.0:
		# the dead channels: the water table fell and the poplars died standing, as the kit says they do
		if u > 0.88:
			return "poplar_dead"
		if u > 0.78:
			return "tamarisk"
		if u > 0.66:
			return "broom"
		return ""
	if g < 2600.0:
		# the open sand and reg: the dune shrub, and saltbush on the margins
		if u > 0.90:
			return "broom"
		if u > 0.86:
			return "saltbush"
		return ""
	return ""
