# core/world 250 m drainage residual in GDScript: the twin of 43d-world-residual.js (GRAPHICS-TERRAIN-PROPOSAL.md T2).
# Evaluates the signed 250 m residual raster D(wx, wz) in [-400, +400] m by bicubic Catmull-Rom over world-aligned u16
# rasters (loaded losslessly from a 16-bit grayscale PNG via IHDR+IDAT zlib inflate, or u16_b64 / u16 array), matched to <= 1e-6.
extends RefCounted

static var active := false
static var OX := 0.0
static var OZ := 0.0
static var WX0 := 0.0
static var WZ0 := 0.0
static var CELL := 250.0
static var NX := 0
static var NZ := 0
static var LO := -400.0
static var HI := 400.0
static var CX0 := 0.0
static var CZ0 := 0.0
static var CX1 := 0.0
static var CZ1 := 0.0
static var FEATHER := 0.0
static var DATA := PackedFloat64Array()


static func reset() -> void:
	active = false
	DATA = PackedFloat64Array()
	NX = 0
	NZ = 0


static func _clamp(v: float, a: float, b: float) -> float:
	return a if v < a else (b if v > b else v)


static func _smooth(a: float, b: float, x: float) -> float:
	var t := (x - a) / (b - a)
	t = 0.0 if t < 0.0 else (1.0 if t > 1.0 else t)
	return t * t * (3.0 - 2.0 * t)


static func _cr(p0: float, p1: float, p2: float, p3: float, t: float) -> float:
	return p1 + 0.5 * t * (p2 - p0 + t * (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3 + t * (3.0 * (p1 - p2) + p3 - p0)))


static func _crd(p0: float, p1: float, p2: float, p3: float, t: float) -> float:
	return 0.5 * ((p2 - p0) + t * (2.0 * (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) + 3.0 * t * (3.0 * (p1 - p2) + p3 - p0)))


static func _u32_be(b: PackedByteArray, p: int) -> int:
	return (int(b[p]) << 24) | (int(b[p + 1]) << 16) | (int(b[p + 2]) << 8) | int(b[p + 3])


static func _load_u16_png_lossless(path: String, lo: float, hi: float) -> Dictionary:
	var b := FileAccess.get_file_as_bytes(path)
	if b.size() < 33:
		return {}
	var pos := 8
	var w := 0
	var h := 0
	var bit_depth := 0
	var color_type := 0
	var idat := PackedByteArray()
	while pos + 12 <= b.size():
		var clen := _u32_be(b, pos)
		var tag := b.slice(pos + 4, pos + 8).get_string_from_ascii()
		if tag == "IHDR" and clen >= 13:
			w = _u32_be(b, pos + 8)
			h = _u32_be(b, pos + 12)
			bit_depth = int(b[pos + 16])
			color_type = int(b[pos + 17])
		elif tag == "IDAT":
			idat.append_array(b.slice(pos + 8, pos + 8 + clen))
		elif tag == "IEND":
			break
		pos += 12 + clen
	if w <= 0 or h <= 0 or bit_depth != 16 or color_type != 0:
		return {}
	var stride := w * 2
	var expected := h * (1 + stride)
	var raw := idat.decompress(expected, FileAccess.COMPRESSION_DEFLATE)
	if raw.size() != expected:
		raw = idat.decompress_dynamic(-1, FileAccess.COMPRESSION_DEFLATE)
	if raw.size() < expected:
		return {}
	var out := PackedFloat64Array()
	out.resize(w * h)
	var sc := (hi - lo) / 65535.0
	var prev := PackedByteArray()
	prev.resize(stride)
	var cur := PackedByteArray()
	cur.resize(stride)
	for j in h:
		var r0 := j * (1 + stride)
		var ftype := int(raw[r0])
		for x in stride:
			var v := int(raw[r0 + 1 + x])
			if ftype == 0:
				cur[x] = v
			elif ftype == 1:
				var a := int(cur[x - 2]) if x >= 2 else 0
				cur[x] = (v + a) & 0xFF
			elif ftype == 2:
				cur[x] = (v + int(prev[x])) & 0xFF
			elif ftype == 3:
				var a := int(cur[x - 2]) if x >= 2 else 0
				var up := int(prev[x])
				cur[x] = (v + ((a + up) >> 1)) & 0xFF
			else:
				var a := int(cur[x - 2]) if x >= 2 else 0
				var up := int(prev[x])
				var c := int(prev[x - 2]) if x >= 2 else 0
				var p_val := a + up - c
				var pa := absi(p_val - a)
				var pb := absi(p_val - up)
				var pc := absi(p_val - c)
				var pr := a if (pa <= pb and pa <= pc) else (up if pb <= pc else c)
				cur[x] = (v + pr) & 0xFF
		var row_off := j * w
		for i in w:
			var q := (int(cur[2 * i]) << 8) | int(cur[2 * i + 1])
			out[row_off + i] = lo + float(q) * sc
		for x in stride:
			prev[x] = cur[x]
	return {"nx": w, "nz": h, "data": out}


static func init(o: Dictionary) -> void:
	if o.is_empty():
		reset()
		return
	OX = float(o.get("ox", 0.0))
	OZ = float(o.get("oz", 0.0))
	WX0 = float(o.get("wx0", 0.0))
	WZ0 = float(o.get("wz0", 0.0))
	CELL = float(o.get("cell", 250.0))
	NX = int(o.get("nx", 0))
	NZ = int(o.get("nz", 0))
	LO = float(o.get("lo", -400.0))
	HI = float(o.get("hi", 400.0))
	FEATHER = float(o.get("feather", 0.0))
	DATA = PackedFloat64Array()

	if o.has("png_path"):
		var dec := _load_u16_png_lossless(str(o["png_path"]), LO, HI)
		if not dec.is_empty():
			NX = int(dec["nx"])
			NZ = int(dec["nz"])
			DATA = dec["data"]
	elif o.has("u16_b64") and NX > 0 and NZ > 0:
		var raw := Marshalls.base64_to_raw(str(o["u16_b64"]))
		var sc := (HI - LO) / 65535.0
		DATA.resize(NX * NZ)
		for k in NX * NZ:
			DATA[k] = LO + float(raw.decode_u16(k * 2)) * sc
	elif o.has("u16"):
		var u = o["u16"]
		var sc := (HI - LO) / 65535.0
		DATA.resize(NX * NZ)
		for k in NX * NZ:
			DATA[k] = LO + float(u[k]) * sc

	if o.has("coreBox") and (o["coreBox"] as Array).size() == 4:
		var cb: Array = o["coreBox"]
		CX0 = float(cb[0])
		CZ0 = float(cb[1])
		CX1 = float(cb[2])
		CZ1 = float(cb[3])
	else:
		CX0 = WX0 + CELL
		CZ0 = WZ0 + CELL
		CX1 = WX0 + float(NX - 2) * CELL
		CZ1 = WZ0 + float(NZ - 2) * CELL

	active = DATA.size() == NX * NZ and NX >= 4 and NZ >= 4


static func weight(x: float, z: float) -> float:
	if not active:
		return 0.0
	var wx := x + OX
	var wz := z + OZ
	if wx <= CX0 or wx >= CX1 or wz <= CZ0 or wz >= CZ1:
		return 0.0
	if not (FEATHER > 0.0):
		return 1.0
	var d := minf(minf(wx - CX0, CX1 - wx), minf(wz - CZ0, CZ1 - wz))
	return 1.0 if d >= FEATHER else _smooth(0.0, FEATHER, d)


static func _raw_at(wx: float, wz: float) -> float:
	var u := _clamp((wx - WX0) / CELL, 1.0, float(NX) - 2.0001)
	var v := _clamp((wz - WZ0) / CELL, 1.0, float(NZ) - 2.0001)
	var i := floori(u)
	var j := floori(v)
	var fu := u - float(i)
	var fv := v - float(j)
	var o0 := (j - 1) * NX + i
	var o1 := j * NX + i
	var o2 := (j + 1) * NX + i
	var o3 := (j + 2) * NX + i
	var r0 := _cr(DATA[o0 - 1], DATA[o0], DATA[o0 + 1], DATA[o0 + 2], fu)
	var r1 := _cr(DATA[o1 - 1], DATA[o1], DATA[o1 + 1], DATA[o1 + 2], fu)
	var r2 := _cr(DATA[o2 - 1], DATA[o2], DATA[o2 + 1], DATA[o2 + 2], fu)
	var r3 := _cr(DATA[o3 - 1], DATA[o3], DATA[o3 + 1], DATA[o3 + 2], fu)
	return _cr(r0, r1, r2, r3, fv)


static func at(x: float, z: float, min_wave: float = 0.0) -> float:
	if not active or min_wave >= 3200.0:
		return 0.0
	var w := weight(x, z)
	if not (w > 0.0):
		return 0.0
	var lod := 1.0 if min_wave <= 1200.0 else (1.0 - _smooth(1200.0, 3200.0, min_wave))
	return w * lod * _raw_at(x + OX, z + OZ)


static func grad(x: float, z: float) -> Array:
	if not active:
		return [0.0, 0.0]
	var w := weight(x, z)
	if not (w > 0.0):
		return [0.0, 0.0]
	var u := _clamp((x + OX - WX0) / CELL, 1.0, float(NX) - 2.0001)
	var v := _clamp((z + OZ - WZ0) / CELL, 1.0, float(NZ) - 2.0001)
	var i := floori(u)
	var j := floori(v)
	var fu := u - float(i)
	var fv := v - float(j)
	var o0 := (j - 1) * NX + i
	var o1 := j * NX + i
	var o2 := (j + 1) * NX + i
	var o3 := (j + 2) * NX + i
	var r0 := _cr(DATA[o0 - 1], DATA[o0], DATA[o0 + 1], DATA[o0 + 2], fu)
	var r1 := _cr(DATA[o1 - 1], DATA[o1], DATA[o1 + 1], DATA[o1 + 2], fu)
	var r2 := _cr(DATA[o2 - 1], DATA[o2], DATA[o2 + 1], DATA[o2 + 2], fu)
	var r3 := _cr(DATA[o3 - 1], DATA[o3], DATA[o3 + 1], DATA[o3 + 2], fu)
	var d0 := _crd(DATA[o0 - 1], DATA[o0], DATA[o0 + 1], DATA[o0 + 2], fu)
	var d1 := _crd(DATA[o1 - 1], DATA[o1], DATA[o1 + 1], DATA[o1 + 2], fu)
	var d2 := _crd(DATA[o2 - 1], DATA[o2], DATA[o2 + 1], DATA[o2 + 2], fu)
	var d3 := _crd(DATA[o3 - 1], DATA[o3], DATA[o3 + 1], DATA[o3 + 2], fu)
	return [w * _cr(d0, d1, d2, d3, fv) / CELL, w * _crd(r0, r1, r2, r3, fv) / CELL]
