# A page's lamps as data (krator-lamps: Girder's _api.lamps, written by tools/export_spike.py as lamps.json): the halo
# the page draws over every flame, and a light. Girder lights its scene at night through a baked light volume only its
# own shaders read, and draws its halos as a Points cloud: neither crosses in the glTF, so its braziers sat dark here.
# Halos: one MultiMesh on shaders/halo.gdshader, lit by the lamp's hours. Lights: the MAX_LIGHTS nearest the focus
# become OmniLight3D run by krator/atmos_lights.gd (warm flames flicker as braziers); the rest stay halos only.
class_name KratorLamps
extends RefCounted

const HALO := preload("res://shaders/halo.gdshader")
const MAX_LIGHTS := 32


static func build(path: String, focus: Vector3) -> Node3D:
	var root := Node3D.new()
	root.name = "Lamps"
	var report := {"route": "krator-lamps JSON", "file": path, "gaps": {}, "counts": {}}
	var d = KData.read_json(path)
	if not (d is Dictionary) or d.get("format") != "krator-lamps":
		report["gaps"]["format"] = "not a krator-lamps file"
		root.set_meta("report", report)
		return root
	var lamps: Array = d["lamps"]

	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.use_colors = true
	mm.use_custom_data = true
	var q := QuadMesh.new()
	q.size = Vector2(1, 1)
	mm.mesh = q
	mm.instance_count = lamps.size()
	for i in lamps.size():
		var l: Dictionary = lamps[i]
		var s := float(l["size"])
		mm.set_instance_transform(i, Transform3D(Basis().scaled(Vector3(s, s, s)), _v3(l["at"])))
		mm.set_instance_color(i, KData.colour(l["color"], true))
		var hr: Array = l["hours"]
		mm.set_instance_custom_data(i, Color(float(hr[0]), float(hr[1]), 0, 0))
	var mmi := MultiMeshInstance3D.new()
	mmi.name = "Halos"
	mmi.multimesh = mm
	var hm := ShaderMaterial.new()
	hm.shader = HALO
	hm.set_shader_parameter("gain", 1.0)
	mmi.material_override = hm
	mmi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	root.add_child(mmi)

	var lights := Node3D.new()
	lights.name = "Lights"
	lights.set_script(load("res://krator/atmos_lights.gd"))
	root.add_child(lights)
	var near := lamps.duplicate()
	near.sort_custom(func(a, b): return _v3(a["at"]).distance_squared_to(focus) < _v3(b["at"]).distance_squared_to(focus))
	for i in min(MAX_LIGHTS, near.size()):
		var l: Dictionary = near[i]
		var o := OmniLight3D.new()
		o.position = _v3(l["at"])
		o.omni_range = float(l.get("radius", 16.0))
		o.light_color = KData.colour(l["color"], true)
		o.set_meta("hours", l["hours"])
		o.set_meta("energy", 1.2 * float(l.get("amp", 1.0)))
		o.set_meta("kind", "lamp" if l.get("cool", false) else "brazier")
		lights.add_child(o)
	report["counts"] = {"lamps": lamps.size(), "lights": min(MAX_LIGHTS, lamps.size())}
	report["gaps"]["lamp light"] = "the page lights its scene through a baked light volume its own shaders read (45-kit.js); here the nearest %d lamps are OmniLight3D, energy 1.2 x amp, range the lamp's radius: the spike's choice, to tune against the page" % MAX_LIGHTS
	report["gaps"]["lamp hours"] = "the page lights its lamps by its night factor (DAYNIGHT_NIGHT_K), the export by hours [17.2, 30.8] (dusk to dawn)"
	root.set_meta("report", report)
	return root


static func _v3(a: Array) -> Vector3:
	return Vector3(float(a[0]), float(a[1]), float(a[2]))
