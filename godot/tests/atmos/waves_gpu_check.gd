# shaders/atmos_waves.gdshaderinc on a GPU against the CPU twin (Atmos.wave_height, wave_slope): compiles the include
# in a canvas shader, draws one pixel per golden point, and reads the field back (8 bits a channel, so the tolerance is
# coarse: this proves the translation, the bit-exact match is atmos_test.gd's). Needs a renderer, not --headless:
#   xvfb-run -a godot --path godot --rendering-method gl_compatibility --rendering-driver opengl3 \
#     --script res://tests/atmos/waves_gpu_check.gd          exits 0 when every pixel matches
extends SceneTree

const T := 3.7          # one clock for the frame (atm_wave_t is global)
const RANGE := 2.0      # heights and slopes are drawn as v / (2 RANGE) + 0.5
const TOL := 0.02

var _vp: SubViewport
var _rows: Array = []
var _frames := 0


func _init() -> void:
	var gold: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/atmos/golden.json"))
	for r in gold["waves"]["height"]:
		if float(r[2]) == T:
			_rows.append(r)
	var sh := Shader.new()
	sh.code = """shader_type canvas_item;
#include "res://shaders/atmos_waves.gdshaderinc"
uniform vec4 pts[%d];
void fragment() {
	vec4 p = pts[int(FRAGCOORD.x)];
	float h = atm_wave_height(p.xy, p.z);
	vec3 s = atm_wave_slope(p.xy, 200.0);
	COLOR = vec4(h / %.1f + 0.5, s.x / %.1f + 0.5, s.y / %.1f + 0.5, 1.0);
}""" % [_rows.size(), 2.0 * RANGE, 2.0 * RANGE, 2.0 * RANGE]
	var m := ShaderMaterial.new()
	m.shader = sh
	var pts: Array = []
	for r in _rows:
		pts.append(Vector4(r[0], r[1], r[3], 0.0))
	m.set_shader_parameter("pts", pts)
	_vp = SubViewport.new()
	_vp.size = Vector2i(_rows.size(), 1)
	_vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	var cr := ColorRect.new()
	cr.size = Vector2(_rows.size(), 1)
	cr.material = m
	_vp.add_child(cr)
	root.add_child(_vp)


func _process(_delta: float) -> bool:
	_frames += 1
	var atmos := root.get_node_or_null("Atmos")   # the autoload sets atm_wave_t every frame: hold its clock at T
	if atmos:
		atmos.paused = true
		atmos.t = T
	else:
		RenderingServer.global_shader_parameter_set("atm_wave_t", T)
	if _frames < 4:
		return false
	var img := _vp.get_texture().get_image()
	var A = load("res://krator/atmos.gd").new()
	var bad := 0
	for i in _rows.size():
		var r: Array = _rows[i]
		var c := img.get_pixel(i, 0)
		var s: PackedFloat64Array = A.wave_slope(r[0], r[1], T, 200.0)
		var want := [float(r[4]), s[0], s[1]]
		var got := [(c.r - 0.5) * 2.0 * RANGE, (c.g - 0.5) * 2.0 * RANGE, (c.b - 0.5) * 2.0 * RANGE]
		for k in 3:
			if abs(got[k] - want[k]) > TOL:
				bad += 1
				print("  %s %s: gpu %.4f, cpu %.4f" % [["height", "dh/dx", "dh/dz"][k], str(r.slice(0, 4)), got[k], want[k]])
	A.free()
	print(("PASS" if bad == 0 else "FAIL") + "  atmos_waves.gdshaderinc on the GPU (%d points, height and slope, within %.2f)" % [_rows.size(), TOL])
	quit(0 if bad == 0 else 1)
	return true
