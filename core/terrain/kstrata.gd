# core/terrain/35-core-strata.js in GDScript: the twin that reads a krator-strata record (S.export()) and answers what
# rock is at a point, bit for bit as the page's KSTRATA does (golden-strata.json, kstrata_test.gd). The beds come from
# the record; the noise lattice is rebuilt from the seed with core/rand's twin (krand.gd, one folder up in rand/).
#
#   var s := KStrata.from_export(json)
#   s.yy(x, y, z)                 the stratigraphic height
#   s.at(x, y, z)                 {yy, formation, recipe, bed, kid, kind, colour, hard, f, edge, cell, altered}
#   s.terrace(x, z, h, k = 0.6)   the ground eased into benches at each bed's top and foot (a monotone map of h)
class_name KStrata
extends RefCounted

const KRand := preload("../rand/krand.gd")
const P := 64

var seed: int
var tbl := PackedByteArray()
var dip: Array
var warp: Array
var wf: Array
var faults: Array
var kinds: Array
var fs: Array
var kind_at := {}
var fd = null


static func from_export(j: Dictionary) -> KStrata:
	assert(j.get("format", "") == "krator-strata", "KStrata: not a krator-strata record")
	var s := KStrata.new()
	s.seed = int(j["seed"])
	s.dip = j["dip"]
	s.warp = j["warp"]
	s.wf = j["warpF"]
	s.faults = j["faults"]
	s.kinds = j["kinds"]
	s.fs = j["formations"]
	for k in s.kinds:
		s.kind_at[k["name"]] = int(k["id"])
	s.tbl.resize(P * P * 4)
	for jj in P:
		for i in P:
			for c in 4:
				s.tbl[(jj * P + i) * 4 + c] = KRand.hash_ints(s.seed, [i, jj, c, 0x57A7]) >> 24
	var fold = j.get("fold")
	if fold != null:
		var dx := float(fold["dir"][0])
		var dz := float(fold["dir"][1])
		var dl := sqrt(dx * dx + dz * dz)
		var at_ = fold.get("at")
		s.fd = {"nx": -dz / dl, "nz": dx / dl, "wl": float(fold["wl"]), "amp": float(fold["amp"]),
			"ph": 0.0 if fold.get("phase") == null else float(fold["phase"]),
			"sh": 0.0 if fold.get("sharp") == null else float(fold["sharp"]),
			"ax": 0.0 if at_ == null else float(at_[0]), "az": 0.0 if at_ == null else float(at_[1])}
	return s


static func _clamp(v: float, a: float, b: float) -> float:
	return a if v < a else (b if v > b else v)


static func _sstep(a: float, b: float, x: float) -> float:
	var t := _clamp((x - a) / (b - a), 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)


static func wave(u: float, sharp: float) -> float:
	var t := u - floorf(u)
	var s := 1.0 - 32.0 * t * t * (1.0 - t) * (1.0 - t)
	var tri := 4.0 * absf(t - 0.5) - 1.0
	return s + (tri - s) * sharp


func _tv(c: int, i: int, j: int) -> float:
	return float(tbl[(posmod(j, P) * P + posmod(i, P)) * 4 + c]) / 255.0


func noise(c: int, x: float, z: float) -> float:
	var xi := floori(x)
	var zi := floori(z)
	var fx := x - float(xi)
	var fz := z - float(zi)
	var u := fx * fx * (3.0 - 2.0 * fx)
	var v := fz * fz * (3.0 - 2.0 * fz)
	var a := _tv(c, xi, zi)
	var b := _tv(c, xi + 1, zi)
	var d := _tv(c, xi, zi + 1)
	var e := _tv(c, xi + 1, zi + 1)
	var p := a + (b - a) * u
	var q := d + (e - d) * u
	return p + (q - p) * v


func _w1(x: float, z: float) -> float:
	return noise(0, x * float(wf[0]), z * float(wf[0])) - 0.5


func yy(x: float, y: float, z: float) -> float:
	var v := y + _w1(x, z) * float(warp[0]) + (noise(1, x * float(wf[1]) + 0.37, z * float(wf[1]) + 0.37) - 0.5) * float(warp[1]) \
		+ (x * float(dip[0]) + z * float(dip[1])) * float(dip[2])
	if fd != null:
		v -= fd["amp"] * wave(((x - fd["ax"]) * fd["nx"] + (z - fd["az"]) * fd["nz"]) / fd["wl"] + fd["ph"], fd["sh"])
	for F in faults:
		var ax := float(F["a"][0])
		var az := float(F["a"][1])
		var dx := float(F["b"][0]) - ax
		var dz := float(F["b"][1]) - az
		var L := sqrt(dx * dx + dz * dz)
		var s := (dz * (x - ax) - dx * (z - az)) / L
		var w := 2.0 if F.get("w") == null else float(F["w"])
		var m := 1.0
		if F.get("taper") != null and float(F["taper"]) != 0.0:
			var t := ((x - ax) * dx + (z - az) * dz) / (L * L)
			m = _clamp(1.0 + minf(t, 1.0 - t) * L / float(F["taper"]), 0.0, 1.0)
		v += float(F["throw"]) * _sstep(-w, w, s) * m
	return v


func _formation_at(v: float) -> int:
	var lo := 0
	var hi := fs.size() - 1
	if v < float(fs[0]["base"]):
		return 0
	while lo < hi:
		var mid := (lo + hi + 1) >> 1
		if float(fs[mid]["base"]) <= v:
			lo = mid
		else:
			hi = mid - 1
	return lo


func _bed_in(F: Dictionary, v: float) -> Array:
	var B: Array = F["beds"]
	var rep = F.get("repeat")
	var H := float(F["top"]) - float(F["base"]) if rep == null else float(rep)
	var r := v - float(F["base"])
	if F["flip"]:
		r = (float(F["top"]) - float(F["base"])) - r
	if rep != null:
		r = r - floorf(r / H) * H
	else:
		r = _clamp(r, 0.0, H)
	var lo := 0
	var hi := B.size() - 1
	while lo < hi:
		var mid := (lo + hi + 1) >> 1
		if float(B[mid][0]) <= r:
			lo = mid
		else:
			hi = mid - 1
	return [lo, r]


func _cell_vals(i: int, j: int, k: int, off: int) -> Array:
	var ti := i + 7 * k + off
	var tj := j + 13 * k + off * 3
	return [_tv(0, ti, tj), _tv(1, ti, tj), _tv(2, ti, tj), _tv(3, ti, tj)]


func _worley(x: float, y: float, z: float, size: float, off: int) -> Dictionary:
	var ci := floori(x / size)
	var cj := floori(y / size)
	var ck := floori(z / size)
	var d1 := 1e30
	var d2 := 1e30
	var best := {}
	for a in range(-1, 2):
		for b in range(-1, 2):
			for c in range(-1, 2):
				var i := ci + a
				var j := cj + b
				var k := ck + c
				var v := _cell_vals(i, j, k, off)
				var px: float = (float(i) + 0.15 + 0.7 * v[0]) * size - x
				var py: float = (float(j) + 0.15 + 0.7 * v[1]) * size - y
				var pz: float = (float(k) + 0.15 + 0.7 * v[2]) * size - z
				var d := sqrt(px * px + py * py + pz * pz)
				if d < d1:
					d2 = d1
					d1 = d
					best = {"i": i, "j": j, "k": k, "v": v}
				elif d < d2:
					d2 = d
	best["d1"] = d1
	best["d2"] = d2
	return best


func _pick_w(F: Dictionary, u: float) -> int:
	var Wt: Array = F["blocks"]["weights"]
	var cl: Array = F["blocks"]["clasts"]
	var tot := 0.0
	for w in Wt:
		tot += float(w)
	var a := u * tot
	for i in Wt.size():
		if a < float(Wt[i]):
			return int(cl[i])
		a -= float(Wt[i])
	return int(cl[Wt.size() - 1])


func _col(kid: int, u: float) -> Array:
	var C: Array = kinds[kid]["col"]
	var c: Array = C[int(floorf(u * C.size())) % C.size()]
	return [float(c[0]), float(c[1]), float(c[2])]


func _block_at(F: Dictionary, x: float, v: float, z: float, o: Dictionary) -> void:
	var Bk: Dictionary = F["blocks"]
	var size := float(Bk["size"])
	var W := _worley(x, v, z, size, 11)
	var mk: int = kind_at[F["recipe"] + "." + Bk["matrix"]]
	o["cell"] = [W["i"], W["j"], W["k"]]
	o["f"] = 0.0
	o["edge"] = (W["d2"] - W["d1"]) * 0.5
	if W["d2"] - W["d1"] < float(Bk["gap"]) * size:
		o["kid"] = mk
		o["colour"] = _col(mk, W["v"][3])
		return
	var id := _pick_w(F, W["v"][3])
	var nest = Bk.get("nest")
	if nest != null and kinds[id]["kind"] == nest["kind"]:
		var ns := float(nest["size"])
		var V := _worley(x, v, z, ns, 29)
		W = V
		o["cell"] = [V["i"], V["j"], V["k"]]
		o["edge"] = (V["d2"] - V["d1"]) * 0.5
		if V["d2"] - V["d1"] < float(Bk["gap"]) * ns:
			o["kid"] = mk
			o["colour"] = _col(mk, 0.0)
			return
		id = _pick_w(F, V["v"][3])
		if kinds[id]["kind"] == nest["kind"]:
			id = mk
	var vv := _cell_vals(W["i"], W["j"], W["k"], 23)
	var nx: float = vv[0] - 0.5
	var ny: float = vv[1] - 0.5
	var nz: float = vv[2] - 0.5
	var nl := sqrt(nx * nx + ny * ny + nz * nz)
	if nl < 1e-6:
		nx = 0.0
		ny = 1.0
		nz = 0.0
		nl = 1.0
	var band := floorf((x * nx + v * ny + z * nz) / nl / float(Bk["bed"]))
	var odd := band - 2.0 * floorf(band / 2.0)
	var c := _col(id, vv[3])
	var m := 0.9 if odd != 0.0 else 1.0
	o["kid"] = id
	o["colour"] = [c[0] * m, c[1] * m, c[2] * m]


func at(x: float, y: float, z: float) -> Dictionary:
	var o := {}
	var v := yy(x, y, z)
	var fi := _formation_at(v)
	var F: Dictionary = fs[fi]
	o["yy"] = v
	o["formation"] = fi
	o["recipe"] = F["recipe"]
	o["altered"] = false
	o["cell"] = null
	if F.get("blocks") != null:
		o["bed"] = -1
		_block_at(F, x, v, z, o)
	else:
		var q := _bed_in(F, v)
		var b: Array = F["beds"][q[0]]
		var r: float = q[1]
		o["bed"] = q[0]
		o["kid"] = int(b[2])
		o["colour"] = [float(b[3]), float(b[4]), float(b[5])]
		var f := _clamp((r - float(b[0])) / float(b[1]), 0.0, 1.0)
		if F["flip"]:
			f = 1.0 - f
		o["f"] = f
		o["edge"] = minf(r - float(b[0]), float(b[0]) + float(b[1]) - r)
	for A in F["alter"]:
		var K: Dictionary = kinds[o["kid"]]
		if typeof(A["kinds"]) != TYPE_STRING and not (A["kinds"] as Array).has(K["kind"]):
			continue
		if y < float(A["below"]) + float(A["band"]) * 2.0 * _w1(x, z):
			var key: String = F["recipe"] + "." + A["to"]
			if not kind_at.has(key):
				continue
			var tk: int = kind_at[key]
			var salt := int(F["salt"])
			var h: int
			if o["bed"] >= 0:
				h = KRand.hash_ints(salt, [o["bed"], 5])
			else:
				h = KRand.hash_ints(salt, [o["cell"][0], o["cell"][1], o["cell"][2], 5])
			o["kid"] = tk
			o["colour"] = _col(tk, KRand.unit(h))
			o["altered"] = true
			break
	o["kind"] = kinds[o["kid"]]["kind"]
	o["hard"] = float(kinds[o["kid"]]["hard"])
	return o


func terrace(x: float, z: float, h: float, k: float = 0.6) -> float:
	var v := yy(x, h, z)
	var F: Dictionary = fs[_formation_at(v)]
	if F.get("blocks") != null:
		return h
	var q := _bed_in(F, v)
	var b: Array = F["beds"][q[0]]
	var f := _clamp((float(q[1]) - float(b[0])) / float(b[1]), 0.0, 1.0)
	var s := _clamp(k * float(kinds[int(b[2])]["hard"]), 0.0, 1.0)
	var g := f + s * (f * f * (3.0 - 2.0 * f) - f)
	if F["flip"]:
		return h - (g - f) * float(b[1])
	return h + (g - f) * float(b[1])
