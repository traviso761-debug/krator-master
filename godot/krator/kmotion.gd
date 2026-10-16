# Fauna a kit moves on the CPU, replayed (biomes/GODOT.md, "Motion"). The page bakes each moving item's motion to a
# track (BIO.motionBake, core/biome/42-core-export.js): per instance, frames of the 3x4 matrix (and any channel that
# moves, aP1) on a grid t0 + k / hz, one exact period when the kit gave one, else a loop cross-faded over its first
# `fade` seconds. KMotion.sample is the twin of BIO.motionAt; a KMotion node, a child of a MultiMeshInstance3D, writes
# its instances' transforms into the MultiMesh buffer every frame from the module clock (Atmos.t, the shaders' atm_time).
# Both importers attach it (krator/biome_import.gd from the JSON item, krator/gltf_instancing.gd from world.glb's
# node extras krator_motion). Tested by tests/motion/motion_test.gd against the page's own ticks.
class_name KMotion
extends Node

# the track: t0, hz, loop, fade, stride, channels (Array), period (floats), start, frames (ints), data (floats)
var track := {}
var sel := PackedInt32Array()   # the MultiMesh's instance k is the track's instance sel[k]
var origin := Vector3.ZERO      # the node's own position (a biome cell's centre): the buffer is relative to it
var clock := -1.0e30            # the clock last written
var _buf := PackedFloat32Array()
var _ch := {}                   # channel name -> its offset in a frame


# a JSON item's motion record (typed arrays as {type, n, b64}) -> a track, or {} when it has none or an error
static func from_record(m) -> Dictionary:
	if not (m is Dictionary) or m.get("format") != "krator-motion" or m.has("error"):
		return {}
	return {"t0": float(m["t0"]), "hz": float(m["hz"]), "loop": float(m["loop"]), "fade": float(m["fade"]),
		"stride": int(m["stride"]), "channels": m["channels"], "period": KData.floats(m["period"]),
		"start": KData.ints(m["start"]), "frames": KData.ints(m["frames"]), "data": KData.floats(m["data"])}


# the pose of instance j at clock t: stride floats (basis x, y, z, origin, then the channels), linear between frames
static func sample(tr: Dictionary, j: int, t: float) -> PackedFloat32Array:
	var s: int = tr["stride"]
	var out := PackedFloat32Array()
	out.resize(s)
	var P: float = tr["period"][j]
	var u: float = t - float(tr["t0"])
	var hz: float = tr["hz"]
	if P > 0.0:
		_frame(tr, j, fposmod(u, P) * hz, out, 1.0)
		return out
	var loop: float = tr["loop"]
	var fade: float = tr["fade"]
	var w := fposmod(u, loop)
	if w < fade:
		_frame(tr, j, (w + loop) * hz, out, 1.0)
		var x := w / fade
		_frame(tr, j, w * hz, out, x * x * (3.0 - 2.0 * x))   # a smoothstep: the seam keeps its speed
	else:
		_frame(tr, j, w * hz, out, 1.0)
	return out


static func _frame(tr: Dictionary, j: int, f: float, out: PackedFloat32Array, w: float) -> void:
	var s: int = tr["stride"]
	var n: int = tr["frames"][j]
	var k := clampi(int(floor(f)), 0, n - 2)
	var a := f - k
	var D: PackedFloat32Array = tr["data"]
	var b0: int = (int(tr["start"][j]) + k) * s
	for q in s:
		var v := D[b0 + q] + (D[b0 + s + q] - D[b0 + q]) * a
		out[q] = v if w == 1.0 else out[q] + (v - out[q]) * w


# the pose as a Transform3D (three's column-major basis and origin)
static func transform(f: PackedFloat32Array) -> Transform3D:
	return Transform3D(Basis(Vector3(f[0], f[1], f[2]), Vector3(f[3], f[4], f[5]), Vector3(f[6], f[7], f[8])), Vector3(f[9], f[10], f[11]))


# give mmi its track: its instances are the track's sel; its custom_aabb covers every frame, so it is never culled
static func attach(mmi: MultiMeshInstance3D, tr: Dictionary, sel_: PackedInt32Array, origin_: Vector3) -> KMotion:
	var k := KMotion.new()
	k.name = "Motion"
	k.track = tr
	k.sel = sel_
	k.origin = origin_
	var off := 12
	for c in tr["channels"]:
		if str(c) == "matrix":
			continue
		k._ch[str(c)] = off
		off += {"aP1": 4, "aP0": 4, "aPh": 1, "aN": 3, "aC2": 3}.get(str(c), 0)
	var D: PackedFloat32Array = tr["data"]
	var s: int = tr["stride"]
	var lo := Vector3(INF, INF, INF)
	var hi := -lo
	var sc := 0.0
	for j in sel_:
		var b0: int = int(tr["start"][j]) * s
		for f in int(tr["frames"][j]):
			var b := b0 + f * s
			var p := Vector3(D[b + 9], D[b + 10], D[b + 11])
			lo = lo.min(p)
			hi = hi.max(p)
			sc = maxf(sc, maxf(Vector3(D[b], D[b + 1], D[b + 2]).length(), maxf(Vector3(D[b + 3], D[b + 4], D[b + 5]).length(), Vector3(D[b + 6], D[b + 7], D[b + 8]).length())))
	if sel_.size() > 0 and mmi.multimesh and mmi.multimesh.mesh:
		var mb := mmi.multimesh.mesh.get_aabb()
		var r := maxf(mb.position.abs().length(), mb.end.abs().length()) * sc
		mmi.custom_aabb = AABB(lo - origin_ - Vector3(r, r, r), hi - lo + Vector3(r, r, r) * 2.0)
	mmi.add_child(k)
	return k


func _process(_dt: float) -> void:
	var A = get_node_or_null("/root/Atmos")
	if A != null:
		apply(float(A.t))


# write every instance's pose at clock t into the parent's MultiMesh buffer (20 floats an instance: the 3x4 transform
# row by row, COLOR, INSTANCE_CUSTOM; krator/biome_import.gd's packing)
func apply(t: float) -> void:
	if t == clock:
		return
	clock = t
	var mmi := get_parent() as MultiMeshInstance3D
	if mmi == null or mmi.multimesh == null:
		return
	var mm := mmi.multimesh
	if _buf.size() != mm.instance_count * 20:
		_buf = mm.buffer
	for k in sel.size():
		var f := sample(track, sel[k], t)
		var b := k * 20
		_buf[b] = f[0]; _buf[b + 1] = f[3]; _buf[b + 2] = f[6]; _buf[b + 3] = f[9] - origin.x
		_buf[b + 4] = f[1]; _buf[b + 5] = f[4]; _buf[b + 6] = f[7]; _buf[b + 7] = f[10] - origin.y
		_buf[b + 8] = f[2]; _buf[b + 9] = f[5]; _buf[b + 10] = f[8]; _buf[b + 11] = f[11] - origin.z
		if _ch.has("aP1"):   # an anim walker's gait in INSTANCE_CUSTOM (shaders/anim_body.gdshaderinc)
			var o: int = _ch["aP1"]
			_buf[b + 16] = f[o]; _buf[b + 17] = f[o + 1]; _buf[b + 18] = f[o + 2]; _buf[b + 19] = f[o + 3]
		if _ch.has("aP0"):
			_buf[b + 15] = f[int(_ch["aP0"]) + 3]
		if _ch.has("aPh"):
			_buf[b + 16] = f[int(_ch["aPh"])]
	mm.buffer = _buf
