// Bark and wood buckets (material kind 'bark'): vertex-coloured, textured, double-sided, Lambert. Also 'plain'
// instanced solids, where COLOR is the instance colour. Two kit kinds the export names (since 2026-10-05):
//   mode 1 'irid'  (BIO.iridBarkMat): the colour swings between two tints with the view angle, a slow shimmer
//   mode 2 'gloss' (barkMat2): the map is DATA (red: brightness over its mean; green: a mask toward a second colour),
//                  read raw, plus a sun highlight on the unmasked bark
//   mode 3 'far', pack c2-rule (rift's impostors): uv.x packs a second colour, uv.y the rule that blends to it
//   mode 4 'far', pack gloss (swlowlands' impostors): uv.x is the trunk's gloss, a sun highlight
//   mode 5 'hang' (nhighlands' bulbs and pods): swing on their threads; glow by night
shader_type spatial;
render_mode cull_disabled, diffuse_lambert, specular_disabled;

#include "res://shaders/atmos.gdshaderinc"
#include "res://shaders/kcolour.gdshaderinc"

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
uniform vec3 emissive = vec3(0.0);
uniform vec2 night_k = vec2(0.0);           // hang: emissive intensity by day and by night
uniform float hang_a = 0.05;

varying vec3 v_wp;
varying vec3 v_wn;

void vertex() {
	if (mode == 5) {   // 50-biome-nhighlands-species.js: the bulbs sway on their threads (local, before the instance matrix)
		float ph = dot(MODEL_MATRIX[3].xyz, vec3(0.13, 0.07, 0.11));
		VERTEX.x += -VERTEX.y * hang_a * sin(atm_time * 1.1 + ph);
		VERTEX.z += -VERTEX.y * hang_a * cos(atm_time * 0.8 + ph * 1.3);
	}
	v_wp = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	v_wn = normalize(mat3(MODEL_MATRIX) * NORMAL);
}

void fragment() {
	vec2 uv = vec2(UV.x * uv_repeat.x, flip_v ? 1.0 - UV.y * uv_repeat.y : UV.y * uv_repeat.y);
	vec4 tx = has_tex ? texture(albedo_tex, uv) : vec4(1.0);
	vec3 c = k_tex(tx.rgb) * COLOR.rgb * colour;
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
	} else if (mode == 3 && UV.y > 0.5) {   // RIFT.farMat
		float p = UV.x;
		float r = floor(p * (1.0 / 65536.0)); p -= r * 65536.0;
		float g = floor(p * (1.0 / 256.0)); float b = p - g * 256.0;
		vec3 c2 = vec3(r, g, b) * (1.0 / 255.0); c2 *= c2;
		float fr = 1.0 - abs(dot(N, V));
		float sh = 0.12 * sin(atm_time * 0.5 + dot(v_wp, vec3(0.011, 0.017, 0.013)));
		float k;
		if (UV.y < 1.5) {
			float sf = dot(N, normalize(atm_sun_dir)) * 0.5 + 0.5;
			k = 1.0 - smoothstep(0.22, 0.78, sf * 1.15 - fr * 0.80 + 0.30 + sh);
		} else {
			k = smoothstep(0.12, 0.82, fr * 0.85 + 0.15 + sh);
		}
		c = mix(c, c2, k);
	} else if (mode == 4 && UV.x > 0.0) {   // SWLOW.farMat
		if (dot(N, V) < 0.0) N = -N;
		vec3 L = normalize(atm_sun_dir);
		EMISSION = UV.x * pow(max(dot(N, normalize(L + V)), 0.0), 26.0) * step(0.0, dot(N, L)) * vec3(1.0, 0.93, 0.8) * atm_light;
	} else if (mode == 5) {
		EMISSION = emissive * mix(night_k.x, night_k.y, atm_night);
	}
	ALBEDO = k_albedo(c);
	if (alpha_test > 0.0) {
		ALPHA = tx.a;
		ALPHA_SCISSOR_THRESHOLD = alpha_test;
	}
}
