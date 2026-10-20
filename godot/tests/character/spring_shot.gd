# A screenshot for the SpringBoneSimulator3D spike (godot/krator/character/REPORT.md): the man in the Voth court
# robe walking, from behind or from the side, mid-stride, with the Verlet chains or the simulator. Needs a window:
#   godot --path godot --script res://tests/character/spring_shot.gd -- --out=<abs path.png> [--sim] [--view=back|side]
#     [--clip=walk] [--nocol] [--ends] [--noarms] [--stiff_k=<x>] [--gravity=<x>] [--drag=<x>] [--radius=<x>]   (as spring_spike.gd)
extends SceneTree

const DIR := "res://data/spike"
const FRAME := 34                         # 0.25 s of blend-in, then mid-stride of the 1.03 s walk
var frames := 0
var out := "user://spring_shot.png"
var view := "back"
var clip := "walk"
var fig: KCharFigure


func _init() -> void:
	var sim := false
	var opts := {}
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--out="):
			out = a.substr(6)
		if a.begins_with("--view="):
			view = a.substr(7)
		if a == "--sim":
			sim = true
		if a == "--nocol":
			opts["collide"] = false
		if a == "--ends":
			opts["ends"] = true
		if a == "--noarms":
			opts["noarms"] = true
		if a.begins_with("--clip="):
			clip = a.substr(7)
		for k in ["stiff_k", "gravity", "drag", "radius"]:
			if a.begins_with("--%s=" % k):
				opts[k] = float(a.substr(k.length() + 3))
	fig = KCharFigure.new()
	fig.spring_sim = sim
	fig.spring_opts = opts
	fig.load_body(DIR, "mpfb_male")
	root.add_child(fig)
	var rec := KChar.blank(fig.kit)
	rec["armour"] = {"torso": "voth_m_noble_robe", "legs": "voth_m_noble_skirt", "feet": "voth_m_noble_sandals"}
	fig.apply(rec)
	fig.play(clip)
	var cam := Camera3D.new()
	cam.fov = 30
	root.add_child(cam)
	var eye := Vector3(0, 1.0, -4.2) if view == "back" else Vector3(4.2, 1.0, 0)
	cam.look_at_from_position(eye, Vector3(0, 0.95, 0))
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-35, 205 if view == "back" else 115, 0)
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


func _process(_dt: float) -> bool:
	if frames == 0:                       # stepped from here only (as spring_spike.gd)
		fig.set_process(false)
	frames += 1
	if frames == FRAME + 1:
		root.get_viewport().get_texture().get_image().save_png(out)
		print("saved ", out)
		return true
	fig._process(1.0 / 30.0)
	return false
