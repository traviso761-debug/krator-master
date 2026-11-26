# The Godot side of KFIRE's golden test: the case core/biome/test-fire.js writes into golden-fire.json (a ground, a
# burnability and an edge warp all on KRAND, so GDScript makes the same ones), run on kfire.gd.
# From the Godot project (godot/tools/sync_core.py vendors kfire.gd, this file and golden-fire.json into tests/fire/):
#   godot --headless --path godot --script res://tests/fire/kfire_test.gd       exits 0 when every grid matches
extends SceneTree

const KFire := preload("kfire.gd")
const KRand := preload("../rand/krand.gd")


func _sha(b: PackedByteArray) -> String:
	var h := HashingContext.new()
	h.start(HashingContext.HASH_SHA256)
	h.update(b)
	return h.finish().hex_encode()


func _i16(a: PackedInt32Array) -> PackedByteArray:
	var b := PackedByteArray()
	b.resize(a.size() * 2)
	for i in a.size():
		b.encode_s16(i * 2, a[i])
	return b


# a number read back from JSON: Godot's parser can lose a double's last bits, so scalars compare within 1e-12 (a float32
# grid value that differs is off by 6e-8 or more); the grids themselves compare by sha256 of their bytes
func _eq(a: float, b) -> bool:
	return b != null and absf(a - float(b)) <= 1e-12 * maxf(1.0, absf(float(b)))


func _init() -> void:
	var dir: String = get_script().resource_path.get_base_dir()
	var gold: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir + "/golden-fire.json"))
	var G: Dictionary = gold.case
	var hs := int(G.hseed)
	var rs := int(G.rseed)
	var gH := func(x: float, z: float) -> float: return 40.0 * KRand.fbm(x * 0.003, z * 0.003, 0.0, 3, hs)
	var burn := func(x: float, z: float) -> float:
		var rock := KFire.smooth(0.6, 0.72, KRand.fbm(x * 0.005 + 2.0, z * 0.005, 0.0, 2, rs))
		return KFire.burn_k(rock, 0.0, KFire.smooth(200.0, 40.0, KFire.hypot(x - 150.0, z + 200.0)), gH.call(x, z) < 4.0, KFire.patch(x, z, 521))
	var fires := []
	for f in G.fires:
		fires.append(f.duplicate())
	var h = KFire.history({"R": G.R, "cell": G.cell, "seed": G.seed, "wind": G.wind, "old": G.old, "fires": fires,
		"height": gH, "burn": burn})
	var bad := 0
	bad += _report("grid size and the disc", h.N == int(gold.N) and h.inside == int(gold.inside))
	bad += _report("the ground (H)", _sha(h.H.to_byte_array()) == gold.sha.H)
	bad += _report("the burnability (base)", _sha(h.base.to_byte_array()) == gold.sha.base)
	var ok: bool = h.fires.size() == gold.fires.size()
	if ok:
		for i in h.fires.size():
			var a: Dictionary = h.fires[i]
			var b: Dictionary = gold.fires[i]
			ok = ok and _eq(a.ago, b.ago) and _eq(a.frac, b.frac) and _eq(a.veer, b.veer) and int(a.get("ix", -1)) == int(b.ix) \
				and int(a.get("iz", -1)) == int(b.iz) and int(a.cells) == int(b.cells) and bool(a.get("failed", false)) == b.failed
	bad += _report("the fires (old ones lit by hash; ignitions, sizes)", ok)
	var dl := 0
	var di := 0
	for k in h.last.size():
		if not _eq(h.last[k], gold.last[k]):
			dl += 1
		if h.id[k] != int(gold.id[k]):
			di += 1
	bad += _report("every cell's age and fire (%d and %d cells differ)" % [dl, di], _sha(h.last.to_byte_array()) == gold.sha.last
		and _sha(_i16(h.id)) == gold.sha.id)
	bad += _report("the newest fire's front", _sha(h.front.to_byte_array()) == gold.sha.front)
	var R: Dictionary = gold.run
	var r = KFire.run(h, {"x": R.x, "z": R.z, "maxT": R.maxT})
	bad += _report("the live fire (%d cells; golden %d)" % [r.order.size(), int(R.n)], r.ok == R.ok
		and _sha(r.arrive.to_byte_array()) == gold.sha.arrive and _sha(r.order.to_byte_array()) == gold.sha.order)
	var dp := 0
	for p in gold.points:
		var x: float = p[0]
		var z: float = p[1]
		var fa: Dictionary = h.fire_at(x, z)
		var at: float = r.at(x, z)
		var pa = p[5]
		if not _eq(h.age_at(x, z), p[2]) or int(fa.fire) != int(p[3]) or not _eq(h.front_at(x, z), p[4]) \
				or (pa == null and at < INF) or (pa != null and not _eq(at, pa)):
			dp += 1
	bad += _report("age_at, fire_at, front_at and the run's at() at %d points (%d differ)" % [gold.points.size(), dp], dp == 0)
	# negatives: the checks see a change
	var h2 = KFire.history({"R": G.R, "cell": G.cell, "seed": int(G.seed) + 1, "wind": G.wind, "old": G.old, "fires": fires,
		"height": gH, "burn": burn})
	bad += _report("a new seed is seen by the comparison", _sha(h2.last.to_byte_array()) != gold.sha.last)
	bad += _report("old = 0 lights no old fires", KFire.history({"R": 200, "cell": 20, "old": 0, "warp": null}).fires.size() == 0)
	print("all passed" if bad == 0 else "%d FAILED" % bad)
	quit(1 if bad else 0)


func _report(name: String, ok: bool) -> int:
	print(("PASS  " if ok else "FAIL  ") + name)
	return 0 if ok else 1
