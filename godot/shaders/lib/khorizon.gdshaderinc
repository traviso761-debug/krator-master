// Stage 3 (S1 + S5): 40 km 8-azimuth horizon elevation shadows, Dozier & Frew (1990) sky-visibility factor V,
// and drifting core/atmos cloud shadows shared across open-world terrain, site terrain, and 3D grass sward.
#ifndef KRATOR_HORIZON_INC
#define KRATOR_HORIZON_INC

#include "res://shaders/atmos_cloudshade.gdshaderinc"

global uniform sampler2D khz_tex0 : filter_linear, repeat_disable;
global uniform sampler2D khz_tex1 : filter_linear, repeat_disable;
global uniform vec4 khz_box;       // (x0, z0, 1/(x1-x0), 1/(z1-z0))
global uniform vec4 khz_params;    // (max_tan, enabled, nx, nz)
global uniform vec3 atm_sun_dir;

float khz_pick_dir(int q, vec4 t0, vec4 t1) {
	if (q == 0) return t0.x;
	if (q == 1) return t0.y;
	if (q == 2) return t0.z;
	if (q == 3) return t0.w;
	if (q == 4) return t1.x;
	if (q == 5) return t1.y;
	if (q == 6) return t1.z;
	return t1.w;
}

// Returns vec3(direct_sun_vis, sky_vis_V, cloud_shade) at region coordinates reg_xyz.
vec3 khz_evaluate(vec3 reg_xyz) {
	vec3 wp_mod = vec3(mod(reg_xyz.x, 260000.0), reg_xyz.y, mod(reg_xyz.z, 260000.0));
	float cloud_sh = atmCloudShade(wp_mod, atm_sun_dir);
	float hz_sun = 1.0;
	float sky_v = 1.0;

	if (khz_params.y > 0.5) {
		vec2 u01 = (reg_xyz.xz - khz_box.xy) * khz_box.zw;
		if (u01.x >= 0.0 && u01.x <= 1.0 && u01.y >= 0.0 && u01.y <= 1.0) {
			vec2 dims = max(khz_params.zw, vec2(2.0));
			vec2 tuv = (u01 * (dims - 1.0) + 0.5) / dims;
			vec4 e0 = textureLod(khz_tex0, tuv, 0.0);
			vec4 e1 = textureLod(khz_tex1, tuv, 0.0);
			vec4 t0 = e0 * e0 * khz_params.x;
			vec4 t1 = e1 * e1 * khz_params.x;

			vec4 s0 = (t0 * t0) / (vec4(1.0) + t0 * t0);
			vec4 s1 = (t1 * t1) / (vec4(1.0) + t1 * t1);
			sky_v = clamp(1.0 - 0.125 * (s0.x + s0.y + s0.z + s0.w + s1.x + s1.y + s1.z + s1.w), 0.18, 1.0);

			if (atm_sun_dir.y > -0.02) {
				float az = atan(atm_sun_dir.z, atm_sun_dir.x);
				float qf = mod(az * 1.27323954, 8.0);   // 8 / (2*PI)
				int q0 = int(floor(qf)) & 7;
				int q1 = (q0 + 1) & 7;
				float tan_h = mix(khz_pick_dir(q0, t0, t1), khz_pick_dir(q1, t0, t1), fract(qf));
				float sun_tan = atm_sun_dir.y / max(length(atm_sun_dir.xz), 1e-4);
				// Constant ~1.55 deg angular penumbra across all solar elevations: d(tan)/d(theta) = 1 + tan^2
				float soft_t = 0.027 * (1.0 + min(sun_tan * sun_tan, 4.0));
				hz_sun = smoothstep(tan_h - soft_t, tan_h + soft_t, sun_tan);
			} else {
				hz_sun = 0.0;
			}
		}
	}
	return vec3(hz_sun * cloud_sh, sky_v, cloud_sh);
}

#endif
