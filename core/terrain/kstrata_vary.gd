# core/terrain's varied contacts in GDScript: the twin of KSTRATA.vary (35c-core-strata-vary.js). A KStrata stack whose
# formation contacts move by an offset of (x, z), the stratigraphic height remapped piecewise linearly between the moved
# contacts; where two cross, the higher-numbered wins. The same arithmetic as the page's (only + - * / floor sqrt and the
# stack's own noise table), so it gives the same rock at the same point. kstrata_vary_test.gd checks it against
# golden-strata-vary.json, which test-strata-vary.js writes. Needs kstrata.gd beside it (and krand.gd one folder up).
#
#   var V := KStrataVary.from_export(json)     a krator-strata-vary record (V.export() on the page)
#   V.yy(x, y, z), V.at(x, y, z) (KStrata.at's record, plus "varied": the shift), V.contact(x, z, k), V.thickness(x, z, k)
class_name KStrataVary
extends RefCounted

var S: KStrata
var contacts: Array
var B: Array = []
var by_k := {}
var ks: Array = []


static func from_export(j: Dictionary) -> KStrataVary:
	assert(j.get("format", "") == "krator-strata-vary", "KStrataVary: not a krator-strata-vary record")
	var v := KStrataVary.new()
	v.S = KStrata.from_export(j["stack"])
	v.contacts = j["contacts"]
	var fs: Array = v.S.fs
	for F in fs:
		v.B.append(float(F["base"]))
	v.B.append(float(fs[fs.size() - 1]["top"]))
	for c in v.contacts:
		var k := int(c["at"])
		if not v.by_k.has(k):
			v.by_k[k] = []
			v.ks.append(k)
		v.by_k[k].append(c.get("by", {}))
	v.ks.sort()
	return v


func _offset(by, x: float, z: float) -> float:
	if by == null:
		return 0.0
	var v := 0.0
	if by.get("d") != null:
		v += float(by["d"])
	if by.get("plane") != null:
		var f: Array = by.get("from", [0, 0]) if by.get("from") != null else [0, 0]
		v += float(by["plane"][0]) * (x - float(f[0])) + float(by["plane"][1]) * (z - float(f[1]))
	if by.get("noise") != null:
		var N: Dictionary = by["noise"]
		var ch := 2 if N.get("ch") == null else int(N["ch"])
		v += float(N["amp"]) * (2.0 * S.noise(ch, x / float(N["wl"]), z / float(N["wl"])) - 1.0)
	if by.get("pts") != null:
		var r := float(by["r"])
		var sw := 0.0
		var sd := 0.0
		for p in by["pts"]:
			var dx := x - float(p[0])
			var dz := z - float(p[1])
			var q := (dx * dx + dz * dz) / (r * r)
			if q < 1.0:
				var w := (1.0 - q) * (1.0 - q)
				sw += w
				sd += w * float(p[2])
		if sw > 0.0:
			v += sd / (sw if sw > 1.0 else 1.0)
	if by.get("grid") != null:
		var G: Dictionary = by["grid"]
		var nx := int(G["nx"])
		var nz := int(G["nz"])
		var st := float(G["step"])
		var fx := clampf((x - float(G["x0"])) / st, 0.0, float(nx - 1))
		var fz := clampf((z - float(G["z0"])) / st, 0.0, float(nz - 1))
		var i0 := floori(fx)
		var j0 := floori(fz)
		var i1 := mini(i0 + 1, nx - 1)
		var j1 := mini(j0 + 1, nz - 1)
		var tx := fx - float(i0)
		var tz := fz - float(j0)
		var D: Array = G["data"]
		var a := float(D[j0 * nx + i0])
		var b := float(D[j0 * nx + i1])
		var c := float(D[j1 * nx + i0])
		var e := float(D[j1 * nx + i1])
		v += a + (b - a) * tx + (c - a) * tz + (a - b - c + e) * tx * tz
	return v


func moved(x: float, z: float) -> Array:
	var M := B.duplicate()
	for k in ks:
		var s := 0.0
		for by in by_k[k]:
			s += _offset(by, x, z)
		M[k] = float(M[k]) + s
	var n := B.size() - 1
	for j in range(n, 0, -1):
		if float(M[j - 1]) > float(M[j]):
			M[j - 1] = M[j]
	return M


func remap_yy(x: float, z: float, v: float) -> float:
	var M := moved(x, z)
	var n := B.size() - 1
	if v < float(M[0]):
		return v + (float(B[0]) - float(M[0]))
	if v >= float(M[n]):
		return v + (float(B[n]) - float(M[n]))
	var lo := 0
	var hi := n - 1
	while lo < hi:
		var mid := (lo + hi + 1) >> 1
		if float(M[mid]) <= v:
			lo = mid
		else:
			hi = mid - 1
	while lo < n - 1 and float(M[lo + 1]) <= v:
		lo += 1
	var span := float(M[lo + 1]) - float(M[lo])
	if span > 0.0:
		return float(B[lo]) + (v - float(M[lo])) * (float(B[lo + 1]) - float(B[lo])) / span
	return float(B[lo])


func yy(x: float, y: float, z: float) -> float:
	return remap_yy(x, z, S.yy(x, y, z))


func at(x: float, y: float, z: float) -> Dictionary:
	var v := S.yy(x, y, z)
	var d := remap_yy(x, z, v) - v
	var o := S.at(x, y + d, z)
	o["varied"] = d
	return o


func contact(x: float, z: float, k: int) -> float:
	return float(moved(x, z)[k]) - S.yy(x, 0.0, z)


func thickness(x: float, z: float, k: int) -> float:
	var M := moved(x, z)
	return float(M[k + 1]) - float(M[k])
