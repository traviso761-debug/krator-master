// Bark and wood buckets (material kind 'bark'): vertex-coloured, textured, double-sided, Lambert. Also 'plain'
// instanced solids, where COLOR is the instance colour. Two kit kinds the export names (since 2026-10-05):
//   mode 1 'irid'  (BIO.iridBarkMat): the colour swings between two tints with the view angle, a slow shimmer
//   mode 2 'gloss' (barkMat2): the map is DATA (red: brightness over its mean; green: a mask toward a second colour),
//                  read raw, plus a sun highlight on the unmasked bark
shader_type spatial;
render_mode cull_disabled, diffuse_lambert, specular_disabled;

#include "res://shaders/atmos.gdshaderinc"

uniform sampler2D albedo_tex : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D data_tex : filter_linear_mipmap_anisotropic, repeat_enable;   // the same map, undecoded (gloss)
uniform bool has_tex = false;
uniform vec3 colour = vec3(1.0);
uniform vec2 uv_repeat = vec2(1.0);         // texture.repeat
uniform bool flip_v = true;                // the texture's flipY: a canvas (true) is uploaded flipped, a DataTexture (false) is not
uniform float alpha_test = 0.0;
uniform int mode = 0;
uniform vec3 irid_a = vec3(0.78, 1.18, 0.92);
uniform vec3 irid_b = vec3(1.45, 0.82, 0.74);
uniform vec3 gloss_alt = vec3(0.22);
uniform float gloss_mean = 0.55;
uniform float gloss_gain = 0.52;
uniform float gloss_k = 0.0;

varying vec3 v_wp;
varying vec3 v_wn;

void vertex() {
	v_wp = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	v_wn = normalize(mat3(MODEL_MATRIX) * NORMAL);
}

void fragment() {
	vec2 uv = vec2(UV.x * uv_repeat.x, flip_v ? 1.0 - UV.y * uv_repeat.y : UV.y * uv_repeat.y);
	vec4 tx = has_tex ? texture(albedo_tex, uv) : vec4(1.0);
	vec3 c = tx.rgb * COLOR.rgb * colour;
	vec3 V = normalize(CAMERA_POSITION_WORLD - v_wp);
	vec3 N = normalize(v_wn);
	if (mode == 1) {
		float fr = 1.0 - abs(dot(N, V));
		float sh = 0.5 + 0.5 * sin(dot(v_wp, vec3(0.21, 0.37, 0.29)) + atm_time * 0.35);
		c *= mix(irid_a, irid_b, smoothstep(0.12, 0.82, fr * 0.85 + sh * 0.3));
	} else if (mode == 2) {
		vec4 d = has_tex ? texture(data_tex, uv) : vec4(gloss_mean, 0.0, 0.0, 1.0);
		float bl = d.r / gloss_mean;
		float bm = d.g;
		c = colour * mix(COLOR.rgb, gloss_alt, bm) * bl * gloss_gain;
		if (dot(N, V) < 0.0) N = -N;
		vec3 L = normalize(atm_sun_dir);
		vec3 H = normalize(L + V);
		float sp = pow(max(dot(N, H), 0.0), 26.0) * step(0.0, dot(N, L));
		EMISSION = gloss_k * sp * vec3(1.0, 0.93, 0.8) * (1.0 - bm * 0.8) * bl * atm_light;
	}
	ALBEDO = c;
	if (alpha_test > 0.0) {
		ALPHA = tx.a;
		ALPHA_SCISSOR_THRESHOLD = alpha_test;
	}
}
