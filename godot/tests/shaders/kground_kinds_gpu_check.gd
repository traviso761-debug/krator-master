# The ground shader's layer kinds on a GPU (shaders/lib/kground_kinds.gdshaderinc; core/terrain/43-core-ground.js's
# 'clast', 'sand' and 'polygon'). Needs a renderer, not --headless (library_gpu_check.gd's pattern):
#   godot --path godot --rendering-method gl_compatibility --rendering-driver opengl3 \
#     --script res://tests/shaders/kground_kinds_gpu_check.gd          exits 0 when every value matches
# The include's functions (hash3, the 2D and 3D Voronoi, the value noise, the ripple) at the arguments in
# kground_kinds_golden.json, one value a pixel in two bytes over [-2, 2], against KGROUND.fn's values there
# (`node core/terrain/test-ground.js --golden` writes it). The kinds' recipes (kg_polygon, kg_sand_ripple, kg_glint) are
# compiled in the same shader. The negative: the golden's values shifted by 0.05 must miss.
extends SceneTree

const TOL := 0.01     # fp32 on the GPU against doubles (the hash's products reach a few thousand before fract)
var _vp: SubViewport
var _rows: Array = []
var _frames := 0


func _shader(rows: Array) -> Shader:
	var body := ""
	for i in rows.size():
		body += "\tif (i == %d) return %s;\n" % [i, rows[i][0]]
	var sh := Shader.new()
	sh.code = """shader_type canvas_item;
#include "res://shaders/lib/kground_kinds.gdshaderinc"
float v2f(float x, float y, float sd) { vec2 c; vec2 r; return kg_vor2(vec2(x, y), 0.9, sd, c, r).x; }
float v2e(float x, float y, float sd) { vec2 c; vec2 r; return kg_vor2(vec2(x, y), 0.9, sd, c, r).y; }
float v3f(vec3 p, float sd) { vec3 c; vec3 r; return kg_vor3(p, 0.9, sd, c, r).x; }
float v3e(vec3 p, float sd) { vec3 c; vec3 r; return kg_vor3(p, 0.9, sd, c, r).y; }
float recipes() { vec3 q; vec3 p = kg_polygon(vec2(3.0, 4.0), vec4(0.1, 0.04, 0.12, 0.85), 0.05, 0.01, 2.0, q);
	vec2 s = kg_sand_ripple(vec2(1.0, 2.0), vec2(1.0, 0.0), 0.12, 7.0, 1.2, 0.8, 0.0667, normalize(vec3(0.4, 0.75, 0.5)), 0.01, 3.0);
	return p.x + p.y + q.x + s.x + s.y + kg_glint(vec3(1.0, 0.0, 2.0), vec3(0.0, 2.0, 5.0), normalize(vec3(0.4, 0.75, 0.5)), 0.03, 2.0, 150.0, 0.2, 0.005, 3.0); }
float value(int i) {
%s	if (i == %d) return clamp(recipes(), -1.0, 1.0) * 0.0;
	return 0.0;
}
void fragment() {
	float v = value(int(FRAGCOORD.x)) / 4.0 + 0.5;
	float hi = floor(v * 255.0) / 255.0;
	COLOR = vec4(hi, (v - hi) * 255.0, 0.0, 1.0);
}""" % [body, rows.size()]
	return sh


func _initialize() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/shaders/kground_kinds_golden.json"))
	_rows = g["rows"]
	var m := ShaderMaterial.new()
	m.shader = _shader(_rows)
	_vp = SubViewport.new()
	_vp.size = Vector2i(_rows.size() + 1, 1)
	_vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	_vp.transparent_bg = false
	var cr := ColorRect.new()
	cr.size = Vector2(_rows.size() + 1, 1)
	cr.material = m
	_vp.add_child(cr)
	root.add_child(_vp)


func _process(_d: float) -> bool:
	_frames += 1
	if _frames < 4:
		return false
	var img := _vp.get_texture().get_image()
	var bad := 0
	var worst := 0.0
	var miss := 0
	for i in _rows.size():
		var c := img.get_pixel(i, 0)
		var got := (c.r + c.g / 255.0 - 0.5) * 4.0
		var want: float = _rows[i][1]
		var e := absf(got - want)
		worst = maxf(worst, e)
		if e > TOL:
			print("  %s: gpu %.5f, js %.5f" % [_rows[i][0], got, want])
			bad += 1
		if absf(got - (want + 0.05)) <= TOL:
			miss += 1
	var compiled := img.get_pixel(_rows.size(), 0).r > 0.4   # the recipes' pixel: 0.5 when the shader ran
	print(("ok   " if bad == 0 else "FAIL ") + "lib/kground_kinds: %d values on the GPU against KGROUND.fn (worst %.5f, tolerance %.2f)" % [_rows.size(), worst, TOL])
	print(("ok   " if compiled else "FAIL ") + "the kinds' recipes (kg_polygon, kg_sand_ripple, kg_glint) compile with them")
	print(("ok   " if miss == 0 else "FAIL ") + "negative: the values shifted by 0.05 match none of the %d pixels (%d did)" % [_rows.size(), miss])
	var fails := bad + (0 if compiled else 1) + (0 if miss == 0 else 1)
	print(("PASS" if fails == 0 else "FAIL") + "  the ground kinds on the GPU")
	quit(0 if fails == 0 else 1)
	return true
