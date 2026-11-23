# core/world landforms in GDScript: the twin of 43b-world-landforms.js (core/world/PLAN-RELIEF.md P4, P7, P12; P15). The
# record engine: records placed per 2 km world-absolute cell by the land style, pinned records, the overlay's fissures,
# the world-absolute features (the master gja), and the land with them (each body's raster with its batter and talus
# apron, the cuts). Bodies are core/terrain's KSTACKS records (kstacks.gd). The rasters are PackedFloat32Array, as the JS
# file's Float32Arrays. Checked against core/world/golden-relief.json by wrelief_test.gd, to 1e-6.
#
#   WLand.pin(f)          before init: f (a Callable (o) -> [records], or an Array of records)
#   WLand.init(o)         o: {ox, oz, seed, ground, styleName, overlay, caprock, keep, inside (Callables), sites: [{x, z, pinned}]}
#   WLand.apply(h, x, z, minWave) -> h     WLand.at(x, z) -> Dictionary or null     WLand.list(x0, z0, x1, z1) -> Array
#   WLand.reset()     WLand.pins()     WLand.cells()
extends RefCounted

const KRand := preload("../rand/krand.gd")
const KStacks := preload("../terrain/kstacks.gd")

const CELL := 2000.0
const KEEP_SITE := 3500.0
const TALUS_H := 0.1
const TALUS_W := 0.35
const LOW := -1e9
const WALL := 20.0
const KINDS := {
	"savanna": [{"kind": "butte", "p": 0.35, "cap": 0.3, "h": [45, 140], "r": [70, 220]}, {"kind": "tor", "p": 0.3, "n": 2, "H": [6, 14], "r": [8, 18]}, {"kind": "dome", "p": 0.12, "H": [40, 120], "r": [90, 240]}],
	"desert": [{"kind": "butte", "p": 0.3, "cap": 0.3, "h": [40, 150], "r": [60, 200]}, {"kind": "dome", "p": 0.08, "H": [30, 100], "r": [80, 200]}, {"kind": "spire", "p": 0.12, "n": 4, "H": [18, 45], "r": [5, 11]}],
	"dryland": [{"kind": "tor", "p": 0.25, "n": 2, "H": [5, 12], "r": [7, 15]}, {"kind": "dome", "p": 0.12, "H": [30, 90], "r": [70, 190]}],
	"badland": [{"kind": "butte", "p": 0.35, "cap": 0.25, "h": [30, 110], "r": [50, 160]}, {"kind": "spire", "p": 0.4, "n": 6, "H": [12, 35], "r": [4, 9]}, {"kind": "fin", "p": 0.15, "n": 2, "H": [15, 40], "r": [8, 16]}],
	"chasm": [{"kind": "butte", "p": 0.45, "cap": 0.2, "h": [60, 200], "r": [80, 260]}],
	"steps": [{"kind": "butte", "p": 0.25, "cap": 0.3, "h": [40, 130], "r": [80, 240]}],
	"korona": [{"kind": "butte", "p": 0.2, "cap": 0.3, "h": [60, 180], "r": [90, 260]}],
	"highland": [{"kind": "tor", "p": 0.3, "n": 2, "H": [6, 16], "r": [8, 20]}],
	"karst": [{"kind": "tower", "p": 0.6, "n": 3, "H": [40, 135], "r": [35, 90]}]}
const KINDS_V2 := {
	"savanna": [{"kind": "butte", "p": 0.35, "cap": 0.3, "h": [45, 140], "r": [70, 220]}, {"kind": "tor", "p": 0.3, "n": 2, "H": [6, 14], "r": [8, 18]}, {"kind": "dome", "p": 0.12, "H": [40, 120], "r": [90, 240]}],
	"desert": [{"kind": "butte", "p": 0.3, "cap": 0.3, "h": [40, 150], "r": [60, 200]}, {"kind": "dome", "p": 0.08, "H": [30, 100], "r": [80, 200]}, {"kind": "spire", "p": 0.12, "n": 4, "H": [18, 45], "r": [5, 11]}],
	"dryland": [{"kind": "tor", "p": 0.25, "n": 2, "H": [5, 12], "r": [7, 15]}, {"kind": "dome", "p": 0.12, "H": [30, 90], "r": [70, 190]}],
	"badland": [{"kind": "butte", "p": 0.35, "cap": 0.25, "h": [30, 110], "r": [50, 160]}, {"kind": "spire", "p": 0.4, "n": 6, "H": [12, 35], "r": [4, 9]}, {"kind": "fin", "p": 0.15, "n": 2, "H": [15, 40], "r": [8, 16]}],
	"chasm": [{"kind": "butte", "p": 0.45, "cap": 0.2, "h": [60, 200], "r": [80, 260]}],
	"steps": [{"kind": "butte", "p": 0.25, "cap": 0.3, "h": [40, 130], "r": [80, 240]}],
	"korona": [{"kind": "butte", "p": 0.2, "cap": 0.3, "h": [60, 180], "r": [90, 260]}],
	"highland": [{"kind": "tor", "p": 0.3, "n": 2, "H": [6, 16], "r": [8, 20]}],
	"karst": [{"kind": "tower", "p": 0.6, "n": 3, "H": [40, 135], "r": [35, 90]}],
	"alpine": [{"kind": "tor", "p": 0.45, "n": 3, "H": [12, 34], "r": [10, 22], "crest": 6.0, "label": "A ridge gendarme"}, {"kind": "fin", "p": 0.3, "n": 2, "H": [16, 44], "r": [8, 16], "crest": 8.0, "label": "An arete crag"}],
	"volcanic": [{"kind": "spire", "p": 0.35, "n": 2, "H": [18, 50], "r": [8, 18], "crest": 6.0, "label": "A volcanic plug"}, {"kind": "tor", "p": 0.3, "n": 2, "H": [9, 24], "r": [9, 20], "crest": 5.0, "label": "A lava crag"}]}
const FEATURES := [{"id": "gja:master", "kind": "gja", "name": "The master gja of the Singing Gjar", "px": [1569, 1643], "strike": 20, "len": 24000, "w": [300, 600], "d": 310}]
const OVERLAY := {"high rift": [{"kind": "fissure", "p": 0.3, "n": 3, "L": [400, 2400], "w": [2, 30], "d": [3, 50], "strike": 20, "jit": 8}]}
const COS_T := [1.0, 0.7071, 0.0, -0.7071, -1.0, -0.7071, 0.0, 0.7071]
const SIN_T := [0.0, 0.7071, 1.0, 0.7071, 0.0, -0.7071, -1.0, -0.7071]

static var OX := 0.0
static var OZ := 0.0
static var SEED := 0
static var O = null
static var PINS := []
static var PINF := []
static var CELLS := {}
static var V2 := false


static func _clamp(v: float, a: float, b: float) -> float:
	return a if v < a else (b if v > b else v)


static func _lerp(a: float, b: float, t: float) -> float:
	return a + (b - a) * t


static func _smooth(a: float, b: float, v: float) -> float:
	var t := (v - a) / (b - a)
	t = 0.0 if t < 0 else (1.0 if t > 1 else t)
	return t * t * (3 - 2 * t)


static func _g(x: float, z: float) -> float:
	return O.ground.call(x, z)


static func _keep(x: float, z: float) -> bool:
	return O.keep.call(x, z)


static func pin(f) -> void:
	PINF.append(f)


static func init(o: Dictionary) -> void:
	O = o
	OX = float(o.get("ox", 0.0))
	OZ = float(o.get("oz", 0.0))
	SEED = KRand.child(0x4C4E44 if o.get("seed") == null else int(o.seed), "landform")
	V2 = (int(o.get("version", 1)) == 2)
	CELLS.clear()
	PINS = []
	for f in PINF:
		var L = f.call(o) if f is Callable else f
		for B in (L if L else []):
			B.pinned = 1
			PINS.append(B)
	var inside = o.get("inside")
	for F in FEATURES:
		var x: float = F.px[0] * 2000.0 - OX
		var z: float = F.px[1] * 2000.0 - OZ
		var a: float = F.strike * PI / 180
		var ux := sin(a)
		var uz := -cos(a)
		var hl: float = F.len / 2.0
		if not (inside is Callable) or not inside.call(x, z):
			continue
		var top := -1e9
		var t := -hl
		while t <= hl:
			for sd: float in [-6000.0, -4000.0, 4000.0, 6000.0]:
				var px := x + ux * t - uz * sd
				var pz := z + uz * t + ux * sd
				if inside.call(px, pz):
					top = maxf(top, _g(px, pz))
			t += 2000.0
		PINS.append({"id": F.id, "kind": F.kind, "name": F.name, "carve": 1, "pinned": 1, "feature": 1, "x": x, "z": z,
			"a": [x - ux * hl, z - uz * hl], "b": [x + ux * hl, z + uz * hl], "w": (F.w[0] + F.w[1]) / 2.0, "wr": F.w, "d": F.d,
			"bed": top - F.d, "R": hl + F.w[1]})


static func reset() -> void:
	PINS = []
	PINF = []
	CELLS.clear()
	O = null
	V2 = false


static func _u01(i: int, j: int, k: int, s: int) -> float:
	return KRand.unit(KRand.hash_ints(SEED, [i, j, k * 16 + s]))


static func _rng(a: Array, i: int, j: int, k: int, s: int) -> float:
	return a[0] + (a[1] - a[0]) * _u01(i, j, k, s)


static func _free(x: float, z: float, R: float) -> bool:
	if _keep(x, z):
		return false
	for a in 8:
		if _keep(x + COS_T[a] * R * 1.1, z + SIN_T[a] * R * 1.1):
			return false
	for s in O.get("sites", []):
		if not s.get("pinned") and KStacks.hypot(x - s.x, z - s.z) < KEEP_SITE + R:
			return false
	return true


static func _foot_y(x: float, z: float, rx: float, rz: float) -> float:
	var m := _g(x, z)
	for a in 8:
		for k in [0.6, 1.05]:
			m = minf(m, _g(x + COS_T[a] * rx * k, z + SIN_T[a] * rz * k))
	return m - 2


static func _cell_of(i: int, j: int) -> Array:
	var key := (i + 32768) * 65536 + (j + 32768)
	if CELLS.has(key):
		return CELLS[key]
	var C := []
	CELLS[key] = C
	var bx := i * CELL - OX
	var bz := j * CELL - OZ
	var mx := bx + CELL / 2
	var mz := bz + CELL / 2
	var KT := KINDS_V2 if V2 else KINDS
	var K = KT.get(O.styleName.call(mx, mz))
	_fissures(i, j, bx, bz, mx, mz, C)
	if K == null:
		return C
	for di in K.size():
		var D: Dictionary = K[di]
		var n: int = D.get("n", 1)
		for t in n:
			var k: int = di * 8 + t
			if _u01(i, j, k, 0) >= D.p:
				continue
			var big: bool = D.kind == "butte" or D.kind == "dome" or D.kind == "tower"
			var r := _rng(D.r, i, j, k, 1)
			var inset := minf(CELL * 0.45, (r * 1.6 if big else r * 3) + 40)
			var x := bx + inset + (CELL - 2 * inset) * _u01(i, j, k, 2)
			var z := bz + inset + (CELL - 2 * inset) * _u01(i, j, k, 3)
			if D.get("cap") and O.caprock.call(x, z) < D.cap:
				continue
			if D.get("crest"):
				var prom := _g(x, z) - 0.25 * (_g(x + 120.0, z) + _g(x - 120.0, z) + _g(x, z + 120.0) + _g(x, z - 120.0))
				if prom < float(D.crest):
					continue
			if not _free(x, z, r * 1.4 if big else r * 2):
				continue
			var clash := false
			for B in C:
				if KStacks.hypot(B.x - x, B.z - z) < B.R + (r * 1.4 if big else r * 2) + 30:
					clash = true
					break
			if clash:
				continue
			var seed := KRand.hash_ints(SEED, [i, j, k * 16 + 9])
			var ry := _u01(i, j, k, 4) * 3.14159
			var id: String = "lf:" + D.kind + ":" + str(i) + ":" + str(j) + ":" + str(t)
			var B = null
			var Hm := 0.0
			if D.kind == "butte":
				var e := 1 + _u01(i, j, k, 5) * 0.8
				var y0 := _foot_y(x, z, r / sqrt(e), r * sqrt(e))
				var h := _rng(D.h, i, j, k, 6)
				Hm = h
				B = KStacks.make({"id": id, "kind": "butte", "x": x, "z": z, "y0": y0, "seed": seed, "lobes": 0.18, "weather": 0.8,
					"tiers": [{"h": h + (_g(x, z) - y0), "r": r, "e": e, "ry": ry}], "shoulder": {"h": minf(20, h * 0.15), "back": minf(18, h * 0.12), "bed": [3.0, 6.0]}})
				B.name = "A butte (" + str(int(KStacks.jround(h))) + " m)"
			elif D.kind == "dome":
				var H := _rng(D.H, i, j, k, 6)
				var y0 := _foot_y(x, z, r, r)
				Hm = H
				B = KStacks.make({"id": id, "kind": "dome", "x": x, "z": z, "H": H + (_g(x, z) - y0), "r": r, "y0": y0, "seed": seed, "e": 1 + _u01(i, j, k, 5) * 0.5, "ry": ry})
				B.name = "An inselberg (" + str(int(KStacks.jround(H))) + " m)"
			elif D.kind == "tor":
				var H := _rng(D.H, i, j, k, 6)
				var y0 := _foot_y(x, z, r, r)
				Hm = H
				B = KStacks.make({"id": id, "kind": "tor", "x": x, "z": z, "H": H + (_g(x, z) - y0), "r": r, "y0": y0, "seed": seed})
				B.name = "A kopje (" + str(int(KStacks.jround(H))) + " m)"
			elif D.kind == "spire" or D.kind == "fin":
				var H := _rng(D.H, i, j, k, 6)
				var y0 := _foot_y(x, z, r, r)
				Hm = H
				B = KStacks.make({"id": id, "kind": D.kind, "x": x, "z": z, "y0": y0, "seed": seed, "H": H + (_g(x, z) - y0), "r": r,
					"e": 3 + _u01(i, j, k, 5) * 2 if D.kind == "fin" else 1 + _u01(i, j, k, 5) * 0.4, "ry": ry, "lean": (_u01(i, j, k, 7) - 0.5) * 0.12})
				B.name = ("A fin (" if D.kind == "fin" else "A hoodoo (") + str(int(KStacks.jround(H))) + " m)"
			elif D.kind == "tower":
				var H := _rng(D.H, i, j, k, 6)
				var y0 := _foot_y(x, z, r, r)
				Hm = H
				B = KStacks.tower({"id": id, "seed": seed, "x": x, "z": z, "H": H + (_g(x, z) - y0), "R": r, "y0": y0})
				B.name = "A karst tower (" + str(int(KStacks.jround(H))) + " m)"
			if B:
				if D.get("label"):
					B.name = str(D.label) + " (" + str(int(KStacks.jround(Hm))) + " m)"
				B.placed = 1
				C.append(B)
	return C


# THE FISSURES of cell (i, j), en echelon
static func _fissures(i: int, j: int, bx: float, bz: float, mx: float, mz: float, C: Array) -> void:
	var ov = O.overlay.call(mx, mz) if O.get("overlay") is Callable else ""
	var F = OVERLAY.get(ov) if ov else null
	if F == null:
		return
	for di in F.size():
		var D: Dictionary = F[di]
		var px = null
		var pz = null
		for t in int(D.n):
			var k: int = 64 + di * 8 + t
			if _u01(i, j, k, 0) >= D.p:
				continue
			var len := _rng(D.L, i, j, k, 1)
			var w := _rng(D.w, i, j, k, 2)
			var d := minf(_rng(D.d, i, j, k, 3), w * 2 + 2)
			var a: float = (D.strike + (_u01(i, j, k, 4) - 0.5) * 2 * D.jit) * PI / 180
			var ux := sin(a)
			var uz := -cos(a)
			var x: float
			var z: float
			if px == null:
				x = bx + CELL * (0.25 + 0.5 * _u01(i, j, k, 5))
				z = bz + CELL * (0.25 + 0.5 * _u01(i, j, k, 6))
			else:
				var off := w * (3 + 3 * _u01(i, j, k, 5))
				var al := len * 0.33 * (-1.0 if _u01(i, j, k, 6) < 0.5 else 1.0)
				x = px - uz * off + ux * al
				z = pz + ux * off + uz * al
			var hl := minf(len / 2, CELL * 0.45)
			var A := [x - ux * hl, z - uz * hl]
			var B2 := [x + ux * hl, z + uz * hl]
			if _keep(x, z) or _keep(A[0], A[1]) or _keep(B2[0], B2[1]):
				continue
			C.append({"id": "lf:fissure:" + str(i) + ":" + str(j) + ":" + str(t), "kind": "fissure", "carve": 1, "placed": 1, "x": x, "z": z,
				"a": A, "b": B2, "w": w, "d": d, "R": hl + w + 14,
				"name": "A tension fissure (" + str(int(KStacks.jround(w))) + " m wide, " + str(int(KStacks.jround(d))) + " m deep)"})
			px = x
			pz = z


static func _fissure_cut(F: Dictionary, x: float, z: float) -> float:
	var dx: float = F.b[0] - F.a[0]
	var dz: float = F.b[1] - F.a[1]
	var l2 := dx * dx + dz * dz
	var l := sqrt(l2)
	var t: float = ((x - F.a[0]) * dx + (z - F.a[1]) * dz) / l2
	if t < -0.05 or t > 1.05:
		return 0.0
	t = 0.0 if t < 0 else (1.0 if t > 1 else t)
	var s: float = ((x - F.a[0]) * dz - (z - F.a[1]) * dx) / l
	var u := t * l
	if F.get("sd") == null:
		F.sd = KRand.hash_ints(SEED, [KStacks.jround(F.x), KStacks.jround(F.z), 77])
	var sd: int = F.sd
	var wob: float = ((KRand.vnoise(u / 220, 0, 0.5, sd) - 0.5) * 1.4 + (KRand.vnoise(u / 70, 3.1, 0.5, sd ^ 0x55) - 0.5) * 0.6) * minf(12, F.w * 1.5)
	var d := absf(s - wob)
	var hw: float = F.w / 2 * (1 - _smooth(0.8, 1, absf(2 * t - 1)))
	var edge: float = hw + F.d / 20 + 0.5
	if d >= edge or hw <= 0:
		return 0.0
	return F.d * (1 - _smooth(0.8, 1, absf(2 * t - 1))) * (1 - _smooth(hw, edge, d))


static func _gja_cut(F: Dictionary, h: float, x: float, z: float) -> float:
	var dx: float = F.b[0] - F.a[0]
	var dz: float = F.b[1] - F.a[1]
	var l2 := dx * dx + dz * dz
	var l := sqrt(l2)
	var t: float = ((x - F.a[0]) * dx + (z - F.a[1]) * dz) / l2
	if t < -0.02 or t > 1.02:
		return 0.0
	t = 0.0 if t < 0 else (1.0 if t > 1 else t)
	var u := t * l
	var sd := KRand.hash_ints(SEED, [77, 13, 5])
	var s: float = ((x - F.a[0]) * dz - (z - F.a[1]) * dx) / l
	var wob := (KRand.vnoise(u / 1800, 0, 0.5, sd) - 0.5) * 80
	var end := 1 - _smooth(0.85, 1, absf(2 * t - 1))
	var hw: float = (F.wr[0] + (F.wr[1] - F.wr[0]) * KRand.vnoise(u / 3000, 7, 0.5, sd ^ 9)) / 2 * end
	var d := absf(s - wob)
	if hw <= 1 or d > hw + F.d / 20.0 + 2:
		return 0.0
	var top: float = F.bed + F.d
	var shelf: float = F.bed + F.d * 0.45
	var R: float = F.d / 20.0
	var lvl: float
	if d < hw * 0.4:
		lvl = F.bed
	elif d < hw * 0.4 + R:
		lvl = _lerp(F.bed, shelf, _smooth(hw * 0.4, hw * 0.4 + R, d))
	elif d < hw * 0.8:
		lvl = shelf
	else:
		lvl = _lerp(shelf, top + 50, _smooth(hw * 0.8, hw + R, d))
	return maxf(0, h - lvl) * (1 - _smooth(hw, hw + R, d)) + 0.0


static func _ht(B: Dictionary) -> float:
	return float(B.R) if B.get("top") == null else float(B.top) - float(B.y0)


static func _reach(B: Dictionary) -> float:
	if B.get("_reach") == null:
		B._reach = float(B.R) + 2 if B.get("carve") else float(B.R) + _ht(B) * TALUS_W + 10
	return B._reach


static func _near(x: float, z: float) -> Array:
	var N := []
	for B in PINS:
		var R := _reach(B)
		if absf(x - B.x) <= R and absf(z - B.z) <= R:
			N.append(B)
	var i := floori((x + OX) / CELL)
	var j := floori((z + OZ) / CELL)
	for b in range(-1, 2):
		for a in range(-1, 2):
			for B in _cell_of(i + a, j + b):
				var R := _reach(B)
				if absf(x - B.x) <= R and absf(z - B.z) <= R:
					N.append(B)
	return N


# THE RASTER: a body's surface and its talus apron on a world-aligned grid, with the wall's batter
static func _raster(B: Dictionary) -> Dictionary:
	if B.get("_r") != null:
		return B._r
	var R := _reach(B)
	var cs := _clamp(float(B.R) / 50, 2, 6)
	var x0 := floorf((float(B.x) - R + OX) / cs) * cs - OX
	var z0 := floorf((float(B.z) - R + OZ) / cs) * cs - OZ
	var nx := ceili((float(B.x) + R - x0) / cs) + 1
	var nz := ceili((float(B.z) + R - z0) / cs) + 1
	var top := PackedFloat32Array()
	top.resize(nx * nz)
	var apr := PackedFloat32Array()
	apr.resize(nx * nz)
	var L1 := [B]
	var Ht := _ht(B)
	var W := Ht * TALUS_W + 8
	for j in nz:
		for i in nx:
			var x := x0 + i * cs
			var z := z0 + j * cs
			var o := j * nx + i
			var f = KStacks.foot(L1, x, z)
			var s = KStacks.surface(L1, x, z) if f != null and f.d <= cs else null
			top[o] = s.top if s != null else LOW
			if s == null:
				apr[o] = Ht * TALUS_H * (1 - _smooth(0, W, f.d)) if f != null and f.d > 0 and f.d < W else 0.0
	var d1 := WALL * cs
	var d2 := WALL * cs * 1.41421356
	for j in nz:
		for i in nx:
			var o := j * nx + i
			var v := top[o]
			if i > 0:
				v = maxf(v, top[o - 1] - d1)
			if j > 0:
				v = maxf(v, top[o - nx] - d1)
				if i > 0:
					v = maxf(v, top[o - nx - 1] - d2)
				if i < nx - 1:
					v = maxf(v, top[o - nx + 1] - d2)
			top[o] = v
	for j in range(nz - 1, -1, -1):
		for i in range(nx - 1, -1, -1):
			var o := j * nx + i
			var v := top[o]
			if i < nx - 1:
				v = maxf(v, top[o + 1] - d1)
			if j < nz - 1:
				v = maxf(v, top[o + nx] - d1)
				if i < nx - 1:
					v = maxf(v, top[o + nx + 1] - d2)
				if i > 0:
					v = maxf(v, top[o + nx - 1] - d2)
			top[o] = v
	B._r = {"x0": x0, "z0": z0, "cs": cs, "nx": nx, "nz": nz, "top": top, "apr": apr}
	return B._r


static func apply(h: float, x: float, z: float, minWave = null) -> float:
	if O == null:
		return h
	var N := _near(x, z)
	if not N.size():
		return h
	var mw: float = 0.0 if minWave == null else float(minWave)
	var out := h
	var cut := 0.0
	for B in N:
		if B.get("carve"):
			if B.w >= mw * 0.25:
				var c := _gja_cut(B, h, x, z) if B.kind == "gja" else _fissure_cut(B, x, z)
				if c > cut:
					cut = c
			continue
		if B.R * 2 < mw * 0.25:
			continue
		var r := _raster(B)
		var u: float = (x - r.x0) / r.cs
		var v: float = (z - r.z0) / r.cs
		if u < 0 or v < 0 or u >= r.nx - 1 or v >= r.nz - 1:
			continue
		var i := floori(u)
		var j := floori(v)
		var fu := u - i
		var fv := v - j
		var rnx: int = r.nx
		var o := j * rnx + i
		var T: PackedFloat32Array = r.top
		var A: PackedFloat32Array = r.apr
		var t := (T[o] * (1 - fu) + T[o + 1] * fu) * (1 - fv) + (T[o + rnx] * (1 - fu) + T[o + rnx + 1] * fu) * fv
		if t > out:
			out = t
		var a := (A[o] * (1 - fu) + A[o + 1] * fu) * (1 - fv) + (A[o + rnx] * (1 - fu) + A[o + rnx + 1] * fu) * fv
		if h + a > out:
			out = h + a
	return out - cut


# the record at (x, z): a raised one's {S, top, wall, d} or a carving's {S, cut}; null where none
static func at(x: float, z: float):
	if O == null:
		return null
	var N := _near(x, z)
	if not N.size():
		return null
	var R := N.filter(func(B): return not B.get("carve"))
	var s = KStacks.surface(R, x, z) if R.size() else null
	if s != null:
		return {"S": s.S, "top": s.top, "wall": s.wall, "d": s.d}
	for B in N:
		if B.get("carve"):
			var c := _gja_cut(B, _g(x, z), x, z) if B.kind == "gja" else _fissure_cut(B, x, z)
			if c > 0:
				return {"S": B, "cut": c}
	return null


static func list(x0: float, z0: float, x1: float, z1: float) -> Array:
	var out := PINS.filter(func(B): return B.x >= x0 and B.x <= x1 and B.z >= z0 and B.z <= z1)
	if O == null:
		return out
	for j in range(floori((z0 + OZ) / CELL), floori((z1 + OZ) / CELL) + 1):
		for i in range(floori((x0 + OX) / CELL), floori((x1 + OX) / CELL) + 1):
			for B in _cell_of(i, j):
				if B.x >= x0 and B.x <= x1 and B.z >= z0 and B.z <= z1:
					out.append(B)
	return out


static func cells() -> int:
	return CELLS.size()


static func pins() -> Array:
	return PINS
