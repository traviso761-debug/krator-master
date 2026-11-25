# Landforms, from the geology rather than from taste. The scatter in catch_bowl_rocks.gd puts boulders on the ground;
# this puts the things you navigate by -- a mesa on the skyline, a pedestal rock beside the road, a field of hoodoos --
# and what stands where is decided by what the rock IS.
#
# ROCK DOES NOT WEATHER INTO ONE SHAPE, and that is the whole point of this file. Flat-lying sandstone undercuts into
# mesas and buttes with a talus skirt. A hard ironstone cap over soft rock leaves a pedestal, because the cap shelters
# the stem long after the ground around it has gone. Tuff -- welded volcanic ash -- erodes into hoodoos, a stack of
# hard and soft bands with a caprock on top. Limestone dissolves rather than crumbling, so it leaves steep towers
# undercut at the base where the water sat. An evaporite pan grows fluted pillars out of its own crust. And shocked
# impact breccia does not make a shape at all: it makes jagged ridges of angular block, because it was never bedded.
#
# WHERE EACH BELONGS IS DATA. openworld/catch-bowl/tools/export_godot.py reads
# kits/resources/data/geology-gemini.json over the box and writes geology.png, one family index a sample. Over the
# Catch and the Bowl that comes out as breccia 96k samples, mesa 83k, evaporite 79k, pedestal 33k, with karst, hoodoo
# and tor in pockets -- which is a fair description of an impact basin with a salt floor and sandstone benches.
#
# EVERY FORM IS A SWEPT PROFILE, except the two that are piles. A profile is a list of (height, radius) rings swept
# round a jittered polygon, and a mesa, a pedestal, a hoodoo, a karst tower and a salt pillar differ only in their
# rings and how ragged the sweep is. That is not a shortcut: it is how these forms actually differ, since all of them
# are one rock column eaten at different rates up its height.
class_name KratorCatchBowlLandforms
extends Node3D

const KRand := preload("res://tests/rand/krand.gd")
const SEED := 20261125
const CELL := 1150.0
const REACH := 8
const MOVED := 400.0

# family -> how big, how often, and what colour. `every` is one in how many cells carries one.
# h and r are metres: the TRUE heights, so a mesa reads as a mesa from ten kilometres and a hoodoo does not.
const FAM := {
	# r falls as h rises: the small ones are broad mounds (the Taklamakan's wind-cut stumps) and the big ones
	# are buttes, not pancakes. Keeping one radius range for both gave a field of flat discs.
	"mesa": {"h": [55.0, 300.0], "r": [150.0, 95.0], "every": 9, "col": Color(0.60, 0.46, 0.33)},
	"pedestal": {"h": [7.0, 26.0], "r": [5.0, 19.0], "every": 3, "col": Color(0.46, 0.34, 0.26)},
	"hoodoo": {"h": [6.0, 30.0], "r": [2.0, 7.0], "every": 1, "col": Color(0.70, 0.58, 0.44)},
	"karst": {"h": [45.0, 190.0], "r": [26.0, 95.0], "every": 4, "col": Color(0.66, 0.63, 0.56)},
	"evaporite": {"h": [2.0, 9.0], "r": [1.6, 6.0], "every": 2, "col": Color(0.86, 0.85, 0.80)},
	"breccia": {"h": [5.0, 26.0], "r": [14.0, 62.0], "every": 5, "col": Color(0.42, 0.37, 0.35)},
	"tor": {"h": [7.0, 24.0], "r": [5.0, 17.0], "every": 2, "col": Color(0.40, 0.38, 0.36)},
}

# The profiles: (height 0..1, radius 0..1), base to top. Read them as sections through the real thing.
const PROFILE := {
	# a talus skirt at the foot, a battered wall, then the caprock standing slightly proud of it and a flat top
	"mesa": [[0.0, 1.00], [0.10, 0.80], [0.74, 0.74], [0.80, 0.86], [0.95, 0.84], [1.0, 0.70], [1.0, 0.0]],
	# the waisted stem the cap has sheltered, and the cap sitting on it like a table
	"pedestal": [[0.0, 0.52], [0.18, 0.30], [0.46, 0.24], [0.60, 0.34], [0.70, 0.96], [0.86, 0.92], [0.88, 0.0]],
	# hard and soft bands: the radius steps in and out up the column, with a caprock on top
	"hoodoo": [[0.0, 0.62], [0.14, 0.40], [0.26, 0.62], [0.40, 0.36], [0.54, 0.58], [0.68, 0.34],
		[0.80, 0.52], [0.90, 0.88], [0.97, 0.84], [1.0, 0.0]],
	# dissolved, not crumbled: steep sides, and the notch at the foot where the water stood
	"karst": [[0.0, 0.78], [0.05, 0.54], [0.11, 0.88], [0.55, 0.84], [0.88, 0.70], [0.97, 0.44], [1.0, 0.0]],
	# a fluted pillar grown out of the crust it stands on
	"evaporite": [[0.0, 1.00], [0.12, 0.62], [0.45, 0.52], [0.72, 0.44], [0.90, 0.40], [1.0, 0.0]],
}
# how ragged the sweep is, per family: limestone and salt weather smooth, sandstone blocky, breccia is all corners
const RAGGED := {"mesa": 0.10, "pedestal": 0.07, "hoodoo": 0.09, "karst": 0.05, "evaporite": 0.13}
const SIDES := {"mesa": 11, "pedestal": 9, "hoodoo": 8, "karst": 10, "evaporite": 7}

var host: Node3D
var cam: Camera3D
var _mm := {}
var _fam := PackedByteArray()
var _fn := 0
var _fz := 0
var _names: Array = []
var _last := Vector3(1e12, 1e12, 1e12)


func _ready() -> void:
	for k in FAM:
		var mi := MultiMeshInstance3D.new()
		mi.name = k
		var m := MultiMesh.new()
		m.transform_format = MultiMesh.TRANSFORM_3D
		m.use_colors = true
		m.mesh = _pile(k) if (k == "breccia" or k == "tor") else _swept(k)
		m.instance_count = 0
		mi.multimesh = m
		var mat := StandardMaterial3D.new()
		mat.vertex_color_use_as_albedo = true
		mat.roughness = 1.0
		mat.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
		mi.material_override = mat
		add_child(mi)
		_mm[k] = mi


# A profile swept round a jittered polygon. The jitter is per ring AND per side, so the column is not a solid of
# revolution: a real one is eaten unevenly round its circumference, which is what makes a butte read as rock rather
# than as a lathe-turned cone.
func _swept(key: String) -> ArrayMesh:
	var prof: Array = PROFILE[key]
	var sides: int = SIDES[key]
	var rag: float = RAGGED[key]
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var rings := []
	for i in prof.size():
		var ring := []
		for s in sides:
			var h := KRand.cell(SEED + 7, i * 131 + s, key.length() * 17)
			var j: float = 1.0 + (KRand.unit(h) - 0.5) * 2.0 * rag
			var a := TAU * float(s) / float(sides)
			var r: float = float(prof[i][1]) * j
			ring.append(Vector3(cos(a) * r, float(prof[i][0]), sin(a) * r))
		rings.append(ring)
	# the cap is darker than the body on a pedestal and a hoodoo, because the cap is the hard bed that saved it
	var cap_from: float = 0.68 if (key == "pedestal" or key == "hoodoo") else (0.78 if key == "mesa" else 2.0)
	for i in rings.size() - 1:
		var a0: Array = rings[i]
		var a1: Array = rings[i + 1]
		for s in sides:
			var t := (s + 1) % sides
			# BEDDING. Every reference of wind-cut desert rock shows the beds: horizontal bands of harder and
			# softer stone, picked out because the wind takes the soft ones back faster. Without them a swept
			# form is a smooth lump of clay. The band pattern is seeded, not regular, because strata are not.
			var shade0: float = _bed(key, float(prof[i][0])) * (0.72 if float(prof[i][0]) >= cap_from else 1.0)
			var shade1: float = _bed(key, float(prof[i + 1][0])) * (0.72 if float(prof[i + 1][0]) >= cap_from else 1.0)
			for v in [[a0[s], shade0], [a0[t], shade0], [a1[t], shade1],
					  [a0[s], shade0], [a1[t], shade1], [a1[s], shade1]]:
				st.set_color(Color(v[1], v[1], v[1]))
				st.add_vertex(v[0])
	st.generate_normals()
	return st.commit()


# Breccia and tor are not swept, they are piles: angular block for shocked impact rock, rounded block for a tor.
# A pile is the only honest shape for either, because neither was ever bedded into a column to be eaten out of.
func _pile(key: String) -> ArrayMesh:
	var angular := key == "breccia"
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var blocks := 9 if angular else 5
	for b in blocks:
		var h := KRand.cell(SEED + 23, b, angular if 1 else 0)
		var bx: float = (KRand.unit(h) - 0.5) * 1.5
		var bz: float = (KRand.unit(KRand.mix32(h + 1)) - 0.5) * 1.5
		var by: float = KRand.unit(KRand.mix32(h + 2)) * 0.55
		var sx: float = 0.25 + 0.4 * KRand.unit(KRand.mix32(h + 3))
		var sy: float = (0.2 + 0.5 * KRand.unit(KRand.mix32(h + 4))) * (1.0 - by * 0.6)
		var yaw: float = KRand.unit(KRand.mix32(h + 5)) * TAU
		var tilt: float = (KRand.unit(KRand.mix32(h + 6)) - 0.5) * (1.1 if angular else 0.35)
		var basis := Basis(Vector3.UP, yaw) * Basis(Vector3.RIGHT, tilt)
		var corners := []
		for c in 8:
			var cx: float = (-1.0 if (c & 1) == 0 else 1.0) * sx
			var cy: float = (-1.0 if (c & 2) == 0 else 1.0) * sy
			var cz: float = (-1.0 if (c & 4) == 0 else 1.0) * sx
			if not angular:
				# a tor block is a corestone: rounded by weathering along its joints
				cx *= 0.86
				cz *= 0.86
			var jh := KRand.cell(SEED + 41, b * 29 + c, 3)
			var jj: float = 1.0 + (KRand.unit(jh) - 0.5) * (0.5 if angular else 0.22)
			corners.append(basis * Vector3(cx * jj, cy * jj, cz * jj) + Vector3(bx, by + sy, bz))
		# the six faces, two triangles each
		var faces := [[0, 2, 3, 1], [4, 5, 7, 6], [0, 1, 5, 4], [2, 6, 7, 3], [0, 4, 6, 2], [1, 3, 7, 5]]
		var shade: float = 0.78 + 0.3 * KRand.unit(KRand.mix32(h + 7))
		for f in faces:
			for idx in [f[0], f[1], f[2], f[0], f[2], f[3]]:
				st.set_color(Color(shade, shade, shade))
				st.add_vertex(corners[idx])
	st.generate_normals()
	return st.commit()


# the bed at height t up the form: a seeded sequence of darker and lighter strata
func _bed(key: String, t: float) -> float:
	var beds := 9
	var i := clampi(int(t * float(beds)), 0, beds - 1)
	var h := KRand.cell(SEED + 61, i, key.length())
	return 0.80 + 0.26 * KRand.unit(h)


func bind(h: Node3D, c: Camera3D) -> void:
	host = h
	cam = c
	var img := Image.new()
	if img.load("res://data/catch-bowl/geology.png") != OK:
		print("  landforms: no geology.png -- re-run export_godot.py")
		return
	_fn = img.get_width()
	_fz = img.get_height()
	_fam.resize(_fn * _fz)
	for z in _fz:
		for x in _fn:
			_fam[z * _fn + x] = int(round(img.get_pixel(x, z).r * 255.0))
	var meta: Dictionary = host.meta if "meta" in host else {}
	_names = meta.get("landforms", [])
	print("  landforms: %d x %d family samples, %s" % [_fn, _fz, ", ".join(PackedStringArray(_names))])


func family_at(x: float, z: float) -> String:
	if _fn == 0 or _names.is_empty():
		return ""
	var ix := clampi(int(x / 2000.0), 0, _fn - 1)
	var iz := clampi(int(z / 2000.0), 0, _fz - 1)
	var i := int(_fam[iz * _fn + ix])
	return String(_names[i]) if i > 0 and i < _names.size() else ""


func _process(_d: float) -> void:
	if host == null or cam == null or _fn == 0:
		return
	var p := cam.global_position
	if Vector2(p.x - _last.x, p.z - _last.z).length() < MOVED:
		return
	_last = p
	_rebuild(p)


func _rebuild(p: Vector3) -> void:
	var tf := {}
	var cols := {}
	for k in FAM:
		tf[k] = []
		cols[k] = PackedColorArray()
	var cx := int(floor(p.x / CELL))
	var cz := int(floor(p.z / CELL))
	for dz in range(-REACH, REACH + 1):
		for dx in range(-REACH, REACH + 1):
			var ix := cx + dx
			var iz := cz + dz
			var h0 := KRand.cell(SEED, ix, iz)
			var x := (float(ix) + KRand.unit(KRand.mix32(h0 + 3))) * CELL
			var z := (float(iz) + KRand.unit(KRand.mix32(h0 + 4))) * CELL
			if Vector2(x - p.x, z - p.z).length() > CELL * float(REACH):
				continue
			var key := family_at(x, z)
			if key == "" or not FAM.has(key):
				continue
			var f: Dictionary = FAM[key]
			# `every`: one cell in N carries this family, so a mesa is a landmark and a hoodoo is a field
			if int(KRand.unit(h0) * 1000.0) % int(f["every"]) != 0:
				continue
			var g: float = host.height_at(x, z)
			var us := KRand.unit(KRand.mix32(h0 + 5))
			var hh: float = lerpf(f["h"][0], f["h"][1], us * us)      # squared: the big ones are the rare ones
			var rr: float = lerpf(f["r"][0], f["r"][1], us)
			var yaw := KRand.unit(KRand.mix32(h0 + 6)) * TAU
			# a touch of ellipse, because nothing weathers evenly in plan either
			var ex: float = rr * (0.82 + 0.36 * KRand.unit(KRand.mix32(h0 + 7)))
			var b := Basis(Vector3.UP, yaw).scaled(Vector3(ex, hh, rr))
			tf[key].append(Transform3D(b, Vector3(x, g - hh * 0.03, z)))
			var c: Color = f["col"]
			var sh: float = 0.88 + 0.22 * KRand.unit(KRand.mix32(h0 + 8))
			cols[key].append(Color(c.r * sh, c.g * sh, c.b * sh))
	for k in FAM:
		var m: MultiMesh = _mm[k].multimesh
		var arr: Array = tf[k]
		m.instance_count = arr.size()
		for i in arr.size():
			m.set_instance_transform(i, arr[i])
			m.set_instance_color(i, cols[k][i])
