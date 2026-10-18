# The shader library on a GPU (needs a renderer, not --headless; waves_gpu_check.gd's pattern):
#   xvfb-run -a godot --path godot --rendering-method gl_compatibility --rendering-driver opengl3 \
#     --script res://tests/shaders/library_gpu_check.gd          exits 0 when every pixel matches
# 1. shaders/lib/water.gdshaderinc's wtr_height (3 Newton steps) and wtr_damp, with the uniforms KWater makes (the same
#    code path as krator/water_import.gd), at 32 points on each of tests/water/golden.json's three surfaces (the sea
#    with half the shared wave field and a bed, the pond, the bay with the field's chop), one clock: read back against
#    KWater.height_at, the CPU twin that equals WATER.heightAt to 1e-14 m (water_test.gd). The height travels in two
#    8-bit channels over +-4 m (6e-5 m a step).
# 2. every other include (world-uv, breakup, foliage, bark, cloth-sway, flag, glass, coursing, anim) compiled into one shader,
#    each function at fixed arguments against its GDScript twin below: a stale or broken include draws wrong pixels.
# The negative: the sea's uniforms with its first wave 5% taller must miss.
extends SceneTree

const T := 3.7          # one clock for the frame (atm_wave_t is global)
const R := 4.0          # heights drawn as (h - level) / (2 R) + 0.5, in two bytes
const N := 32
const H_TOL := 4e-3     # metres: fp32 on the GPU against doubles
const H_TOL_SHORE := 1.5e-2   # a shore grid's breakers read the bed's depth and shore distance through 8-bit texture
                              # filtering (llvmpipe weights the texels in 1/256 steps), and the depth's fine channel hands
                              # over to the coarse one at 3 m: a few cm of depth there, a few mm to a cm of breaker height
const F_TOL := 4e-3

var _vps: Array = []
var _rows: Array = []   # per viewport: [kind, data]
var _frames := 0
var _atm


func _water_shader(n: int) -> Shader:
	var sh := Shader.new()
	sh.code = """shader_type canvas_item;
#include "res://shaders/lib/water.gdshaderinc"
uniform vec2 pts[%d];
void fragment() {
	vec2 p = pts[int(FRAGCOORD.x)];
	float h = (wtr_height(p) - wtr_level) / %.1f + 0.5;
	float hi = floor(h * 255.0) / 255.0;
	COLOR = vec4(hi, (h - hi) * 255.0, wtr_damp(p) * 0.5, 1.0);
}""" % [n, 2.0 * R]
	return sh


# a shore grid's own reads on the GPU: the bed's depth (two bytes over -20..44 m) and the shore distance (one byte over
# +-band), at the same points
func _shore_shader(n: int) -> Shader:
	var sh := Shader.new()
	sh.code = """shader_type canvas_item;
#include "res://shaders/lib/water.gdshaderinc"
uniform vec2 pts[%d];
void fragment() {
	vec2 p = pts[int(FRAGCOORD.x)];
	float d = clamp((wtr_depth(p) + 20.0) / 64.0, 0.0, 1.0);
	float hi = floor(d * 255.0) / 255.0;
	COLOR = vec4(hi, (d - hi) * 255.0, clamp(wtr_shore_dist(p) / (2.0 * wtr_shore.x) + 0.5, 0.0, 1.0), 1.0);
}""" % n
	return sh


# lib/water_kinds' functions at fixed arguments (the river's advected normal, the fall's streak and churn, the pool's
# normal), one value a pixel in two bytes over [-1, 1], each against KWater's twin
const KIND_ARGS := [[12.5, 3.0, 1.6, 0.4, 0.02], [431.0, -12.0, -0.3, 1.1, 0.09], [-2560.0, 530.0, 0.0, 0.0, 0.0]]
func _kinds_shader(kind: String) -> Shader:
	var sh := Shader.new()
	var body := ""
	if kind == "flow":
		body = "vec4 a = A[i / 2]; vec3 n = wk_flow_n(a.xy, a.zw, S[i / 2]); v = (i % 2 == 0) ? n.x : n.z;"
	elif kind == "fall":
		body = "vec4 a = A[i / 2]; v = (i % 2 == 0) ? wk_streak(a.x, a.y) : wk_plunge_at(a.zw).x;"
	else:
		body = "vec4 a = A[i / 2]; vec3 n = wk_still_n(a.xy); v = (i % 2 == 0) ? n.x : n.z;"
	sh.code = """shader_type canvas_item;
#include "res://shaders/lib/water_kinds.gdshaderinc"
uniform vec4 A[3];
uniform float S[3];
void fragment() {
	int i = int(FRAGCOORD.x);
	float v = 0.0;
	%s
	float h = v * 0.5 + 0.5;
	float hi = floor(h * 255.0) / 255.0;
	COLOR = vec4(hi, (h - hi) * 255.0, 0.0, 1.0);
}""" % body
	return sh


func _lib_shader() -> Shader:
	var sh := Shader.new()
	sh.code = """shader_type canvas_item;
#include "res://shaders/lib/world-uv.gdshaderinc"
#include "res://shaders/lib/breakup.gdshaderinc"
#include "res://shaders/lib/foliage.gdshaderinc"
#include "res://shaders/lib/bark.gdshaderinc"
#include "res://shaders/lib/cloth-sway.gdshaderinc"
#include "res://shaders/lib/flag.gdshaderinc"
#include "res://shaders/lib/glass.gdshaderinc"
#include "res://shaders/lib/coursing.gdshaderinc"
#include "res://shaders/lib/anim.gdshaderinc"
#include "res://shaders/lib/world-uv.gdshaderinc"
vec3 anm_p(int mode, float t) { mat3 M; vec3 P; anm_pose(mode, 3.0, vec4(0.7, 1.3, 1.6, 0.6), t, M, P); return P; }
vec3 anm_m0(int mode, float t) { mat3 M; vec3 P; anm_pose(mode, 3.0, vec4(-0.7, 1.3, 1.6, 0.6), t, M, P); return M[0]; }
float value(int i) {
	if (i == 0) return wuv_box(vec2(0.25, 0.5), vec3(0.0, 1.0, 0.0), vec3(3.0, 1.0, 5.0), vec2(0.5)).y;
	if (i == 1) return wuv_box(vec2(0.25, 0.5), vec3(1.0, 0.0, 0.0), vec3(3.0, 2.0, 5.0), vec2(0.5, 0.25)).x;
	if (i == 2) return wuv_layer(vec3(0.6), vec3(0.8), 1.12, 0.85).r;
	if (i == 3) return km_n(vec3(0.31, 0.72, 0.15));
	if (i == 4) return bu_bright(vec3(1.3, 0.2, 2.1), 0.15, 6.0);
	if (i == 5) return fol_sway(vec3(0.3, 0.6, -0.2), vec3(1.5, 0.0, -2.0), 1.4, 0.8, 3.7, vec2(0.8, 0.35), 0.06).x;
	if (i == 6) return fol_irid(normalize(vec3(0.2, 0.9, 0.1)), normalize(vec3(-0.5, 0.3, 0.8)), vec3(0.45, 0.72, -0.52), vec3(1.0, 2.0, 3.0), 3.7);
	if (i == 7) return bark_irid(normalize(vec3(0.6, 0.3, 0.7)), normalize(vec3(0.1, 0.2, 0.97)), vec3(1.0, 2.0, 3.0), 3.7, vec3(0.78, 1.18, 0.92), vec3(1.45, 0.82, 0.74)).g;
	if (i == 8) return cloth_sway(vec3(0.3, 0.2, -0.1), vec2(0.125, -0.0725), 3.7).x;
	if (i == 9) return flag_flutter(vec3(0.4, 0.1, 0.0), 1.3, vec3(2.0, 1.0, 3.0), 3.7).z;
	if (i == 10) return flag_pose(vec3(0.4, 0.1, 0.0), 1.3, vec3(2.0, 1.0, 3.0), vec2(0.1, -0.2), 0.7, 0.9, 3.7).x;
	if (i == 11) return glass_fresnel(vec3(0.0, 1.0, 0.0), vec3(sin(1.1), cos(1.1), 0.0));
	if (i == 12) return glass_alpha(0.3, 0.5);
	if (i == 13) return coursing(vec2(1.37, 0.81), vec2(0.0), 0.32, 0.9, 0.6, 0.02, 0.12, 7u).x;
	if (i == 14) return coursing(vec2(1.37, 0.641), vec2(0.0), 0.32, 0.9, 0.6, 0.02, 0.12, 7u).x;
	if (i == 15) return coursing(vec2(1.37, 0.81), vec2(0.0), 0.32, 0.9, 0.6, 0.02, 0.12, 7u).y;
	if (i == 16) return coursing(vec2(-3.1, 2.5), vec2(0.0), 0.32, 0.9, -0.5, 0.02, 0.2, 3u).y;
	if (i == 17) return coursing(vec2(1.37, 0.64), vec2(0.05, 0.05), 0.32, 0.9, 0.6, 0.02, 0.12, 7u).x;
	if (i == 18) return bark_far_k(normalize(vec3(0.2, 0.9, 0.1)), normalize(vec3(-0.5, 0.3, 0.8)), vec3(0.45, 0.72, -0.52), vec3(1.0, 2.0, 3.0), 3.7, 1.0);
	if (i == 20) return anm_p(0, 3.7).x;
	if (i == 21) return anm_m0(0, 3.7).y;
	if (i == 22) return anm_p(1, 3.7).y;
	if (i == 23) return anm_m0(1, 3.7).z;
	if (i == 24) return anm_flap(vec3(0.2, 0.0, 0.9), vec3(0.2, 0.0, 0.9), 3.7, vec4(0.7, 1.3, 1.6, 0.6), true, 7.0, 0.6, 0.02).y;
	if (i == 25) return anm_legs(vec3(-0.3, 0.1, 0.2), vec3(-0.3, 0.1, 0.2), vec4(0.7, 1.3, 1.6, 0.6), 0.62, 0.16, 0.056).x;
	if (i == 19) return bark_sun_spec(normalize(vec3(0.3, 0.9, 0.2)), normalize(vec3(-0.2, 0.5, 0.84)), vec3(0.45, 0.72, -0.52));
	return 0.0;
}
void fragment() {
	float v = value(int(FRAGCOORD.x)) / 16.0 + 0.5;
	float hi = floor(v * 255.0) / 255.0;
	COLOR = vec4(hi, (v - hi) * 255.0, 0.0, 1.0);
}"""
	return sh


func _viewport(n: int, mat: ShaderMaterial) -> SubViewport:
	var vp := SubViewport.new()
	vp.size = Vector2i(n, 1)
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	vp.transparent_bg = false
	var cr := ColorRect.new()
	cr.size = Vector2(n, 1)
	cr.material = mat
	vp.add_child(cr)
	root.add_child(vp)
	_vps.append(vp)
	return vp


func _initialize() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/water/golden.json"))
	_atm = load("res://krator/atmos.gd").new()
	_atm.load_presets({"presets": {"waves": g["waves"]}})
	var surfaces := KWater.from_section(g["section"], _atm, ["open"])
	var rs := 777
	var cases := []
	for w in surfaces:
		cases.append([w, false])
	var tall := KWater.from_record(g["section"]["surfaces"][0], g["section"], _atm)
	tall.waves[0]["A"] *= 1.05
	cases.append([tall, true])
	for c in cases:
		var w: KWater = c[0]
		var e: Array = w.bounds
		var pts := []
		for i in N:
			rs = (rs * 1103515245 + 12345) & 0x7FFFFFFF
			var x: float = lerpf(e[0], e[2], float(rs) / 2147483647.0)
			rs = (rs * 1103515245 + 12345) & 0x7FFFFFFF
			var z: float = lerpf(e[1], e[3], float(rs) / 2147483647.0)
			pts.append(Vector2(x, z))
		var m := ShaderMaterial.new()
		m.shader = _water_shader(N)
		var u := w.uniforms(T)
		for k in u:
			m.set_shader_parameter(k, u[k])
		m.set_shader_parameter("pts", pts)
		_viewport(N, m)
		var ref: KWater = surfaces[0] if c[1] else w   # the negative draws the taller sea and compares with the true one
		_rows.append(["water", {"w": ref, "pts": pts, "negative": c[1]}])
		if w.shore != null and not c[1]:
			var sm := ShaderMaterial.new()
			sm.shader = _shore_shader(N)
			for k in u:
				sm.set_shader_parameter(k, u[k])
			sm.set_shader_parameter("pts", pts)
			_viewport(N, sm)
			_rows.append(["shore", {"w": w, "pts": pts}])
	# the other kinds (flow, fall, still) on lib/water_kinds, from the golden's own surfaces
	var all := {}
	for w in KWater.from_section(g["section"], _atm, ["flow", "fall", "still"]):
		all[w.kind] = w
	for kind in ["flow", "fall", "still"]:
		var w: KWater = all[kind]
		var km := ShaderMaterial.new()
		km.shader = _kinds_shader(kind)
		var u := w.kind_uniforms()
		for key in u:
			km.set_shader_parameter(key, u[key])
		var A := []
		var S := []
		for a in KIND_ARGS:
			if kind == "fall":
				var P := w.plunge()
				A.append(Vector4(fposmod(a[0] * 0.013, 1.0), fposmod(absf(a[1]) * 0.0017, 1.0), P[0] + a[2] * 7.0 + 3.0, P[2] + a[3] * 9.0 - 2.0))
			elif kind == "still":
				A.append(Vector4(3000.0 + fposmod(a[0], 20.0), fposmod(absf(a[1]), 20.0), 0.0, 0.0))
			else:
				A.append(Vector4(a[0], a[1], a[2], a[3]))
			S.append(a[4])
		km.set_shader_parameter("A", A)
		km.set_shader_parameter("S", S)
		_viewport(6, km)
		_rows.append(["kind", {"w": w, "A": A, "S": S}])
	var lm := ShaderMaterial.new()
	lm.shader = _lib_shader()
	_viewport(26, lm)
	_rows.append(["lib", {}])


func _process(_delta: float) -> bool:
	_frames += 1
	var atmos := root.get_node_or_null("Atmos")   # the autoload sets atm_wave_t every frame: hold its clock at T
	if atmos:
		atmos.paused = true
		atmos.t = T
	RenderingServer.global_shader_parameter_set("atm_wave_t", _atm.wave_wrap(T))
	RenderingServer.global_shader_parameter_set("atm_wave_amp", float(_atm.waves["amp"]))
	if _frames < 5:
		return false
	var bad := 0
	for k in _vps.size():
		var img: Image = (_vps[k] as SubViewport).get_texture().get_image()
		var row: Array = _rows[k]
		if row[0] == "water":
			var D: Dictionary = row[1]
			var w: KWater = D["w"]
			var worst := 0.0
			var dworst := 0.0
			for i in N:
				var p: Vector2 = D["pts"][i]
				var c := img.get_pixel(i, 0)
				var got := (c.r + c.g / 255.0 - 0.5) * 2.0 * R + w.level_at(T)
				var e := absf(got - w.height_at(p.x, p.y, T, 3))
				if e > worst:
					worst = e
					D["at"] = [p.x, p.y, w.depth_at(p.x, p.y, T)]
				dworst = maxf(dworst, absf(2.0 * c.b - w.damp(p.x, p.y, T)))
			var tol := H_TOL_SHORE if w.shore != null else H_TOL
			var fine := worst < tol and dworst < 5.0 / 255.0
			if OS.get_environment("KRATOR_DEBUG") != "":
				print("  worst at ", D.get("at"))
			if D["negative"]:
				print(("ok   " if not fine else "FAIL ") + "negative: the sea drawn with its first wave 5%% taller misses its CPU heights by up to %.4f m" % worst)
				if fine:
					bad += 1
			else:
				print(("ok   " if fine else "FAIL ") + "%s (%s): wtr_height at %d points on the GPU against KWater within %.4f m (worst %.5f m), wtr_damp within %.4f" % [w.id, w.name, N, tol, worst, dworst])
				if not fine:
					bad += 1
		elif row[0] == "shore":
			var D: Dictionary = row[1]
			var w: KWater = D["w"]
			var dw := 0.0
			var sw := 0.0
			for i in N:
				var p: Vector2 = D["pts"][i]
				var c := img.get_pixel(i, 0)
				var dep := (c.r + c.g / 255.0) * 64.0 - 20.0
				var want_d := clampf(w.depth_at(p.x, p.y, T), -20.0, 44.0)
				dw = maxf(dw, absf(dep - want_d))
				var sd := (c.b - 0.5) * 2.0 * float(w.shore["band"])
				sw = maxf(sw, absf(sd - clampf(w.shore_dist(p.x, p.y), -float(w.shore["band"]), float(w.shore["band"]))))
				if OS.get_environment("KRATOR_DEBUG") != "":
					print("  ", p, " depth gpu ", dep, " cpu ", want_d, " dist gpu ", sd, " cpu ", w.shore_dist(p.x, p.y))
			var good := dw < 0.05 and sw < 2.0 * float(w.shore["band"]) / 255.0 + 0.05
			print(("ok   " if good else "FAIL ") + "%s (%s): the shore grid on the GPU: the bed's depth within %.3f m, the shore distance within %.3f m (one byte: %.2f m)" % [w.id, w.name, dw, sw, 2.0 * float(w.shore["band"]) / 255.0])
			if not good:
				bad += 1
		elif row[0] == "kind":
			var D: Dictionary = row[1]
			var w: KWater = D["w"]
			var worst := 0.0
			for i in 6:
				var a: Vector4 = D["A"][i / 2]
				var want := 0.0
				if w.kind == "flow":
					var n := w.flow_normal(a.x, a.y, a.z, a.w, D["S"][i / 2], T)
					want = n[0] if i % 2 == 0 else n[2]
				elif w.kind == "fall":
					want = w.fall_streak(a.x, a.y, T) if i % 2 == 0 else w.plunge_at(a.z, a.w, T)[0]
				else:
					var n := w.still_normal(a.x, a.y, T)
					want = n[0] if i % 2 == 0 else n[2]
				var c := img.get_pixel(i, 0)
				worst = maxf(worst, absf((c.r + c.g / 255.0 - 0.5) * 2.0 - want))
			var good := worst < 0.01
			print(("ok   " if good else "FAIL ") + "%s (%s): lib/water_kinds on the GPU against KWater at 6 values (worst %.5f, tolerance 0.01)" % [w.id, w.kind, worst])
			if not good:
				bad += 1
		else:
			var want := _lib_values()
			var worst := 0.0
			var which := -1
			for i in want.size():
				var c := img.get_pixel(i, 0)
				var got := (c.r + c.g / 255.0 - 0.5) * 16.0
				# 3 and 4 are three's sin hash (breakup): fp32 and doubles disagree on sin of a few hundred, so the hash is
				# only checked for its range there; 8 hashes a small argument (cloth-sway's phase): close, not exact
				if i == 3 or i == 4:
					var inr: bool = got >= -0.01 and got <= 1.01 if i == 3 else got >= 0.84 and got <= 1.16
					if not inr:
						print("  include value %d: gpu %.5f out of its range" % [i, got])
						bad += 1
					continue
				var tol: float = 0.02 if i == 8 else F_TOL
				if absf(got - want[i]) > tol:
					print("  include value %d: gpu %.5f, cpu %.5f" % [i, got, want[i]])
					bad += 1
				if absf(got - want[i]) > worst:
					worst = absf(got - want[i])
					which = i
			print(("ok   " if worst < 0.02 else "FAIL ") + "the other nine includes compile together and %d values match their GDScript twins (worst %.5f, value %d)" % [want.size(), worst, which])
	_atm.free()
	print(("PASS" if bad == 0 else "FAIL") + "  the shader library on the GPU")
	quit(0 if bad == 0 else 1)
	return true


# ---- the GDScript twins of the includes' functions, at the shader's arguments
static func _ss(a: float, b: float, x: float) -> float:
	var t := clampf((x - a) / (b - a), 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)


static func _km_h(p: Vector3) -> float:
	var v := sin(p.dot(Vector3(127.1, 311.7, 74.7))) * 43758.5453
	return v - floor(v)


static func _km_n(p: Vector3) -> float:
	var i := p.floor()
	var f := p - i
	f = f * f * (Vector3(3, 3, 3) - 2.0 * f)
	var a := lerpf(lerpf(_km_h(i), _km_h(i + Vector3(1, 0, 0)), f.x), lerpf(_km_h(i + Vector3(0, 1, 0)), _km_h(i + Vector3(1, 1, 0)), f.x), f.y)
	var b := lerpf(lerpf(_km_h(i + Vector3(0, 0, 1)), _km_h(i + Vector3(1, 0, 1)), f.x), lerpf(_km_h(i + Vector3(0, 1, 1)), _km_h(i + Vector3(1, 1, 1)), f.x), f.y)
	return lerpf(a, b, f.z)


static func _crs_mix(x: int) -> int:
	var M = load("res://krator/atmos.gd")
	x ^= x >> 16
	x = M._mul32(x, 0x7feb352d)
	x ^= x >> 15
	x = M._mul32(x, 0x846ca68b)
	return x ^ (x >> 16)


static func _crs_h(a: int, b: int, seed: int) -> float:
	var M = load("res://krator/atmos.gd")
	var h := _crs_mix((M._mul32((a + 1048576) & 0xFFFFFFFF, 0x9e3779b1) ^ _crs_mix(((b + 1048576) + seed) & 0xFFFFFFFF)) & 0xFFFFFFFF)
	return float(h >> 8) / 16777216.0


static func _crs_joint(x: float, p: float, j: float, w: float) -> float:
	var y0 := x - 0.5 * w + 0.5 * j
	var a := y0 - floorf(y0 / p) * p
	if w < 1e-6:
		return 1.0 if a < j else 0.0
	var b := a + w
	var ib := floorf(b / p) * j + minf(b - floorf(b / p) * p, j)
	return clampf((ib - minf(a, j)) / w, 0.0, 1.0)


static func _coursing(uv: Vector2, fw: Vector2, ch: float, bw: float, slide: float, joint: float, tone: float, seed: int) -> Vector4:
	var c := int(floor(uv.y / ch))
	var off: float
	if slide < 0.0:
		off = (1.0 if c % 2 != 0 else 0.0) * -slide * bw
	else:
		off = _crs_h(c, 0, seed ^ 0x51) * slide * bw
	var u := uv.x + off
	var b := int(floor(u / bw))
	var jm := 1.0 - (1.0 - _crs_joint(uv.y, ch, joint, fw.y)) * (1.0 - _crs_joint(u, bw, joint, fw.x))
	return Vector4(jm, 1.0 + tone * (_crs_h(c, b, seed) * 2.0 - 1.0), c, b)


static func _fol_sway_x(local: Vector3, origin: Vector3, sc: float, wg: float, t: float, wind: Vector2, a: float) -> float:
	var ph := origin.dot(Vector3(0.131, 0.073, 0.117))
	var on := 1.0 if wind.length() >= 1e-4 else 0.0
	var wk := lerpf(1.0, maxf(0.3, wind.length()), on)
	var lean := on * wind.x * (0.9 + 0.6 * sin(t * 0.45 + ph * 2.1))
	return wg * sc * ((sin(t * 0.9 + ph) + 0.45 * sin(t * 2.3 + ph * 1.7 + local.x * 5.0)) * wk + lean) * a


static func _fol_irid(n: Vector3, v: Vector3, sun: Vector3, wp: Vector3, t: float) -> float:
	var fr := 1.0 - absf(n.dot(v))
	var sf := n.dot(sun.normalized()) * 0.5 + 0.5
	var sh := 0.16 * sin(t * 0.8 + wp.dot(Vector3(0.045, 0.083, 0.037))) + 0.08 * sin(t * 1.9 + wp.dot(Vector3(-0.21, 0.13, 0.17)))
	return _ss(0.22, 0.78, sf * 1.15 - fr * 0.80 + 0.30 + sh)


static func _flag_flutter(p: Vector3, d: float, root: Vector3, t: float) -> Vector3:
	if d > 0.0:
		var w := sin(t * 5.3 - d * 1.9 + root.x * 0.37 + root.z * 0.23)
		p.z += d * (0.05 + 0.01 * d) * w
		p.y += d * 0.025 * sin(t * 3.1 - d * 1.3 + root.x * 0.2)
	return p


static func _flag_pose_x(p: Vector3, d: float, root: Vector3, lean: Vector2, w: float, a: float, t: float) -> float:
	var k := Vector3(lean.x, 1.0, lean.y).normalized()
	var q := _flag_flutter(p, d, root, t) - root
	return (root + q.rotated(k, a * w)).x


func _lib_values() -> Array:
	var n6 := Vector3(0.2, 0.9, 0.1).normalized()
	var v6 := Vector3(-0.5, 0.3, 0.8).normalized()
	var n7 := Vector3(0.6, 0.3, 0.7).normalized()
	var v7 := Vector3(0.1, 0.2, 0.97).normalized()
	var fr7 := 1.0 - absf(n7.dot(v7))
	var sh7 := 0.5 + 0.5 * sin(Vector3(1, 2, 3).dot(Vector3(0.21, 0.37, 0.29)) + 3.7 * 0.35)
	var fr11 := 1.0 - cos(1.1)
	var sun := Vector3(0.45, 0.72, -0.52)
	var fr18 := 1.0 - absf(n6.dot(v6))
	var sh18 := 0.12 * sin(3.7 * 0.5 + Vector3(1, 2, 3).dot(Vector3(0.011, 0.017, 0.013)))
	var sf18 := n6.dot(sun.normalized()) * 0.5 + 0.5
	var a1 := Vector4(0.7, 1.3, 1.6, 0.6)
	var a2 := Vector4(-0.7, 1.3, 1.6, 0.6)
	var n19 := Vector3(0.3, 0.9, 0.2).normalized()
	var v19 := Vector3(-0.2, 0.5, 0.84).normalized()
	var l19 := sun.normalized()
	var ph8 := fmod(sin(Vector2(0.125, -0.0725).dot(Vector2(12.9898, 78.233))) * 43758.5453, 1.0)
	if ph8 < 0.0:
		ph8 += 1.0
	ph8 *= 6.28318
	return [
		0.5 * 5.0 * 0.5,                                                     # 0: a y face: uv.y * isc.z * k
		0.25 * 5.0 * 0.5,                                                    # 1: an x face: uv.x * isc.z * K
		0.6 * lerpf(1.0, 0.8 * 1.12, 0.85),                                   # 2
		_km_n(Vector3(0.31, 0.72, 0.15)),                                    # 3
		1.0 + 0.15 * (_km_n(Vector3(1.3, 0.2, 2.1) / (6.0 * 2.7) + Vector3(19.1, 19.1, 19.1)) * 2.0 - 1.0),   # 4
		_fol_sway_x(Vector3(0.3, 0.6, -0.2), Vector3(1.5, 0.0, -2.0), 1.4, 0.8, 3.7, Vector2(0.8, 0.35), 0.06),   # 5
		_fol_irid(n6, v6, sun, Vector3(1, 2, 3), 3.7),                        # 6
		lerpf(1.18, 0.82, _ss(0.12, 0.82, fr7 * 0.85 + sh7 * 0.3)),          # 7
		0.3 + (sin(3.7 * 1.6 + ph8) * 0.16 + sin(3.7 * 2.7 + ph8 * 1.3) * 0.07) * 0.64,   # 8
		_flag_flutter(Vector3(0.4, 0.1, 0.0), 1.3, Vector3(2, 1, 3), 3.7).z,  # 9
		_flag_pose_x(Vector3(0.4, 0.1, 0.0), 1.3, Vector3(2, 1, 3), Vector2(0.1, -0.2), 0.7, 0.9, 3.7),   # 10
		fr11 * fr11 * fr11,                                                  # 11
		clampf(0.3 + 0.5 * 0.42, 0.0, 1.0),                                  # 12
		_coursing(Vector2(1.37, 0.81), Vector2.ZERO, 0.32, 0.9, 0.6, 0.02, 0.12, 7).x,     # 13: inside a block
		_coursing(Vector2(1.37, 0.641), Vector2.ZERO, 0.32, 0.9, 0.6, 0.02, 0.12, 7).x,    # 14: on a bed joint
		_coursing(Vector2(1.37, 0.81), Vector2.ZERO, 0.32, 0.9, 0.6, 0.02, 0.12, 7).y,     # 15: the block's tone
		_coursing(Vector2(-3.1, 2.5), Vector2.ZERO, 0.32, 0.9, -0.5, 0.02, 0.2, 3).y,      # 16: running bond, negative coordinates
		_coursing(Vector2(1.37, 0.64), Vector2(0.05, 0.05), 0.32, 0.9, 0.6, 0.02, 0.12, 7).x,   # 17: box-filtered over 5 cm
		1.0 - _ss(0.22, 0.78, sf18 * 1.15 - fr18 * 0.80 + 0.30 + sh18),       # 18
		pow(maxf(n19.dot((l19 + v19).normalized()), 0.0), 26.0) * (1.0 if n19.dot(l19) >= 0.0 else 0.0),   # 19
		(KAnim.pose(0, 3.0, a1, 3.7)["P"] as Vector3).x,                     # 20: anim, orbit
		(KAnim.pose(0, 3.0, a2, 3.7)["M"] as Basis).x.y,                     # 21
		(KAnim.pose(1, 3.0, a1, 3.7)["P"] as Vector3).y,                     # 22: flit
		(KAnim.pose(1, 3.0, a2, 3.7)["M"] as Basis).x.z,                     # 23
		KAnim.flap(Vector3(0.2, 0, 0.9), Vector3(0.2, 0, 0.9), 3.7, a1, true, 7.0, 0.6, 0.02).y,   # 24: flap while walking
		KAnim.legs(Vector3(-0.3, 0.1, 0.2), Vector3(-0.3, 0.1, 0.2), a1, 0.62, 0.16, 0.056).x,     # 25: legs
	]
