# core/water's open surface in GDScript (core/water/README.md, "Godot"): the CPU twin of WATER's (20-core-water.js:
# troD, troNJ, rest, surfaceAt, heightAt, normalAt, foamAt, the bed's depth and damping), rebuilt from core/export's
# water section (krator-water) alone, in 64-bit floats, every sum in the JavaScript's order, so a height here equals
# WATER.heightAt to the last bits or close to it (tests/water/water_test.gd: against node's twin at fixed (x, z, t);
# tests/export/world_test.gd's water checks: against the probes the page wrote). shaders/lib/water.gdshaderinc is the
# same maths on the GPU; uniforms() gives it this surface. The shared wave field (field > 0) comes from an atmos object
# with wave_height(x, z, t, chop) and wave_slope(x, z, t, d) (krator/atmos.gd: the Atmos autoload, or a new instance).
# Never Vector2 or Vector3 here: they are 32-bit.
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


# every open surface of a krator-water section, as KWater (the other kinds are not drawn yet: phases 2 to 4)
static func from_section(sec: Dictionary, atm: Object = null) -> Array:
	var out := []
	for r in sec.get("surfaces", []):
		if r.get("kind") == "open":
			out.append(from_record(r, sec, atm))
	return out


static func from_record(r: Dictionary, sec: Dictionary, atm: Object = null) -> KWater:
	var w := KWater.new()
	w.id = str(r["id"])
	w.kind = str(r["kind"])
	w.name = str(r.get("name", ""))
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
	w.extent = r.get("extent")
	w.look = r.get("look")
	w.presets = sec.get("presets", {})
	w.period = float(sec.get("period", 600.0))
	w.atmos = atm
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
	var out := PackedFloat64Array([0.0, 0.0])
	for ch in 2:
		var c00 := _byte(i0, j0, ch)
		var c10 := _byte(i0 + 1, j0, ch)
		var c01 := _byte(i0, j0 + 1, ch)
		var c11 := _byte(i0 + 1, j0 + 1, ch)
		out[ch] = (c00 * (1.0 - ax) + c10 * ax) * (1.0 - az) + (c01 * (1.0 - ax) + c11 * ax) * az
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
	return _ss(0.0, damp_depth, depth_at(x, z, t)) if bed != null else 1.0


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
	return PackedFloat64Array([x, level_at(t) + (d[1] + f) * m, z, m])


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
	return u
