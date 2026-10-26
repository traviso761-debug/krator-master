# The shared sky rendered in Godot (shaders/sky.gdshader + krator/sky.gd): proves the generated include compiles on a GPU
# and shows it. Needs a renderer, not --headless:
#   godot --path godot --script res://tests/sky/sky_shot.gd -- --out=<png> [--hour=15] [--day=0] [--look=giant|cluster|sun|up]
#     [--fov=55] [--px=446 --py=690]      writes the frame and exits 0 when the sky drew (not black, not the error magenta)
extends SceneTree

var _sky
var _cam: Camera3D
var _frames := 0
var _args := {}


func _initialize() -> void:
	for a in OS.get_cmdline_user_args():
		var kv := a.trim_prefix("--").split("=", true, 1)
		_args[kv[0]] = kv[1] if kv.size() > 1 else "1"
	root.size = Vector2i(960, 600)
	_sky = load("res://krator/sky.gd").new()
	_sky.hour = float(_args.get("hour", "15"))
	_sky.day = float(_args.get("day", "0"))
	_sky.site_px = Vector2(float(_args.get("px", "446")), float(_args.get("py", "690")))
	root.add_child(_sky)
	_cam = Camera3D.new()
	_cam.fov = float(_args.get("fov", "55"))
	root.add_child(_cam)
	_cam.current = true
	var ground := MeshInstance3D.new()
	var pm := PlaneMesh.new()
	pm.size = Vector2(4000, 4000)
	ground.mesh = pm
	var gm := StandardMaterial3D.new()
	gm.albedo_color = Color(0.33, 0.36, 0.25)
	ground.material_override = gm
	ground.position.y = -1.7
	root.add_child(ground)


func _process(_dt: float) -> bool:
	_frames += 1
	if _frames == 2:
		var s: Dictionary = _sky.state
		var look: String = _args.get("look", "giant")
		var d: Vector3 = s["giantDir"] if look == "giant" else (s["clusterDir"] if look == "cluster" else (s["sunDir"] if look == "sun" else Vector3(0, 0.999, -0.04)))
		_cam.look_at(_cam.global_position + d, Vector3.UP if absf(d.y) < 0.99 else Vector3.FORWARD)
	if _frames < 30:
		return false
	var img := root.get_texture().get_image()
	var out: String = _args.get("out", "user://sky_shot.png")
	img.save_png(out)
	var c := img.get_pixel(img.get_width() / 2, img.get_height() / 3)
	var magenta := c.r > 0.9 and c.g < 0.1 and c.b > 0.9
	var black := c.r + c.g + c.b < 0.003
	print("sky_shot: %s  centre-top pixel %s  %s" % [out, c, "FAIL" if magenta or black else "ok"])
	quit(1 if magenta or black else 0)
	return true
