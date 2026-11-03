# The season on a leaf, on a GPU (needs a renderer, not --headless; library_gpu_check.gd's pattern):
#   xvfb-run -a godot --path godot --rendering-method gl_compatibility --rendering-driver opengl3 \
#     --script res://tests/shaders/season_gpu_check.gd          exits 0 when every check passes
# 1. shaders/lib/season.gdshaderinc's functions (the hash, the dry's and the flush's shares, the cards gone, the tint) at fixed
#    arguments, read back against their GDScript twins below (the formulas of core/biome/30-core-foliage.js and
#    30s-core-season-flush.js, which test-foliage.js and test-season-flush.js run in the GLSL interpreter).
# 2. foliage.gdshader itself on a card, through krator/biome_import.gd's _season: with no season options the card draws as it
#    did; at full dry with drop 1 it is gone; at full flush its colour turns to the flush colour. The negatives: a card with
#    the season options but season_dry 0 is still there, and the flush at 0 leaves its colour alone.
extends SceneTree

const N := 16
const F_TOL := 4e-3

var _vps: Array = []
var _frames := 0
var _stage := 0
var _cards := {}


func _lib_shader() -> Shader:
	var sh := Shader.new()
	sh.code = """shader_type canvas_item;
#include "res://shaders/lib/season.gdshaderinc"
float value(int i) {
	if (i == 0) return sn_hash(vec3(1.7, 3.1, -0.9));
	if (i == 1) return sn_hash(vec3(-120.5, 4.25, 77.0));
	if (i == 2) return sn_hash(vec3(0.0));
	if (i == 3) return sn_dry_k(0.5, vec4(0.8, 0.9, 0.5, 0.0), 0.2);
	if (i == 4) return sn_dry_k(1.0, vec4(0.8, 0.9, 0.5, 0.0), 0.9);
	if (i == 5) return sn_dry_k(0.0, vec4(0.8, 0.9, 0.5, 0.0), 0.6);
	if (i == 6) return sn_gone(0.5, vec4(0.8, 0.9, 0.5, 0.0), 0.3);
	if (i == 7) return sn_gone(1.0, vec4(0.8, 0.9, 0.5, 0.0), 0.05);
	if (i == 8) return sn_gone(1.0, vec4(0.8, 0.9, 0.5, 0.0), 0.999);
	if (i == 9) return sn_flush_k(0.6, vec2(0.9, 0.5), 0.25);
	if (i == 10) return sn_flush_k(1.0, vec2(1.0, 0.5), 0.0);
	if (i == 11) return sn_tint(vec3(0.4, 0.5, 0.6), vec3(0.5, 0.6, 0.7), vec3(0.6, 0.3, 0.1), 0.4, 0.7).r;
	if (i == 12) return sn_tint(vec3(0.4, 0.5, 0.6), vec3(0.5, 0.6, 0.7), vec3(0.6, 0.3, 0.1), 0.4, 0.7).b;
	if (i == 13) return sn_tint(vec3(0.4, 0.5, 0.6), vec3(0.5, 0.6, 0.7), vec3(0.6, 0.3, 0.1), 0.4, 0.0).g;
	if (i == 14) return sn_discard(vec3(0.31, 0.72, 0.15), 0.4, 1.0) ? 1.0 : 0.0;
	if (i == 15) return sn_discard(vec3(0.31, 0.72, 0.15), 0.4, 0.0) ? 1.0 : 0.0;
	return 0.0;
}
void fragment() {
	float v = value(int(FRAGCOORD.x));
	float hi = floor(v * 255.0) / 255.0;
	COLOR = vec4(hi, (v - hi) * 255.0, 0.0, 1.0);
}"""
	return sh


static func _fract(x: float) -> float:
	return x - floor(x)


static func _hash(p: Vector3) -> float:
	var q := Vector3(_fract(p.x * 0.1031), _fract(p.y * 0.1031), _fract(p.z * 0.1031))
	var d := q.dot(Vector3(q.z, q.y, q.x) + Vector3(31.32, 31.32, 31.32))
	q += Vector3(d, d, d)
	return _fract((q.x + q.y) * q.z)


static func _dry_k(dry: float, k: Vector4, h: float) -> float:
	return clampf(dry * (1.0 + k.z * (2.0 * h - 1.0)), 0.0, 1.0) * k.y


static func _gone(dry: float, k: Vector4, h: float) -> float:
	return clampf((dry * k.x * 1.15 - h) / 0.15, 0.0, 1.0)


static func _flush_k(fl: float, k: Vector2, h: float) -> float:
	return clampf(fl * (1.0 + k.y * (2.0 * h - 1.0)), 0.0, 1.0) * k.x


static func _tint(c: Vector3, vc: Vector3, t: Vector3, h: float, d: float) -> Vector3:
	var r := t * (0.88 + 0.24 * h)
	var m := Vector3(r.x / maxf(vc.x, 0.004), r.y / maxf(vc.y, 0.004), r.z / maxf(vc.z, 0.004))
	return c * (Vector3.ONE + (m - Vector3.ONE) * d)


func _want() -> Array:
	var K := Vector4(0.8, 0.9, 0.5, 0.0)
	var c := Vector3(0.4, 0.5, 0.6)
	var vc := Vector3(0.5, 0.6, 0.7)
	var t := Vector3(0.6, 0.3, 0.1)
	var p := Vector3(0.31, 0.72, 0.15)
	var cell := Vector3(floor(p.x * 8.0), floor(p.y * 8.0), floor(p.z * 8.0)) + Vector3(0.4, 0.4, 0.4) * 17.0
	return [_hash(Vector3(1.7, 3.1, -0.9)), _hash(Vector3(-120.5, 4.25, 77.0)), _hash(Vector3.ZERO),
		_dry_k(0.5, K, 0.2), _dry_k(1.0, K, 0.9), _dry_k(0.0, K, 0.6), _gone(0.5, K, 0.3), _gone(1.0, K, 0.05), _gone(1.0, K, 0.999),
		_flush_k(0.6, Vector2(0.9, 0.5), 0.25), _flush_k(1.0, Vector2(1.0, 0.5), 0.0),
		_tint(c, vc, t, 0.4, 0.7).x, _tint(c, vc, t, 0.4, 0.7).z, _tint(c, vc, t, 0.4, 0.0).y,
		1.0 if _hash(cell) < 1.0 else 0.0, 0.0]


func _card(name: String, opts) -> void:
	var vp := SubViewport.new()
	vp.size = Vector2i(8, 8)
	vp.transparent_bg = true
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	vp.own_world_3d = true
	var cam := Camera3D.new()
	cam.position = Vector3(0, 0, 3)
	vp.add_child(cam)
	var sun := DirectionalLight3D.new()
	sun.rotation = Vector3(-0.3, 0.2, 0.0)
	vp.add_child(sun)
	var mi := MeshInstance3D.new()
	var q := QuadMesh.new()
	q.size = Vector2(4, 4)
	mi.mesh = q
	var sm := ShaderMaterial.new()
	sm.shader = preload("res://shaders/foliage.gdshader")
	sm.set_shader_parameter("has_tex", false)
	sm.set_shader_parameter("colour", Color(0.3, 0.7, 0.3))
	sm.set_shader_parameter("sway_a", 0.0)
	KratorBiome._season(sm, opts)
	mi.material_override = sm
	vp.add_child(mi)
	root.add_child(vp)
	_cards[name] = vp


func _initialize() -> void:
	var mat := ShaderMaterial.new()
	mat.shader = _lib_shader()
	var vp := SubViewport.new()
	vp.size = Vector2i(N, 1)
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	var cr := ColorRect.new()
	cr.size = Vector2(N, 1)
	cr.material = mat
	vp.add_child(cr)
	root.add_child(vp)
	_vps.append(vp)
	_card("plain", null)
	_card("drop", {"drop": 1.0, "colour": 0xc8a860, "k": 0.9})
	_card("flush", {"flush": {"colour": 0xb0502a, "k": 1.0, "stagger": 0.0}})
	RenderingServer.global_shader_parameter_set("season_dry", 0.0)
	RenderingServer.global_shader_parameter_set("season_flush", 0.0)


func _px(name: String) -> Color:
	return (_cards[name] as SubViewport).get_texture().get_image().get_pixel(4, 4)


var _before := {}


func _process(_delta: float) -> bool:
	_frames += 1
	if _frames < 5:
		return false
	if _stage == 0:   # season_dry 0, season_flush 0: every card drawn, the flush card in its own colour
		_before = {"plain": _px("plain"), "drop": _px("drop"), "flush": _px("flush")}
		RenderingServer.global_shader_parameter_set("season_dry", 1.0)
		RenderingServer.global_shader_parameter_set("season_flush", 1.0)
		_stage = 1
		_frames = 0
		return false
	var bad := 0
	var img: Image = (_vps[0] as SubViewport).get_texture().get_image()
	var want := _want()
	var worst := 0.0
	for i in N:
		var c := img.get_pixel(i, 0)
		worst = maxf(worst, absf(c.r + c.g / 255.0 - float(want[i])))
	var ok1 := worst <= F_TOL
	print(("PASS  " if ok1 else "FAIL  ") + "season.gdshaderinc: %d values against the GDScript twins, worst %s" % [N, str(worst)])
	var after := {"plain": _px("plain"), "drop": _px("drop"), "flush": _px("flush")}
	var checks := [
		["no season options: the card draws, and the season globals do not touch it", _before["plain"].a > 0.9 and after["plain"].is_equal_approx(_before["plain"])],
		["  negative: with drop 1 and season_dry 0 the card is still there", _before["drop"].a > 0.9],
		["season_dry 1 with drop 1: the card is gone", after["drop"].a < 0.05],
		["  negative: season_flush 0 leaves the flush card in its own colour", _before["flush"].is_equal_approx(_before["plain"])],
		["season_flush 1: the flush card turns copper (red over green)", after["flush"].r > after["flush"].g and _before["flush"].g > _before["flush"].r]]
	for ck in checks:
		if not ck[1]:
			bad += 1
		print(("PASS  " if ck[1] else "FAIL  ") + ck[0])
	if not ok1:
		bad += 1
	print("before %s, after %s" % [str(_before), str(after)])
	print("season_gpu: %s" % ("all passed" if bad == 0 else "%d FAILED" % bad))
	quit(1 if bad else 0)
	return true
