// Height-bounded desert dust slab & karaburan haboob wall (krator/atmos_fx.gd; port of core/atmos/fx/89-atmos-fx-airload.js).
// Ray-integrates two exponential dust layers above the basin floor:
//   1. Saltation boundary haze (dust_h ~ 35 m): thin wind-lifted sand veil hugging low desert basins.
//   2. Karaburan / dust-season storm slab (storm_h ~ 850..1200 m): thick ochre dust ceiling with billowed top, so high passes
//      (Godsgate, Stalker Gate, SE outer wall) look DOWN onto a sunlit sea of dust filling the Catch and Bowl below.
// Lit with Henyey-Greenstein Mie forward sun scattering (g = 0.76).
shader_type spatial;
render_mode unshaded, depth_test_disabled, depth_draw_never, cull_disabled, blend_mix, fog_disabled, shadows_disabled;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/breakup.gdshaderinc"

uniform sampler2D depth_tex : hint_depth_texture, filter_nearest, repeat_disable;
// salt_slab: (density_0 1/m, floor_y m, scale_h m, max_alpha)
uniform vec4 salt_slab = vec4(0.0, 0.0, 45.0, 0.45);
// storm_slab: (density_0 1/m, floor_y m, scale_h m, max_alpha)
uniform vec4 storm_slab = vec4(0.0, 0.0, 850.0, 0.96);
uniform vec3 dust_colour : source_color = vec3(0.58, 0.44, 0.28);
// sun_scatter: (sun_dir.xyz, mie_strength)
uniform vec4 sun_scatter = vec4(0.51, 0.56, 0.65, 0.65);
uniform vec3 sun_colour : source_color = vec3(1.0, 0.86, 0.66);
uniform vec2 wind_offset = vec2(0.0, 0.0);
uniform float max_reach = 180000.0;

void vertex() {
	POSITION = vec4(VERTEX.xy, 1.0, 1.0);
}

float ray_slab_tau(float dens0, float floor_y, float scale_h, float cam_y, float hit_y, float dist) {
	if (dens0 <= 1e-8 || dist <= 0.01) {
		return 0.0;
	}
	float sh = max(scale_h, 1.0);
	float at_cam = exp(clamp((floor_y - cam_y) / sh, -28.0, 2.5));
	float t = clamp((hit_y - cam_y) / sh, -28.0, 28.0);
	float mean = abs(t) > 0.001 ? (1.0 - exp(-t)) / t : (1.0 - 0.5 * t);
	return max(0.0, dens0 * at_cam * mean * dist);
}

float hg_phase(float cos_th, float g) {
	float g2 = g * g;
	float denom = max(1.0 + g2 - 2.0 * g * cos_th, 1e-4);
	return (1.0 - g2) / (4.0 * 3.14159265 * pow(denom, 1.5));
}

void fragment() {
	float depth = texture(depth_tex, SCREEN_UV).x;
	bool is_sky = depth <= 0.000001;
	if (is_sky || (salt_slab.x <= 1e-8 && storm_slab.x <= 1e-8)) {
		ALBEDO = vec3(0.0);
		ALPHA = 0.0;
	} else {
#if CURRENT_RENDERER == RENDERER_COMPATIBILITY
		vec3 ndc = vec3(SCREEN_UV, depth) * 2.0 - 1.0;
#else
		vec3 ndc = vec3(SCREEN_UV * 2.0 - 1.0, depth);
#endif
		vec4 vp = INV_PROJECTION_MATRIX * vec4(ndc, 1.0);
		vec3 view_pos = vp.xyz / vp.w;
		vec3 world_pos = (INV_VIEW_MATRIX * vec4(view_pos, 1.0)).xyz;
		vec3 cam = INV_VIEW_MATRIX[3].xyz;
		float dist = min(length(view_pos), max_reach);

		// Billowed top on the storm ceiling so looking down from high mountain walls shows rolling karaburan lobes
		vec2 billow_xz = world_pos.xz * 0.00035 - wind_offset * 0.015;
		float billow = (km_n(vec3(billow_xz, 13.0)) * 0.65 + km_n(vec3(billow_xz * 2.7, 29.0)) * 0.35 - 0.5) * storm_slab.z * 0.45;

		float tau_salt = ray_slab_tau(salt_slab.x, salt_slab.y, salt_slab.z, cam.y, world_pos.y, dist);
		float tau_storm = ray_slab_tau(storm_slab.x, storm_slab.y + billow, storm_slab.z, cam.y, world_pos.y, dist);

		float a_salt = (1.0 - exp(-tau_salt)) * salt_slab.w;
		float a_storm = (1.0 - exp(-tau_storm)) * storm_slab.w;
		float alpha = clamp(a_salt + a_storm * (1.0 - a_salt), 0.0, 0.96);

		vec3 ray = normalize(world_pos - cam);
		float cos_th = dot(ray, normalize(sun_scatter.xyz));
		// Anisotropic Mie forward scattering (g = 0.76) normalized so peak forward lobe adds warm amber transmission
		float mie = clamp(hg_phase(cos_th, 0.76) * 0.28, 0.0, 1.15);
		// Upper billow tops catch extra direct sun when viewed from above the ceiling
		float top_lit = smoothstep(storm_slab.y, storm_slab.y + storm_slab.z * 2.2, cam.y)
			* (0.88 + 0.24 * km_n(vec3(billow_xz * 1.9, 41.0)));
		vec3 col = dust_colour * mix(1.0, top_lit, 0.45 * clamp(a_storm, 0.0, 1.0));
		col = mix(col, sun_colour, clamp(mie * sun_scatter.w, 0.0, 0.72));

		ALBEDO = k_albedo(col);
		ALPHA = alpha;
	}
}
