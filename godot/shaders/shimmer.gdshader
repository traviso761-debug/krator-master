// Desert heat shimmer & grazing-angle inferior mirage post-pass (krator/shimmer_fx.gd; port of core/atmos/fx/89-atmos-fx-shimmer.js
// plus grazing-angle inferior mirage over hot desert basins and salt flats).
//   1. Thermal boil (ATMOS.shimmer): pixels over warm ground (6..180 m, or a KTHERM raster) refract upward with
//      dual-octave sine-free value noise (kg_vn from lib/kground_kinds.gdshaderinc), guarded against foreground silhouettes.
//   2. Inferior mirage: when a view ray skims flat low-elevation desert/playa ground (< 1.25 deg grazing angle beyond 160 m),
//      total internal reflection in the superheated boundary layer bends rays upward, reflecting distant ridges and horizon sky
//      like sheets of shimmering water.
shader_type spatial;
render_mode unshaded, depth_test_disabled, depth_draw_never, cull_disabled, blend_mix, fog_disabled, shadows_disabled;

#include "res://shaders/lib/kground_kinds.gdshaderinc"

uniform sampler2D screen_tex : hint_screen_texture, filter_linear_mipmap, repeat_disable;
uniform sampler2D depth_tex : hint_depth_texture, filter_nearest, repeat_disable;
uniform bool has_heat_tex = false;
uniform sampler2D heat_tex : filter_linear, repeat_disable;
uniform vec4 heat_box = vec4(0.0, 0.0, 1.0, 1.0);   // (x0, z0, span_x, span_z)
uniform vec2 heat_dims = vec2(2.0, 2.0);            // (nx, nz)

// shimmer_params: (strength 0..1.5, amp_uv 0.0035, speed 1.2, cell_scale 34.0)
uniform vec4 shimmer_params = vec4(0.0, 0.0035, 1.2, 34.0);
// shimmer_ramp: (near_m 6.0, far_m 120.0, hot_top_y 2400.0, time_s)
uniform vec4 shimmer_ramp = vec4(6.0, 120.0, 2400.0, 0.0);
// mirage_params: (mirage_strength 0..1.5, near_m 160.0, far_m 1800.0, max_grazing_sin 0.022)
uniform vec4 mirage_params = vec4(0.0, 160.0, 1800.0, 0.022);
uniform vec3 sky_horizon_col = vec3(0.55, 0.50, 0.42);

void vertex() {
	POSITION = vec4(VERTEX.xy, 1.0, 1.0);
}

vec3 world_from_uv(vec2 uv, mat4 inv_proj, mat4 inv_view, out float dist, out bool is_sky) {
	float d = texture(depth_tex, uv).x;
	is_sky = d <= 0.000001;
#if CURRENT_RENDERER == RENDERER_COMPATIBILITY
	vec3 ndc = vec3(uv, d) * 2.0 - 1.0;
#else
	vec3 ndc = vec3(uv * 2.0 - 1.0, d);
#endif
	vec4 vp = inv_proj * vec4(ndc, 1.0);
	vec3 vpos = vp.xyz / vp.w;
	dist = length(vpos);
	return (inv_view * vec4(vpos, 1.0)).xyz;
}

float ground_heat_at(vec3 wp) {
	if (has_heat_tex) {
		vec2 g = (wp.xz - heat_box.xy) / max(heat_box.zw, vec2(1e-3));
		if (g.x < 0.0 || g.y < 0.0 || g.x > 1.0 || g.y > 1.0) {
			return 0.0;
		}
		g = (g * (heat_dims - 1.0) + 0.5) / heat_dims;
		return texture(heat_tex, g).r;
	}
	// Regional desert thermal profile: strongest in deep low-altitude basins (Bowl < 0 m, Catch floor), tapering off up rock walls
	float hot_top = shimmer_ramp.z;
	float low_boost = 1.0 + 0.35 * (1.0 - smoothstep(-1200.0, 200.0, wp.y));
	return clamp((1.0 - smoothstep(hot_top - 700.0, hot_top + 900.0, wp.y)) * low_boost, 0.0, 1.25);
}

void fragment() {
	float dist;
	bool is_sky;
	vec3 wp = world_from_uv(SCREEN_UV, INV_PROJECTION_MATRIX, INV_VIEW_MATRIX, dist, is_sky);
	if (is_sky || (shimmer_params.x <= 0.001 && mirage_params.x <= 0.001)) {
		ALBEDO = vec3(0.0);
		ALPHA = 0.0;
	} else {
		vec3 cam = INV_VIEW_MATRIX[3].xyz;
		float h_k = ground_heat_at(wp);
		float t = shimmer_ramp.w * shimmer_params.z;
		float aspect = VIEWPORT_SIZE.x / max(VIEWPORT_SIZE.y, 1.0);

		// 1. Upward thermal boil (ATMOS.shimmer)
		float k_boil = h_k * smoothstep(shimmer_ramp.x, shimmer_ramp.y, dist)
			* (1.0 - smoothstep(6000.0, 28000.0, dist)) * shimmer_params.x;

		// 2. Grazing-angle inferior mirage over distant flat desert/salt basins
		vec3 ray = (wp - cam) / max(dist, 1e-3);
		float graze = (1.0 - smoothstep(0.0015, max(mirage_params.w, 0.003), abs(ray.y)))
			* smoothstep(mirage_params.y, mirage_params.z, dist)
			* (1.0 - smoothstep(35000.0, 120000.0, dist));
		// Suppress mirage if camera is high up looking steeply down
		float low_eye = 1.0 - smoothstep(80.0, 420.0, max(0.0, cam.y - wp.y));
		float k_mir = graze * low_eye * clamp(h_k, 0.0, 1.0) * mirage_params.x;

		float total = clamp(max(k_boil, k_mir), 0.0, 1.0);
		if (total <= 0.002) {
			ALBEDO = vec3(0.0);
			ALPHA = 0.0;
		} else {
			vec2 p = vec2(SCREEN_UV.x * aspect, SCREEN_UV.y) * shimmer_params.w;
			float nx = kg_vn(p + vec2(0.0, -t * 3.0), 13.0) - 0.5;
			float ny = kg_vn(p * 1.7 + vec2(5.2, -t * 4.1), 29.0) - 0.5;
			vec2 uv_boil = clamp(SCREEN_UV + vec2(nx * 0.5, ny - 0.35) * shimmer_params.y * min(k_boil, 1.2) * 2.0, vec2(0.001), vec2(0.999));

			float d2;
			bool sky2;
			vec3 wp2 = world_from_uv(uv_boil, INV_PROJECTION_MATRIX, INV_VIEW_MATRIX, d2, sky2);
			// Guard against foreground silhouettes bleeding into far hot ground
			bool valid_boil = !sky2 && (d2 >= dist * 0.65) && ground_heat_at(wp2) > 0.02;
			vec3 col = textureLod(screen_tex, valid_boil ? uv_boil : SCREEN_UV, 0.0).rgb;

			if (k_mir > 0.005) {
				// Shimmering horizontal wavelets + inverted upward reflection of ridge/sky just above the horizon line
				float wave = kg_vn(vec2(SCREEN_UV.x * aspect * 26.0, SCREEN_UV.y * 95.0 - t * 2.6), 43.0) - 0.5;
				float lift = clamp((mirage_params.w - abs(ray.y)) * 1.65 + 0.008 + wave * 0.004, 0.003, 0.055);
				vec2 uv_mir = clamp(vec2(SCREEN_UV.x + nx * 0.0025, SCREEN_UV.y - lift), vec2(0.002), vec2(0.998));
				vec3 mir_col = textureLod(screen_tex, uv_mir, 1.0).rgb;
				// Slight silver-sky grazing sheen
				mir_col = mix(mir_col, max(mir_col, sky_horizon_col), 0.22);
				col = mix(col, mir_col, clamp(k_mir * 0.78, 0.0, 0.82));
			}

			ALBEDO = col;
			ALPHA = clamp(total * 1.25, 0.0, 1.0);
		}
	}
}
