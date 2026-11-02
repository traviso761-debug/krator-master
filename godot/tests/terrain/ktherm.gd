# The ground's temperature, the GDScript twin of core/terrain/47-core-therm.js: a krator-therm export read back and sampled with the same
# arithmetic, so a Godot hazard, walker or ground shader reads the page's own numbers. Held to golden-therm.json by ktherm_test.gd.
# The project's copy is godot/tests/terrain/ktherm.gd (godot/tools/sync_core.py keeps it in step).
# Axes: metres, x east, z south. Degrees C.
class_name KTherm
extends RefCounted

const KRand := preload("../rand/krand.gd")

var soil_value := 0.0
var soil_raster := {}   # {x0, z0, cell, nx, nz, T}; empty: soil_value everywhere
var vents: Array = []
var amp := 0.0
var scale := 0.02
var seed_value := 0


# a krator-therm object (H.export() in the page); null with an error when it is not one
static func from_export(d: Dictionary) -> KTherm:
	if d.get("format") != "krator-therm":
		push_error("KTherm: not a krator-therm")
		return null
	if int(d.get("version", 0)) != 1:
		push_error("KTherm: version %s (this reads 1)" % d.get("version"))
		return null
	var H := KTherm.new()
	if d["soil"] is Dictionary:
		H.soil_raster = d["soil"]
	else:
		H.soil_value = float(d["soil"])
	for v in d["vents"]:
		var R: Dictionary = v.duplicate()
		var pts: Array = v["pts"] if v.has("pts") else [[v["x"], v["z"]]]
		var b := [INF, INF, -INF, -INF]
		for p in pts:
			b = [min(b[0], float(p[0])), min(b[1], float(p[1])), max(b[2], float(p[0])), max(b[3], float(p[1]))]
		var r := float(v["reach"])
		R["bb"] = [b[0] - r, b[1] - r, b[2] + r, b[3] + r]
		H.vents.append(R)
	H.amp = float(d["detail"]["amp"])
	H.scale = float(d["detail"]["scale"])
	H.seed_value = int(d["detail"]["seed"])
	return H


static func _clamp(v: float, a: float, b: float) -> float:
	return a if v < a else (b if v > b else v)


static func _sm(a: float, b: float, v: float) -> float:
	var t := _clamp((v - a) / (b - a), 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)


static func _share(q: float, k: float) -> float:
	if q >= 1.0:
		return 0.0
	if not k > 0.0:
		return 1.0 - q
	var e := exp(-k)
	return (exp(-k * q) - e) / (1.0 - e)


static func _bilinear(F: Dictionary, A: Array, x: float, z: float) -> float:
	var nx := int(F["nx"])
	var nz := int(F["nz"])
	var cell := float(F["cell"])
	var u := _clamp((x - float(F["x0"])) / cell, 0.0, nx - 1.0)
	var v := _clamp((z - float(F["z0"])) / cell, 0.0, nz - 1.0)
	var i := mini(nx - 2, int(floor(u)))
	var j := mini(nz - 2, int(floor(v)))
	var fu := u - i
	var fv := v - j
	var k := j * nx + i
	return (float(A[k]) * (1.0 - fu) + float(A[k + 1]) * fu) * (1.0 - fv) + (float(A[k + nx]) * (1.0 - fu) + float(A[k + nx + 1]) * fu) * fv


static func _seg_d(a: Array, b: Array, x: float, z: float) -> float:
	var ax := float(a[0])
	var az := float(a[1])
	var dx := float(b[0]) - ax
	var dz := float(b[1]) - az
	var l2 := dx * dx + dz * dz
	var t := _clamp(((x - ax) * dx + (z - az) * dz) / l2, 0.0, 1.0) if l2 > 0.0 else 0.0
	var ex := x - ax - dx * t
	var ez := z - az - dz * t
	return sqrt(ex * ex + ez * ez)   # not Vector2: single precision


static func _vent_d(v: Dictionary, x: float, z: float) -> float:
	if v["kind"] == "point":
		var ex := x - float(v["x"])
		var ez := z - float(v["z"])
		return sqrt(ex * ex + ez * ez)
	var d := INF
	var P: Array = v["pts"]
	for i in P.size() - 1:
		d = min(d, _seg_d(P[i], P[i + 1], x, z))
	return d


func soil_at(x: float, z: float) -> float:
	return _bilinear(soil_raster, soil_raster["T"], x, z) if not soil_raster.is_empty() else soil_value


func _sum(x: float, z: float, s: float) -> float:
	var t := 0.0
	var top := -INF
	for v in vents:
		var b: Array = v["bb"]
		if x < b[0] or z < b[1] or x > b[2] or z > b[3]:
			continue
		var e := float(v["T"]) - s
		if e <= 0.0:
			continue
		var f := _share(_vent_d(v, x, z) / float(v["reach"]), float(v["decay"]))
		if f <= 0.0:
			continue
		t += e * f
		if float(v["T"]) > top:
			top = float(v["T"])
	return min(t, top - s) if t > 0.0 else 0.0


func heat_at(x: float, z: float) -> float:
	var s := soil_at(x, z)
	var e := _sum(x, z, s)
	if not e > 0.0 or amp == 0.0:
		return s + e
	return s + e + amp * (2.0 * KRand.fbm(x * scale, z * scale, 0.5, 2, seed_value) - 1.0) * min(1.0, e / 10.0)


func bake(box: Array, cell := 8.0) -> Dictionary:
	var nx := int(ceil((float(box[2]) - float(box[0])) / cell)) + 1
	var nz := int(ceil((float(box[3]) - float(box[1])) / cell)) + 1
	var T: Array = []
	T.resize(nx * nz)
	var k := 0
	for j in nz:
		for i in nx:
			T[k] = heat_at(float(box[0]) + i * cell, float(box[1]) + j * cell)
			k += 1
	return {"x0": float(box[0]), "z0": float(box[1]), "cell": cell, "nx": nx, "nz": nz, "T": T}


func snow_mask(box: Array, cell := 8.0, t0 := 0.0, soft := 2.0) -> PackedByteArray:
	var F := bake(box, cell)
	var T: Array = F["T"]
	var M := PackedByteArray()
	M.resize(T.size())
	for k in T.size():
		# Math.round: halves up, as the page's
		M[k] = int(floor(255.0 * (1.0 - _sm(t0, t0 + soft, T[k])) + 0.5))
	return M


static func _pt(F: Dictionary, key: int, t: float) -> Array:
	var nx := int(F["nx"])
	var cell := float(F["cell"])
	var T: Array = F["T"]
	var a := key & 1
	var k := (key - a) / 2
	var i := k % nx
	var j := (k - i) / nx
	var b := k + nx if a == 1 else k + 1
	var u: float = (t - T[k]) / (T[b] - T[k])
	return [float(F["x0"]) + (i + (0.0 if a == 1 else u)) * cell, float(F["z0"]) + (j + (u if a == 1 else 0.0)) * cell]


# marching squares, the page's contourOf: the same lines in the same order. -> [{closed, pts}]
static func contour_of(F: Dictionary, t: float) -> Array:
	var nx := int(F["nx"])
	var nz := int(F["nz"])
	var T: Array = F["T"]
	var seg: Array = []
	var by := {}
	var add := func(e0: int, e1: int) -> void:
		var s := seg.size()
		seg.append([e0, e1])
		for e in [e0, e1]:
			if by.has(e):
				by[e].append(s)
			else:
				by[e] = [s]
	for j in nz - 1:
		for i in nx - 1:
			var k := j * nx + i
			var a: bool = T[k] >= t
			var b: bool = T[k + 1] >= t
			var c: bool = T[k + nx + 1] >= t
			var d: bool = T[k + nx] >= t
			var cs := (1 if a else 0) | (2 if b else 0) | (4 if c else 0) | (8 if d else 0)
			if cs == 0 or cs == 15:
				continue
			var N := 2 * k
			var W := 2 * k + 1
			var S := 2 * (k + nx)
			var E := 2 * (k + 1) + 1
			if cs == 5 or cs == 10:
				var mid: bool = (T[k] + T[k + 1] + T[k + nx] + T[k + nx + 1]) / 4.0 >= t
				if (cs == 5) == (not mid):
					add.call(N, W)
					add.call(S, E)
				else:
					add.call(N, E)
					add.call(S, W)
				continue
			var ee: Array = []
			if a != b:
				ee.append(N)
			if b != c:
				ee.append(E)
			if c != d:
				ee.append(S)
			if d != a:
				ee.append(W)
			add.call(ee[0], ee[1])
	var used := PackedByteArray()
	used.resize(seg.size())
	var keys: Array = by.keys()
	keys.sort()
	var out: Array = []
	var walk := func(start: int, closed: bool) -> void:
		var e := start
		var pts: Array = [_pt(F, e, t)]
		while true:
			var s := -1
			for q in by[e]:
				if used[q] == 0:
					s = q
					break
			if s < 0:
				break
			used[s] = 1
			e = seg[s][1] if seg[s][0] == e else seg[s][0]
			pts.append(_pt(F, e, t))
		out.append({"closed": closed, "pts": pts})
	for e in keys:
		if by[e].size() == 1 and used[by[e][0]] == 0:
			walk.call(e, false)
	for e in keys:
		if used[by[e][0]] == 0:
			walk.call(e, true)
	return out
