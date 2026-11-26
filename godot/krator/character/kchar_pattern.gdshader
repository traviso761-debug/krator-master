// A frog's head in the record's colours (kchar_figure.gd _tinted, role "pattern"; core/charactermodels/tools/amphibian.py):
// COLOR holds the pattern's fields (R spots, G a net, B marbling) and the pale share (A), UV2.x a shade; c1 the skin,
// c2 the marks, c3 the pale parts; kind picks the field (0 none, 1 spots, 2 net, 3 marble), amount how much of the skin
// the marks take. The twin of patternMat in 50-figure.js; kchar_skin.gdshader does the same from the body's texture.
shader_type spatial;
render_mode cull_back;

uniform sampler2D tex : source_color, hint_default_white, filter_linear_mipmap, repeat_enable;
uniform sampler2D ntex : hint_normal, filter_linear_mipmap, repeat_enable;
uniform float nscale = 0.0;
uniform float rough = 0.4;
uniform vec3 c1 : source_color = vec3(0.37, 0.54, 0.21);
uniform vec3 c2 : source_color = vec3(0.12, 0.16, 0.07);
uniform vec3 c3 : source_color = vec3(0.89, 0.85, 0.69);
uniform float kind = 3.0;
uniform float amount = 0.45;

float marks(vec4 pm) {
	if (kind > 0.5 && kind < 1.5) {
		return 1.0 - smoothstep(0.6 * amount, 0.6 * amount + 0.05, pm.r);
	} else if (kind > 1.5 && kind < 2.5) {
		return 1.0 - smoothstep(0.3 * amount, 0.3 * amount + 0.04, pm.g);
	} else if (kind > 2.5) {
		return smoothstep(1.0 - amount - 0.04, 1.0 - amount + 0.04, pm.b);
	}
	return 0.0;
}

// the pattern's fields reach the shader as if the vertex colour were sRGB (the jaw of a marbled frog came out nearly
// all marks, unlike the page's and the body's): decoded back to the numbers tools/amphibian.py wrote
vec3 decode(vec3 c) {
	return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
}

void fragment() {
	vec4 pm = vec4(decode(COLOR.rgb), COLOR.a);
	vec3 c = mix(mix(c1, c2, marks(pm)), c3, pm.a);
	ALBEDO = texture(tex, UV).rgb * c * UV2.x;
	NORMAL_MAP = texture(ntex, UV).rgb;
	NORMAL_MAP_DEPTH = nscale;
	ROUGHNESS = rough;
}
