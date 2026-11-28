// The eyes of a MakeHuman figure (kchar_figure.gd): make_mpfb.py greys the irises and stores their mask in the
// texture's alpha; the eye colour (linear, gain folded in) multiplies in by that mask, so the whites stay white.
// The twin of irisTint() in core/charactermodels/src/50-figure.js. The gaze (kchar_figure.gd _look, _gaze): each
// eyeball turned by `gaze` about its own centre (eye_l, eye_r: the left one on +eye_ax's side), all in the skeleton's
// space as the head has carried them (VERTEX arrives skinned); identity leaves the eyes as the head has them.
shader_type spatial;

uniform sampler2D tex : source_color, filter_linear_mipmap;
uniform vec3 tint = vec3(1.0);
uniform mat3 gaze = mat3(1.0);
uniform vec3 eye_l = vec3(0.0);
uniform vec3 eye_r = vec3(0.0);
uniform vec3 eye_ax = vec3(1.0, 0.0, 0.0);

void vertex() {
	vec3 c = dot(VERTEX - 0.5 * (eye_l + eye_r), eye_ax) > 0.0 ? eye_l : eye_r;
	VERTEX = gaze * (VERTEX - c) + c;
	NORMAL = gaze * NORMAL;
}

void fragment() {
	vec4 t = texture(tex, UV);
	ALBEDO = t.rgb * mix(vec3(1.0), tint, t.a);
	ROUGHNESS = 0.35;
}
