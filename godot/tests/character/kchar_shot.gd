# Five strangers from kits/characters' MakeHuman bodies, drawn by Godot and saved as a PNG: one per people, both
# bodies, holding props in clips (a drawn bow, a two-handed hoe and rifle). On a machine with no display:
#   xvfb-run -a -s "-screen 0 1400x800x24" godot --path godot --rendering-method gl_compatibility \
#     --rendering-driver opengl3 --script res://tests/character/kchar_shot.gd -- --out=/abs/path.png [--face]
extends SceneTree

const DIR := "res://data/characters"
var frames := 0
var out := "user://kchar_shot.png"
var face := false
var walkers: Array[KCharFigure] = []


func _init() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--out="):
			out = a.substr(6)
		if a == "--face":
			face = true
	var peoples := {}
	for p in JSON.parse_string(FileAccess.get_file_as_string(DIR + "/peoples.json"))["peoples"]:
		peoples[p["id"]] = p
	var cast := [["mpfb_male", "chichani", 3], ["mpfb_female", "beast_riders", 4], ["mpfb_male", "rustic_clansmen", 5],
		["mpfb_female", "yuni", 6], ["mpfb_male", "dalabites", 7]]
	for i in cast.size():
		var fig := KCharFigure.new()
		fig.load_body(DIR, cast[i][0])
		fig.position = Vector3((i - 2) * (0.42 if face else 0.95), 0, 0)
		root.add_child(fig)
		fig.apply(KChar.stranger(cast[i][2], fig.kit, peoples[cast[i][1]]))
		fig.hold([{"R": "sword", "L": "shield"}, {"L": "bow"}, {"R": "axe"}, {"R": "hoe", "both": true}, {"R": "rifle", "both": true}][i])
		if not face:
			fig.play(["idle", "bow_scan", "walk", "ual_chop", "walk_shoot"][i])
			walkers.append(fig)
	var cam := Camera3D.new()
	cam.fov = 30
	root.add_child(cam)
	if face:
		cam.look_at_from_position(Vector3(0, 1.62, 2.4), Vector3(0, 1.58, 0))
	else:
		cam.look_at_from_position(Vector3(0.3, 1.0, 6.4), Vector3(0, 0.9, 0))
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-35, 25, 0)
	sun.light_energy = 0.9
	root.add_child(sun)
	var env := WorldEnvironment.new()
	env.environment = Environment.new()
	env.environment.background_mode = Environment.BG_COLOR
	env.environment.background_color = Color(0.82, 0.85, 0.80)
	env.environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.environment.ambient_light_color = Color(0.85, 0.85, 0.82)
	env.environment.ambient_light_energy = 0.6
	root.add_child(env)


func _process(dt: float) -> bool:
	frames += 1
	for w in walkers:
		w._process(1.0 / 30.0)
	if frames == 24:
		root.get_viewport().get_texture().get_image().save_png(out)
		print("saved ", out)
		return true
	return false
