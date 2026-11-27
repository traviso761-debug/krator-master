// Back-lit blown-sand saltation streaks & helical dust-devil particles (krator/grit_fx.gd).
// Soft tapered grain/puff falloff + Henyey-Greenstein Mie forward sun scattering, clamped below HDR bloom
// threshold and faded near the lens so ground-level walking never produces sub-pixel strobing flashes.
shader_type spatial;
render_mode unshaded, cull_disabled, blend_mix, depth_draw_never, shadows_disabled;

#include "res://shaders/kcolour.gdshaderinc"

global uniform vec3 atm_sun_dir;

uniform vec4 base_tint = vec4(0.76, 0.64, 0.44, 0.11);
uniform vec3 sun_tint = vec3(0.92, 0.78, 0.54);
uniform float mie_gain = 0.48;
uniform bool is_streak = true;
uniform int billboard_kind = 1;   // 0 = none (aligned particle Y), 1 = Y-fixed, 2 = full camera billboard

varying vec4 v_pcol;
varying vec3 v_wpos;

void vertex() {
	if (billboard_kind == 2) {
		MODELVIEW_MATRIX = VIEW_MATRIX * mat4(
			vec4(normalize(INV_VIEW_MATRIX[0].xyz), 0.0),
			vec4(normalize(INV_VIEW_MATRIX[1].xyz), 0.0),
			vec4(normalize(INV_VIEW_MATRIX[2].xyz), 0.0),
			MODEL_MATRIX[3]
		);
		MODELVIEW_MATRIX = MODELVIEW_MATRIX * mat4(
			vec4(length(MODEL_MATRIX[0].xyz), 0.0, 0.0, 0.0),
			vec4(0.0, length(MODEL_MATRIX[1].xyz), 0.0, 0.0),
			vec4(0.0, 0.0, length(MODEL_MATRIX[2].xyz), 0.0),
			vec4(0.0, 0.0, 0.0, 1.0)
		);
	}
	v_wpos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	v_pcol = COLOR;
}

void fragment() {
	vec2 d = UV * 2.0 - 1.0;
	float shape_a;
	if (is_streak) {
		// Soft wide wind-wisp (avoids 1-pixel needle aliasing)
		float core = clamp(1.0 - abs(d.x), 0.0, 1.0);
		float ends = clamp(1.0 - d.y * d.y, 0.0, 1.0);
		shape_a = core * (3.0 - 2.0 * core) * core * ends * ends;
	} else {
		float r = clamp(1.0 - length(d), 0.0, 1.0);
		shape_a = r * r * (3.0 - 2.0 * r);
	}

	vec3 to_p = v_wpos - CAMERA_POSITION_WORLD;
	float cam_d = length(to_p);
	float near_fade = smoothstep(2.2, 8.5, cam_d);

	vec3 sdir = length(atm_sun_dir) > 1e-3 ? normalize(atm_sun_dir) : vec3(0.51, 0.56, 0.65);
	vec3 vdir = to_p / max(cam_d, 1e-3);
	float cos_th = dot(vdir, sdir);
	float g = 0.70;
	float hg = (1.0 - g * g) / (4.0 * 3.14159265 * pow(max(1.0 + g * g - 2.0 * g * cos_th, 1e-4), 1.5));
	float rim = clamp(hg * 0.22 * mie_gain, 0.0, 0.65) * smoothstep(-0.02, 0.25, sdir.y);

	// Convert sRGB tints to linear and clamp strictly below HDR glow threshold (0.72 max linear)
	vec3 col = k_s2l(clamp(base_tint.rgb * v_pcol.rgb, vec3(0.0), vec3(1.0)));
	col = mix(col, k_s2l(sun_tint) * 0.68, rim);
	col = min(col, vec3(0.72));
	ALBEDO = k_albedo(col);
	ALPHA = clamp(base_tint.a * v_pcol.a * shape_a * near_fade, 0.0, 0.45);
}
