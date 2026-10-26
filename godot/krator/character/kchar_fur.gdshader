// One fur shell over a garment's fur rows (the twin of furShells in core/charactermodels/src/50-figure.js; data/fur.json,
// kit items' fur): kchar_figure.gd _fur chains one per layer after the garment's material (next_pass). The shell stands
// kfH out along the normal from the cloth where the push put it (kchar_push.gdshaderinc), its tips combed down (kfC),
// and keeps only the texels a strand passes through: strands on a grid of kfS metres in u and v (kfR: the rows, and
// the metres a unit of u and of v spans; a whole number across u, so a tube's seam meets itself), each jittered in its
// cell, of its own length (kfL), tapering to its tip (kfW its width at the root). Roots shaded (kfSh), tips lit (kfTp),
// each strand lighter or darker (kfV). kfF: a legs item's fur lies between the boots' top and the top's hem (rest
// heights; here the unmorphed rest, CUSTOM1, where the page takes the morphed one).
shader_type spatial;
render_mode cull_disabled;

uniform sampler2D tex : source_color, hint_default_white, filter_linear_mipmap, repeat_enable;
uniform vec4 albedo : source_color = vec4(1.0);
uniform float rough = 1.0;
#include "res://krator/character/kchar_push.gdshaderinc"

uniform float kfH = 0.0;
uniform float kfC = 0.0;
uniform float kfT = 0.0;
uniform vec4 kfR[4];
uniform float kfS = 0.002;
uniform float kfW = 0.8;
uniform float kfL = 0.0;
uniform float kfSh = 1.0;
uniform float kfTp = 1.0;
uniform float kfV = 0.0;
uniform vec2 kfF = vec2(-1000.0, 1000.0);
varying float kfK;

vec3 kf_hash(vec3 p) {
	p = fract(p * vec3(0.1031, 0.1030, 0.0973));
	p += dot(p, p.yxz + 33.33);
	return fract((p.xxy + p.yxx) * p.zyx);
}

void vertex() {
	kc_push(VERTEX, NORMAL);
	vec3 n = normalize(NORMAL);
	vec3 d = vec3(0.0, -1.0, 0.0);
	d -= n * dot(d, n);
	kfK = smoothstep(kfF.x, kfF.x + 0.03, CUSTOM1.x) * (1.0 - smoothstep(kfF.y - 0.03, kfF.y, CUSTOM1.x));
	VERTEX += (n * kfH + d * kfC) * kfK;
}

void fragment() {
	vec4 r0 = vec4(0.0);
	bool inside = false;
	for (int i = 0; i < 4; i++) {
		if (!inside && UV.y >= kfR[i].x && UV.y <= kfR[i].y) {
			inside = true;
			r0 = kfR[i];
		}
	}
	if (!inside || kfK < 0.05) {
		discard;
	}
	float nu = max(1.0, floor(r0.z / kfS + 0.5));
	vec2 g = vec2(UV.x * nu, UV.y * r0.w / kfS);
	vec2 c0 = floor(g);
	vec2 fr = fract(g);
	float best = 1e9;
	float len = 1.0;
	float tone = 1.0;
	for (int j = -1; j <= 1; j++) {
		for (int i = -1; i <= 1; i++) {
			vec2 o = vec2(float(i), float(j));
			vec2 cc = c0 + o;
			cc.x = mod(cc.x, nu);
			vec3 h = kf_hash(vec3(cc, r0.x * 1024.0));
			float dd = length(o + 0.15 + 0.7 * h.xy - fr);
			if (dd < best) {
				best = dd;
				len = 1.0 - kfL * h.z;
				tone = 1.0 + kfV * (fract(h.z * 7.13) - 0.5);
			}
		}
	}
	if (kfT > len || best > 0.5 * kfW * (1.0 - kfT / len)) {
		discard;
	}
	ALBEDO = (texture(tex, UV) * albedo).rgb * mix(kfSh, kfTp, kfT) * tone;
	ROUGHNESS = rough;
}
