# The Godot side of core/terrain/golden-stacks.json (core/world/PLAN-RELIEF.md P15): kstacks.gd run on the golden's own
# inputs (as test-golden-stacks.js makes them) and compared to 1e-6, strings and integers exactly: every kind's record,
# the queries at points round each body, rings, walls, bores, the meshes (counts, KSTACKS.hash, index sum, samples) with
# weather, contour and arch_round, and the layouts. From the Godot project, with kstacks.gd and golden-stacks.json copied
# into res://tests/terrain/ (godot/tools/sync_core.py):
#   godot --headless --path godot --script res://tests/terrain/kstacks_test.gd      exits 0 when every value matches
extends SceneTree

const KRand := preload("../rand/krand.gd")
const K := preload("kstacks.gd")

var worst := 0.0


static func gr(x: float, z: float) -> float:
	return 3 + 0.02 * x + 4 * KRand.vnoise(x / 40, z / 40, 0.5, 5)


static func strata(_x: float, y: float, _z: float) -> Dictionary:
	var k := floori(y / 7)
	return {"h": 4 + 3 * KRand.unit(KRand.hash_ints(9, [k])), "hard": KRand.unit(KRand.hash_ints(9, [k, 1]))}


# a value made plain as the JS side's plain(): Packed arrays to Arrays, infinities to +-1e300, Callables and _keys dropped
func plain(v):
	if v is float:
		return (1e300 if v > 0 else -1e300) if is_inf(v) else v
	if v is Array or v is PackedFloat32Array or v is PackedFloat64Array or v is PackedInt32Array or v is PackedByteArray or v is PackedStringArray:
		var o := []
		for x in v:
			o.append(plain(x))
		return o
	if v is Dictionary:
		var o := {}
		for k in v.keys():
			if v[k] is Callable or str(k).begins_with("_"):
				continue
			o[k] = plain(v[k])
		return o
	return v


func diff(a, b, at: String) -> String:
	var na: bool = a is int or a is float
	var nb: bool = b is int or b is float
	if na and nb:
		var d := absf(float(a) - float(b))
		worst = maxf(worst, d)
		return "" if d <= 1e-6 else at + ": " + str(a) + " against " + str(b)
	if a is Array and b is Array:
		if a.size() != b.size():
			return at + ": " + str(a.size()) + " values against " + str(b.size())
		for i in a.size():
			var r := diff(a[i], b[i], at + "[" + str(i) + "]")
			if r != "":
				return r
		return ""
	if a is Dictionary and b is Dictionary:
		var ks := {}
		for k in a.keys():
			ks[k] = 1
		for k in b.keys():
			ks[k] = 1
		for k in ks.keys():
			var r := diff(a.get(k), b.get(k), at + "." + str(k))
			if r != "":
				return r
		return ""
	return "" if a == b else at + ": " + JSON.stringify(a) + " against " + JSON.stringify(b)


func specs() -> Array:
	var G := func(x, z): return gr(x, z)
	var ST := func(x, y, z): return strata(x, y, z)
	return [
		{"id": "mesa", "kind": "mesa", "x": 10.0, "z": -20.0, "y0": 0.0, "seed": 101, "tiers": [{"h": 120.0, "r": 150.0, "e": 1.3, "ry": 0.3}, {"h": 60.0, "r": 70.0, "e": 1.1, "dx": 10.0, "dz": -5.0}], "lobes": 0.16, "weather": 0.6},
		{"id": "butte", "kind": "butte", "x": 0.0, "z": 0.0, "y0": 5.0, "seed": 102, "lobes": 0.18, "weather": 0.8, "tiers": [{"h": 100.0, "r": 120.0, "e": 1.4, "ry": 1.0}], "shoulder": {"h": 15.0, "back": 12.0, "bed": [3.0, 6.0]}},
		{"id": "flow", "kind": "mesa", "x": 0.0, "z": 0.0, "y0": 0.0, "seed": 103, "tiers": [{"h": 40.0, "r": 80.0}], "columns": {"w": [1.2, 2.4]}},
		{"id": "spire", "kind": "spire", "x": 5.0, "z": 5.0, "y0": 0.0, "seed": 104, "H": 60.0, "r": 12.0},
		{"id": "fin", "kind": "fin", "x": 0.0, "z": 0.0, "y0": 0.0, "seed": 105, "H": 40.0, "r": 10.0},
		{"id": "bal", "kind": "balanced", "x": 0.0, "z": 0.0, "y0": 0.0, "seed": 106, "H": 20.0, "r": 5.0},
		{"id": "plates", "kind": "spire", "x": 0.0, "z": 0.0, "y0": 0.0, "seed": 107, "H": 50.0, "r": 20.0, "plates": [3.0, 8.0]},
		{"id": "mound", "kind": "mound", "x": 3.0, "z": 4.0, "H": 8.0, "seed": 108, "ground": G},
		{"id": "mound2", "kind": "mound", "x": 0.0, "z": 0.0, "H": 6.0, "y0": 2.0, "seed": 109, "spires": 4, "soil": [0.5, 0.4, 0.3]},
		{"id": "dome", "kind": "dome", "x": 10.0, "z": -5.0, "H": 60.0, "seed": 110, "ground": G},
		{"id": "pagoda", "kind": "dome", "x": 0.0, "z": 0.0, "H": 50.0, "seed": 111, "y0": 0.0, "pagoda": 0.8, "strata": ST},
		{"id": "tor", "kind": "tor", "x": 0.0, "z": 0.0, "H": 8.0, "seed": 112, "ground": G, "logan": true},
		{"id": "arch", "kind": "arch", "x": 0.0, "z": 0.0, "span": 14.0, "seed": 113, "ground": G},
		{"id": "pillar", "kind": "pillar", "x": 0.0, "z": 0.0, "H": 120.0, "w": 30.0, "l": 24.0, "seed": 114, "ground": G, "strata": ST},
		{"id": "pipe", "kind": "chimney", "x": 0.0, "z": 0.0, "seed": 115, "ground": G, "ledges": [0.3, 0.6]},
		{"id": "bell", "kind": "chimney", "form": "bell", "x": 0.0, "z": 0.0, "seed": 116, "y0": 0.0, "ice": {"from": 0.3}},
		{"id": "stalk", "kind": "chimney", "form": "stalk", "x": 0.0, "z": 0.0, "seed": 117, "y0": 0.0},
		{"id": "siphon", "kind": "chimney", "form": "siphon", "mouths": 3, "x": 0.0, "z": 0.0, "seed": 118, "y0": 0.0},
		{"id": "rubble", "kind": "chimney", "state": "rubble", "x": 0.0, "z": 0.0, "seed": 119, "ground": G},
		{"id": "fallen", "kind": "chimney", "state": "fallen", "toward": [1.0, 0.5], "x": 0.0, "z": 0.0, "seed": 120, "ground": G}]


func points(B: Dictionary) -> Array:
	var P := []
	for k in 24:
		var a := k * TAU / 24 + 0.1
		var f := ((k % 4) + 0.5) / 4 * 1.1
		P.append([B.x + cos(a) * B.R * f, B.z + sin(a) * B.R * f])
	return P


func queries(B: Dictionary) -> Array:
	var L := [B]
	var out := []
	for p in points(B):
		var x: float = p[0]
		var z: float = p[1]
		var a = K.at(L, x, z)
		var s = K.surface(L, x, z)
		var sd = K.surface(L, x, z, Callable(), {"drawn": true})
		var f = K.foot(L, x, z)
		var l = K.ledge(L, x, z)
		out.append([x, z, [a.S.id, a.b.k, a.top, a.d] if a != null else null, [s.S.id, s.b.k, s.top, s.d, s.wall, s.steep] if s != null else null,
			[sd.S.id, sd.b.k, sd.top, sd.d, sd.wall, sd.steep] if sd != null else null, [f.S.id, f.d] if f != null else null,
			[l.S.id, l.b.k, l.w, l.out] if l != null else null, K.top_at(L, x, z)])
	return out


func samp(A, k: int) -> Array:
	var o := []
	var st := maxi(1, ceili(A.size() / 60.0)) + k
	for i in range(0, A.size(), st):
		o.append(A[i])
	return o


func mesh_sum(m: Dictionary) -> Dictionary:
	var isum := 0
	for v in m.idx:
		isum += v
	var ps := 0
	for v in m.part:
		ps += v
	var bs := 0
	for v in m.bed:
		bs += v
	var r := {"n": [m.pos.size(), m.uv.size(), m.idx.size(), m.part.size(), m.bed.size(), m.occ.size()], "hash": K.hash(m), "isum": isum, "idx": samp(m.idx, 29),
		"pos": samp(m.pos, 37), "uv": samp(m.uv, 41), "part": ps, "bed": bs, "occ": samp(m.occ, 31)}
	if m.get("ice") != null:
		r.ice = samp(m.ice, 23)
	return r


func snapshot() -> Dictionary:
	var G := {}
	var Gr := func(x, z): return gr(x, z)
	var ST := func(x, y, z): return strata(x, y, z)
	var B := []
	for o in specs():
		B.append(K.make(o))
	B.append(K.tower({"id": "tower", "seed": 121, "x": 0.0, "z": 0.0, "H": 100.0, "R": 40.0, "y0": 0.0}))
	B.append(K.tower({"id": "tower2", "seed": 122, "x": 0.0, "z": 0.0, "H": 80.0, "R": 30.0, "foot": func(x, z, r): return gr(x, z) - 1 - r * 0.01}))
	var by := {}
	for b in B:
		by[b.id] = b
	G.kinds = K.kinds()
	G.records = B
	G.queries = {}
	G.rings = {}
	G.walls = {}
	G.bores = {}
	G.meshes = {}
	for b in B:
		G.queries[b.id] = queries(b)
		G.rings[b.id] = K.ring(b, (float(b.y0) + float(b.top)) / 2, 24)
		var bb: Dictionary = b.beds[floori(b.beds.size() / 2.0)]
		G.walls[b.id] = [0.0, 0.3, 0.5, 0.9].map(func(u): return K.wall(b, bb, u * 5.1, u))
		if b.kind == "chimney":
			G.bores[b.id] = K.bore(b, {"depth": 12.0})
		G.meshes[b.id] = mesh_sum(K.mesh(b))
	G.meshes["mesa:grid"] = mesh_sum(K.mesh(by.mesa, {"top": {"grid": 5.0}}))
	G.meshes["butte:grid-cull"] = mesh_sum(K.mesh(by.butte, {"step": 7.0, "segMax": 600, "top": {"grid": 6.0, "cull": false}}))
	G.meshes["mesa:rings"] = mesh_sum(K.mesh(by.mesa, {"step": 7.0, "topRings": 9, "segMax": 300}))
	G.meshes["pipe:open"] = mesh_sum(K.mesh(by.pipe, {"bore": "open"}))
	G.meshes["flow:columns"] = mesh_sum(K.mesh(by.flow, {"perColumn": 3, "colMax": 900}))
	G.meshes["mound:flutes"] = mesh_sum(K.mesh(by.mound, {"perFlute": 4}))
	G.meshes["arch:weather"] = mesh_sum(K.weather(by.arch, K.mesh(by.arch), {"ground": Gr}))
	G.meshes["mesa:weather"] = mesh_sum(K.weather(by.butte, K.mesh(by.butte), {"amp": 1.5, "pit": 0.4, "seed": 5}))
	G.meshes["pillar:contour"] = mesh_sum(K.contour(by.pillar, K.mesh(by.pillar)))
	G.meshes["pillar:contour-keep"] = mesh_sum(K.contour(by.pillar, K.mesh(by.pillar), {"keep": 10.0, "cleft": false, "joints": [2, 3]}))
	G.meshes["arch:round"] = mesh_sum(K.weather(by.arch, K.arch_round(by.arch, K.mesh(by.arch), {"band": 0.5}), {"ground": Gr}))
	G.row = K.row({"id": "row", "seed": 130, "n": 5, "a": [0.0, 0.0], "b": [200.0, 50.0], "H": [20.0, 40.0], "r": [6.0, 10.0], "ground": Gr, "taper": [0.2, 0.4],
		"plates": [3.0, 6.0], "platesShare": 0.5, "lift": func(_x, _z, r): return r * 0.1})
	G.cluster = K.cluster({"id": "cl", "seed": 131, "n": 8, "c": [0.0, 0.0], "rad": 80.0, "r": [5.0, 10.0], "H": [15.0, 40.0], "ground": Gr,
		"accept": func(x, _z, _r): return x > -70, "lean": [0.0, 0.05]})
	G.mounds = K.mounds({"x0": 0.0, "z0": 0.0, "x1": 120.0, "z1": 120.0, "cell": 40.0, "world": 7, "ground": Gr, "p": 0.4, "per": 2}).map(
		func(M): return [M.id, M.x, M.z, M.top, M.R, M.beds.size(), M.clay])
	var blocks := []
	for j in 3:
		for i in 4:
			blocks.append({"id": "b" + str(i) + "-" + str(j), "i": i, "j": j, "cx": i * 60.0, "cz": j * 55.0, "w": 40.0 + 5 * i, "l": 30.0 + 4 * j, "ry": 0.1 * i})
	G.pillars = K.pillars({"id": "pr", "blocks": blocks, "zone": func(x, _z): return 0.2 + x / 250, "top": func(_x, z): return 140 + 0.1 * z, "ground": Gr,
		"world": 9, "strata": ST, "minW": 8.0})
	G.layoutMesh = mesh_sum(K.mesh(G.row[2]))
	return plain(G)


func _init() -> void:
	var f := FileAccess.open("res://tests/terrain/golden-stacks.json", FileAccess.READ)
	if f == null:
		print("FAIL  no golden-stacks.json beside the test")
		quit(1)
		return
	var GOLD: Dictionary = JSON.parse_string(f.get_as_text())
	var t0 := Time.get_ticks_msec()
	var G := snapshot()
	var bad := 0
	for key in GOLD.keys():
		worst = 0.0
		var d := diff(G.get(key), GOLD[key], key)
		if d != "":
			bad += 1
		print(("PASS  " if d == "" else "FAIL  ") + key + (": as the golden, the worst off by " + str(worst) if d == "" else ": " + d.left(400)))
	var N: Dictionary = G.duplicate(true)
	var caught := false
	if N.get("records") is Array and N.records.size() > 3:
		N.records[3].beds[1].rx = float(N.records[3].beds[1].rx) + 1e-5
		caught = diff(N, GOLD, "") != ""
	print(("PASS  " if caught else "FAIL  ") + "negative: a value nudged by 1e-5 is caught")
	if not caught:
		bad += 1
	print(("all passed" if bad == 0 else str(bad) + " FAILED") + " (" + str(Time.get_ticks_msec() - t0) + " ms)")
	quit(0 if bad == 0 else 1)
