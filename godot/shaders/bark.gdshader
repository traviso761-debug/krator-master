// Bark and wood buckets (material kind 'bark'; library hook 'bark': shaders/lib/bark.gdshaderinc holds the kinds' maths): vertex-coloured, textured, double-sided, Lambert. Also 'plain'
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
#include "res://shaders/lib/bark.gdshaderinc"

uniform sampler2D albedo_tex : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D data_tex : filter_linear_mipmap_anisotropic, repeat_enable;   // the same map, undecoded (gloss)
uniform bool has_tex = false;
uniform vec3 colour = vec3(1.0);
uniform vec2 uv_repeat = vec2(1.0);         // texture.repeat
uniform vec2 uv_offset = vec2(0.0);         // texture.offset (a card that shows one cell of a library sheet)
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
		VERTEX = bark_hang(VERTEX, MODEL_MATRIX[3].xyz, atm_time, hang_a);
	}
	v_wp = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	v_wn = normalize(mat3(MODEL_MATRIX) * NORMAL);
}

void fragment() {
	vec2 tuv = UV * uv_repeat + uv_offset;   // three's uv transform (repeat, then offset), then its flipY
	vec2 uv = vec2(tuv.x, flip_v ? 1.0 - tuv.y : tuv.y);
	vec4 tx = has_tex ? texture(albedo_tex, uv) : vec4(1.0);
	vec3 c = k_tex(tx.rgb) * COLOR.rgb * colour;
	vec3 V = normalize(CAMERA_POSITION_WORLD - v_wp);
	vec3 N = normalize(v_wn);
	if (mode == 1) {
		c *= bark_irid(N, V, v_wp, atm_time, irid_a, irid_b);
	} else if (mode == 2) {
		vec4 d = has_tex ? texture(data_tex, uv) : vec4(gloss_mean, 0.0, 0.0, 1.0);
		float bl = d.r / gloss_mean;
		float bm = d.g;
		c = colour * mix(COLOR.rgb, gloss_alt, bm) * bl * gloss_gain;
		EMISSION = gloss_k * bark_sun_spec(N, V, atm_sun_dir) * vec3(1.0, 0.93, 0.8) * (1.0 - bm * 0.8) * bl * atm_light;
	} else if (mode == 3 && UV.y > 0.5) {   // RIFT.farMat
		c = mix(c, bark_c2_unpack(UV.x), bark_far_k(N, V, atm_sun_dir, v_wp, atm_time, UV.y));
	} else if (mode == 4 && UV.x > 0.0) {   // SWLOW.farMat
		EMISSION = UV.x * bark_sun_spec(N, V, atm_sun_dir) * vec3(1.0, 0.93, 0.8) * atm_light;
	} else if (mode == 5) {
		EMISSION = emissive * mix(night_k.x, night_k.y, atm_night);
	}
	ALBEDO = k_albedo(c);
	if (alpha_test > 0.0) {
		ALPHA = tx.a;
		ALPHA_SCISSOR_THRESHOLD = alpha_test;
	}
}
