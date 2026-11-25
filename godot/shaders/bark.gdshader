// Bark and wood buckets (material kind 'bark'; library hook 'bark': shaders/lib/bark.gdshaderinc holds the kinds' maths): vertex-coloured, textured, double-sided, Lambert. Also 'plain'
// instanced solids, where COLOR is the instance colour. Two kit kinds the export names (since 2026-10-05):
//   mode 1 'irid'  (BIO.iridBarkMat): the colour swings between two tints with the view angle, a slow shimmer
//   mode 2 'gloss' (barkMat2): the map is DATA (red: brightness over its mean; green: a mask toward a second colour),
//                  read raw, plus a sun highlight on the unmasked bark
//   mode 3 'far', pack c2-rule (rift's impostors): uv.x packs a second colour, uv.y the rule that blends to it
//   mode 4 'far', pack gloss (swlowlands' impostors): uv.x is the trunk's gloss, a sun highlight
//   mode 5 'hang' (nhighlands' bulbs and pods): swing on their threads; glow by night
shader_type spatial;
render_mode cull_disabled, diffuse_burley, specular_schlick_ggx;

#include "res://shaders/atmos.gdshaderinc"
#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/bark.gdshaderinc"
#include "res://shaders/lib/lod.gdshaderinc"

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
uniform bool srgb_vcol = false;
// the export form's wind fields in the mesh's second UV set (core/biome aWind; krator/world_import.gd _wind): u the
// vertex's stiffness (1 a trunk, 0 a twig's tip), v its branch's phase. Off, a branch stands still, as it always has
uniform bool wind_uv2 = false;
uniform float wind_a = 0.035;                // metres a twig's tip moves in a calm breeze             // true when GLTFDocument converted glTF COLOR_0 from linear to sRGB

varying vec3 v_wp;
varying vec3 v_wn;
varying float v_lod;
varying float v_local_y;

void vertex() {
	v_local_y = VERTEX.y;
	if (mode == 5) {   // 50-biome-nhighlands-species.js: the bulbs sway on their threads (local, before the instance matrix)
		VERTEX = bark_hang(VERTEX, MODEL_MATRIX[3].xyz, atm_time, hang_a);
	}
	if (wind_uv2) {
		// a branch swings as one (its phase), a twig more than a bough (its stiffness), harder in a wind and downwind.
		// Small on purpose: the leaves on it sway by their own rule (lib/foliage.gdshaderinc) and must not part from it
		float give = (1.0 - clamp(UV2.x, 0.0, 1.0));
		give *= give;
		float ph = UV2.y * 6.2831853;
		float wk = max(1.0, length(atm_wind));
		vec2 dir = length(atm_wind) > 1e-3 ? normalize(atm_wind) : vec2(0.85, 0.35);
		float s = sin(atm_time * 1.7 + ph) + 0.4 * sin(atm_time * 3.1 + ph * 2.3);
		vec3 push = vec3(dir.x, 0.0, dir.y) * (wind_a * give * wk * (0.35 * (wk - 1.0) + s * 0.7));
		VERTEX += push * mat3(MODEL_MATRIX);   // the push is in the world; a bucket's own frame is a turn and a place
	}
	v_lod = klod(MODEL_MATRIX[3].xyz, CAMERA_POSITION_WORLD, INSTANCE_ID);
	if (v_lod > 1.5) {
		VERTEX = vec3(0.0);   // past its range: every vertex at the origin, nothing rasterized (lib/lod.gdshaderinc)
	}
	v_wp = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	v_wn = normalize(mat3(MODEL_MATRIX) * NORMAL);
}

void fragment() {
	vec2 tuv = UV * uv_repeat + uv_offset;   // three's uv transform (repeat, then offset), then its flipY
	vec2 uv = vec2(tuv.x, flip_v ? 1.0 - tuv.y : tuv.y);
	vec4 tx = has_tex ? texture(albedo_tex, uv) : vec4(1.0);
	vec3 tx_lin = k_tex(tx.rgb);
	float luma = dot(tx_lin, vec3(0.2126, 0.7152, 0.0722));
	// GLSL ES 3.00: evaluate derivatives in uniform control flow BEFORE klod_drop's discard
	vec3 dpdx = dFdx(v_wp);
	vec3 dpdy = dFdy(v_wp);
	float dlx = dFdx(luma);
	float dly = dFdy(luma);
	if (klod_drop(v_lod, FRAGCOORD.xy)) {
		discard;
	}
	vec3 vcol = srgb_vcol ? k_s2l(COLOR.rgb) : COLOR.rgb;
	vec3 c = tx_lin * vcol * colour;
	vec3 to_cam = CAMERA_POSITION_WORLD - v_wp;
	float depth = length(to_cam);
	vec3 V = to_cam / max(depth, 1e-4);
	bool is_impostor = (mode == 3 || mode == 4);
	vec3 N = bark_furrow_normal(normalize(v_wn), dpdx, dpdy, dlx, dly, depth, has_tex && !is_impostor && mode != 5);
	vec3 bar = bark_ao_rough(luma, v_local_y, is_impostor || mode == 5);
	if (mode == 1) {
		c *= bark_irid(N, V, v_wp, atm_time, irid_a, irid_b);
	} else if (mode == 2) {
		vec4 d = has_tex ? texture(data_tex, uv) : vec4(gloss_mean, 0.0, 0.0, 1.0);
		float bl = d.r / gloss_mean;
		float bm = d.g;
		c = colour * mix(vcol, gloss_alt, bm) * bl * gloss_gain;
		bar.y = mix(0.46, 0.84, bm);
		EMISSION = gloss_k * bark_sun_spec(N, V, atm_sun_dir) * vec3(1.0, 0.93, 0.8) * (1.0 - bm * 0.8) * bl * atm_light;
	} else if (mode == 3 && UV.y > 0.5) {   // RIFT.farMat
		c = mix(c, bark_c2_unpack(UV.x), bark_far_k(N, V, atm_sun_dir, v_wp, atm_time, UV.y));
	} else if (mode == 4 && UV.x > 0.0) {   // SWLOW.farMat
		EMISSION = UV.x * bark_sun_spec(N, V, atm_sun_dir) * vec3(1.0, 0.93, 0.8) * atm_light;
	} else if (mode == 5) {
		EMISSION = emissive * mix(night_k.x, night_k.y, atm_night);
	}
	c *= bar.z;
	ALBEDO = k_albedo(c);
	NORMAL = normalize((VIEW_MATRIX * vec4(FRONT_FACING ? N : -N, 0.0)).xyz);
	ROUGHNESS = bar.y;
	SPECULAR = is_impostor ? 0.14 : 0.28;
	AO = bar.x;
	AO_LIGHT_AFFECT = is_impostor ? 0.0 : 0.52;
	if (alpha_test > 0.0) {
		ALPHA = tx.a;
		ALPHA_SCISSOR_THRESHOLD = alpha_test;
	}
}
