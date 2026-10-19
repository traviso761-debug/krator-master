# The Iziz court furniture as Godot draws it from an export case, saved as a PNG to hold beside the page: the overlays
# (paintings in their gilt frames, vase glazes, book spines, carpets) and the triplanar finishes (marquetry, brocade,
# opus sectile, gold leaf, velvet: hook 'triplanar', shaders/lib/triplanar.gdshaderinc). Needs a display (no --headless):
#   godot --path godot --script res://tests/export/court_shot.gd -- --case=world-talia --view=living --out=C:/abs/shot.png
# Views are inside Talia's rich mixed street's Vernacular rich house (kits/talia, box -40,1064,16,1086): living (the
# divans and the gilt tray tables), hall (a painting), study (the library shelves), bedroom (a court cabinet).
extends SceneTree

var frames := 0
var out := "user://court_shot.png"
var case := "world-talia"
var view := "living"
# a piece's foot position, its heading (ry: its front is +z turned by ry), the camera's distance in front and height above
const VIEWS := {
	"living": [Vector3(7.62, 0.5, 1079.85), PI, 2.4, 1.3],
	"divan": [Vector3(5.56, 0.5, 1078.22), PI / 2, 2.2, 1.2],
	"hall": [Vector3(4.86, 0.9, 1070.33), -PI / 2, 2.2, 1.8],
	"study": [Vector3(2.55, 5.4, 1075.27), -PI / 2, 2.4, 1.3],
	"bedroom": [Vector3(5.44, 5.4, 1079.67), -PI / 2, 2.4, 1.2],
	"jars": [Vector3(-33.07, 1.4, 1067.01), 0.0, 1.6, 0.9],
}


func _init() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--out="):
			out = a.substr(6)
		elif a.begins_with("--case="):
			case = a.substr(7)
		elif a.begins_with("--view="):
			view = a.substr(7)
	var w := KratorWorld.build("res://data/" + case + "/world.json")
	root.add_child(w)
	# the walls hide the rooms: draw the furniture items alone (core/export's pieces, ids iziz/furn:...)
	var stack: Array[Node] = [w]
	while stack.size() > 0:
		var n: Node = stack.pop_back()
		stack.append_array(n.get_children())
		if n is GeometryInstance3D:
			var k = n.get_meta("krator") if n.has_meta("krator") else {}
			var id := str(k.get("id", "")) if k is Dictionary else ""
			(n as GeometryInstance3D).visible = id.begins_with("iziz/furn:")
	var v: Array = VIEWS.get(view, VIEWS["living"])
	var at: Vector3 = v[0]
	var front := Vector3(sin(v[1]), 0, cos(v[1]))
	var cam := Camera3D.new()
	cam.fov = 60
	cam.near = 0.05
	root.add_child(cam)
	cam.look_at_from_position(at + front * float(v[2]) + Vector3(0, float(v[3]), 0), at + Vector3(0, float(v[3]) * 0.6, 0))
	var lamp := OmniLight3D.new()   # the room's own lamps are fixtures the page lights; one bulb here
	lamp.position = at + front * float(v[2]) * 0.6 + Vector3(0, 2.2, 0)
	lamp.omni_range = 9.0
	lamp.light_energy = 2.2
	root.add_child(lamp)
	var env := WorldEnvironment.new()
	env.environment = Environment.new()
	env.environment.background_mode = Environment.BG_COLOR
	env.environment.background_color = Color(0.55, 0.62, 0.70)
	env.environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.environment.ambient_light_color = Color(0.95, 0.92, 0.86)
	env.environment.ambient_light_energy = 0.75
	root.add_child(env)


func _process(_dt: float) -> bool:
	frames += 1
	if frames == 30:
		root.get_viewport().get_texture().get_image().save_png(out)
		print("saved ", out)
		return true
	return false
