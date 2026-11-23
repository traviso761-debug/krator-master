// Stage 4 Legible 3D Grass Sward Shader (godot/shaders/grass_sward.gdshader)
// Renders GPU-instanced 3D curved grass blade clumps (Near 0..36 m, Mid 36..84 m) and optional alpha-cutout seed plumes.
//   - INSTANCE_CUSTOM.rgb: underlying terrain linear RGB sampled from albedo_rock_tex (root melts seamlessly into ground)
//   - INSTANCE_CUSTOM.a:   packed biome tint & phase (fractional part = wind phase, integer part = ecological tint mode)
//   - UV.y:                0.0 at root -> 1.0 at blade tip
//   - Shares Stage 3 S1 40 km mountain horizon shadows, Dozier & Frew sky visibility, and S5 drifting cloud shadows.
shader_type spatial;
render_mode cull_disabled;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/khorizon.gdshaderinc"

global uniform vec2 atm_wind;
global uniform float atm_gust_amp;

uniform vec3 stream_origin = vec3(0.0);
uniform float fade_start = 62.0;
uniform float fade_end = 84.0;
uniform bool is_plume_card = false;
uniform sampler2D plume_tex : source_color, filter_linear_mipmap, repeat_disable;

varying float v_h;
varying vec3 v_root_col;
varying float v_eco;
varying float v_sun_vis;
varying float v_sky_vis;
varying float v_var;

void vertex() {
	v_h = clamp(UV.y, 0.0, 1.0);
	v_root_col = INSTANCE_CUSTOM.rgb;
	float raw_a = INSTANCE_CUSTOM.a;
	v_eco = floor(raw_a * 0.25);                  // 0=valley lush, 1=moist sedge, 2=highrift tussock, 3=alpine turf
	float phase = fract(raw_a) * 6.2831853;
	v_var = fract(raw_a * 7.13);

	vec3 inst_local = MODEL_MATRIX[3].xyz;
	vec3 reg_pos = inst_local + stream_origin;

	// Smooth distance height taper near outer ring edge so grass never pops
	vec3 cam_w = INV_VIEW_MATRIX[3].xyz;
	vec3 world_base = (MODEL_MATRIX * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
	float cam_d = length(world_base - cam_w);
	float dist_scale = 1.0 - smoothstep(fade_start, fade_end, cam_d);
	VERTEX *= dist_scale;

	// Traveling wind wave + per-clump flutter, quadratic with blade height so roots stay planted
	vec2 wdir = length(atm_wind) > 1e-3 ? normalize(atm_wind) : vec2(0.85, 0.35);
	float wave_p = dot(reg_pos.xz, wdir) * 0.14 - atm_time * 2.15 + phase;
	float gust = 0.55 + 0.45 * sin(dot(reg_pos.xz, wdir) * 0.035 - atm_time * 0.85);
	float sway = (sin(wave_p) * 0.13 + 0.05 * sin(wave_p * 2.3 + v_var * 5.0)) * (0.65 + 0.7 * atm_gust_amp * gust);
	float bend = v_h * v_h * sway * dist_scale;
	VERTEX.xz += wdir * bend;
	VERTEX.y -= abs(bend) * 0.22 * v_h;

	// Blend blade normal strongly toward hemisphere up so grass sward reads cohesive with terrain lighting, with crisp tip sheen
	NORMAL = normalize(mix(vec3(0.0, 1.0, 0.0), NORMAL, 0.24 + 0.52 * v_h));

	vec3 hz = khz_evaluate(reg_pos);
	v_sun_vis = hz.x;
	v_sky_vis = hz.y;
}

void fragment() {
	vec3 c_lin;
	if (is_plume_card) {
		vec4 pt = texture(plume_tex, vec2(UV.x, 1.0 - UV.y));
		if (pt.a < 0.42) {
			discard;
		}
		vec3 pt_lin = k_tex(pt.rgb) * vec3(0.84, 0.78, 0.52);
		vec3 plume_tip = mix(pt_lin, pt_lin * vec3(1.12, 1.02, 0.84), clamp(v_eco * 0.45, 0.0, 1.0));
		c_lin = mix(v_root_col * 0.65, plume_tip, smoothstep(0.05, 0.62, v_h));
	} else {
		// Lush chlorophyll or golden steppe tip palette harmonized with underlying root terrain color (linear RGB)
		vec3 tip_lush = mix(vec3(0.15, 0.30, 0.07), vec3(0.24, 0.38, 0.10), v_var);
		vec3 tip_sedge = mix(vec3(0.11, 0.26, 0.09), vec3(0.19, 0.33, 0.11), v_var);
		vec3 tip_steppe = mix(vec3(0.32, 0.29, 0.13), vec3(0.44, 0.36, 0.16), v_var);
		vec3 tip_alpine = mix(vec3(0.21, 0.25, 0.11), vec3(0.30, 0.24, 0.13), v_var);

		vec3 bio_tip = tip_lush;
		if (v_eco > 2.5) {
			bio_tip = tip_alpine;
		} else if (v_eco > 1.5) {
			bio_tip = tip_steppe;
		} else if (v_eco > 0.5) {
			bio_tip = tip_sedge;
		}
		vec3 root_shaded = mix(v_root_col, bio_tip, 0.58) * 0.52;
		vec3 tip_col = mix(bio_tip * 1.32, v_root_col * 1.18, 0.38);
		c_lin = mix(root_shaded, tip_col, smoothstep(0.04, 0.88, v_h));
	}

	if (!FRONT_FACING) {
		NORMAL = -NORMAL;
	}
	ALBEDO = k_albedo(c_lin);
	ROUGHNESS = mix(0.88, 0.56, v_h);
	SPECULAR = 0.18 * v_h;
	AO = mix(0.68, 1.0, v_h) * v_sky_vis;
	AO_LIGHT_AFFECT = 0.32;
	BACKLIGHT = k_albedo(c_lin * (0.48 * (0.25 + 0.75 * v_h)));
}

void light() {
	float att = ATTENUATION;
	vec3 sun_view = normalize((VIEW_MATRIX * vec4(atm_sun_dir, 0.0)).xyz);
	if (LIGHT_IS_DIRECTIONAL && dot(LIGHT, sun_view) > 0.70) {
		att *= v_sun_vis;
	}
	float ndl = dot(NORMAL, LIGHT);
	float wrap_d = clamp((ndl + 0.28) / 1.28, 0.0, 1.0);
	float back = max(-ndl, 0.0) * (0.46 * (0.25 + 0.75 * v_h));
	vec3 H = normalize(LIGHT + VIEW);
	float ndh = max(dot(NORMAL, H), 0.0);
	float spec = pow(ndh, 22.0) * (0.045 * v_h * v_h) * SPECULAR_AMOUNT * max(ndl, 0.0);

	DIFFUSE_LIGHT += (wrap_d + back) * LIGHT_COLOR * att / 3.14159265;
	SPECULAR_LIGHT += LIGHT_COLOR * spec * att;
}
