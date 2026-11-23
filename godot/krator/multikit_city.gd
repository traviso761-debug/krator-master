# Dynamic multi-kit settlement builder for Godot 4.7.2 (Phase 4 of core/region/MULTI-KIT-SCOPE.md, Rulings #99-101).
# Lazily loads per-kit prototype libraries (`res://data/kits/<kitId>.glb` + `<kitId>.glb.json`, exported headlessly by
# `python3 tools/kit_pack.py --export-glb`), upgrades materials through `KratorKmat.apply` (`shaders/library.gdshader`),
# instantiates `MultiMeshInstance3D` batches per `(kitId, pieceKey, v, surface)` for completed lots, and slices the
# build-order-sorted `ARRAY_INDEX` buffers for mid-construction lots (`0 <= f < 1`, matching `KCITY.constructMesh`).
class_name KratorMultikitCity
extends RefCounted

var kit_dir := "res://data/kits"
var repo_root := ""
var default_kit := "islanders"
var kits_reg: KratorKits = null
var loaded_kits := {}
var missing_kits := {}
var protos := {}   # "<kitId>:<pieceKey>#<v>" -> { "surfaces": [{mesh, material, tris, quantiles}], "meta": Dictionary }


func _init(p_kit_dir := "res://data/kits", p_default_kit := "islanders") -> void:
	kit_dir = p_kit_dir.trim_suffix("/")
	default_kit = p_default_kit
	repo_root = ProjectSettings.globalize_path("res://..").trim_suffix("/")
	kits_reg = KratorKits.new()
	var mpath := kit_dir + "/kits-manifest.json"
	if FileAccess.file_exists(mpath):
		var mdata = KData.read_json(mpath)
		if mdata is Dictionary:
			kits_reg.load_manifest(mdata)


func ensure_kit(kit_id: String) -> bool:
	if loaded_kits.has(kit_id):
		return true
	if missing_kits.has(kit_id):
		return false
	var glb_path := kit_dir + "/" + kit_id + ".glb"
	var meta_path := kit_dir + "/" + kit_id + ".glb.json"
	if not FileAccess.file_exists(glb_path):
		missing_kits[kit_id] = true
		return false

	var meta_doc: Dictionary = {}
	if FileAccess.file_exists(meta_path):
		var md = KData.read_json(meta_path)
		if md is Dictionary:
			meta_doc = md

	var doc := GLTFDocument.new()
	var state := GLTFState.new()
	var err := doc.append_from_file(glb_path, state)
	if err != OK:
		missing_kits[kit_id] = true
		return false
	var scene: Node = doc.generate_scene(state)

	# Upgrade library materials from the kit's pack.json when present on disk
	var tex_rel := str(meta_doc.get("texDir", ""))
	var kmat_report := {}
	if not tex_rel.is_empty():
		var tex_abs := repo_root + "/" + tex_rel
		if FileAccess.file_exists(tex_abs + "/pack.json"):
			kmat_report = KratorKmat.apply(scene, state, tex_abs)

	var proto_table: Dictionary = meta_doc.get("prototypes", {})
	var indexed := 0
	for pkey in proto_table:
		var pmeta: Dictionary = proto_table[pkey]
		var node_name := str(pmeta.get("node", ""))
		var pnode := scene.find_child(node_name.validate_node_name(), true, false)
		if pnode == null:
			pnode = scene.find_child(node_name, true, false)
		if pnode == null:
			continue
		var surfaces := []
		var surf_summaries: Array = pmeta.get("surfaces", [])
		var s_idx := 0
		for child in pnode.get_children():
			if child is MeshInstance3D and (child as MeshInstance3D).mesh != null:
				var mi := child as MeshInstance3D
				var msh := mi.mesh
				for si in msh.get_surface_count():
					var s_meta: Dictionary = surf_summaries[s_idx] if s_idx < surf_summaries.size() else {}
					var mat := msh.surface_get_material(si)
					if mi.material_override != null:
						mat = mi.material_override
					var arrays := msh.surface_get_arrays(si)
					var idx_arr: PackedInt32Array = arrays[Mesh.ARRAY_INDEX] if arrays[Mesh.ARRAY_INDEX] != null else PackedInt32Array()
					var tri_cnt := int(idx_arr.size() / 3) if idx_arr.size() > 0 else int((arrays[Mesh.ARRAY_VERTEX] as PackedVector3Array).size() / 3)
					surfaces.append({
						"arrays": arrays,
						"mesh": msh,
						"surface_index": si,
						"material": mat,
						"tris": tri_cnt,
						"quantiles": s_meta.get("quantiles", [])
					})
					s_idx += 1
		if not surfaces.is_empty():
			protos[kit_id + ":" + str(pkey)] = {"surfaces": surfaces, "meta": pmeta}
			indexed += 1

	scene.free()
	loaded_kits[kit_id] = {"kitId": kit_id, "prototypes": indexed, "kmat": kmat_report}
	return true


static func _lot_transform(L: Dictionary, scale_vec := Vector3.ONE) -> Transform3D:
	var ry := float(L.get("ry", 0.0))
	var pos := Vector3(float(L.get("x", 0.0)), float(L.get("y", 0.0)), float(L.get("z", 0.0)))
	var b := Basis(Vector3.UP, ry).scaled_local(scale_vec)
	return Transform3D(b, pos)


static func _slice_surface_mesh(surf: Dictionary, f: float) -> ArrayMesh:
	var cf := clampf(f, 0.0, 1.0)
	var total_tris := int(surf["tris"])
	var quants: Array = surf.get("quantiles", [])
	var keep_tris := int(floor(cf * float(total_tris)))
	if quants.size() == 21:
		var qf := cf * 20.0
		var q0 := mini(20, int(floor(qf)))
		var q1 := mini(20, q0 + 1)
		var frac := qf - float(q0)
		keep_tris = int(round(lerpf(float(quants[q0]), float(quants[q1]), frac)))
	keep_tris = clampi(keep_tris, 0, total_tris)
	if keep_tris <= 0:
		return null

	var src_arrays: Array = surf["arrays"]
	var new_arrays := src_arrays.duplicate()
	var idx_in: PackedInt32Array = src_arrays[Mesh.ARRAY_INDEX] if src_arrays[Mesh.ARRAY_INDEX] != null else PackedInt32Array()
	if idx_in.size() >= keep_tris * 3:
		new_arrays[Mesh.ARRAY_INDEX] = idx_in.slice(0, keep_tris * 3)
	var am := ArrayMesh.new()
	am.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, new_arrays)
	if surf["material"] != null:
		am.surface_set_material(0, surf["material"])
	return am


func build_plan(plan: Dictionary, lot_progress := {}) -> Node3D:
	var root := Node3D.new()
	root.name = "MultikitCity"
	var raw_lots: Array = plan.get("lots", [])
	var standing := []
	for L in raw_lots:
		if L is Dictionary and L.get("died", null) == null:
			standing.append(L)

	var used_kits := KratorKits.kits_used_by_lots(standing, default_kit)
	for kid in used_kits:
		ensure_kit(str(kid))

	var batches := {}   # proto_id -> Array[Dictionary]
	var massing := []
	var constructing_parent := Node3D.new()
	constructing_parent.name = "Constructing"
	root.add_child(constructing_parent)
	var n_constructing := 0

	for L in standing:
		var fb = L.get("kit", null)
		if fb == null:
			fb = default_kit
		var parsed := KratorKits.parse_key(str(L.get("key", "")), fb)
		var v := int(L.get("v", 0))
		var pid := str(parsed["qkey"]) + "#" + str(v)
		if not protos.has(pid) and v != 0 and protos.has(str(parsed["qkey"]) + "#0"):
			pid = str(parsed["qkey"]) + "#0"

		var lot_key := str(L.get("tag", L.get("id", "")))
		var prog := float(lot_progress[lot_key]) if lot_progress.has(lot_key) else 1.0

		if prog < 1.0 and protos.has(pid):
			var P: Dictionary = protos[pid]
			var cgroup := Node3D.new()
			cgroup.name = "Construct_" + lot_key.validate_node_name()
			cgroup.transform = _lot_transform(L)
			for si in (P["surfaces"] as Array).size():
				var sm := _slice_surface_mesh(P["surfaces"][si], prog)
				if sm != null:
					var mi := MeshInstance3D.new()
					mi.name = "surf_%d" % si
					mi.mesh = sm
					cgroup.add_child(mi)
			cgroup.set_meta("krator_lot", lot_key)
			cgroup.set_meta("krator_progress", prog)
			constructing_parent.add_child(cgroup)
			n_constructing += 1
		elif protos.has(pid):
			if not batches.has(pid):
				batches[pid] = []
			batches[pid].append(L)
		else:
			massing.append(L)

	var inst_parent := Node3D.new()
	inst_parent.name = "Buildings"
	root.add_child(inst_parent)
	var mm_nodes := 0

	var batch_keys: Array = batches.keys()
	batch_keys.sort()
	for pid0 in batch_keys:
		var pid := str(pid0)
		var P2: Dictionary = protos[pid]
		var lots_list: Array = batches[pid]
		var surfs: Array = P2["surfaces"]
		for si in surfs.size():
			var surf: Dictionary = surfs[si]
			var single := ArrayMesh.new()
			single.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, surf["arrays"])
			if surf["material"] != null:
				single.surface_set_material(0, surf["material"])
			var mm := MultiMesh.new()
			mm.transform_format = MultiMesh.TRANSFORM_3D
			mm.mesh = single
			mm.instance_count = lots_list.size()
			for li in lots_list.size():
				mm.set_instance_transform(li, _lot_transform(lots_list[li]))
			var mmi := MultiMeshInstance3D.new()
			mmi.name = (pid + "_s" + str(si)).validate_node_name()
			mmi.multimesh = mm
			mmi.set_meta("krator_proto", pid)
			mmi.set_meta("krator_count", lots_list.size())
			inst_parent.add_child(mmi)
			mm_nodes += 1

	if not massing.is_empty():
		var box := BoxMesh.new()
		box.size = Vector3.ONE
		var mmat := StandardMaterial3D.new()
		mmat.albedo_color = Color(0.72, 0.66, 0.58)
		mmat.roughness = 0.92
		var mmm := MultiMesh.new()
		mmm.transform_format = MultiMesh.TRANSFORM_3D
		mmm.mesh = box
		mmm.instance_count = massing.size()
		for mi2 in massing.size():
			var ML: Dictionary = massing[mi2]
			var w := float(ML.get("w", 6.0))
			var d := float(ML.get("d", 6.0))
			var h := float(ML.get("h", 6.0))
			var tr := _lot_transform(ML, Vector3(w, h, d))
			tr.origin.y += h * 0.5
			mmm.set_instance_transform(mi2, tr)
		var mass_node := MultiMeshInstance3D.new()
		mass_node.name = "MassingFallback"
		mass_node.multimesh = mmm
		mass_node.material_override = mmat
		root.add_child(mass_node)

	root.set_meta("report", {
		"standing_lots": standing.size(),
		"used_kits": used_kits,
		"loaded_kits": loaded_kits.keys(),
		"missing_kits": missing_kits.keys(),
		"multimesh_nodes": mm_nodes,
		"constructing_nodes": n_constructing,
		"massing_lots": massing.size()
	})
	return root
