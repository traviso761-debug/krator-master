# The strata include on a GPU (needs a renderer, not --headless; library_gpu_check.gd's pattern):
#   godot --path godot --script res://tests/terrain/kstrata_gpu_check.gd          exits 0 when every pixel matches
# Each case of golden-strata.json is drawn flat through shaders/lib/strata.gdshaderinc's ks_strata_raw, its uniforms filled
# by KStrata.apply (the bytes and parameters kstrata_test.gd holds to the page's), on a vertical face (the colour a wall
# shows) or, for badland, a flat ground (the wash: the bed 2.5 m higher). Every sampled pixel off a bed's edge must equal
# KStrata.surface's colour (with the bake's dark seam) within 4/255, as the page's GPU does with KSTRATA_RAW. The
# negative: the same case with its dip doubled must miss.
extends SceneTree

const N := 256
const Z := 13.7
const Y := 210.3
var _vps: Array = []
var _rows: Array = []
var _frames := 0


func _shader(flat: bool) -> Shader:
	var sh := Shader.new()
	sh.code = """shader_type canvas_item;
#include "res://shaders/lib/strata.gdshaderinc"
uniform vec4 box;
void fragment() {
	vec3 wp = %s;
	COLOR = vec4(ks_strata_raw(wp, %s), 1.0);
}""" % (["vec3(mix(box.x, box.y, UV.x), %f, mix(box.z, box.w, UV.y))" % Y, "vec3(0.0, 1.0, 0.0)"] if flat else
		["vec3(mix(box.x, box.y, UV.x), mix(box.w, box.z, UV.y), %f)" % Z, "vec3(0.0, 0.0, 1.0)"])
	return sh


func _case(rec: Dictionary, box: Array, flat: bool, label: String, neg := false) -> void:
	var s := KStrata.from_export(rec)
	var mat := ShaderMaterial.new()
	mat.shader = _shader(flat)
	s.apply(mat, 0.25)
	mat.set_shader_parameter("box", Vector4(box[0], box[1], box[2], box[3]))
	if neg:
		var d: Vector3 = mat.get_shader_parameter("ks_dip")
		mat.set_shader_parameter("ks_dip", Vector3(d.x, d.y, d.z * 2.0 + 0.01))
	var vp := SubViewport.new()
	vp.size = Vector2i(N, N)
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	vp.transparent_bg = false
	var cr := ColorRect.new()
	cr.size = Vector2(N, N)
	cr.material = mat
	vp.add_child(cr)
	root.add_child(vp)
	_vps.append(vp)
	_rows.append([s, box, flat, label, neg])


func _initialize() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/terrain/golden-strata.json"))
	var boxes := {"canyon": [-100.0, 100.0, 0.0, 300.0], "outland": [-100.0, 100.0, 0.0, 400.0], "tibasalt": [-100.0, 100.0, 7700.0, 8000.0],
		"wouterwall": [-150.0, 150.0, 150.0, 450.0], "ringfold": [-150.0, 150.0, 0.0, 400.0], "legacy": [-100.0, 100.0, 0.0, 300.0],
		"badland": [-150.0, 150.0, -150.0, 150.0], "lateral": [-300.0, 100.0, 0.0, 380.0], "multi": [-150.0, 150.0, -250.0, 400.0],
		"tepui": [-100.0, 100.0, 0.0, 380.0]}
	for c in g["cases"]:
		_case(c["strata"], boxes[c["name"]], c["name"] == "badland", c["name"])
	_case(g["cases"][1]["strata"], boxes["outland"], false, "outland, dip doubled (the negative)", true)


func _process(_delta: float) -> bool:
	_frames += 1
	if _frames < 5:
		return false
	var bad := 0
	for k in _vps.size():
		var img: Image = (_vps[k] as SubViewport).get_texture().get_image()
		var s: KStrata = _rows[k][0]
		var box: Array = _rows[k][1]
		var flat: bool = _rows[k][2]
		var neg: bool = _rows[k][4]
		var n := 0
		var miss := 0
		var worst := 0.0
		for j in range(2, N, 5):
			for i in range(2, N, 5):
				var u := (float(i) + 0.5) / float(N)
				var v := (float(j) + 0.5) / float(N)
				var x: float = box[0] + (box[1] - box[0]) * u
				var y: float
				var z: float
				if flat:
					y = Y
					z = box[2] + (box[3] - box[2]) * v
				else:
					y = box[3] + (box[2] - box[3]) * v
					z = Z
				var q := s.surface(x, y, z, 1.0 if flat else 0.0)
				if float(q["edge"]) < (0.6 if int(q["bed"]) < 0 else 0.35):
					continue
				var kn: Array = (s.lat_b.kinds if int(q.get("side", 0)) == 1 else s.kinds)
				var K: Dictionary = kn[q["kid"]]
				var kk := 1.0
				if int(q["bed"]) >= 0 and not q["altered"]:
					var ed: float = q["edge"]
					var e := 1.0 if ed > 0.25 else ed / 0.25
					kk = 1.0 - 0.1 * (1.0 - e * e * (3.0 - 2.0 * e))
					if float(K["xbed"]) >= 0.99:
						kk *= 0.94 + 0.1 * float(q["f"])
				var px := img.get_pixel(i, j)
				var d := maxf(maxf(absf(px.r8 - q["colour"][0] * 255.0 * kk), absf(px.g8 - q["colour"][1] * 255.0 * kk)), absf(px.b8 - q["colour"][2] * 255.0 * kk))
				n += 1
				worst = maxf(worst, d)
				if d > 4.0:
					miss += 1
		var pass_ := (miss > n / 20) if neg else (miss == 0 and n > 500)
		if not pass_:
			bad += 1
		print(("PASS  " if pass_ else "FAIL  ") + "%s: %d pixels, %d off by more than 4/255, worst %d" % [_rows[k][3], n, miss, int(worst)])
	print("kstrata gpu: %s (%s)" % ["all passed" if bad == 0 else "%d FAILED" % bad, RenderingServer.get_video_adapter_name()])
	quit(1 if bad else 0)
	return true
