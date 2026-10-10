# Three figures from kits/characters' pieces, drawn by Godot, saved as a PNG: a mixed outfit at rest, the same with
# strong sliders, and one mid-walk. On a machine with no display:
#   xvfb-run -a -s "-screen 0 1200x800x24" godot --path godot --rendering-method gl_compatibility \
#     --rendering-driver opengl3 --script res://tests/character/kchar_shot.gd -- --out=/abs/path.png
extends SceneTree

var frames := 0
var out := "user://kchar_shot.png"
var walker: KCharFigure


func _init() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--out="):
			out = a.substr(6)
	var mix := {"head": "phil", "torso": "bronze", "hands": "hide", "legs": "scout", "feet": "bone"}
	var recs := [
		{"slots": mix, "sliders": {}, "dye": {}},
		{"slots": mix, "sliders": {"height": 1.0, "build": 1.0, "shoulders": 1.0, "armgirth": 1.0, "jaw": 1.0}, "dye": {"legs": "#6f8fc0"}},
		{"slots": {"head": "styv", "torso": "scout", "hands": "bronze", "legs": "hide", "feet": "bronze"}, "sliders": {"legs": -0.6}, "dye": {}},
	]
	for i in recs.size():
		var fig := KCharFigure.new()
		fig.load_dir("res://data/characters")
		fig.position = Vector3((i - 1) * 1.15, 0, 0)
		root.add_child(fig)
		fig.apply(recs[i])
		if i == 2:
			fig.play("walk")
			walker = fig
	var cam := Camera3D.new()
	cam.fov = 32
	root.add_child(cam)
	cam.look_at_from_position(Vector3(0.4, 1.1, 5.6), Vector3(0, 0.95, 0))
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-40, 30, 0)
	sun.light_energy = 1.3
	root.add_child(sun)
	var env := WorldEnvironment.new()
	env.environment = Environment.new()
	env.environment.background_mode = Environment.BG_COLOR
	env.environment.background_color = Color(0.82, 0.85, 0.80)
	env.environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.environment.ambient_light_color = Color(0.75, 0.75, 0.72)
	root.add_child(env)


func _process(dt: float) -> bool:
	frames += 1
	if walker:
		walker._process(1.0 / 30.0)
	if frames == 20:
		root.get_viewport().get_texture().get_image().save_png(out)
		print("saved ", out)
		return true
	return false
