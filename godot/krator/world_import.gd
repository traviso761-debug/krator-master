# A krator-world (core/export, core/export/README.md: world.json beside world.glb, the library maps in tex/) to a Godot
# scene. It reuses the spike's importers rather than forking them: the meshes come through GLTFDocument and
# krator/gltf_instancing.gd (each item a MultiMesh, packed as krator/biome_import.gd packs it), materials are
# KratorBiome._material on the shared shaders, the terrain KratorField (krator/field_import.gd) or KData's grid, the
# atmosphere KratorAtmos.build_from (loaded by path), the stage krator/stage.gd (the caller applies root meta "stage", as spike.gd does).
#   "Items"    a MultiMeshInstance3D per item: meta krator_record (its item set), krator_records (a uid per instance, in
#              instance order), krator_index (each instance's index in its set), krator_set (the set's registry record)
#   "Buckets"  a MeshInstance3D per bucket: meta krator_records and krator_record_ids (the volumes it merges)
#   "Field" or "Terrain" (the ground's layers, a material with role 'ground' and hook 'world-uv', on its material), "Water"
#              (krator/water_import.gd: the water section's open surfaces on the library's water shader), and "Atmos"
#              when the world has one
# Every material's hook is resolved against the shader library (krator/khooks.gd); a hook nothing answers is a gap.
# Root meta: report (counts, ids, the sections' status, the export's own errors, the gaps), tags ({id: record}), stage,
# ground (the terrain node), world (the JSON minus items and buckets).
class_name KratorWorld
extends RefCounted

const CHUNK := 1200.0   # BIO.LOD.chunk


static func build(path: String) -> Node3D:
	var t0 := Time.get_ticks_msec()
	var root := Node3D.new()
	root.name = "World"
	var report := {"route": "krator-world (core/export)", "file": path, "gaps": {}, "counts": {}}
	root.set_meta("report", report)
	var d = KData.read_json(path)
	if not (d is Dictionary) or d.get("format") != "krator-world":
		report["gaps"]["format"] = "not a krator-world file"
		return root
	var dir := path.get_base_dir()
	report["sections"] = {}
	for s in d["sections"]:
		report["sections"][s] = d["sections"][s]["status"]
		if d["sections"][s]["status"] == "stub":
			report["gaps"]["section " + s] = "a stub: no module fills it yet (its contract is core/export/README.md's)"
	report["export_errors"] = d.get("errors", [])
	if (d.get("errors", []) as Array).size() > 0:
		report["gaps"]["export errors"] = "%d contributors failed in the page: %s" % [d["errors"].size(), JSON.stringify(d["errors"])]

	# the registry (core/tags): by id, for the side tables
	var by_id := {}
	if d.get("registry") is Dictionary:
		for r in d["registry"]["records"]:
			by_id[r["id"]] = r
		root.set_meta("tags", by_id)

	# textures: a PNG data URL, or a library map by reference (the build's pack in tex/: pack.json names its files)
	var tex := {}
	var texrec := {}
	var packs := {}
	var tc := {"png": 0, "library": 0, "missing": 0}
	for t in d["textures"]:
		texrec[t["id"]] = t
		var img: Texture2D = null
		if t.get("from") == "library":
			img = _library(dir, t, packs)
			if img:
				tc["library"] += 1
		elif t.has("png"):
			img = KData.texture_from_data_url(t["png"])
			if img:
				tc["png"] += 1
		if img == null:
			tc["missing"] += 1
		tex[t["id"]] = img
	var mats := {}
	var ground_rec = null
	for m in d["materials"]:
		mats[m["id"]] = m
		if m.get("role") == "ground" and ground_rec == null:
			ground_rec = m
	var hk := KHooks.survey(d["materials"])
	report["hooks"] = hk["hooks"]
	if not (hk["unknown"] as Array).is_empty():
		report["gaps"]["hooks"] = "no library shader answers hook(s) %s (krator/khooks.gd)" % [", ".join(PackedStringArray(hk["unknown"]))]

	# the meshes: world.glb through GLTFDocument with the instancing extension (krator/gltf_instancing.gd)
	var scene: Node = null
	var gp := dir + "/" + str(d.get("glb", {}).get("file", "world.glb"))
	if FileAccess.file_exists(gp):
		KratorGltf._register_instancing()
		var doc := GLTFDocument.new()
		var state := GLTFState.new()
		var err := doc.append_from_file(gp, state)
		if err != OK:
			report["gaps"]["load"] = "GLTFDocument.append_from_file failed on %s: %d" % [gp, err]
			return root
		scene = doc.generate_scene(state)
	else:
		report["gaps"]["load"] = "no %s: this importer reads the split form (tools/harness.py export without --json)" % gp
		return root

	var ids := {"items": 0, "items_with_record": 0, "instances": 0, "instances_with_uid": 0, "sets_resolved": 0,
		"buckets": 0, "buckets_with_records": 0, "bucket_records": 0, "bucket_records_resolved": 0, "materials_resolved": 0, "materials_missing": 0}
	var items := Node3D.new()
	items.name = "Items"
	root.add_child(items)
	var mat_cache := {}
	for k in d["items"].size():
		var it: Dictionary = d["items"][k]
		var node := scene.find_child(str(it["glb"]["node"]), true, false) as MultiMeshInstance3D
		if node == null:
			report["gaps"]["item nodes"] = "item %s: no node %s in world.glb" % [it["id"], it["glb"]["node"]]
			continue
		node.get_parent().remove_child(node)
		node.owner = null
		node.name = "item_%d" % k
		items.add_child(node)
		var n: int = node.multimesh.instance_count
		node.material_override = _mat(it["material"], mats, tex, texrec, mat_cache, ids, report, true)
		node.visible = bool(it.get("visible", true))
		if it.get("owners") is Array and (it["owners"] as Array).size() == n:   # a city's: per instance the record it stands in
			node.set_meta("krator_owners", it["owners"])
		_lod(node, it, report)
		node.set_meta("krator", {"id": it["id"], "kit": it["kit"], "name": it["name"], "label": it["label"],
			"material": it["material"], "dynamic": it["dynamic"], "count": n})
		ids["items"] += 1
		ids["instances"] += n
		if it.get("records") is Array and (it["records"] as Array).size() == n:
			node.set_meta("krator_record", it["record"])
			node.set_meta("krator_records", PackedStringArray(it["records"]))
			node.set_meta("krator_index", KData.ints(it["recordIndex"]))
			ids["items_with_record"] += 1
			if by_id.has(it["record"]):
				node.set_meta("krator_set", by_id[it["record"]])
				ids["sets_resolved"] += 1
			for u in it["records"]:
				if str(u).length() == 8:
					ids["instances_with_uid"] += 1
		var mrec: Dictionary = mats.get(it["material"], {})
		if it["dynamic"] and str((mrec.get("options") if mrec.get("options") is Dictionary else {}).get("mode", "orbit")) == "walk":
			report["gaps"]["fauna walk"] = "walking fauna (anim mode 'walk') are moved by the page's own host tick (a herd's CPU path), which no export carries: they stand at their export pose, wings flapping"
	var buckets := Node3D.new()
	buckets.name = "Buckets"
	root.add_child(buckets)
	var tris := 0
	for k in d["buckets"].size():
		var b: Dictionary = d["buckets"][k]
		var node := scene.find_child(str(b["glb"]["node"]), true, false) as MeshInstance3D
		if node == null:
			report["gaps"]["bucket nodes"] = "bucket %s: no node %s in world.glb" % [b["id"], b["glb"]["node"]]
			continue
		node.get_parent().remove_child(node)
		node.owner = null
		node.name = "bucket_%d" % k
		buckets.add_child(node)
		node.material_override = _mat(b["material"], mats, tex, texrec, mat_cache, ids, report, false)
		_lod(node, b, report)
		node.set_meta("krator", {"id": b["id"], "kit": b["kit"], "name": b["name"], "label": b["label"], "material": b["material"]})
		ids["buckets"] += 1
		if b.get("records") is Array:
			node.set_meta("krator_records", PackedStringArray(b["records"]))
			node.set_meta("krator_record_ids", PackedStringArray(b["recordIds"]))
			node.set_meta("krator_pieces", b.get("pieces", {}))
			ids["bucket_records"] += (b["records"] as Array).size()
			if (b["records"] as Array).size() > 0:
				ids["buckets_with_records"] += 1
			for i in (b["recordIds"] as Array).size():
				if by_id.has(b["recordIds"][i]) and by_id[b["recordIds"][i]]["uid"] == b["records"][i]:
					ids["bucket_records_resolved"] += 1
		tris += int(b["triangles"])
	scene.free()
	if ids["buckets"] > ids["buckets_with_records"]:
		report["gaps"]["bucket records"] = "%d of %d buckets name no record (pieces in no registered volume)" % [ids["buckets"] - ids["buckets_with_records"], ids["buckets"]]

	# the terrain: the page's field where it has one (a mesh on its own grid and a HeightMapShape3D), else the sampled grid
	var look = d["stage"].get("ground") if d.get("stage") is Dictionary else null
	var t = d.get("terrain")
	if t is Dictionary:
		var grid: Dictionary = t["grid"] if t.get("grid") is Dictionary else {}
		var g: Node3D = null
		if t.get("field") is Dictionary:
			var f := KField.from_export(t["field"])
			if f == null:
				report["gaps"]["field"] = "terrain.field is not a readable krator-field"
			else:
				g = KratorField.build(f, look, grid)
				report["field"] = g.get_meta("krator")
				if t.get("probes") is Dictionary:   # the page's own h at points off the lattice, against KField.h here
					var mx := 0.0
					var pts: Array = t["probes"]["points"]
					for p in pts:
						mx = max(mx, abs(f.h(float(p[0]), float(p[1])) - float(p[2])))
					report["terrain_probes"] = {"points": pts.size(), "max_abs_m": mx}
		elif not grid.is_empty():
			g = KData.ground(grid, look)
			report["gaps"]["field"] = "the terrain is the page's h sampled on a grid: the build bakes no core/terrain field"
		if g != null:
			var has_water: bool = d.get("water") is Dictionary and (d["water"].get("surfaces", []) as Array).size() > 0
			if not has_water and not grid.is_empty() and grid.get("water") is Dictionary and t.get("field") is Dictionary:
				var wm := KData.water_sheet(grid)
				if wm:
					g.add_child(wm)
			if ground_rec != null:
				report["ground_layers"] = ground_layers(g, ground_rec, tex, texrec)
				if report["ground_layers"].has("gap"):
					report["gaps"]["ground layers"] = report["ground_layers"]["gap"]
			root.add_child(g)
			root.set_meta("ground", g)
	else:
		report["gaps"]["terrain"] = "no terrain section"

	# the water (core/water through core/export's water section): the open surfaces drawn by the library's water shader,
	# and the page's own heights at the probes against KWater here
	if d.get("water") is Dictionary:
		var atm = Engine.get_main_loop().root.get_node_or_null("Atmos") if Engine.get_main_loop() is SceneTree else null
		var wn := KratorWater.build(d["water"], d.get("box"), atm)
		root.add_child(wn)
		var wr: Dictionary = wn.get_meta("report")
		wr["probes"] = KratorWater.check_probes(d["water"], wn.get_meta("surfaces", {}))
		report["water"] = wr
		for k in wr["gaps"]:
			report["gaps"]["water " + k] = wr["gaps"][k]
		if not (wr["not_drawn"] as Array).is_empty():
			report["gaps"]["water not drawn"] = "; ".join(PackedStringArray(wr["not_drawn"]))

	if d.get("atmos") is Dictionary and d["atmos"].get("format") == "krator-atmos":
		# loaded by path, not by class name: atmos_import.gd reads the Atmos autoload, which a --script run compiles late
		var a: Node3D = load("res://krator/atmos_import.gd").build_from(d["atmos"], path + "#atmos")
		root.add_child(a)
		report["atmos"] = a.get_meta("report")
	if d.get("stage") is Dictionary:
		root.set_meta("stage", d["stage"])
	# a city's buildings, fixtures and furniture slots as nodes (the KRATOR_EXPORT shape)
	if d.get("fixtures") is Dictionary or d.get("furniture") is Dictionary:
		report["records"] = records(root, d, by_id)
	var meta := {}
	for k in d:
		if not (k in ["items", "buckets", "textures", "stage", "registry", "terrain", "atmos", "water"]):
			meta[k] = d[k]
	root.set_meta("world", meta)
	KratorBiome.cell = KratorBiome.policy_cell(d["convention"])   # the export contract's LOD cell (convention.lod)
	root.set_meta("krator", {"box": d["box"], "build": d["build"], "convention": d["convention"]})
	report["counts"] = {"items": d["items"].size(), "instances": ids["instances"], "buckets": d["buckets"].size(), "triangles": tris,
		"materials": d["materials"].size(), "textures": tc, "records": by_id.size(), "load_ms": Time.get_ticks_msec() - t0}
	report["ids"] = ids
	if tc["missing"] > 0:
		report["gaps"]["textures"] = "%d textures have no image (an export without an encoder, or a library pack not copied to tex/)" % tc["missing"]
	return root


# a ground's layers (core/export's EXPORT.groundLayers: hook 'world-uv', role 'ground') on the terrain's ground.gdshader:
# the maps by texture id, each term's gain, amount and weight channel, the weights on the tile's grid as a texture
# (RGBA8, a name a channel, sampled bilinearly between grid points as the page's per-vertex weights are). Returns what it
# set, or {gap} when it cannot.
static func ground_layers(g: Node3D, rec: Dictionary, tex: Dictionary, texrec: Dictionary) -> Dictionary:
	var mi: MeshInstance3D = g as MeshInstance3D if g is MeshInstance3D and g.name == "Terrain" else g.get_node_or_null("Terrain") as MeshInstance3D
	if mi == null or mi.mesh == null:
		return {"gap": "no Terrain mesh to put the ground's layers on"}
	var mat := mi.mesh.surface_get_material(0) as ShaderMaterial
	if mat == null or mat.shader == null or not mat.shader.resource_path.ends_with("ground.gdshader"):
		return {"gap": "the terrain is not on ground.gdshader (the stage carries no ground look): its layers are not drawn"}
	if not ("world-uv" in KHooks.resolve(rec.get("hook"))["ids"]):
		return {"gap": "the ground record's hook %s is not world-uv" % rec.get("hook")}
	var L: Dictionary = rec.get("layers", {})
	var W = rec.get("weights")
	var names: Array = W["names"] if W is Dictionary else []
	var maps := []
	var terms: Array = L.get("terms", [])
	var out := {"maps": 0, "terms": terms.size(), "weights": names, "missing": []}
	if terms.size() > 3:
		return {"gap": "%d layer terms: ground.gdshader holds 3" % terms.size()}
	var tk := []
	for ti in terms.size():
		var t: Dictionary = terms[ti]
		for q in t["maps"]:
			maps.append([ti, q])
		var ch := names.find(t["weight"]) if t.get("weight") != null else -1
		if t.get("weight") != null and ch < 0:
			out["missing"].append("weight " + str(t["weight"]))
		tk.append(Vector4(float(t.get("gain", 1.0)), float(t.get("amount", 1.0)), float(ch), 0.0))
	while tk.size() < 3:
		tk.append(Vector4(1.0, 0.0, -1.0, 0.0))
	if maps.size() > 4 or names.size() > 4:
		return {"gap": "%d layer maps and %d weights: ground.gdshader holds 4 of each" % [maps.size(), names.size()]}
	var st := []
	var imgs := []
	var term := Vector4i.ZERO
	var flip := Vector4i.ONE
	for i in 4:
		if i < maps.size():
			var q: Dictionary = maps[i][1]
			var img: Texture2D = tex.get(q["map"])
			if img == null:
				out["missing"].append("map " + str(q["map"]))
			imgs.append(img)
			st.append(Vector4(float(q["scale"][0]), float(q["scale"][1]), float(q["offset"][0]), float(q["offset"][1])))
			term[i] = int(maps[i][0])
			flip[i] = 1 if bool(texrec.get(q["map"], {}).get("flipY", true)) else 0
		else:
			st.append(Vector4(1.0, 1.0, 0.0, 0.0))
	if not (out["missing"] as Array).is_empty():
		return {"gap": "the ground's layers name what the export does not hold: %s" % ", ".join(PackedStringArray(out["missing"]))}
	for i in imgs.size():
		mat.set_shader_parameter("layer%d" % i, imgs[i])
	mat.set_shader_parameter("layer_n", maps.size())
	mat.set_shader_parameter("layer_st", st)
	mat.set_shader_parameter("layer_term", term)
	mat.set_shader_parameter("layer_flip", flip)
	mat.set_shader_parameter("term_n", terms.size())
	mat.set_shader_parameter("term_k", tk)
	if W is Dictionary:
		var v := KData.floats(W["values"])
		var nx: int = int(W["nx"])
		var nz: int = int(W["nz"])
		var nn := names.size()
		var bytes := PackedByteArray()
		bytes.resize(nx * nz * 4)
		for s in nx * nz:
			for c in 4:
				bytes[s * 4 + c] = int(round(clampf(v[s * nn + c], 0.0, 1.0) * 255.0)) if c < nn else 0
		var wimg := Image.create_from_data(nx, nz, false, Image.FORMAT_RGBA8, bytes)
		mat.set_shader_parameter("weights_tex", ImageTexture.create_from_image(wimg))
		mat.set_shader_parameter("weights_box", Vector4(float(W["x0"]), float(W["z0"]), 1.0 / float(W["step"]), 0.0))
		mat.set_shader_parameter("weights_n", Vector2(nx, nz))
		out["grid"] = [nx, nz, float(W["step"])]
		mi.set_meta("krator_ground_weights", wimg)
	out["maps"] = maps.size()
	mi.set_meta("krator_ground_layers", rec["id"])
	return out


# a material by id, built once (KratorBiome._material: the foliage and bark shaders, the kits' kinds; a city's three.js
# material records, kind 'standard' or 'basic', on the library shader: _standard). instanced: the mesh is a MultiMesh
# (a world-uv record tiles an instance by its scale, a plain mesh keeps its uv)
static func _mat(id: Variant, mats: Dictionary, tex: Dictionary, texrec: Dictionary, cache: Dictionary, ids: Dictionary, report: Dictionary, instanced := true) -> Material:
	var key := "%s|%s" % [id, instanced]
	if cache.has(key):
		ids["materials_resolved"] += 1
		return cache[key]
	if not mats.has(id):
		ids["materials_missing"] += 1
		report["gaps"]["materials"] = "a mesh names material %s, which the world does not hold" % id
		return null
	ids["materials_resolved"] += 1
	var rec: Dictionary = mats[id]
	var m: Material
	if rec.get("kind") in ["standard", "basic", "shader"]:
		m = _standard(rec, tex, texrec, instanced, report)
	else:
		m = KratorBiome._material(rec, tex, texrec, true, report)
	cache[key] = m
	return m


# a three.js MeshStandardMaterial or MeshBasicMaterial record (a city's: core/export/README.md, "Iziz") as Godot draws it.
# Opaque ones on shaders/library.gdshader, its hooks resolved by name (krator/khooks.gd: world-uv, breakup; glass has no
# include of its own yet and draws as the plain surface), the maps by texture id; a transparent one (glass with an opacity,
# the moat) as a StandardMaterial3D with alpha blending. Returns the material; its meta "krator" names the record and the
# hooks it drew.
static func _standard(rec: Dictionary, tex: Dictionary, texrec: Dictionary, instanced: bool, report: Dictionary) -> Material:
	var hk := KHooks.resolve(rec.get("hook"))
	var col := KData.colour(rec.get("colour", "#ffffff"), false)   # linear already (convention.colours.materials)
	var map_id = rec.get("map")
	var img: Texture2D = tex.get(map_id) if map_id != null else null
	if rec.get("kind") == "shader":
		_gap_once(report, "shader materials", "a ShaderMaterial a city's mesh uses (the vendored biome's own) is drawn plain from its colour")
	if bool(rec.get("transparent", false)) and float(rec.get("opacity", 1.0)) < 0.999:
		var s := StandardMaterial3D.new()
		s.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		s.albedo_color = Color(col.r, col.g, col.b, float(rec["opacity"]))
		s.roughness = float(rec.get("roughness", 1.0))
		s.metallic = float(rec.get("metal", 0.0))
		s.cull_mode = BaseMaterial3D.CULL_DISABLED
		if img:
			s.albedo_texture = img
		s.set_meta("krator", {"material": rec["id"], "hooks": hk["ids"], "shader": "StandardMaterial3D (alpha)"})
		return s
	var sm := ShaderMaterial.new()
	sm.shader = KratorKmat.LIB
	sm.set_shader_parameter("colour", Vector3(col.r, col.g, col.b))
	sm.set_shader_parameter("has_albedo", img != null)
	if img:
		sm.set_shader_parameter("albedo_tex", img)
		sm.set_shader_parameter("flip_v", bool(texrec.get(map_id, {}).get("flipY", true)))
	elif map_id != null:
		_gap_once(report, "missing images", "a material names a texture the export holds no image for: drawn from its colour")
	for slot in [["normalMap", "normal_tex", "has_normal"], ["roughnessMap", "rough_tex", "has_rough"]]:
		var t = rec.get(slot[0])
		var ti: Texture2D = tex.get(t) if t != null else null
		sm.set_shader_parameter(slot[2], ti != null)
		if ti:
			sm.set_shader_parameter(slot[1], ti)
	sm.set_shader_parameter("normal_scale", float(rec.get("normalScale", 1.0)))
	sm.set_shader_parameter("roughness_k", clampf(float(rec.get("roughness", 1.0)), 0.0, 1.0))
	sm.set_shader_parameter("metal", clampf(float(rec.get("metal", 0.0)), 0.0, 1.0))
	sm.set_shader_parameter("specular_k", clampf(float(rec.get("specular", 0.5)), 0.0, 1.0))
	sm.set_shader_parameter("tint", bool(rec.get("tint", true)))
	sm.set_shader_parameter("unlit", bool(rec.get("unlit", false)))
	if rec.get("emissive") != null:
		var e := KData.colour(rec["emissive"], false) * float(rec.get("emissiveIntensity", 1.0))
		sm.set_shader_parameter("emission", Vector3(e.r, e.g, e.b))
	# the map's own repeat and offset (three's uvTransform) where no world-uv replaces it
	if img and texrec.has(map_id):
		var r: Array = texrec[map_id].get("repeat", [1, 1])
		var o: Array = texrec[map_id].get("offset", [0, 0])
		sm.set_shader_parameter("uv_scale", Vector3(float(r[0]), float(r[1]), 1.0))
		sm.set_shader_parameter("uv_offset", Vector3(float(o[0]), float(o[1]), 0.0))
	# hook 'world-uv' (vWorldUV): an instance tiles by the two scale axes its face spans times K, with no per-instance
	# start; a plain mesh keeps the uv it carries
	var wuv = rec.get("worldUV")
	if "world-uv" in hk["ids"] and wuv is Dictionary and instanced:
		var k := float(wuv.get("K", 1.0))
		sm.set_shader_parameter("world_uv", true)
		sm.set_shader_parameter("world_uv_offset", false)
		sm.set_shader_parameter("tile_m", Vector2(1.0 / k, 1.0 / k))
	if "breakup" in hk["ids"] and rec.get("breakup") is Dictionary:
		var b: Dictionary = rec["breakup"]
		sm.set_shader_parameter("bu_mix", float(b.get("mix", 0.0)))
		sm.set_shader_parameter("bu_macro", float(b.get("macro", 0.0)))
		sm.set_shader_parameter("bu_cell", float(b.get("cell", 8.0)))
	if "glass" in hk["ids"]:
		_gap_once(report, "hook glass", "records with hook 'glass' draw as the library surface: lib/glass.gdshaderinc's Fresnel is not wired into library.gdshader yet")
	sm.set_meta("krator", {"material": rec["id"], "hooks": hk["ids"], "shader": "library.gdshader", "world_uv": "world-uv" in hk["ids"] and instanced})
	return sm


static func _gap_once(report: Dictionary, k: String, msg: String) -> void:
	if not report["gaps"].has(k):
		report["gaps"][k] = msg


# a city's records as nodes, in the KRATOR_EXPORT shape (Yuni's GAME_EXPORT.md; core/export/README.md, "Iziz"): a
# "Records" node holding Building_<id> (Building.<id> as a valid node name) per building record of the registry (at its base centre, turned by ry; meta
# krator the record), each building's fixtures as its children (Door_<id>, Window_<id>, Light_<id>: Marker3D, local +z out,
# meta krator the record and krator_host its host), and Furniture_<record> per furniture placement (meta krator_piece).
# Returns {buildings, fixtures, fixtures_parented, furniture, furniture_resolved}.
static func records(root: Node3D, d: Dictionary, by_id: Dictionary) -> Dictionary:
	var out := {"buildings": 0, "fixtures": 0, "fixtures_parented": 0, "furniture": 0, "furniture_resolved": 0}
	var R := Node3D.new()
	R.name = "Records"
	root.add_child(R)
	var bnodes := {}
	for id in by_id:
		var r: Dictionary = by_id[id]
		if r.get("class") != "building" or r.get("set"):
			continue
		var n := Node3D.new()
		n.name = ("Building.%s" % id).validate_node_name()   # Building_bld_00042: Godot keeps no "." in a node name
		n.transform = _rec_xf(r)
		n.set_meta("krator", r)
		R.add_child(n)
		bnodes[id] = n
		out["buildings"] += 1
	var F = d.get("fixtures")
	if F is Dictionary:
		for r in F.get("records", []):
			out["fixtures"] += 1
			var m := Marker3D.new()
			m.name = ("%s.%s" % [str(r.get("kind", "fixture")).capitalize(), r["id"]]).validate_node_name()
			m.set_meta("krator", r)
			m.set_meta("krator_host", r.get("host"))
			var p = bnodes.get(r.get("parent"))
			if p != null:
				p.add_child(m)
				m.transform = (p as Node3D).transform.affine_inverse() * _rec_xf(r)
				out["fixtures_parented"] += 1
			else:
				R.add_child(m)
				m.transform = _rec_xf(r)
	var U = d.get("furniture")
	if U is Dictionary:
		var pieces := {}
		for p in U.get("pieces", []):
			pieces[p["id"]] = p
		for pl in U.get("placements", []):
			out["furniture"] += 1
			var m := Marker3D.new()
			m.name = ("Furniture.%s" % str(pl["record"])).validate_node_name()
			m.transform = _rec_xf({"at": pl["at"], "ry": pl.get("ry", 0.0)})
			m.set_meta("krator", by_id.get(pl["record"], {}))
			m.set_meta("krator_piece", pieces.get(pl["piece"], {}))
			R.add_child(m)
			if by_id.has(pl["record"]) and pieces.has(pl["piece"]):
				out["furniture_resolved"] += 1
	return out


static func _rec_xf(r: Dictionary) -> Transform3D:
	var at: Array = r.get("at", [0, 0, 0])
	return Transform3D(Basis(Vector3.UP, float(r.get("ry", 0.0))), Vector3(float(at[0]), float(at[1]), float(at[2])))


# a library map by reference: <dir>/tex/pack.json's family names its file for the slot (tools/textures/pack.py's output);
# an export from several packs (a kit on Iziz's page) holds <pack>.pack.json for each, its files side by side in tex/
static func _library(dir: String, t: Dictionary, packs: Dictionary) -> Texture2D:
	var pj := dir + "/tex/%s.pack.json" % str(t.get("pack", ""))
	if not FileAccess.file_exists(pj):
		pj = dir + "/tex/pack.json"
	if not packs.has(pj):
		packs[pj] = KData.read_json(pj) if FileAccess.file_exists(pj) else {}
	var fams: Dictionary = (packs[pj] as Dictionary).get("families", {})
	var fam: Dictionary = fams.get(t["family"], {})
	var file = fam.get("files", {}).get(t["slot"])
	if file == null:
		return null
	var bytes := FileAccess.get_file_as_bytes(dir + "/tex/" + str(file))
	var img := Image.new()
	var err := img.load_webp_from_buffer(bytes) if str(file).ends_with(".webp") else img.load_png_from_buffer(bytes)
	if err != OK:
		return null
	img.generate_mipmaps()
	return ImageTexture.create_from_image(img)


# a LOD-chunked mesh: visibility measured from the chunk's centre, as KratorBiome places it (the node moves to the
# centre and its instances or vertices move back by as much)
static func _lod(gi: GeometryInstance3D, rec: Dictionary, report: Dictionary) -> void:
	var lod = rec.get("lod")
	if lod == null:
		return
	var c: PackedStringArray = str(lod["chunk"]).split(",")
	var o := Vector3((float(c[0]) + 0.5) * CHUNK, 0.0, (float(c[1]) + 0.5) * CHUNK)
	if gi is MultiMeshInstance3D:
		var mm: MultiMesh = (gi as MultiMeshInstance3D).multimesh
		var buf := mm.buffer   # through the buffer: headless, get_instance_transform answers the identity
		var stride := 12 + (4 if mm.use_colors else 0) + (4 if mm.use_custom_data else 0)
		for i in mm.instance_count:
			buf[i * stride + 3] -= o.x
			buf[i * stride + 7] -= o.y
			buf[i * stride + 11] -= o.z
		mm.buffer = buf
	elif gi is MeshInstance3D:
		var src: Mesh = (gi as MeshInstance3D).mesh
		var out := ArrayMesh.new()
		for s in src.get_surface_count():
			var a := src.surface_get_arrays(s)
			var v: PackedVector3Array = a[Mesh.ARRAY_VERTEX]
			for i in v.size():
				v[i] -= o
			a[Mesh.ARRAY_VERTEX] = v
			out.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, a)
			out.surface_set_material(s, src.surface_get_material(s))
		(gi as MeshInstance3D).mesh = out
	gi.position = o
	KratorBiome._apply_lod(gi, rec, report, KratorBiome.CHUNK * 0.7071)   # a whole chunk at its centre
