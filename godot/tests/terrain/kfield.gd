# The terrain field's GDScript twin (core/terrain/30-core-field.js): a krator-field export read back and sampled with
# the same arithmetic, operation for operation, so Godot and the page agree on the ground to the last bit of the same
# float32 data. Read-only: Godot does not bake a field, it loads one (KField.from_export).
# The project's copy is godot/tests/terrain/kfield.gd (godot/tools/sync_core.py keeps it in step); the importer that
# turns a field into a terrain mesh and a HeightMapShape3D is godot/krator/field_import.gd.
# Axes: metres, +y up, x east, z south. Grid point (i, j) is at x = x0 + i*step, z = z0 + j*step; heights[j*nx + i].
class_name KField
extends RefCounted

const DRY := -1e9

var name := ""
var x0 := 0.0
var z0 := 0.0
var step := 1.0
var nx := 1
var nz := 1
var heights := PackedFloat32Array()
var min_h := 0.0
var max_h := 0.0
# name -> {"level": float}, or {"i0", "j0", "nx", "nz", "heights": PackedFloat32Array} (NaN where dry)
var water := {}
var cover := PackedByteArray()
var cover_names: Array = []
# finer fields over windows of this one (a cliff, a cave mouth): h reads the first whose grid holds (x, z), edges
# included, else the base
var insets: Array[KField] = []
var x1 := 0.0
var z1 := 0.0


# a krator-field object (f.export() in the page); null with an error when it is not one
static func from_export(d: Dictionary) -> KField:
	if d.get("format") != "krator-field":
		push_error("KField: not a krator-field")
		return null
	if int(d.get("version", 0)) != 1:
		push_error("KField: version %s (this reads 1)" % d.get("version"))
		return null
	var f := KField.new()
	f.name = str(d.get("name", ""))
	f.x0 = float(d["x0"])
	f.z0 = float(d["z0"])
	f.step = float(d["step"])
	f.nx = int(d["nx"])
	f.nz = int(d["nz"])
	f.heights = Marshalls.base64_to_raw(d["heights"]).to_float32_array()
	if f.heights.size() != f.nx * f.nz:
		push_error("KField: heights holds %d values, the grid %d" % [f.heights.size(), f.nx * f.nz])
		return null
	f.min_h = float(d.get("min", 0.0))
	f.max_h = float(d.get("max", 0.0))
	var w: Dictionary = d.get("water", {})
	for k in w:
		var e: Dictionary = w[k]
		if e.has("level"):
			f.water[k] = {"level": float(e["level"])}
		else:
			f.water[k] = {"i0": int(e["i0"]), "j0": int(e["j0"]), "nx": int(e["nx"]), "nz": int(e["nz"]),
				"heights": Marshalls.base64_to_raw(e["heights"]).to_float32_array()}
	if d.has("cover"):
		f.cover = Marshalls.base64_to_raw(d["cover"])
		f.cover_names = d.get("coverNames", [])
	f.x1 = f.x0 + (f.nx - 1) * f.step
	f.z1 = f.z0 + (f.nz - 1) * f.step
	for g in d.get("insets", []):
		var fi := KField.from_export(g)
		if fi != null:
			f.insets.append(fi)
	return f


# THE ORDER IS THE CONTRACT: 30-core-field.js's bilinear(), line for line
static func bilinear(H: PackedFloat32Array, w: int, d: int, u: float, v: float) -> float:
	if u < 0.0:
		u = 0.0
	elif u > w - 1:
		u = w - 1
	if v < 0.0:
		v = 0.0
	elif v > d - 1:
		v = d - 1
	var i := int(floor(u))
	var j := int(floor(v))
	if i > w - 2:
		i = w - 2
	if i < 0:
		i = 0
	if j > d - 2:
		j = d - 2
	if j < 0:
		j = 0
	var fu: float = u - i
	var fv: float = v - j
	var k := j * w + i
	var i1 := 1 if w > 1 else 0
	var j1 := w if d > 1 else 0
	var a: float = H[k]
	var b: float = H[k + i1]
	var c: float = H[k + j1]
	var e: float = H[k + j1 + i1]
	var top: float = a + (b - a) * fu
	var bot: float = c + (e - c) * fu
	return top + (bot - top) * fv


func h(x: float, z: float) -> float:
	for g in insets:
		if x >= g.x0 and z >= g.z0 and x <= g.x1 and z <= g.z1:
			return g.h(x, z)
	return bilinear(heights, nx, nz, (x - x0) / step, (z - z0) / step)


func at(i: int, j: int) -> float:
	return heights[clampi(j, 0, nz - 1) * nx + clampi(i, 0, nx - 1)]


# the unit normal in double precision (a Vector3 holds float32): central differences one step either side
func normal64(x: float, z: float) -> PackedFloat64Array:
	var s := step
	var ex: float = h(x - s, z) - h(x + s, z)
	var ez: float = h(x, z - s) - h(x, z + s)
	var ey: float = 2 * s
	var l: float = sqrt(ex * ex + ey * ey + ez * ez)
	return PackedFloat64Array([ex / l, ey / l, ez / l])


func normal(x: float, z: float) -> Vector3:
	var n := normal64(x, z)
	return Vector3(n[0], n[1], n[2])


func water_at(wname: String, x: float, z: float) -> float:
	if not water.has(wname):
		return DRY
	var W: Dictionary = water[wname]
	if W.has("level"):
		return W["level"]
	var wx: int = W["nx"]
	var wz: int = W["nz"]
	var u: float = (x - x0) / step - W["i0"]
	var v: float = (z - z0) / step - W["j0"]
	if u < -0.5 or v < -0.5 or u > wx - 0.5 or v > wz - 0.5:
		return DRY
	var A: PackedFloat32Array = W["heights"]
	var cu: float = 0.0 if u < 0.0 else (float(wx - 1) if u > wx - 1 else u)
	var cv: float = 0.0 if v < 0.0 else (float(wz - 1) if v > wz - 1 else v)
	var i := int(floor(cu))
	var j := int(floor(cv))
	if i > wx - 2:
		i = wx - 2
	if i < 0:
		i = 0
	if j > wz - 2:
		j = wz - 2
	if j < 0:
		j = 0
	var i1 := 1 if wx > 1 else 0
	var j1 := wx if wz > 1 else 0
	var k := j * wx + i
	if not (is_nan(A[k]) or is_nan(A[k + i1]) or is_nan(A[k + j1]) or is_nan(A[k + j1 + i1])):
		return bilinear(A, wx, wz, u, v)
	# JavaScript's Math.round: halves go up
	var n: float = A[int(floor(cv + 0.5)) * wx + int(floor(cu + 0.5))]
	return DRY if is_nan(n) else n


func water_h(x: float, z: float) -> float:
	var best := DRY
	for k in water:
		var y := water_at(k, x, z)
		if y > best:
			best = y
	return best


func cover_at(x: float, z: float) -> int:
	if cover.is_empty():
		return 0
	var i := clampi(int(floor((x - x0) / step + 0.5)), 0, nx - 1)
	var j := clampi(int(floor((z - z0) / step + 0.5)), 0, nz - 1)
	return cover[j * nx + i]
