# core/water's open surface in GDScript (core/water/README.md, "Godot"): the CPU twin of WATER's (20-core-water.js:
# troD, troNJ, rest, surfaceAt, heightAt, normalAt, foamAt, the bed's depth and damping), rebuilt from core/export's
# water section (krator-water) alone, in 64-bit floats, every sum in the JavaScript's order, so a height here equals
# WATER.heightAt to the last bits or close to it (tests/water/water_test.gd: against node's twin at fixed (x, z, t);
# tests/export/world_test.gd's water checks: against the probes the page wrote). shaders/lib/water.gdshaderinc is the
# same maths on the GPU; uniforms() gives it this surface. The shared wave field (field > 0) comes from an atmos object
# with wave_height(x, z, t, chop) and wave_slope(x, z, t, d) (krator/atmos.gd: the Atmos autoload, or a new instance).
# Never Vector2 or Vector3 here: they are 32-bit.
# Phases 2 to 4 (core/water/21-core-water-shore.js, 22-core-water-flow.js): an open surface with a SHORE grid (the bed's
# B channel the signed shore distance: the flood's clip, Green's shoaling, the breakers, the beach's wetness); FLOW (a
# river line: its height, its current, its ribbon mesh, the advected normal and foam); FALL (the arcing curtain, its mesh,
# the streaks, the plunge pool's churn); STILL (a level over a box or polygon, its ripple and fountain normal). The shore
# grid can also be rebuilt here from the ground's heights (shore_grid: the flood and the exact distance transform), to
# the same bytes.
class_name KWater
extends RefCounted

var id := ""
var kind := "open"
var name := ""
var level = null            # null: the sea's level (presets.sea, with its tide)
var base := 0.0
var waves: Array = []       # [{A, k, dx, dz, H, ph, tx, tz, tc}]
var field := 0.0
var chop := 0.0
var kchop := 0.0
var tilt := 1.0
var lod := PackedFloat64Array([1.2, 2.4])
var px := PackedFloat64Array([0.35, 1.1])
var damp_depth := 3.0
var amp := 0.0
var bounds = null           # [x0, z0, x1, z1] or null
var extent = null
var bed = null              # {x0, z0, cell, nx, nz, level, data: PackedByteArray} or null
var look = null
var presets: Dictionary = {}
var period := 600.0
var atmos: Object = null
# a shore grid (open water, Phase 2): {band, clip} from the record, the bytes in bed["data"] (B: the shore distance)
var shore = null
# flow: the line [{x, z, y, slope, w, v}]; the ribbon's options from the record
var pts: Array = []
var ribbon_opt: Dictionary = {}
# fall: the lip [[x, z, y], ...], direction, lip speed, drop, the foot's widening (m a side), flight time, lip width
var lip: Array = []
var dir := PackedFloat64Array([1.0, 0.0])
var speed := 1.5
var drop := 0.0
var spread := 0.0
var t_fall := 0.0
var lip_w := 0.0
var plunge_at_rec = null
var curtain_opt: Dictionary = {}
# still: a level over a box or a polygon, a fountain [x, z] or null
var poly = null
var fountain = null
const G := 9.81


# every surface of a krator-water section, as KWater: open, flow, fall and still (a shore band record has no twin of its
# own: its height is its open water's). kinds: the kinds to take (default all four)
static func from_section(sec: Dictionary, atm: Object = null, kinds := ["open", "flow", "fall", "still"]) -> Array:
	var out := []
	for r in sec.get("surfaces", []):
		if r.get("kind") in kinds:
			out.append(from_record(r, sec, atm))
	return out


static func from_record(r: Dictionary, sec: Dictionary, atm: Object = null) -> KWater:
	var w := KWater.new()
	w.id = str(r["id"])
	w.kind = str(r["kind"])
	w.name = str(r.get("name", ""))
	w.presets = sec.get("presets", {})
	w.period = float(sec.get("period", 600.0))
	w.atmos = atm
	w.extent = r.get("extent")
	w.look = r.get("look")
	if w.kind == "flow":
		for p in r["pts"]:
			w.pts.append({"x": float(p[0]), "z": float(p[1]), "y": float(p[2]), "slope": float(p[3]), "w": float(p[4]), "v": float(p[5])})
		if r.get("ribbon") is Dictionary:
			w.ribbon_opt = r["ribbon"]
		return w
	if w.kind == "fall":
		w.lip = r["lip"]
		w.dir = PackedFloat64Array([float(r["dir"][0]), float(r["dir"][1])])
		w.speed = float(r["speed"])
		w.drop = float(r["drop"])
		w.spread = float(r.get("spread", 0.0))
		w.t_fall = sqrt(2.0 * w.drop / G)
		var a: Array = w.lip[0]
		var b: Array = w.lip[w.lip.size() - 1]
		w.lip_w = sqrt((float(b[0]) - float(a[0])) ** 2 + (float(b[1]) - float(a[1])) ** 2)
		w.plunge_at_rec = r.get("plunge")
		if r.get("curtain") is Dictionary:
			w.curtain_opt = r["curtain"]
		return w
	if w.kind == "still":
		w.level = float(r["level"])
		w.bounds = r.get("bounds")
		w.poly = r.get("poly")
		w.fountain = r.get("fountain")
		return w
	w.level = r.get("level")
	w.base = float(r.get("base", 0.0))
	for q in r.get("waves", []):
		w.waves.append({"A": float(q["A"]), "k": float(q["k"]), "dx": float(q["dir"][0]), "dz": float(q["dir"][1]), "H": float(q["H"]),
			"ph": float(q["phase"]), "tx": float(q["turns"][0]), "tz": float(q["turns"][1]), "tc": float(q["turns"][2])})
	w.field = float(r.get("field", 0.0))
	w.chop = float(r.get("chop", 0.0))
	w.kchop = float(r.get("kChop", 0.0))
	w.tilt = float(r.get("tilt", 1.0))
	w.lod = PackedFloat64Array([float(r["lod"][0]), float(r["lod"][1])])
	w.px = PackedFloat64Array([float(r["px"][0]), float(r["px"][1])])
	w.damp_depth = float(r.get("damp", 3.0))
	w.amp = float(r.get("amp", 0.0))
	w.bounds = r.get("bounds")
	if r.get("shore") is Dictionary:
		w.shore = {"band": float(r["shore"]["band"]), "clip": float(r["shore"]["clip"])}
	if r.get("bed") is Dictionary:
		var b: Dictionary = r["bed"]
		w.bed = {"x0": float(b["x0"]), "z0": float(b["z0"]), "cell": float(b["cell"]), "nx": int(b["nx"]), "nz": int(b["nz"]),
			"level": float(b["level"]), "data": Marshalls.base64_to_raw(str(b["bytes"]["b64"]))}
	return w


static func _fr(x: float) -> float:
	return x - floor(x)


static func _ss(a: float, b: float, x: float) -> float:
	var t: float = clampf((x - a) / (b - a), 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)


func level_at(t: float) -> float:
	if level != null:
		return float(level)
	var S: Dictionary = presets.get("sea", {"level": 0.0, "tide": null})
	var v := float(S.get("level", 0.0))
	if S.get("tide") is Dictionary:
		var T: Dictionary = S["tide"]
		v += float(T["amp"]) * sin(TAU * t / float(T["period"]) + float(T.get("phase", 0.0)))
	return v


func _th(w: Dictionary, x: float, z: float, t: float) -> float:
	return TAU * (_fr(x * w["tx"]) + _fr(z * w["tz"]) - _fr(t * w["tc"])) + w["ph"]


# the trochoids' displacement of rest point (x0, z0) at t: [dx, h, dz, Jxx, Jxz, Jzz], each faded by k * sp
func tro_d(x0: float, z0: float, t: float, sp := 0.0) -> PackedFloat64Array:
	var dx := 0.0
	var h := 0.0
	var dz := 0.0
	var jxx := 1.0
	var jxz := 0.0
	var jzz := 1.0
	for w in waves:
		var l: float = 1.0 - _ss(lod[0], lod[1], w["k"] * sp)
		var a := _th(w, x0, z0, t)
		var c := cos(a)
		var s := sin(a)
		var q: float = w["H"] * w["k"] * s * l
		h += w["A"] * s * l
		dx += w["H"] * w["dx"] * c * l
		dz += w["H"] * w["dz"] * c * l
		jxx -= q * w["dx"] * w["dx"]
		jxz -= q * w["dx"] * w["dz"]
		jzz -= q * w["dz"] * w["dz"]
	return PackedFloat64Array([dx, h, dz, jxx, jxz, jzz])


# the shading frame at the rest point: [nx, ny, nz, J], each wave faded by k * mpp
func tro_nj(x0: float, z0: float, t: float, mpp := 0.0) -> PackedFloat64Array:
	var g := PackedFloat64Array([1.0, 0.0, 0.0])
	var k := PackedFloat64Array([0.0, 0.0, 1.0])
	for w in waves:
		var a := _th(w, x0, z0, t)
		var c := cos(a)
		var s := sin(a)
		var l: float = 1.0 - _ss(px[0], px[1], w["k"] * mpp)
		var q: float = w["H"] * w["k"] * s * l
		g[0] -= q * w["dx"] * w["dx"]
		g[1] += c * w["A"] * w["k"] * w["dx"] * l
		g[2] -= q * w["dx"] * w["dz"]
		k[0] -= q * w["dx"] * w["dz"]
		k[1] += c * w["A"] * w["k"] * w["dz"] * l
		k[2] -= q * w["dz"] * w["dz"]
	var n := PackedFloat64Array([k[1] * g[2] - k[2] * g[1], k[2] * g[0] - k[0] * g[2], k[0] * g[1] - k[1] * g[0]])
	var m := sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2])
	return PackedFloat64Array([n[0] / m, n[1] / m, n[2] / m, g[0] * k[2] - g[2] * k[0]])


func cap(j: float) -> float:
	var F: Dictionary = presets["foam"]
	return 1.0 - _ss(float(F["j"][0]), float(F["j"][1]), j)


# the decayed whitecap at a rest point (WATER.foamAt: without the shader's breakup noise)
func foam_at(x0: float, z0: float, t: float, mpp := 0.0) -> float:
	var F: Dictionary = presets["foam"]
	var f := 0.0
	for i in int(F["taps"]):
		f = maxf(f, cap(tro_nj(x0, z0, t - i * float(F["step"]), mpp)[3]) * exp(-i * float(F["step"]) / float(F["decay"])))
	return f


func bed_decode(r: float, g: float) -> float:
	var P: Dictionary = presets["bed"]
	if g > 0.004 and g < 0.996:
		return float(P["fine"][0]) + g * (float(P["fine"][1]) - float(P["fine"][0]))
	return float(P["deep"][0]) + r * r * (float(P["deep"][1]) - float(P["deep"][0]))


# the bed's depth below the base level at (x, z): bilinear over the texel centres, as the GPU filters (clamped at the
# edges); deep outside its box
func bed_depth(x: float, z: float) -> float:
	var B: Dictionary = bed
	var u: float = (x - B["x0"]) / (B["cell"] * B["nx"])
	var v: float = (z - B["z0"]) / (B["cell"] * B["nz"])
	if u < 0.0 or v < 0.0 or u > 1.0 or v > 1.0:
		return float(presets["bed"]["deep"][1])
	var fx: float = u * B["nx"] - 0.5
	var fz: float = v * B["nz"] - 0.5
	var i0 := int(floor(fx))
	var j0 := int(floor(fz))
	var ax := fx - i0
	var az := fz - j0
	var out := PackedFloat64Array([0.0, 0.0, 0.0, 0.0])
	for ch in (4 if shore != null else 2):
		var c00 := _byte(i0, j0, ch)
		var c10 := _byte(i0 + 1, j0, ch)
		var c01 := _byte(i0, j0 + 1, ch)
		var c11 := _byte(i0 + 1, j0 + 1, ch)
		out[ch] = (c00 * (1.0 - ax) + c10 * ax) * (1.0 - az) + (c01 * (1.0 - ax) + c11 * ax) * az
	if shore != null:
		# a shore grid: the linear mid channel (A), the deep one past it (WATER.bedDecodeShore)
		var M: Array = presets["shore"]["mid"]
		var D: Array = presets["bed"]["deep"]
		if out[3] < 0.996:
			return float(M[0]) + out[3] * (float(M[1]) - float(M[0]))
		return float(D[0]) + out[0] * out[0] * (float(D[1]) - float(D[0]))
	return bed_decode(out[0], out[1])


func _byte(i: int, j: int, ch: int) -> float:
	var B: Dictionary = bed
	var nx: int = B["nx"]
	var nz: int = B["nz"]
	return float((B["data"] as PackedByteArray)[(clampi(j, 0, nz - 1) * nx + clampi(i, 0, nx - 1)) * 4 + ch]) / 255.0


func depth_at(x: float, z: float, t: float) -> float:
	if bed == null:
		return 1e9
	return level_at(t) - base + bed_depth(x, z)


func damp(x: float, z: float, t: float) -> float:
	if bed == null:
		return 1.0
	var d := depth_at(x, z, t)
	if shore != null:
		return _ss(0.0, damp_depth, d) * shoal_k(d)
	return _ss(0.0, damp_depth, d)


# the rest point the trochoids carry to (x, z): n Newton steps (5 as WATER.rest; the shader takes 3)
func rest(x: float, z: float, t: float, n := 5) -> PackedFloat64Array:
	var x0 := x
	var z0 := z
	if waves.is_empty():
		return PackedFloat64Array([x, z])
	for i in n:
		var d := tro_d(x0, z0, t, 0.0)
		var m := damp(x0, z0, t)
		var a := 1.0 + (d[3] - 1.0) * m
		var b := d[4] * m
		var c := 1.0 + (d[5] - 1.0) * m
		var det := a * c - b * b
		var rx := x0 + d[0] * m - x
		var rz := z0 + d[2] * m - z
		x0 -= (c * rx - b * rz) / det
		z0 -= (a * rz - b * rx) / det
	return PackedFloat64Array([x0, z0])


# the drawn surface at a rest point: [x, y, z, m] (the vertex shader's wtr_surface)
func surface_at(x0: float, z0: float, t: float, sp := 0.0) -> PackedFloat64Array:
	var d := tro_d(x0, z0, t, sp)
	var m := damp(x0, z0, t)
	var x := x0 + d[0] * m
	var z := z0 + d[2] * m
	var f := 0.0
	if field != 0.0 and atmos != null:
		f = field * atmos.wave_height(x, z, t, chop * (1.0 - _ss(lod[0], lod[1], kchop * sp)))
	return PackedFloat64Array([x, level_at(t) + (d[1] + f) * m + (surf_at(x, z, t) if shore != null else 0.0), z, m])


func height_at(x: float, z: float, t: float, n := 5) -> float:
	var p := rest(x, z, t, n)
	return surface_at(p[0], p[1], t, 0.0)[1]


# the shading normal at world (x, z) for a camera cam_dist away and a pixel of mpp metres
func normal_at(x: float, z: float, t: float, cam_dist: float, mpp: float) -> PackedFloat64Array:
	var p := rest(x, z, t)
	var nj := tro_nj(p[0], p[1], t, mpp)
	var m := damp(p[0], p[1], t)
	var sx := -nj[0] / nj[1]
	var sz := -nj[2] / nj[1]
	if field != 0.0 and atmos != null:
		var w: PackedFloat64Array = atmos.wave_slope(x, z, t, cam_dist)
		var k: float = field * tilt * float(atmos.waves["tilt"])
		sx += w[0] * k
		sz += w[1] * k
	sx *= m
	sz *= m
	if shore != null:
		var g := surf_slope(x, z, t)
		sx += g[0]
		sz += g[1]
	var l := sqrt(sx * sx + 1.0 + sz * sz)
	return PackedFloat64Array([-sx / l, 1.0 / l, -sz / l])


# the bed as a texture (the bytes as they are: RGBA8, sampled linearly, clamped), or null
func bed_texture() -> ImageTexture:
	if bed == null:
		return null
	var img := Image.create_from_data(int(bed["nx"]), int(bed["nz"]), false, Image.FORMAT_RGBA8, bed["data"])
	return ImageTexture.create_from_image(img)


# shaders/lib/water.gdshaderinc's uniforms for this surface; each wave's products made here in 64 bits, as WATER.glsl
# writes them as literals, so the GPU rounds the same numbers. The level is the level at t.
func uniforms(t := 0.0) -> Dictionary:
	var K := []
	var A := []
	var Q := []
	var DD := []
	for i in 8:
		if i < waves.size():
			var w: Dictionary = waves[i]
			K.append(Vector4(w["tx"], w["tz"], w["tc"], w["ph"]))
			A.append(Vector4(w["A"], w["H"] * w["dx"], w["H"] * w["dz"], w["k"]))
			Q.append(Vector4(w["H"] * w["k"], w["A"] * w["k"] * w["dx"], w["A"] * w["k"] * w["dz"], 0.0))
			DD.append(Vector4(w["dx"] * w["dx"], w["dx"] * w["dz"], w["dz"] * w["dz"], 0.0))
		else:
			K.append(Vector4.ZERO)
			A.append(Vector4.ZERO)
			Q.append(Vector4.ZERO)
			DD.append(Vector4.ZERO)
	var P: Dictionary = presets.get("bed", {"fine": [-2, 3], "deep": [-4, 40]})
	var F: Dictionary = presets.get("foam", {"j": [0.3, 0.5], "taps": 4, "step": 0.45, "decay": 1.8, "amount": 0.8})
	var wt := float(atmos.waves["tilt"]) if atmos != null and field != 0.0 else 0.0
	var u := {"wtr_n": mini(waves.size(), 8), "wtr_k": K, "wtr_a": A, "wtr_q": Q, "wtr_dd": DD,
		"wtr_level": level_at(t), "wtr_base": base, "wtr_field": field if atmos != null else 0.0, "wtr_chop": chop, "wtr_kchop": kchop,
		"wtr_tilt_k": field * (tilt * wt), "wtr_lod": Vector2(lod[0], lod[1]), "wtr_px": Vector2(px[0], px[1]), "wtr_damp_depth": damp_depth,
		"wtr_has_bed": bed != null,
		"wtr_bed_enc": Vector4(float(P["fine"][0]), float(P["fine"][1]) - float(P["fine"][0]), float(P["deep"][0]), float(P["deep"][1]) - float(P["deep"][0])),
		"wtr_foam_j": Vector2(float(F["j"][0]), float(F["j"][1])),
		"wtr_foam_t": Vector4(float(F["taps"]), float(F["step"]), float(F["decay"]), float(F["amount"]))}
	if bed != null:
		u["wtr_bed"] = bed_texture()
		u["wtr_bed_box"] = Vector4(bed["x0"], bed["z0"], 1.0 / (bed["cell"] * bed["nx"]), 1.0 / (bed["cell"] * bed["nz"]))
	u["wtr_has_shore"] = shore != null and bed != null
	if shore != null and bed != null:
		var SP: Dictionary = _shore_p()
		var U: Dictionary = SP["surf"]
		u["wtr_shore"] = Vector4(float(shore["band"]), float(shore["clip"]) * float(bed["cell"]), float(SP["mid"][0]), float(SP["mid"][1]) - float(SP["mid"][0]))
		u["wtr_shoal"] = Vector3(float(SP["shoal"]["depth"]), float(SP["shoal"]["max"]), float(SP["shoal"]["min"]))
		u["wtr_surf_a"] = Vector4(float(U["amp"]), 1.0 / float(U["lambda"]), surf_cycles() / period, float(U["skew"]))
		u["wtr_surf_b"] = Vector4(float(U["depth"][1]), float(U["depth"][0]), float(U["born"]), float(U["foam"]))
		u["wtr_surf_h"] = float(U["h"])
		u["wtr_wet_k"] = Vector4(float(SP["wet"]["runup"]), float(SP["wet"]["band"]), float(SP["wet"]["dark"]), float(SP["wet"]["gloss"]))
	return u


# ================================================================ Phase 2: the shore (core/water/21-core-water-shore.js)
func _shore_p() -> Dictionary:
	return presets["shore"]


# channel k of the bed bytes, bilinear over the texel centres (clamped), as WATER.gridSample; NAN outside the grid
func grid_sample(x: float, z: float, k: int) -> float:
	var B: Dictionary = bed
	var u: float = (x - B["x0"]) / (B["cell"] * B["nx"])
	var v: float = (z - B["z0"]) / (B["cell"] * B["nz"])
	if u < 0.0 or v < 0.0 or u > 1.0 or v > 1.0:
		return NAN
	var fx: float = u * B["nx"] - 0.5
	var fz: float = v * B["nz"] - 0.5
	var i0 := int(floor(fx))
	var j0 := int(floor(fz))
	var ax := fx - i0
	var az := fz - j0
	return (_byte(i0, j0, k) * (1.0 - ax) + _byte(i0 + 1, j0, k) * ax) * (1.0 - az) + (_byte(i0, j0 + 1, k) * (1.0 - ax) + _byte(i0 + 1, j0 + 1, k) * ax) * az


# the signed shore distance (m, + on the water), +band outside the grid
func shore_dist(x: float, z: float) -> float:
	var b := grid_sample(x, z, 2)
	if is_nan(b):
		return float(shore["band"])
	return (b - 0.5) * 2.0 * float(shore["band"])


func wet_at(x: float, z: float) -> bool:
	return shore_dist(x, z) > -float(shore["clip"]) * float(bed["cell"])


func shoal_k(depth: float) -> float:
	var Q: Dictionary = _shore_p()["shoal"]
	if depth >= float(Q["depth"]):
		return 1.0
	return minf(float(Q["max"]), pow(float(Q["depth"]) / maxf(depth, float(Q["min"])), 0.25))


func surf_cycles() -> float:
	return maxf(1.0, _jsround(period / float(_shore_p()["surf"]["sec"])))


func surf_phase(d: float, t: float) -> float:
	return TAU * (_fr(d / float(_shore_p()["surf"]["lambda"])) + _fr(t * surf_cycles() / period))


func surf_env(d: float, depth: float, band: float) -> float:
	var Q: Dictionary = _shore_p()["surf"]
	return _ss(band, band * (1.0 - float(Q["born"])), d) * _ss(float(Q["depth"][1]), float(Q["depth"][0]), depth)


func surf_break(depth: float) -> float:
	var d0 := float(_shore_p()["surf"]["depth"][0])
	return 1.0 - _ss(d0 * 0.4, d0, depth)


# the breakers' height at a world point (WATER.surfAt)
func surf_at(x: float, z: float, t: float) -> float:
	var Q: Dictionary = _shore_p()["surf"]
	var depth := depth_at(x, z, t)
	var d := shore_dist(x, z)
	var e := surf_env(d, depth, float(shore["band"]))
	if e <= 0.0:
		return 0.0
	var a := surf_phase(d, t)
	var b := surf_break(depth)
	return float(Q["amp"]) * e * shoal_k(depth) * (sin(a) + float(Q["skew"]) * b * sin(2.0 * a))


func surf_slope(x: float, z: float, t: float) -> PackedFloat64Array:
	var h := float(_shore_p()["surf"]["h"])
	return PackedFloat64Array([(surf_at(x + h, z, t) - surf_at(x - h, z, t)) / (2.0 * h), (surf_at(x, z + h, t) - surf_at(x, z - h, t)) / (2.0 * h)])


func surf_foam_at(x: float, z: float, t: float) -> float:
	var Q: Dictionary = _shore_p()["surf"]
	var depth := depth_at(x, z, t)
	var d := shore_dist(x, z)
	var e := surf_env(d, depth, float(shore["band"]))
	if e <= 0.0:
		return 0.0
	var a := surf_phase(d, t)
	var pr := (sin(a) + float(Q["skew"]) * sin(2.0 * a)) / (1.0 + float(Q["skew"]))
	return float(Q["foam"]) * surf_break(depth) * _ss(0.15, 0.85, pr) * _ss(0.0, 0.25, e)


# the beach at ground height gy: [wet, film] (WATER.wetGroundAt)
func wet_ground_at(x: float, z: float, gy: float, t: float) -> PackedFloat64Array:
	var Q: Dictionary = _shore_p()["wet"]
	var d := shore_dist(x, z)
	var r := gy - level_at(t)
	var ru := float(Q["runup"])
	var bw := float(Q["band"])
	if d < -bw or r > ru:
		return PackedFloat64Array([0.0, 0.0])
	var sw := ru * (0.2 + 0.8 * (0.5 + 0.5 * sin(TAU * _fr(t * surf_cycles() / period) - 0.6)))
	return PackedFloat64Array([_ss(ru, ru * 0.25, r) * _ss(-bw, -bw * 0.6, d), 0.0 if r < 0.0 else _ss(sw, sw - 0.12, r)])


# the rain's share of a surface's wetness (Phase 4): W.wet on what faces up
static func wet_ground_rain(wet: float, ny: float) -> float:
	return wet * _ss(0.35, 0.8, ny)


# the squared distance transform, 1D (Felzenszwalb-Huttenlocher), as WATER.edt's: f sources 0, others INF
const EDT_INF := 1e12


static func _dt1(f: PackedFloat64Array, n: int, d: PackedFloat64Array, v: PackedInt32Array, zz: PackedFloat64Array) -> void:
	var k := 0
	v[0] = 0
	zz[0] = -INF
	zz[1] = INF
	for q in range(1, n):
		var s: float = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / float(2 * q - 2 * v[k])
		while s <= zz[k]:
			k -= 1
			s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / float(2 * q - 2 * v[k])
		k += 1
		v[k] = q
		zz[k] = s
		zz[k + 1] = INF
	k = 0
	for q in n:
		while zz[k + 1] < q:
			k += 1
		d[q] = float((q - v[k]) * (q - v[k])) + f[v[k]]


static func edt(src: PackedByteArray, nx: int, nz: int) -> PackedFloat64Array:
	var N := maxi(nx, nz)
	var f := PackedFloat64Array()
	f.resize(N)
	var d := PackedFloat64Array()
	d.resize(N)
	var v := PackedInt32Array()
	v.resize(N)
	var zz := PackedFloat64Array()
	zz.resize(N + 1)
	var out := PackedFloat64Array()
	out.resize(nx * nz)
	for i in nx:
		for j in nz:
			f[j] = 0.0 if src[j * nx + i] else EDT_INF
		_dt1(f, nz, d, v, zz)
		for j in nz:
			out[j * nx + i] = d[j]
	for j in nz:
		for i in nx:
			f[i] = out[j * nx + i]
		_dt1(f, nx, d, v, zz)
		for i in nx:
			out[j * nx + i] = d[i]
	return out


# the shore grid rebuilt from the ground's heights at the cell centres (row-major, nx x nz), as WATER.shoreGrid: the
# flood from seeds (points [[x, z], ...], or null: every cell under the level), the signed distance, the bytes.
# mid: PRESETS.shore.mid (the A channel's range); land: a PackedByteArray (1 = dry whatever its height) or null.
# -> {wet, dist, data, wet_cells}
static func shore_grid(ground: PackedFloat64Array, nx: int, nz: int, x0: float, z0: float, cell: float, level: float, seeds, band: float, bed_p: Dictionary, mid: Array, land = null) -> Dictionary:
	var n := nx * nz
	var below := PackedByteArray()
	below.resize(n)
	var wet := PackedByteArray()
	wet.resize(n)
	for k in n:
		below[k] = 1 if ground[k] < level and not (land != null and land[k]) else 0
	if seeds == null:
		wet = below.duplicate()
	else:
		var q := PackedInt32Array()
		q.resize(n)
		var h := 0
		var t := 0
		for p in seeds:
			var i := int(floor((float(p[0]) - x0) / cell))
			var j := int(floor((float(p[1]) - z0) / cell))
			if i >= 0 and j >= 0 and i < nx and j < nz:
				var k := j * nx + i
				if below[k] and not wet[k]:
					wet[k] = 1
					q[t] = k
					t += 1
		while h < t:
			var k: int = q[h]
			h += 1
			var i := k % nx
			var j := (k - i) / nx
			for kk in [k - 1 if i > 0 else -1, k + 1 if i < nx - 1 else -1, k - nx if j > 0 else -1, k + nx if j < nz - 1 else -1]:
				if kk >= 0 and below[kk] and not wet[kk]:
					wet[kk] = 1
					q[t] = kk
					t += 1
	var dry := PackedByteArray()
	dry.resize(n)
	var cells := 0
	for k in n:
		dry[k] = 0 if wet[k] else 1
		cells += wet[k]
	var din := edt(dry, nx, nz)
	var dout := edt(wet, nx, nz)
	var dist := PackedFloat64Array()
	dist.resize(n)
	var data := PackedByteArray()
	data.resize(n * 4)
	var D: Array = bed_p["deep"]
	var F: Array = bed_p["fine"]
	for k in n:
		var s: float
		if wet[k]:
			s = band if din[k] >= EDT_INF / 2.0 else (sqrt(din[k]) - 0.5) * cell
		else:
			s = -band if dout[k] >= EDT_INF / 2.0 else -(sqrt(dout[k]) - 0.5) * cell
		dist[k] = s
		var dd := level - ground[k]
		data[k * 4] = _jsround(255.0 * sqrt(clampf((dd - float(D[0])) / (float(D[1]) - float(D[0])), 0.0, 1.0)))
		data[k * 4 + 1] = _jsround(255.0 * clampf((dd - float(F[0])) / (float(F[1]) - float(F[0])), 0.0, 1.0))
		data[k * 4 + 2] = _jsround(255.0 * clampf(0.5 + s / (2.0 * band), 0.0, 1.0))
		data[k * 4 + 3] = _jsround(255.0 * clampf((dd - float(mid[0])) / (float(mid[1]) - float(mid[0])), 0.0, 1.0))
	return {"wet": wet, "dist": dist, "data": data, "wet_cells": cells}


# JavaScript's Math.round: halves go up (floor(x + 0.5))
static func _jsround(x: float) -> int:
	return int(floor(x + 0.5))


# ================================================================ Phase 3: flow (core/water/22-core-water-flow.js)
func _flow_p() -> Dictionary:
	return presets["flow"]


# the nearest segment of the line to (x, z): {i, u, d, ex, ez, L}
func nearest(x: float, z: float) -> Dictionary:
	var best := {}
	for i in pts.size() - 1:
		var a: Dictionary = pts[i]
		var b: Dictionary = pts[i + 1]
		var ex: float = b["x"] - a["x"]
		var ez: float = b["z"] - a["z"]
		var L2 := ex * ex + ez * ez
		if L2 == 0.0:
			L2 = 1.0
		var u := clampf(((x - a["x"]) * ex + (z - a["z"]) * ez) / L2, 0.0, 1.0)
		var px: float = a["x"] + ex * u
		var pz: float = a["z"] + ez * u
		var d := sqrt((x - px) * (x - px) + (z - pz) * (z - pz))
		if best.is_empty() or d < float(best["d"]):
			best = {"i": i, "u": u, "d": d, "ex": ex, "ez": ez, "L": sqrt(L2)}
	return best


func flow_height(x: float, z: float) -> float:
	var n := nearest(x, z)
	var a: Dictionary = pts[n["i"]]
	var b: Dictionary = pts[n["i"] + 1]
	return a["y"] + (b["y"] - a["y"]) * n["u"]


# [vx, vz, speed, slope] (WATER.flowAt on the surface)
func flow_at(x: float, z: float) -> PackedFloat64Array:
	var n := nearest(x, z)
	if n.is_empty():
		return PackedFloat64Array([0.0, 0.0, 0.0, 0.0])
	var a: Dictionary = pts[n["i"]]
	var b: Dictionary = pts[n["i"] + 1]
	var v: float = a["v"] + (b["v"] - a["v"]) * n["u"]
	return PackedFloat64Array([n["ex"] / n["L"] * v, n["ez"] / n["L"] * v, v, a["slope"]])


func contains(x: float, z: float) -> bool:
	if kind == "flow":
		var n := nearest(x, z)
		if n.is_empty():
			return false
		var a: Dictionary = pts[n["i"]]
		var b: Dictionary = pts[n["i"] + 1]
		return n["d"] <= (a["w"] + (b["w"] - a["w"]) * n["u"]) / 2.0
	if kind == "still" and poly is Array:
		var c := false
		var P: Array = poly
		var j := P.size() - 1
		for i in P.size():
			if (float(P[i][1]) > z) != (float(P[j][1]) > z) and x < (float(P[j][0]) - float(P[i][0])) * (z - float(P[i][1])) / (float(P[j][1]) - float(P[i][1])) + float(P[i][0]):
				c = not c
			j = i
		return c
	var inside: bool = bounds == null or (x >= float(bounds[0]) and z >= float(bounds[1]) and x <= float(bounds[2]) and z <= float(bounds[3]))
	if kind == "open" and shore != null:
		return inside and wet_at(x, z)
	return inside


# the ribbon (WATER.ribbon): {count, rows, across, pos, flow, slope, bank, along, idx}, every operation in its order
func ribbon(o := {}) -> Dictionary:
	var Q := _flow_p()
	var step := float(o.get("step", Q["step"]))
	var NA := int(o.get("across", Q["across"]))
	var mg := float(o.get("margin", Q["margin"]))
	var n := pts.size()
	var seg := []
	var s := 0.0
	for i in n - 1:
		var ex: float = pts[i + 1]["x"] - pts[i]["x"]
		var ez: float = pts[i + 1]["z"] - pts[i]["z"]
		var L := sqrt(ex * ex + ez * ez)
		if L == 0.0:
			L = 1e-9
		seg.append({"ex": ex / L, "ez": ez / L, "L": L, "s0": s})
		s += L
	var rows := []
	for i in n - 1:
		var k := maxi(1, int(ceil(seg[i]["L"] / step)))
		for j in k:
			rows.append([i, float(j) / k])
	rows.append([n - 2, 1.0])
	var pos := PackedFloat64Array()
	var flow := PackedFloat64Array()
	var slp := PackedFloat64Array()
	var bank := PackedFloat64Array()
	var along := PackedFloat64Array()
	var idx := PackedInt32Array()
	for row in rows:
		var i: int = row[0]
		var u: float = row[1]
		var a: Dictionary = pts[i]
		var b: Dictionary = pts[i + 1]
		var g: Dictionary = seg[i]
		var x: float = a["x"] + (b["x"] - a["x"]) * u
		var z: float = a["z"] + (b["z"] - a["z"]) * u
		var y: float = a["y"] + (b["y"] - a["y"]) * u
		var w: float = a["w"] + (b["w"] - a["w"]) * u
		var v: float = a["v"] + (b["v"] - a["v"]) * u
		var dx: float = g["ex"]
		var dz: float = g["ez"]
		var st := 1.0
		var jn = null
		if u == 0.0 and i > 0:
			jn = seg[i - 1]
		elif u == 1.0 and i + 2 < n:
			jn = seg[i + 1]
		if jn != null:
			var bx: float = g["ex"] + jn["ex"]
			var bz: float = g["ez"] + jn["ez"]
			var bl := sqrt(bx * bx + bz * bz)
			if bl > 1e-6:
				dx = bx / bl
				dz = bz / bl
				st = 1.0 / maxf(0.35, dx * g["ex"] + dz * g["ez"])
		var hw := w / 2.0 + mg
		for k in NA + 1:
			var q := (float(k) / NA * 2.0 - 1.0) * hw * st
			pos.append_array([x - dz * q, y, z + dx * q])
			flow.append_array([dx * v, dz * v])
			slp.append(a["slope"] + (b["slope"] - a["slope"]) * u)
			bank.append(w / 2.0 - absf(float(k) / NA * 2.0 - 1.0) * hw)
			along.append(g["s0"] + g["L"] * u)
	for r in rows.size() - 1:
		for k in NA:
			var p := r * (NA + 1) + k
			var q2 := p + NA + 1
			idx.append_array([p, q2 + 1, q2, p, p + 1, q2 + 1])
	return {"count": rows.size() * (NA + 1), "rows": rows.size(), "across": NA, "pos": pos, "flow": flow, "slope": slp, "bank": bank, "along": along, "idx": idx}


func flow_phase(t: float) -> PackedFloat64Array:
	var n := float(_flow_p()["phases"])
	var ph := _fr(t * n / period)
	return PackedFloat64Array([ph, _fr(ph + 0.5), period / n])


func _rip_grad(qx: float, qz: float, cx: float, cz: float, R: Array, g: PackedFloat64Array) -> PackedFloat64Array:
	for r in R:
		var a: float = float(r[2]) * PI / 180.0
		var dx := cx * cos(a) - cz * sin(a)
		var dz := cz * cos(a) + cx * sin(a)
		var c := cos((qx * dx + qz * dz) * (TAU / float(r[1]))) * float(r[0])
		g[0] += c * dx
		g[1] += c * dz
	return g


# the advected normal (WATER.flowNormal)
func flow_normal(x: float, z: float, vx: float, vz: float, slope: float, t: float) -> PackedFloat64Array:
	var Q := _flow_p()
	var R: Array = Q["ripple"]
	var P := flow_phase(t)
	var v := sqrt(vx * vx + vz * vz)
	var cx := vx / v if v > 1e-6 else 1.0
	var cz := vz / v if v > 1e-6 else 0.0
	var g0 := _rip_grad(x - vx * P[0] * P[2], z - vz * P[0] * P[2], cx, cz, R, PackedFloat64Array([0.0, 0.0]))
	var l0 := float(R[0][1])
	var g1 := _rip_grad(x - vx * P[1] * P[2] + 0.37 * l0, z - vz * P[1] * P[2] + 0.61 * l0, cx, cz, R, PackedFloat64Array([0.0, 0.0]))
	var w0 := 1.0 - absf(2.0 * P[0] - 1.0)
	var k := 1.0 + float(Q["rapidGain"]) * _ss(float(Q["rapids"][0]), float(Q["rapids"][1]), slope)
	var sx := (g0[0] * w0 + g1[0] * (1.0 - w0)) * k
	var sz := (g0[1] * w0 + g1[1] * (1.0 - w0)) * k
	var l := sqrt(sx * sx + 1.0 + sz * sz)
	return PackedFloat64Array([-sx / l, 1.0 / l, -sz / l])


func flow_foam(slope: float, bank: float) -> float:
	var Q := _flow_p()
	return maxf(float(Q["foam"][0]) * _ss(float(Q["rapids"][0]), float(Q["rapids"][1]), slope), float(Q["foam"][1]) * (1.0 - _ss(0.0, float(Q["edge"]), bank)))


# ================================================================ Phase 3: falls
func _fall_p() -> Dictionary:
	return presets["fall"]


func _lip_dir() -> PackedFloat64Array:
	var a: Array = lip[0]
	var b: Array = lip[lip.size() - 1]
	if lip_w <= 0.0:
		return PackedFloat64Array([0.0, 0.0])
	return PackedFloat64Array([(float(b[0]) - float(a[0])) / lip_w, (float(b[1]) - float(a[1])) / lip_w])


func curtain_at(u: float, f: float) -> PackedFloat64Array:
	var a: Array = lip[0]
	var b: Array = lip[lip.size() - 1]
	var L := _lip_dir()
	var s := f * t_fall
	var q := (u * 2.0 - 1.0) * spread * f
	return PackedFloat64Array([float(a[0]) + (float(b[0]) - float(a[0])) * u + dir[0] * speed * s + L[0] * q, float(a[2]) + (float(b[2]) - float(a[2])) * u - G * s * s / 2.0,
		float(a[1]) + (float(b[1]) - float(a[1])) * u + dir[1] * speed * s + L[1] * q])


func curtain_normal(f: float) -> PackedFloat64Array:
	var L := _lip_dir()
	var lx := L[0]
	var lz := L[1]
	var s := f * t_fall
	var T := PackedFloat64Array([dir[0] * speed, -G * s, dir[1] * speed])
	var n := PackedFloat64Array([T[1] * lz - T[2] * 0.0, T[2] * lx - T[0] * lz, T[0] * 0.0 - T[1] * lx])
	var m := sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2])
	if m == 0.0:
		m = 1.0
	var sg := -1.0 if (n[0] * dir[0] + n[2] * dir[1] + n[1] * 1e-6) < 0.0 else 1.0
	return PackedFloat64Array([sg * n[0] / m, sg * n[1] / m, sg * n[2] / m])


func curtain(o := {}) -> Dictionary:
	var Q := _fall_p()
	var R := int(o.get("rows", Q["rows"]))
	var C := int(o.get("cols", Q["cols"]))
	var pos := PackedFloat64Array()
	var nrm := PackedFloat64Array()
	var uv := PackedFloat64Array()
	var idx := PackedInt32Array()
	for r in R + 1:
		var f := float(r) / R
		for c in C + 1:
			var u := float(c) / C
			pos.append_array(curtain_at(u, f))
			nrm.append_array(curtain_normal(f))
			uv.append_array([u, f])
	for r in R:
		for c in C:
			var a := r * (C + 1) + c
			var b := a + C + 1
			idx.append_array([a, b, b + 1, a, b + 1, a + 1])
	return {"count": (R + 1) * (C + 1), "rows": R, "cols": C, "pos": pos, "nrm": nrm, "uv": uv, "idx": idx}


# the shaders' value noise (WATER.hash2, WATER.noiseP)
static func hash2(x: float, y: float) -> float:
	var q0 := _fr(x * 0.1031)
	var q1 := _fr(y * 0.1031)
	var q2 := _fr(x * 0.1031)
	var d := q0 * (q1 + 33.33) + q1 * (q2 + 33.33) + q2 * (q0 + 33.33)
	q0 += d
	q1 += d
	q2 += d
	return _fr((q0 + q1) * q2)


static func noise_p(x: float, y: float, per: float) -> float:
	var i := floorf(x)
	var j := floorf(y)
	var u := x - i
	var v := y - j
	var a := u * u * (3.0 - 2.0 * u)
	var b := v * v * (3.0 - 2.0 * v)
	var j0 := j - per * floorf(j / per)
	var j1 := (j + 1.0) - per * floorf((j + 1.0) / per)
	var h00 := hash2(i, j0)
	var h10 := hash2(i + 1.0, j0)
	var h01 := hash2(i, j1)
	var h11 := hash2(i + 1.0, j1)
	return (h00 * (1.0 - a) + h10 * a) * (1.0 - b) + (h01 * (1.0 - a) + h11 * a) * b


func fall_streak(u: float, f: float, t: float) -> float:
	var Q: Dictionary = _fall_p()["streak"]
	var n := float(Q["cycles"])
	var th := _fr(t * n / period - f * t_fall * n / period)
	var lw := lip_w * float(Q["across"])
	return 0.55 * noise_p(u * lw * 2.2, th * 6.0, 6.0) + 0.3 * noise_p(u * lw * 5.1 + 3.7, th * 14.0, 14.0) + 0.15 * noise_p(u * lw * 11.0 + 9.1, th * 30.0, 30.0)


static func fall_foam(f: float, streak: float) -> float:
	return clampf(0.25 + 0.6 * _ss(0.0, 0.4, f) + 0.7 * (streak - 0.5), 0.0, 1.0)


# the plunge pool: [x, y, z, r]
func plunge() -> PackedFloat64Array:
	var Q: Dictionary = _fall_p()["plunge"]
	var p: PackedFloat64Array = PackedFloat64Array(plunge_at_rec) if plunge_at_rec is Array else curtain_at(0.5, 1.0)
	return PackedFloat64Array([p[0], p[1], p[2], maxf(lip_w, drop * float(Q["share"]))])


# [foam, ring height] (WATER.plungeAt)
func plunge_at(x: float, z: float, t: float) -> PackedFloat64Array:
	var Q: Dictionary = _fall_p()["plunge"]
	var P := plunge()
	var r := sqrt((x - P[0]) * (x - P[0]) + (z - P[2]) * (z - P[2]))
	var ph := _fr(t * float(Q["cycles"]) / period)
	var a := TAU * (_fr(r / float(Q["ring"])) - ph)
	var e := exp(-r / P[3])
	var nz := noise_p((x - P[0]) * 0.45 + (z - P[2]) * 0.21, ph * 12.0 + r * 0.3, 12.0)
	return PackedFloat64Array([e * clampf(0.35 + 0.25 * sin(a) + 0.8 * (nz - 0.35), 0.0, 1.0), 0.08 * e * sin(a)])


# ================================================================ Phase 4: still water
func still_normal(x: float, z: float, t: float) -> PackedFloat64Array:
	var Q: Dictionary = presets["still"]
	var sx := 0.0
	var sz := 0.0
	for r in Q["ripple"]:
		var a: float = float(r[2]) * PI / 180.0
		var c := cos(TAU * (_fr(x * cos(a) / float(r[1])) + _fr(z * sin(a) / float(r[1])) - _fr(t * float(r[3]) / period))) * float(r[0])
		sx += c * cos(a)
		sz += c * sin(a)
	if fountain is Array:
		var F: Dictionary = Q["fountain"]
		var dx := x - float(fountain[0])
		var dz := z - float(fountain[1])
		var rr := sqrt(dx * dx + dz * dz)
		if rr > 1e-6:
			var c := cos(TAU * (_fr(rr / float(F["ring"])) - _fr(t * float(F["cycles"]) / period))) * 0.06 * exp(-rr / float(F["r"]))
			sx += c * dx / rr
			sz += c * dz / rr
	var l := sqrt(sx * sx + 1.0 + sz * sz)
	return PackedFloat64Array([-sx / l, 1.0 / l, -sz / l])


# any kind's height at (x, z): open (its twin), flow (the line's), still (the level); null for a fall
func height(x: float, z: float, t: float):
	if kind == "flow":
		return flow_height(x, z)
	if kind == "still":
		return float(level)
	if kind == "open":
		return height_at(x, z, t)
	return null


# lib/water_kinds.gdshaderinc's uniforms for a flow, fall or still surface (the numbers WATER.flowGLSL, fallGLSL and
# stillGLSL write as literals, made here in 64 bits)
func kind_uniforms() -> Dictionary:
	var u := {}
	if kind == "flow":
		var Q := _flow_p()
		var R: Array = Q["ripple"]
		var rip := []
		for i in 4:
			if i < R.size():
				var a: float = float(R[i][2]) * PI / 180.0
				rip.append(Vector4(float(R[i][0]), TAU / float(R[i][1]), cos(a), sin(a)))
			else:
				rip.append(Vector4.ZERO)
		var n := float(Q["phases"])
		u = {"wk_rip_n": mini(R.size(), 4), "wk_rip": rip, "wk_flow_t": Vector4(n / period, period / n, 0.37 * float(R[0][1]), 0.61 * float(R[0][1])),
			"wk_flow_r": Vector4(float(Q["rapids"][0]), float(Q["rapids"][1]), float(Q["rapidGain"]), float(Q["edge"])),
			"wk_flow_f": Vector2(float(Q["foam"][0]), float(Q["foam"][1]))}
	elif kind == "fall":
		var Q := _fall_p()
		var n := float(Q["streak"]["cycles"])
		var P := plunge()
		u = {"wk_fall": Vector4(n / period, t_fall * n / period, lip_w * float(Q["streak"]["across"]), 0.0),
			"wk_plunge": Vector4(P[0], P[2], P[3], 0.0), "wk_plunge_k": Vector2(1.0 / float(Q["plunge"]["ring"]), float(Q["plunge"]["cycles"]) / period)}
	elif kind == "still":
		var Q: Dictionary = presets["still"]
		var R: Array = Q["ripple"]
		var st := []
		var sd := []
		for i in 4:
			if i < R.size():
				var a: float = float(R[i][2]) * PI / 180.0
				st.append(Vector4(float(R[i][0]), cos(a) / float(R[i][1]), sin(a) / float(R[i][1]), float(R[i][3]) / period))
				sd.append(Vector4(cos(a), sin(a), 0.0, 0.0))
			else:
				st.append(Vector4.ZERO)
				sd.append(Vector4.ZERO)
		var F: Dictionary = Q["fountain"]
		u = {"wk_still_count": mini(R.size(), 4), "wk_still": st, "wk_still_d": sd,
			"wk_fountain": Vector4(float(fountain[0]), float(fountain[1]), 1.0, 0.0) if fountain is Array else Vector4.ZERO,
			"wk_fountain_k": Vector4(1.0 / float(F["ring"]), float(F["cycles"]) / period, 1.0 / float(F["r"]), 0.0)}
	return u
