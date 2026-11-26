# core/terrain/35-core-strata.js in GDScript: the twin that reads a krator-strata record (S.export()) and answers what
# rock is at a point, bit for bit as the page's KSTRATA does (golden-strata.json, kstrata_test.gd). The beds come from
# the record; the noise lattice is rebuilt from the seed with core/rand's twin (krand.gd, one folder up in rand/).
#
#   var s := KStrata.from_export(json)
#   s.yy(x, y, z)                 the stratigraphic height
#   s.at(x, y, z)                 {yy, formation, recipe, bed, kid, kind, colour, hard, f, edge, cell, altered}
#   s.terrace(x, z, h, k = 0.6)   the ground eased into benches at each bed's top and foot (a monotone map of h)
#   s.surface(x, y, z, ny)        at() with the downslope wash, plus cover: the loose cover's colour
#   s.ledge(x, z, h, slope, o)    the ledge pass (hard beds steep, soft ones eased, benches; packets keep their tops)
#   s.bake(res) / s.params(b, o)  the bytes and the uniforms of strata.gdshaderinc, as KSTRATA.bake and KSTRATA.params give
#   s.apply(material, res, o)     fills a ShaderMaterial whose shader includes res://shaders/lib/strata.gdshaderinc
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
var J: Dictionary
var lat_b: KStrata = null
var lat = null
var wash = null
var regolith := 0.0
var dust := [0.0, 0.0, 0.0]
var _lt := {}


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
	s.J = j
	s.wash = j.get("wash")
	s.regolith = 0.0 if j.get("regolith") == null else float(j["regolith"])
	if j.get("dust") != null:
		s.dust = [float(j["dust"][0]), float(j["dust"][1]), float(j["dust"][2])]
	var la = j.get("lateral")
	if la != null:
		s.lat_b = KStrata.from_export(la["stack"])
		var ldx := float(la["dir"][0])
		var ldz := float(la["dir"][1])
		var ll := sqrt(ldx * ldx + ldz * ldz)
		s.lat = {"nx": ldx / ll, "nz": ldz / ll, "ax": float(la["at"][0]), "az": float(la["at"][1]), "d0": float(la["d0"]),
			"d1": float(la["d1"]), "tg": float(la["tongue"])}
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
	var v := yy(x, y, z)
	if lat_b != null and side(x, v, z) == 1:
		var o2 := lat_b.at(x, y, z)
		o2["side"] = 1
		return o2
	var o := {"side": 0}
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


# ---- the lateral change: the second stack's beds tongue in past d0, all of it past d1 (S.side)
func side(x: float, v: float, z: float) -> int:
	if lat == null:
		return 0
	var w := _sstep(lat["d0"], lat["d1"], (x - lat["ax"]) * lat["nx"] + (z - lat["az"]) * lat["nz"])
	if w <= 0.0:
		return 0
	if w >= 1.0:
		return 1
	return 1 if w > noise(2, v / lat["tg"], ((z - lat["az"]) * lat["nx"] - (x - lat["ax"]) * lat["nz"]) / 500.0) else 0


# ---- the surface: the downslope wash and the loose cover (S.surface)
func surface(x: float, y: float, z: float, ny: float) -> Dictionary:
	var wsh := 0.0
	if wash != null:
		wsh = float(wash["m"]) * _sstep(float(wash["from"]), float(wash["to"]), ny)
	var o := at(x, y + wsh, z)
	o["wash"] = wsh
	var c: Array = o["colour"]
	var g := regolith
	var d := dust
	o["cover"] = [d[0] + (c[0] * 0.85 + 0.12 - d[0]) * g, d[1] + (c[1] * 0.85 + 0.12 - d[1]) * g, d[2] + (c[2] * 0.85 + 0.12 - d[2]) * g]
	return o


# ---- the ledge pass (S.ledge)
static func _lopt(o: Dictionary) -> Dictionary:
	return {"k": 0.5 if o.get("k") == null else float(o["k"]), "bench": 1.5 if o.get("bench") == null else float(o["bench"]),
		"e": 0.15 if o.get("e") == null else float(o["e"]), "anchor": 30.0 if o.get("anchor") == null else float(o["anchor"]),
		"s0": 0.45 if o.get("s0") == null else float(o["s0"]), "s1": 0.9 if o.get("s1") == null else float(o["s1"])}


func _ledge_tab(fi: int, o: Dictionary) -> Dictionary:
	var key := "%d|%s|%s|%s|%s" % [fi, o["k"], o["bench"], o["e"], o["anchor"]]
	if _lt.has(key):
		return _lt[key]
	var B: Array = fs[fi]["beds"]
	var n := B.size()
	var G := PackedFloat64Array()
	var C := PackedFloat64Array()
	var FB := PackedFloat64Array()
	var M := PackedFloat64Array()
	G.resize(n)
	C.resize(n)
	FB.resize(n)
	M.resize(n)
	var e: float = o["e"]
	for i in n:
		var h := float(kinds[int(B[i][2])]["hard"])
		var m: float = 1.0 + o["k"] * (2.0 * h - 1.0)
		var hp := float(kinds[int(B[i - 1][2])]["hard"]) if i > 0 else 0.0
		M[i] = 0.1 if m < 0.1 else m
		FB[i] = minf(1.0, o["bench"] / float(B[i][1])) if (i > 0 and hp >= 0.65 and h < hp - 0.2) else 0.0
	var i0 := 0
	while i0 < n:
		var i1 := i0
		var th := 0.0
		var wi := 0.0
		while i1 < n:
			th += float(B[i1][1])
			wi += float(B[i1][1]) * M[i1] * (1.0 - (1.0 - e) * FB[i1] * 0.5)
			i1 += 1
			if th >= o["anchor"]:
				break
		var c := th / wi
		var g := float(B[i0][0])
		for jj in range(i0, i1):
			G[jj] = g
			C[jj] = c
			g += c * float(B[jj][1]) * M[jj] * (1.0 - (1.0 - e) * FB[jj] * 0.5)
		i0 = i1
	_lt[key] = {"G": G, "C": C, "FB": FB, "M": M}
	return _lt[key]


func ledge(x: float, z: float, h: float, slope: float, opts: Dictionary = {}) -> float:
	var o := _lopt(opts)
	var r := _sstep(o["s0"], o["s1"], slope)
	if r <= 0.0:
		return h
	var v := yy(x, h, z)
	if lat_b != null and side(x, v, z) == 1:
		return lat_b.ledge(x, z, h, slope, opts)
	var fi := _formation_at(v)
	var F: Dictionary = fs[fi]
	if F.get("blocks") != null:
		return h
	var q := _bed_in(F, v)
	var L := _ledge_tab(fi, o)
	var b: Array = F["beds"][q[0]]
	var qr: float = q[1]
	var t := qr - float(b[0])
	var th := float(b[1])
	var m: float = L["M"][q[0]]
	var fb: float = L["FB"][q[0]]
	var e: float = o["e"]
	var w: float
	if fb > 0.0 and t < fb * th:
		w = m * (e * t + (1.0 - e) * t * t / (2.0 * fb * th))
	else:
		w = m * (fb * th * (1.0 + e) * 0.5 + (t - fb * th))
	var d: float = L["G"][q[0]] + L["C"][q[0]] * w - qr
	return h + r * (-d if F["flip"] else d)


# ---- the bake: KSTRATA.bake's bytes, byte for byte
func range_y() -> Array:
	return [float(fs[0]["base"]), float(fs[fs.size() - 1]["top"])]


func bed_at(v: float) -> Dictionary:
	var fi := _formation_at(v)
	var F: Dictionary = fs[fi]
	var o := {"formation": fi, "blocks": F.get("blocks") != null}
	if o["blocks"]:
		o["bed"] = -1
		o["kid"] = kind_at[F["recipe"] + "." + F["blocks"]["matrix"]]
		o["colour"] = kinds[o["kid"]]["col"][0]
		o["f"] = 0.0
		o["edge"] = 1e9
		return o
	var q := _bed_in(F, v)
	var b: Array = F["beds"][q[0]]
	var r: float = q[1]
	var f := _clamp((r - float(b[0])) / float(b[1]), 0.0, 1.0)
	o["bed"] = q[0]
	o["kid"] = int(b[2])
	o["colour"] = [float(b[3]), float(b[4]), float(b[5])]
	o["f"] = 1.0 - f if F["flip"] else f
	o["edge"] = minf(r - float(b[0]), float(b[0]) + float(b[1]) - r)
	return o


static func _byte(v: float) -> int:
	var i := floori(v + 0.5)
	return 0 if i < 0 else (255 if i > 255 else i)


func bake(res: float = 0.25) -> Dictionary:
	var halves: Array = [self] if lat_b == null else [self, lat_b]
	var spans := []
	var tot := 0.0
	for h in halves:
		var ry: Array = h.range_y()
		spans.append(ry[1] - ry[0])
		tot += ry[1] - ry[0]
	if tot / res > 262144.0:
		res = tot / 262144.0
	var Ns := []
	var NT := 0
	for sp in spans:
		Ns.append(ceili(sp / res))
		NT += ceili(sp / res)
	var W := 256
	var H := ceili(float(NT) / float(W))
	var slots := []
	var blocks := []
	var b_idx := []
	var fx := {}
	var vcol = null
	for hi in halves.size():
		var h: KStrata = halves[hi]
		b_idx.append({})
		for fi in h.fs.size():
			var F: Dictionary = h.fs[fi]
			var rf: Dictionary = F.get("fx", {})
			for k in rf:
				if typeof(rf[k]) == TYPE_FLOAT or typeof(rf[k]) == TYPE_INT:
					fx[k] = maxf(float(fx.get(k, 0.0)), float(rf[k]))
			if rf.has("varnishCol") and vcol == null:
				vcol = rf["varnishCol"]
			if F.get("blocks") != null:
				b_idx[hi][fi] = blocks.size()
				blocks.append([hi, F])
			else:
				for a in F["alter"]:
					if not h.kind_at.has(F["recipe"] + "." + a["to"]):
						continue
					if typeof(a["kinds"]) != TYPE_STRING:
						var any := false
						for bd in F["beds"]:
							if (a["kinds"] as Array).has(h.kinds[int(bd[2])]["kind"]):
								any = true
								break
						if not any:
							continue
					slots.append([hi, fi, a])
	assert(slots.size() <= 4 and blocks.size() <= 4, "KStrata.bake: at most 4 alterations and 4 blocks formations")
	var ns := maxi(1, slots.size())
	var col := PackedByteArray()
	var bed := PackedByteArray()
	var alt := PackedByteArray()
	col.resize(W * H * 4)
	bed.resize(W * H * 4)
	alt.resize(W * H * 4 * ns)
	var off := 0
	for hi in halves.size():
		var h: KStrata = halves[hi]
		var kn: Array = h.kinds
		var y0: float = h.range_y()[0]
		for i in Ns[hi]:
			var q: Dictionary = h.bed_at(y0 + (float(i) + 0.5) * res)
			var t: int = (off + i) * 4
			var Kd: Dictionary = kn[q["kid"]]
			if q["blocks"]:
				bed[t] = b_idx[hi][q["formation"]]
				bed[t + 3] = 255
				continue
			var ed: float = q["edge"]
			var e := 0.0 if ed < 0.0 else (1.0 if ed > 0.25 else ed / 0.25)
			var k := 1.0 - 0.1 * (1.0 - e * e * (3.0 - 2.0 * e))
			if float(Kd["xbed"]) >= 0.99:
				k *= 0.94 + 0.1 * float(q["f"])
			var c: Array = q["colour"]
			col[t] = _byte(c[0] * 255.0 * k)
			col[t + 1] = _byte(c[1] * 255.0 * k)
			col[t + 2] = _byte(c[2] * 255.0 * k)
			col[t + 3] = _byte(float(Kd["xbed"]) * 255.0)
			bed[t] = _byte(float(q["f"]) * 255.0)
			bed[t + 1] = _byte(float(Kd["varnish"]) * 255.0)
			bed[t + 2] = _byte(float(Kd["hard"]) * 255.0)
			bed[t + 3] = 128 if float(Kd.get("irid", 0)) != 0.0 else 0
			var F: Dictionary = h.fs[q["formation"]]
			for s in slots.size():
				var sl: Array = slots[s]
				if sl[0] != hi or sl[1] != q["formation"]:
					continue
				var A: Dictionary = sl[2]
				if typeof(A["kinds"]) != TYPE_STRING and not (A["kinds"] as Array).has(Kd["kind"]):
					continue
				var key: String = F["recipe"] + "." + A["to"]
				if not h.kind_at.has(key):
					continue
				var cc: Array = kn[h.kind_at[key]]["col"]
				var c3: Array = cc[int(floorf(KRand.unit(KRand.hash_ints(int(F["salt"]), [q["bed"], 5])) * cc.size())) % cc.size()]
				var u: int = (s * W * H + off + i) * 4
				alt[u] = _byte(float(c3[0]) * 255.0)
				alt[u + 1] = _byte(float(c3[1]) * 255.0)
				alt[u + 2] = _byte(float(c3[2]) * 255.0)
				alt[u + 3] = 255
		off += Ns[hi]
	var nb := maxi(1, blocks.size())
	var btab := PackedByteArray()
	btab.resize(36 * nb * 4)
	var bl := []
	for r in blocks.size():
		var h: KStrata = halves[blocks[r][0]]
		var F: Dictionary = blocks[r][1]
		var Bk: Dictionary = F["blocks"]
		var kn: Array = h.kinds
		var cl: Array = Bk["clasts"]
		var nest := -1
		var w := [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
		for j in cl.size():
			var cs: Array = (kn[int(cl[j])]["col"] as Array).slice(0, 4)
			w[j] = float(Bk["weights"][j])
			if Bk.get("nest") != null and kn[int(cl[j])]["kind"] == Bk["nest"]["kind"]:
				nest = j
			for m in cs.size():
				_put(btab, r, j * 4 + m, cs[m], cs.size() if m == 0 else 255)
		var mc: Array = (kn[h.kind_at[F["recipe"] + "." + Bk["matrix"]]]["col"] as Array).slice(0, 4)
		for m in mc.size():
			_put(btab, r, 32 + m, mc[m], mc.size() if m == 0 else 255)
		bl.append({"size": float(Bk["size"]), "gap": float(Bk["gap"]), "nestSize": float(Bk["nest"]["size"]) if Bk.get("nest") != null else 1.0,
			"bed": float(Bk["bed"]), "nest": nest, "nc": cl.size(), "mcn": mc.size(), "w": w})
	var sl_out := []
	for sl in slots:
		sl_out.append({"below": float(sl[2]["below"]), "band": float(sl[2]["band"])})
	return {"res": res, "W": W, "H": H, "NA": Ns[0], "NB": Ns[1] if Ns.size() > 1 else 0, "yA": range_y()[0],
		"yB": lat_b.range_y()[0] if lat_b != null else 0.0, "col": col, "bed": bed, "alt": alt, "nslots": ns, "slots": sl_out,
		"blocks": bl, "nblocks": nb, "btab": btab, "fx": fx, "varnishCol": vcol}


static func _put(btab: PackedByteArray, r: int, ci: int, c: Array, a: int) -> void:
	var u := (r * 36 + ci) * 4
	btab[u] = _byte(float(c[0]) * 255.0)
	btab[u + 1] = _byte(float(c[1]) * 255.0)
	btab[u + 2] = _byte(float(c[2]) * 255.0)
	btab[u + 3] = a


# ---- the shader's parameters (KSTRATA.params), by the JS names; apply() sets them as ks_* uniforms
func params(B: Dictionary, o: Dictionary = {}) -> Dictionary:
	var fold := [0.0, 0.0, 1.0, 0.0]
	var fold2 := [0.0, 0.0, 0.0, 0.0]
	var lt := [0.0, 0.0, 0.0, 0.0]
	var lt2 := [0.0, 1.0, 6.0, 0.0]
	var fo = J.get("fold")
	if fo != null:
		var dl := sqrt(float(fo["dir"][0]) * float(fo["dir"][0]) + float(fo["dir"][1]) * float(fo["dir"][1]))
		fold = [-float(fo["dir"][1]) / dl, float(fo["dir"][0]) / dl, float(fo["wl"]), float(fo["amp"])]
		fold2 = [0.0 if fo.get("phase") == null else float(fo["phase"]), 0.0 if fo.get("sharp") == null else float(fo["sharp"]),
			0.0 if fo.get("at") == null else float(fo["at"][0]), 0.0 if fo.get("at") == null else float(fo["at"][1])]
	var la = J.get("lateral")
	if la != null:
		var ll := sqrt(float(la["dir"][0]) * float(la["dir"][0]) + float(la["dir"][1]) * float(la["dir"][1]))
		lt = [float(la["dir"][0]) / ll, float(la["dir"][1]) / ll, float(la["at"][0]), float(la["at"][1])]
		lt2 = [float(la["d0"]), float(la["d1"]), float(la["tongue"]), 0.0]
	var fa := []
	var fb := []
	for i in 4:
		var ft = faults[i] if i < faults.size() else null
		if ft != null:
			fa.append([float(ft["a"][0]), float(ft["a"][1]), float(ft["b"][0]), float(ft["b"][1])])
			fb.append([float(ft["throw"]), 2.0 if ft.get("w") == null else float(ft["w"]), 0.0 if ft.get("taper") == null else float(ft["taper"]), 0.0])
		else:
			fa.append([0.0, 0.0, 0.0, 0.0])
			fb.append([0.0, 0.0, 0.0, 0.0])
	var al := []
	var bk := []
	var bm := []
	var bw := []
	for i in 4:
		var s = B["slots"][i] if i < B["slots"].size() else null
		var b = B["blocks"][i] if i < B["blocks"].size() else null
		al.append([s["below"], s["band"], 0.0, 0.0] if s != null else [0.0, 0.0, 0.0, 0.0])
		bk.append([b["size"], b["gap"], b["nestSize"], b["bed"]] if b != null else [1.0, 0.0, 1.0, 1.0])
		bm.append([float(b["nest"]), float(b["nc"]), float(b["mcn"]), 0.0] if b != null else [-1.0, 1.0, 1.0, 0.0])
		bw.append((b["w"] as Array).slice(0, 4) if b != null else [0.0, 0.0, 0.0, 0.0])
		bw.append((b["w"] as Array).slice(4, 8) if b != null else [0.0, 0.0, 0.0, 0.0])
	var fx: Dictionary = B["fx"]
	var dst = dust
	if o.get("dust") != null:
		var hx := int(o["dust"])
		dst = [float((hx >> 16) & 255) / 255.0, float((hx >> 8) & 255) / 255.0, float(hx & 255) / 255.0]
	var vc = o.get("varnish")
	if vc == null:
		vc = B["varnishCol"] if B["varnishCol"] != null else [0.36, 0.3, 0.28]
	var wa := [0.0, 0.55, 0.9, regolith]
	var rep_a := _rep(self)
	var rep_b := _rep(lat_b) if lat_b != null else [0.0, 0.0, 0.0, 0.0]
	if wash != null:
		wa = [float(wash["m"]), float(wash["from"]), float(wash["to"]), regolith]
	return {"CR": [B["yA"], B["res"], float(B["W"]), float(B["H"])], "LB": [B["yB"], float(B["NB"]), float(B["NA"]), 1.0 if lat_b != null else 0.0],
		"Lat": lt, "Lat2": lt2, "Rep": rep_a, "RepB": rep_b, "Wash": wa, "N": float(B["NA"]), "Aln": float(B["slots"].size()), "Bn": float(B["nblocks"]),
		"Dip": dip, "Warp": warp, "WF": wf, "Fold": fold, "Fold2": fold2, "Fa": fa, "Fb": fb, "Fn": float(mini(4, faults.size())),
		"Al": al, "Bk": bk, "Bm": bm, "Bw": bw, "Cap": o.get("cap", [1e5, 1e5 + 1.0]), "Foot": -1e5 if o.get("foot") == null else float(o["foot"]),
		"Dust": dst, "Fx": [float(fx.get("varnish", 0)), float(fx.get("columns", 0)), float(fx.get("liesegang", 0)), float(fx.get("flecks", 0))],
		"Vc": vc}


static func _rep(h: KStrata) -> Array:   # a repeating first or last formation comes round past the baked range
	var f0: Dictionary = h.fs[0]
	var fl: Dictionary = h.fs[h.fs.size() - 1]
	return [0.0 if f0.get("repeat") == null else float(f0["repeat"]), 0.0 if fl.get("repeat") == null else float(fl["repeat"]),
		float(fl["base"]), float(fl["top"])]


static func _tex(bytes: PackedByteArray, w: int, h: int) -> ImageTexture:
	return ImageTexture.create_from_image(Image.create_from_data(w, h, false, Image.FORMAT_RGBA8, bytes))


static func _v(a: Array):
	if a.size() == 2:
		return Vector2(a[0], a[1])
	if a.size() == 3:
		return Vector3(a[0], a[1], a[2])
	return Vector4(a[0], a[1], a[2], a[3])


# fills a ShaderMaterial whose shader includes res://shaders/lib/strata.gdshaderinc (o: cap, foot, dust, varnish)
func apply(mat: ShaderMaterial, res: float = 0.25, o: Dictionary = {}) -> Dictionary:
	var B := bake(res)
	var prm := params(B, o)
	mat.set_shader_parameter("ks_col", _tex(B["col"], B["W"], B["H"]))
	mat.set_shader_parameter("ks_bed", _tex(B["bed"], B["W"], B["H"]))
	mat.set_shader_parameter("ks_alt", _tex(B["alt"], B["W"], B["H"] * B["nslots"]))
	mat.set_shader_parameter("ks_nz", _tex(tbl, P, P))
	mat.set_shader_parameter("ks_bt", _tex(B["btab"], 36, B["nblocks"]))
	for k in prm:
		var name: String = "ks_" + (k as String).to_lower()
		var v = prm[k]
		if typeof(v) == TYPE_ARRAY and v.size() > 0 and typeof(v[0]) == TYPE_ARRAY:
			var arr := PackedVector4Array()
			for e in v:
				arr.append(_v(e))
			mat.set_shader_parameter(name, arr)
		elif typeof(v) == TYPE_ARRAY:
			mat.set_shader_parameter(name, _v(v))
		else:
			mat.set_shader_parameter(name, float(v))
	return {"bake": B, "params": prm}
