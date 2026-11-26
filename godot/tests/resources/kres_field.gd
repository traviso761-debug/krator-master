# kits/resources' node field in GDScript: the twin of src/45r-res-field.js (GEOLOGY.md, "The node field"). Same integers and
# the same doubles in the same order, on core/rand's krand.gd, so a tile gives the JS's nodes, ids and positions.
# The lattice starts at D.field.anchor (m; [0, 0] when absent), as the JS's.
# Copy beside krand.gd (godot/tools/sync_core.py's pattern); kres_field_test.gd checks it against the JS.
#
#   var F := KResField.new(); F.load_json(path_to_geology_json)
#   F.prospect(family, gx, gz) -> int          the family's byte at the cell of (gx, gz) (world metres; 0 off the grid)
#   F.candidate(family, ix, iz) -> Dictionary   {id, kind, grade, gx, gz, p, kept, drop}
#   F.nodes_in(x0, z0, x1, z1, families = []) -> Array[Dictionary]   field nodes in [x0, x1) x [z0, z1), the baked mask's
#                                              drop rule (water, cliff), then the placers; ids as the JS
extends RefCounted

const KRand := preload("krand.gd")

var D: Dictionary = {}
var W := 0
var H := 0
var N := 0
var SU := 0.0
var SV := 0.0
var _layers: Dictionary = {}
var _seeds: Dictionary = {}


func load_json(path: String) -> void:
	D = JSON.parse_string(FileAccess.get_file_as_string(path))
	W = int(D.grid.w)
	H = int(D.grid.h)
	N = W * H
	SU = float(W - 1) / float(int(D.grid.fullW) - 1)
	SV = float(H - 1) / float(int(D.grid.fullH) - 1)
	_layers = {}


func layer(k: String) -> PackedByteArray:
	if not _layers.has(k):
		var b := Marshalls.base64_to_raw(D.layers[k])
		var o := PackedByteArray()
		o.resize(N)
		var at := 0
		for i in range(0, b.size() - 1, 2):
			var r := b[i] + 1
			var v := b[i + 1]
			for q in r:
				o[at + q] = v
			at += r
		assert(at == N, "a geology layer decodes to %d bytes, not %d" % [at, N])
		_layers[k] = o
	return _layers[k]


func cell_of(gx: float, gz: float) -> Vector2i:
	var pm := float(D.grid.px_m)
	var i := floori(gx / pm * SU + 0.5)
	var j := floori(gz / pm * SV + 0.5)
	if i < 0 or j < 0 or i >= W or j >= H:
		return Vector2i(-1, -1)
	return Vector2i(i, j)


func prospect(f: String, gx: float, gz: float) -> int:
	var c := cell_of(gx, gz)
	return 0 if c.x < 0 else layer(f)[c.y * W + c.x]


func _base(f: String) -> int:
	if not _seeds.has(f):
		_seeds[f] = KRand.child(int(D.field.world), "res:" + f)
	return _seeds[f]


func _grade(u: float, p: int) -> String:
	var g: Dictionary = D.field.grade
	var q := u * (1.15 - float(g.tilt) * float(p) / 255.0)
	return "high" if q < float(g.high) else ("medium" if q < float(g.medium) else "low")


func _drop(gx: float, gz: float) -> String:
	var c := cell_of(gx, gz)
	if c.x < 0:
		return "off"
	var m := layer("mask")[c.y * W + c.x]
	return "water" if m & 1 else ("cliff" if m & 2 else "")


func _anchor() -> Array:
	return D.field.anchor if D.field.has("anchor") else [0, 0]


func candidate(f: String, ix: int, iz: int) -> Dictionary:
	var C := float(D.field.cells[f])
	var A := _anchor()
	var ins := float(D.field.inset)
	var s := KRand.cell(_base(f), ix, iz)
	var gx := float(A[0]) + (float(ix) + ins + (1.0 - 2.0 * ins) * KRand.unit(KRand.hash_ints(s, [2]))) * C
	var gz := float(A[1]) + (float(iz) + ins + (1.0 - 2.0 * ins) * KRand.unit(KRand.hash_ints(s, [3]))) * C
	var p := prospect(f, gx, gz)
	var kept := floori(KRand.unit(KRand.hash_ints(s, [1])) * 255.0) < p
	return {"id": "res:%s:%d:%d" % [f, ix, iz], "kind": f, "grade": _grade(KRand.unit(KRand.hash_ints(s, [4])), p),
		"gx": gx, "gz": gz, "p": p, "kept": kept, "drop": _drop(gx, gz) if kept else ""}


func nodes_in(x0: float, z0: float, x1: float, z1: float, families: Array = []) -> Array:
	var fams: Array = families if families.size() else D.field.families
	var out := []
	var A := _anchor()
	for f in fams:
		if not D.field.cells.has(f):
			continue
		var C := float(D.field.cells[f])
		for iz in range(floori((z0 - float(A[1])) / C), floori((z1 - float(A[1])) / C) + 1):
			for ix in range(floori((x0 - float(A[0])) / C), floori((x1 - float(A[0])) / C) + 1):
				var c := candidate(f, ix, iz)
				if c.kept and c.drop == "" and c.gx >= x0 and c.gx < x1 and c.gz >= z0 and c.gz < z1:
					out.append(c)
	for p in D.placers:
		if fams.has(p.kind) and p.x >= x0 and p.x < x1 and p.z >= z0 and p.z < z1 and _drop(p.x, p.z) == "":
			out.append({"id": p.id, "kind": p.kind, "grade": p.grade, "gx": float(p.x), "gz": float(p.z), "placer": true})
	return out
