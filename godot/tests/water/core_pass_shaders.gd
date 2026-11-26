# core_pass_test.gd runs headless, where no shader is compiled. This draws its scene on a real renderer for a few frames, with every option on and
# off; a shader that fails to compile prints SHADER ERROR on stderr (the mesh just vanishes), so the run's output is what is judged.
#   godot --path godot --script res://tests/water/core_pass_shaders.gd     then search its output for "SHADER ERROR"; it prints the count of meshes drawn
extends SceneTree

var frames := 0


func _initialize() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/water/core_pass_golden.json"))
	var ids: Dictionary = g["ids"]
	var keep := func(x: float, z: float) -> float: return clampf((140.0 - x) / 100.0, 0.0, 1.0)
	var opts := {"keep": {ids["stream"]: keep}, "fall": {ids["fall"]: {"footK": 0.8, "plungeR": 9.0, "lipK": 0.85}}, "wet": 0.2, "breakup": true}
	root.add_child(KratorWater.build(g["section"]))
	root.add_child(KratorWater.build(g["section"], null, null, 2.0, opts))
	# every water shader, the ones this scene's records do not reach too, each on a plane in view
	var rest := Node3D.new()
	root.add_child(rest)
	for f in DirAccess.get_files_at("res://shaders"):
		if f.begins_with("water") and f.ends_with(".gdshader"):
			var pm := PlaneMesh.new()
			pm.size = Vector2(40, 40)
			var mi := MeshInstance3D.new()
			mi.mesh = pm
			var sm := ShaderMaterial.new()
			sm.shader = load("res://shaders/" + f)
			mi.material_override = sm
			mi.position = Vector3(300, 12, 0)
			rest.add_child(mi)
	var cam := Camera3D.new()
	cam.far = 4000.0
	root.add_child(cam)
	cam.look_at_from_position(Vector3(300, 300, 400), Vector3(300, 10, 0))


func _process(_d: float) -> bool:
	frames += 1
	if frames == 30:
		var shaders := {}
		var n := 0
		for w in root.get_children():
			for c in w.get_children():
				if c is MeshInstance3D:
					n += 1
					if c.material_override is ShaderMaterial:
						var s: Shader = c.material_override.shader
						shaders[s.resource_path] = s.get_shader_uniform_list().size()
		print("core_pass_shaders: %d meshes, adapter %s" % [n, RenderingServer.get_video_adapter_name()])
		for p in shaders:
			print("  %s: %d uniforms" % [p, shaders[p]])
		quit(0)
	return false
