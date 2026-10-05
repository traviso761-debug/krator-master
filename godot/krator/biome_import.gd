# krator-biome JSON (BIO.export(), core/biome/42-core-export.js) to a Godot scene, per biomes/GODOT.md:
# an item becomes a MultiMeshInstance3D, a bucket a MeshInstance3D with an ArrayMesh, a material one of the
# shared shaders in res://shaders/. Everything the contract leaves open, or the importer had to guess, goes in
# the report (KratorBiome.build(...).get_meta("report")), which is the spike's gap list for this route.
class_name KratorBiome
extends RefCounted

const FOLIAGE := preload("res://shaders/foliage.gdshader")
const BARK := preload("res://shaders/bark.gdshader")
const CHUNK := 1200.0   # BIO.LOD.chunk


static func build(path: String) -> Node3D:
	var t0 := Time.get_ticks_msec()
	var d = KData.read_json(path)
	var root := Node3D.new()
	root.name = "Biome"
	var report := {"route": "krator-biome JSON", "file": path, "gaps": {}, "counts": {}}
	if not (d is Dictionary) or d.get("format") != "krator-biome":
		report["gaps"]["format"] = "not a krator-biome file"
		root.set_meta("report", report)
		return root
	root.set_meta("krator", {"kits": d["kits"], "box": d["box"], "core": d["core"], "convention": d["convention"]})

	# textures: PNG data URLs (sRGB images)
	var tex := {}
	var wraps := {}
	for t in d["textures"]:
		if t.has("png"):
			tex[t["id"]] = KData.texture_from_data_url(t["png"])
		wraps[str(t["wrap"])] = true
	if wraps.has("[1001, 1001]") or wraps.has("[1002, 1002]"):
		_gap(report, "texture wrap", "three's ClampToEdge/Mirrored wrap is not carried to the sampler (the shaders always repeat): %s" % [wraps.keys()])

	var mats := {}
	for m in d["materials"]:
		mats[m["id"]] = m
	var texrec := {}
	for t in d["textures"]:
		texrec[t["id"]] = t

	var items := Node3D.new()
	items.name = "Items"
	root.add_child(items)
	var instances := 0
	for it in d["items"]:
		var m: Dictionary = mats[it["material"]]
		var origin := _lod_origin(it)
		var mat := _material(m, tex, texrec, true, report)
		var mesh := KData.array_mesh(it["geometry"], mat, Vector3.ZERO)
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		mm.use_colors = true
		mm.use_custom_data = true
		mm.mesh = mesh
		var n: int = int(it["count"])
		mm.instance_count = n
		mm.buffer = _instance_buffer(it, n, origin, m, report)
		var mmi := MultiMeshInstance3D.new()
		mmi.name = "%s.%s" % [it["kit"], it["name"]]
		mmi.multimesh = mm
		mmi.position = origin
		_apply_lod(mmi, it, report)
		mmi.set_meta("krator", {"kit": it["kit"], "name": it["name"], "label": it["label"], "material": m.get("key"),
			"kind": m["kind"], "dynamic": it["dynamic"], "count": n})
		if it["dynamic"]:
			_gap(report, "fauna", "dynamic items (fauna on aP0/aP1 paths) are placed static: the anim kind has no Godot shader yet")
		items.add_child(mmi)
		instances += n

	var buckets := Node3D.new()
	buckets.name = "Buckets"
	root.add_child(buckets)
	var tris := 0
	for b in d["buckets"]:
		var m: Dictionary = mats[b["material"]]
		var origin := _lod_origin(b)
		var mi := MeshInstance3D.new()
		mi.name = "%s.%s" % [b["kit"], b["name"]]
		mi.mesh = KData.array_mesh(b["geometry"], _material(m, tex, texrec, false, report), origin)
		mi.position = origin
		_apply_lod(mi, b, report)
		mi.set_meta("krator", {"kit": b["kit"], "name": b["name"], "label": b["label"], "material": m.get("key"), "kind": m["kind"]})
		buckets.add_child(mi)
		tris += int(b["triangles"])

	report["counts"] = {"items": d["items"].size(), "instances": instances, "buckets": d["buckets"].size(), "triangles": tris,
		"materials": d["materials"].size(), "textures": d["textures"].size(), "load_ms": Time.get_ticks_msec() - t0}
	_gap(report, "tags", "no ids, species, class or Köppen tags on items or buckets (biomes/GODOT.md 'Not done yet'): nothing to put in node metadata beyond name and label")
	if d.has("ground"):
		var g := KData.ground(d["ground"])
		root.add_child(g)
		root.set_meta("ground", g)
	else:
		_gap(report, "terrain", "no ground in the export (an export from before 2026-10-05): the spike samples terrainH into terrain.json")
	root.set_meta("report", report)
	return root


static func _gap(report: Dictionary, key: String, text: String) -> void:
	report["gaps"][key] = text


# A LOD-chunked mesh is placed at its chunk's centre, so Godot's visibility range (measured from the node) means
# roughly what three's did (measured from the chunk's box: BIO.lodTick)
static func _lod_origin(rec: Dictionary) -> Vector3:
	var lod = rec.get("lod")
	if lod == null:
		return Vector3.ZERO
	var c: PackedStringArray = str(lod["chunk"]).split(",")
	return Vector3((float(c[0]) + 0.5) * CHUNK, 0.0, (float(c[1]) + 0.5) * CHUNK)


static func _apply_lod(gi: GeometryInstance3D, rec: Dictionary, report: Dictionary) -> void:
	var lod = rec.get("lod")
	if lod == null:
		return
	var half := CHUNK * 0.7071   # three measures to the chunk's box, Godot to the node: widen by the half-diagonal
	gi.visibility_range_end = float(lod["range"]) + half
	gi.visibility_range_end_margin = 60.0
	if float(lod["minRange"]) > 0.0:
		gi.visibility_range_begin = max(0.0, float(lod["minRange"]) - half)
		gi.visibility_range_begin_margin = 60.0
	gi.visibility_range_fade_mode = GeometryInstance3D.VISIBILITY_RANGE_FADE_SELF
	_gap(report, "lod", "LOD is per chunk box in three and per node point in Godot: ranges widened by the chunk half-diagonal (%.0f m); stand-ins and impostors are not LOD levels of what they replace" % half)


# MultiMesh.buffer: per instance 12 floats (the 3x4 transform, row by row), 4 colour, 4 custom.
# COLOR = (r, g, b, c2.r), INSTANCE_CUSTOM = (oct(aN).x, oct(aN).y, c2.g, c2.b) (biomes/GODOT.md)
static func _instance_buffer(it: Dictionary, n: int, origin: Vector3, m: Dictionary, report: Dictionary) -> PackedFloat32Array:
	var M := KData.floats(it["matrices"])
	var C := KData.floats(it["colours"]) if it["colours"] != null else PackedFloat32Array()
	var ex: Dictionary = it["extras"]
	var AN := KData.floats(ex["aN"]["data"]) if ex.has("aN") else PackedFloat32Array()
	var C2 := KData.floats(ex["aC2"]["data"]) if ex.has("aC2") else PackedFloat32Array()
	for k in ex:
		if k == "aP0" or k == "aP1":
			_gap(report, "fauna paths", "fauna that fly a path in the shader (aP0, aP1) stand still at their path centre: the anim shader and its second channel are not ported")
		elif k != "aN" and k != "aC2":
			_gap(report, "extras." + k, "per-instance attribute %s has no slot in the MultiMesh packing" % k)
	var buf := PackedFloat32Array()
	buf.resize(n * 20)
	for i in n:
		var o := i * 16
		var b := i * 20
		# row r of the 3x4 is m[r], m[4+r], m[8+r], m[12+r] in three's column-major order
		buf[b] = M[o]; buf[b + 1] = M[o + 4]; buf[b + 2] = M[o + 8]; buf[b + 3] = M[o + 12] - origin.x
		buf[b + 4] = M[o + 1]; buf[b + 5] = M[o + 5]; buf[b + 6] = M[o + 9]; buf[b + 7] = M[o + 13] - origin.y
		buf[b + 8] = M[o + 2]; buf[b + 9] = M[o + 6]; buf[b + 10] = M[o + 10]; buf[b + 11] = M[o + 14] - origin.z
		if C.size() > 0:
			buf[b + 12] = C[i * 3]; buf[b + 13] = C[i * 3 + 1]; buf[b + 14] = C[i * 3 + 2]
		else:
			buf[b + 12] = 1.0; buf[b + 13] = 1.0; buf[b + 14] = 1.0
		buf[b + 15] = C2[i * 3] if C2.size() > 0 else 1.0
		if AN.size() > 0:
			var e := KData.oct_encode(Vector3(AN[i * 3], AN[i * 3 + 1], AN[i * 3 + 2]))
			buf[b + 16] = e.x; buf[b + 17] = e.y
		buf[b + 18] = C2[i * 3 + 1] if C2.size() > 0 else 1.0
		buf[b + 19] = C2[i * 3 + 2] if C2.size() > 0 else 1.0
	return buf


# o.swayW is a GLSL expression in the export. The three the kits use map to c + dot(w, position); anything else is a gap.
static func _sway(expr: String) -> Array:
	var e := expr.replace(" ", "")
	match e:
		"", "1.0", "1":
			return [1.0, Vector3.ZERO, true]
		"0.0", "0":
			return [0.0, Vector3.ZERO, true]
		"(-position.y)", "-position.y":
			return [0.0, Vector3(0, -1, 0), true]
		"(position.y)", "position.y":
			return [0.0, Vector3(0, 1, 0), true]
		"(position.x)", "position.x":
			return [0.0, Vector3(1, 0, 0), true]
		"(-position.x)", "-position.x":
			return [0.0, Vector3(-1, 0, 0), true]
	return [1.0, Vector3.ZERO, false]


static func _material(m: Dictionary, tex: Dictionary, texrec: Dictionary, instanced: bool, report: Dictionary) -> ShaderMaterial:
	var sm := ShaderMaterial.new()
	var o: Dictionary = m["options"] if m["options"] != null else {}
	var map_id = m["map"]
	var kind: String = m["kind"]
	if kind == "leaf":
		sm.shader = FOLIAGE
		sm.set_shader_parameter("alpha_test", float(m["alphaTest"]) if float(m["alphaTest"]) > 0.0 else 0.42)
		sm.set_shader_parameter("sway_a", float(o.get("swayA", 0.06)) if o.get("swayA") != null else 0.06)
		sm.set_shader_parameter("sway_axis", int(o.get("axis", 0)) if o.get("axis") != null else 0)
		sm.set_shader_parameter("use_an", bool(o.get("aN", false)))
		sm.set_shader_parameter("irid", bool(o.get("irid", false)))
		var sd = m.get("sway")   # the export's sway as data (since 2026-10-05): weight = c + dot(w, position)
		if sd is Dictionary and sd.has("c"):
			var w: Array = sd["w"]
			sm.set_shader_parameter("sway_c", float(sd["c"]))
			sm.set_shader_parameter("sway_w", Vector3(float(w[0]), float(w[1]), float(w[2])))
		else:
			var sw := _sway(str(o.get("swayW", "1.0")) if o.get("swayW") != null else "1.0")
			sm.set_shader_parameter("sway_c", sw[0])
			sm.set_shader_parameter("sway_w", sw[1])
			if not sw[2]:
				_gap(report, "swayW:" + str(o.get("swayW")), "foliage sway weight '%s' is GLSL text the export could not turn into data" % o.get("swayW"))
			elif sd == null:
				_gap(report, "sway data", "an export from before 2026-10-05: sway read from the GLSL text")
		if o.get("dist"):
			_gap(report, "leaf.dist", "foliage option dist=true (%s) is not ported" % m.get("key"))
	else:
		sm.shader = BARK
		match kind:
			"anim", "anim-phase":
				_gap(report, kind, "material kind '%s' (animated fauna: %s) drawn with the bark shader, unanimated" % [kind, "a path in aP0/aP1" if kind == "anim" else "a per-instance phase, aPh"])
			"irid":   # BIO.iridBarkMat: the bark's colour swings between two tints with the view angle
				var a: Array = o.get("a", [0.78, 1.18, 0.92])
				var b: Array = o.get("b", [1.45, 0.82, 0.74])
				sm.set_shader_parameter("mode", 1)
				sm.set_shader_parameter("irid_a", Vector3(float(a[0]), float(a[1]), float(a[2])))
				sm.set_shader_parameter("irid_b", Vector3(float(b[0]), float(b[1]), float(b[2])))
			"gloss":  # barkMat2: the map's red is brightness, green a mask toward a second colour; a sun highlight
				var alt: Array = o.get("alt", [0.22, 0.22, 0.22])
				sm.set_shader_parameter("mode", 2)
				sm.set_shader_parameter("gloss_alt", Vector3(float(alt[0]), float(alt[1]), float(alt[2])))
				sm.set_shader_parameter("gloss_mean", float(o.get("mean", 0.55)))
				sm.set_shader_parameter("gloss_gain", float(o.get("gain", 0.52)))
				sm.set_shader_parameter("gloss_k", float(o.get("gloss", 0.0)))
			"far":   # the far impostors: what the uvs pack says which
				var pk := str(o.get("pack", ""))
				if pk == "c2-rule":
					sm.set_shader_parameter("mode", 3)
				elif pk == "gloss":
					sm.set_shader_parameter("mode", 4)
				else:
					_gap(report, "far", "a far impostor material without `pack` (an export from before 2026-10-05): drawn plain")
			"hang":  # nhighlands' bulbs and pods: the sway and the night glow
				sm.set_shader_parameter("mode", 5)
				sm.set_shader_parameter("hang_a", float(o.get("swayA", 0.05)))
				var nk: Array = o.get("night", [0.0, 1.0])
				sm.set_shader_parameter("night_k", Vector2(float(nk[0]), float(nk[1])))
				if m.get("emissive") != null:
					sm.set_shader_parameter("emissive", KData.colour(m["emissive"], false))
		if m["alphaTest"] > 0.0:
			sm.set_shader_parameter("alpha_test", float(m["alphaTest"]))
	if m.get("hooked") and not (kind in ["leaf", "anim", "anim-phase", "irid", "gloss", "far", "hang"]):
		_gap(report, "hooked:" + str(m.get("key")), "kind '%s' material %s carries a kit shader hook the export does not name: drawn plain" % [kind, m.get("key")])
	# material colours are three's linear working values written as hex (convention.colours.materials): no conversion
	sm.set_shader_parameter("colour", KData.colour(m["colour"], false) if m["colour"] != null else Color(1, 1, 1))
	if map_id != null and tex.has(map_id) and tex[map_id] != null:
		sm.set_shader_parameter("albedo_tex", tex[map_id])
		sm.set_shader_parameter("data_tex", tex[map_id])
		sm.set_shader_parameter("has_tex", true)
		var r: Array = texrec[map_id]["repeat"]
		sm.set_shader_parameter("uv_repeat", Vector2(float(r[0]), float(r[1])))
		if texrec[map_id].has("flipY"):
			sm.set_shader_parameter("flip_v", bool(texrec[map_id]["flipY"]))
		else:
			_gap(report, "flipY", "texture records without flipY (an export from before 2026-10-05): every map assumed flipped, so DataTexture cards read upside down")
	else:
		sm.set_shader_parameter("has_tex", false)
		if map_id != null:
			_gap(report, "missing images", "a material names a texture the export holds no image for (%s): drawn untextured" % texrec.get(map_id, {}).get("error", "no png"))
	if not m.get("doubleSided", true):
		_gap(report, "single-sided", "some materials are single-sided in three; every Godot shader here is cull_disabled")
	return sm
