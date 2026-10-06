# core/mask in GDScript: the twin of 25-core-mask.js. Replays a mask's ops (KMASK.export(...).ops) into the same RGBA
# bytes, bit for bit: pixel centres, hard edges, nonzero fill, round strokes, and only +, -, *, / and comparisons in
# the JS file's order. golden.json (written by test-mask.js) is the test: kmask_test.gd.
#
#   var bytes := KMask.replay(ops, width, height)   -> PackedByteArray (RGBA, row by row)
#   KMask.hash(bytes)                                -> FNV-1a, 8 hex digits, as KMASK.hash
#   KMask.at(bytes, width, i, j, channel)            -> one byte
extends RefCounted


static func _round(v: float) -> int:   # Math.round for the non-negative values a blend makes
	return int(floor(v + 0.5))


static func _put(d: PackedByteArray, o: int, c: Array) -> void:
	var a: float = c[3]
	if a >= 1.0:
		d[o] = c[0]
		d[o + 1] = c[1]
		d[o + 2] = c[2]
		d[o + 3] = 255
		return
	d[o] = _round(c[0] * a + d[o] * (1.0 - a))
	d[o + 1] = _round(c[1] * a + d[o + 1] * (1.0 - a))
	d[o + 2] = _round(c[2] * a + d[o + 2] * (1.0 - a))
	d[o + 3] = _round(255.0 * a + d[o + 3] * (1.0 - a))


static func _i0(a: float, n: int) -> int:
	return clampi(int(ceil(a - 0.5)), 0, n)


static func _i1(b: float, n: int) -> int:
	return clampi(int(floor(b - 0.5)), -1, n - 1)


static func disc(d: PackedByteArray, w: int, h: int, cx: float, cy: float, r: float, c: Array) -> void:
	var r2 := r * r
	for j in range(_i0(cy - r, h), _i1(cy + r, h) + 1):
		var dy := j + 0.5 - cy
		var dy2 := dy * dy
		for i in range(_i0(cx - r, w), _i1(cx + r, w) + 1):
			var dx := i + 0.5 - cx
			if dx * dx + dy2 <= r2:
				_put(d, (j * w + i) * 4, c)


static func ring(d: PackedByteArray, w: int, h: int, cx: float, cy: float, r: float, hw: float, c: Array) -> void:
	var ro := r + hw
	var ri := r - hw
	var ro2 := ro * ro
	var ri2 := ri * ri if ri > 0.0 else -1.0
	for j in range(_i0(cy - ro, h), _i1(cy + ro, h) + 1):
		var dy := j + 0.5 - cy
		var dy2 := dy * dy
		for i in range(_i0(cx - ro, w), _i1(cx + ro, w) + 1):
			var dx := i + 0.5 - cx
			var q := dx * dx + dy2
			if q <= ro2 and q >= ri2:
				_put(d, (j * w + i) * 4, c)


static func polyline(d: PackedByteArray, w: int, h: int, pts: Array, hw: float, c: Array) -> void:
	if pts.size() < 4:
		return
	var x0 := INF
	var y0 := INF
	var x1 := -INF
	var y1 := -INF
	for k in range(0, pts.size(), 2):
		x0 = min(x0, pts[k]); x1 = max(x1, pts[k]); y0 = min(y0, pts[k + 1]); y1 = max(y1, pts[k + 1])
	var ia := _i0(x0 - hw, w)
	var ib := _i1(x1 + hw, w)
	var ja := _i0(y0 - hw, h)
	var jb := _i1(y1 + hw, h)
	if ib < ia or jb < ja:
		return
	var bw := ib - ia + 1
	var mark := PackedByteArray()
	mark.resize(bw * (jb - ja + 1))
	var hw2 := hw * hw
	var k := 0
	while k + 3 < pts.size():
		var ax: float = pts[k]
		var ay: float = pts[k + 1]
		var ex: float = pts[k + 2] - ax
		var ey: float = pts[k + 3] - ay
		var l2 := ex * ex + ey * ey
		var bx := ax + ex
		var by := ay + ey
		for j in range(_i0(min(ay, by) - hw, h), _i1(max(ay, by) + hw, h) + 1):
			var py := j + 0.5 - ay
			for i in range(_i0(min(ax, bx) - hw, w), _i1(max(ax, bx) + hw, w) + 1):
				var m := (j - ja) * bw + (i - ia)
				if mark[m]:
					continue
				var pxx := i + 0.5 - ax
				var t := (pxx * ex + py * ey) / l2 if l2 > 0.0 else 0.0
				t = clampf(t, 0.0, 1.0)
				var qx := pxx - t * ex
				var qy := py - t * ey
				if qx * qx + qy * qy <= hw2:
					mark[m] = 1
					_put(d, (j * w + i) * 4, c)
		k += 2


static func polygons(d: PackedByteArray, w: int, h: int, rings: Array, c: Array) -> void:
	var y0 := INF
	var y1 := -INF
	for p in rings:
		for k in range(1, p.size(), 2):
			y0 = min(y0, p[k]); y1 = max(y1, p[k])
	for j in range(_i0(y0, h), _i1(y1, h) + 1):
		var yc := j + 0.5
		var xs: Array[float] = []
		var ws: Array[int] = []
		for p in rings:
			var n: int = p.size()
			for k in range(0, n, 2):
				var ax: float = p[k]
				var ay: float = p[k + 1]
				var bx: float = p[(k + 2) % n]
				var by: float = p[(k + 3) % n]
				if (ay <= yc and by > yc) or (by <= yc and ay > yc):
					xs.append(ax + (yc - ay) * (bx - ax) / (by - ay))
					ws.append(1 if by > ay else -1)
		if xs.is_empty():
			continue
		var ord: Array = range(xs.size())
		ord.sort_custom(func(a, b): return xs[a] < xs[b] or (xs[a] == xs[b] and a < b))
		var wind := 0
		for q in ord.size() - 1:
			wind += ws[ord[q]]
			if wind != 0:
				for i in range(_i0(xs[ord[q]], w), _i1(xs[ord[q + 1]], w) + 1):
					_put(d, (j * w + i) * 4, c)


static func rect(d: PackedByteArray, w: int, h: int, x: float, y: float, rw: float, rh: float, c: Array) -> void:
	var ia := clampi(int(ceil(x - 0.5)), 0, w)
	var ib := clampi(int(ceil(x + rw - 0.5)) - 1, -1, w - 1)
	var ja := clampi(int(ceil(y - 0.5)), 0, h)
	var jb := clampi(int(ceil(y + rh - 0.5)) - 1, -1, h - 1)
	for j in range(ja, jb + 1):
		for i in range(ia, ib + 1):
			_put(d, (j * w + i) * 4, c)


# an op is [name, numbers..., r, g, b, a] as KMASK records it; 'put' (a whole image) cannot be replayed from ops
static func replay(ops: Array, w: int, h: int) -> PackedByteArray:
	var d := PackedByteArray()
	d.resize(w * h * 4)
	for op in ops:
		var n: int = op.size()
		var c := [int(op[n - 4]), int(op[n - 3]), int(op[n - 2]), float(op[n - 1])]
		match op[0]:
			"disc": disc(d, w, h, op[1], op[2], op[3], c)
			"ring": ring(d, w, h, op[1], op[2], op[3], op[4], c)
			"polyline": polyline(d, w, h, op[1], op[2], c)
			"polygons": polygons(d, w, h, op[1], c)
			"rect": rect(d, w, h, op[1], op[2], op[3], op[4], c)
			_: push_error("core/mask: cannot replay op " + str(op[0]))
	return d


static func hash(b: PackedByteArray) -> String:
	var hh := 2166136261
	for v in b:
		hh = ((hh ^ v) * 16777619) & 0xFFFFFFFF
	return "%08x" % hh


static func at(b: PackedByteArray, w: int, i: int, j: int, ch: int) -> int:
	return b[(j * w + i) * 4 + ch]
