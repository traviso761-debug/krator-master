# The Godot side of core/rand's golden test: the same recipe as test-rand.js and test_rand.py, run on krand.gd.
# From a Godot 4 project that holds krand.gd, krand_test.gd and golden.json in one folder:
#   godot --headless --script res://<folder>/krand_test.gd       exits 0 when every vector matches
extends SceneTree

const KRand := preload("krand.gd")
const SEEDS := [0, 1, 2, 3, 7, 11, 42, 99, 1234, 1234567, 2147483647, 2147483648, 4294967295, 2654435769, 31337,
	65536, 16777216, 271828, 314159, 8675309]
const NAMES := ["trees", "rubble", "a", "", "Hykkousoi", "über"]


func _sha_u32(a: Array) -> String:
	var b := PackedByteArray()
	b.resize(a.size() * 4)
	for i in a.size():
		b.encode_u32(i * 4, a[i])
	var h := HashingContext.new()
	h.start(HashingContext.HASH_SHA256)
	h.update(b)
	return h.finish().hex_encode()


func _sha_f64(a: Array) -> String:
	var b := PackedByteArray()
	b.resize(a.size() * 8)
	for i in a.size():
		b.encode_double(i * 8, a[i])
	var h := HashingContext.new()
	h.start(HashingContext.HASH_SHA256)
	h.update(b)
	return h.finish().hex_encode()


func _init() -> void:
	var dir: String = get_script().resource_path.get_base_dir()
	var gold: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir + "/golden.json"))
	var bad := 0
	# streams
	var ok := true
	for k in SEEDS.size():
		var st = KRand.Stream.new(SEEDS[k])
		var a := []
		for i in 1000:
			a.append(st.u32())
		ok = ok and _sha_u32(a) == gold.streams[k].sha256
	bad += _report("streams", ok)
	# hash
	var g = KRand.Stream.new(99)
	var h1 := []
	var h2 := []
	var h3a := []
	for i in 1000:
		var s: int = g.u32()
		var a: int = g.int_in(-100000, 100000)
		var b: int = g.int_in(-100000, 100000)
		var c: int = g.int_in(-100000, 100000)
		h1.append(KRand.hash_ints(s, [a]))
		h2.append(KRand.hash_ints(s, [a, b]))
		h3a.append(KRand.hash_ints(s, [a, b, c]))
	bad += _report("hash", _sha_u32(h1) == gold.hash.one.sha256 and _sha_u32(h2) == gold.hash.two.sha256
		and _sha_u32(h3a) == gold.hash.three.sha256)
	# noise
	g = KRand.Stream.new(2024)
	var n := {"h3": [], "vnoise": [], "fbm3": [], "fbm5": []}
	for i in 1000:
		var x: float = g.range_f(-500, 500)
		var y: float = g.range_f(-50, 50)
		var z: float = g.range_f(-500, 500)
		var s := i % 5
		n.h3.append(KRand.h3(x, y, z, s))
		n.vnoise.append(KRand.vnoise(x, y, z, s))
		n.fbm3.append(KRand.fbm(x, y, z, 3, s))
		n.fbm5.append(KRand.fbm(x * .01, y * .01, z * .01, 5, s))
	ok = true
	for k in n:
		ok = ok and _sha_f64(n[k]) == gold.noise[k].sha256
	bad += _report("noise", ok)
	# cell and child
	g = KRand.Stream.new(7)
	var cs := []
	for i in 1000:
		var s: int = g.u32()
		var ix: int = g.int_in(-5000, 5000)
		var iz: int = g.int_in(-5000, 5000)
		cs.append(KRand.cell(s, ix, iz))
	ok = _sha_u32(cs) == gold.cell.sha256
	var j := 0
	for s in SEEDS.slice(0, 5):
		for nm in NAMES:
			ok = ok and KRand.child(s, nm) == int(gold.child[j][2])
			j += 1
	bad += _report("cell and child", ok)
	print("all passed" if bad == 0 else "%d FAILED" % bad)
	quit(1 if bad else 0)


func _report(name: String, ok: bool) -> int:
	print(("PASS  " if ok else "FAIL  ") + name + " match golden.json")
	return 0 if ok else 1
