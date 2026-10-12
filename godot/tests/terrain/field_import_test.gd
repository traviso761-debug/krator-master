# The krator-field importer (krator/field_import.gd) on core/terrain's golden field (a base grid and one inset):
# the mesh has a vertex on every grid point, the base's cells under the inset are left out, and rays onto the
# HeightMapShape3D collision land on KField.h at the grid points (base and inset alike).
#   godot --headless --path godot --script res://tests/terrain/field_import_test.gd       exits 0 on a pass
extends SceneTree

var bad := 0


func _ok(name: String, pass_: bool, neg: bool) -> void:
	var r := pass_ and not neg
	if not r:
		bad += 1
	print(("PASS  " if r else "FAIL  ") + name + (" (its negative passed)" if neg else ""))


func _initialize() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(get_script().resource_path.get_base_dir() + "/golden-field.json"))
	var f := KField.from_export(g["field"])
	var node := KratorField.build(f)
	root.add_child(node)
	var ins: KField = f.insets[0]
	var mesh: ArrayMesh = (node.get_node("Terrain") as MeshInstance3D).mesh
	var arr := mesh.surface_get_arrays(0)
	var nv: int = (arr[Mesh.ARRAY_VERTEX] as PackedVector3Array).size()
	var ntri: int = (arr[Mesh.ARRAY_INDEX] as PackedInt32Array).size() / 3
	var under := 0   # base cells whose centre lies inside the inset
	for j in f.nz - 1:
		for i in f.nx - 1:
			var x := f.x0 + (i + 0.5) * f.step
			var z := f.z0 + (j + 0.5) * f.step
			if x > ins.x0 and z > ins.z0 and x < ins.x1 and z < ins.z1:
				under += 1
	var want_tri := 2 * ((f.nx - 1) * (f.nz - 1) - under) + 2 * (ins.nx - 1) * (ins.nz - 1)
	var shared := 0   # base points that are also inset points: SurfaceTool merges the two into one vertex
	for j in f.nz:
		for i in f.nx:
			var x := f.x0 + i * f.step
			var z := f.z0 + j * f.step
			if x >= ins.x0 and z >= ins.z0 and x <= ins.x1 and z <= ins.z1:
				shared += 1
	_ok("a vertex per grid point (%d, %d shared by the base and the inset)" % [nv, shared], nv == f.nx * f.nz + ins.nx * ins.nz - shared and shared > 0,
		nv == f.nx * f.nz)
	_ok("the base's %d cells under the inset are left out (%d triangles)" % [under, ntri], ntri == want_tri and under > 0,
		ntri == 2 * ((f.nx - 1) * (f.nz - 1) + (ins.nx - 1) * (ins.nz - 1)))
	var body := node.get_node("Collision")
	_ok("one HeightMapShape3D per grid", body.get_child_count() == 2 and (body.get_child(0) as CollisionShape3D).shape is HeightMapShape3D,
		body.get_child_count() != 2)
	await physics_frame
	await physics_frame
	var space := node.get_world_3d().direct_space_state
	var worst := 0.0
	var worst_ins := 0.0
	var hits := 0
	for gi in 2:
		var G: KField = f if gi == 0 else ins
		for j in range(0, G.nz, 3):
			for i in range(0, G.nx, 3):
				var x := G.x0 + i * G.step
				var z := G.z0 + j * G.step
				if gi == 0 and x >= ins.x0 and z >= ins.z0 and x <= ins.x1 and z <= ins.z1:
					continue   # under the inset both shapes are there; the higher answers
				var hit := space.intersect_ray(PhysicsRayQueryParameters3D.create(Vector3(x, 1000, z), Vector3(x, -1000, z)))
				if hit.is_empty():
					continue
				hits += 1
				var d: float = abs((hit["position"] as Vector3).y - f.h(x, z))
				if gi == 0:
					worst = max(worst, d)
				else:
					worst_ins = max(worst_ins, d)
	_ok("rays hit the collision at the base's grid points to %.5f m (%d hits)" % [worst, hits], hits > 20 and worst < 1e-3, hits == 0)
	_ok("and at the inset's to %.5f m" % worst_ins, worst_ins < 1e-3, false)
	# negative control: the same rays against a shape left unscaled must miss the field
	var cs := body.get_child(0) as CollisionShape3D
	cs.scale = Vector3.ONE
	await physics_frame
	await physics_frame
	var off := 0.0
	for k in 10:
		var x := f.x0 + (2 + k) * f.step
		var z := f.z0 + 3 * f.step
		var hit := space.intersect_ray(PhysicsRayQueryParameters3D.create(Vector3(x, 1000, z), Vector3(x, -1000, z)))
		off = max(off, 1e9 if hit.is_empty() else abs((hit["position"] as Vector3).y - f.h(x, z)))
	_ok("negative: an unscaled shape does not match (off by %.2f m)" % min(off, 9999.0), off > 0.01, off <= 0.01)
	print("field_import: %s" % ("all passed" if bad == 0 else "%d FAILED" % bad))
	quit(0 if bad == 0 else 1)
