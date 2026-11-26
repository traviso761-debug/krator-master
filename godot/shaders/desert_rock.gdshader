// Desert outcrop, boulder & landform shader (catch_bowl_rocks.gd, catch_bowl_landforms.gd).
// Replaces flat vertex-coloured StandardMaterial3D (roughness 1.0, specular disabled) with:
//   1. Stratigraphic bedding, cross-bedding, Liesegang bands, conjugate vertical joints & caprock ledges
//   2. Triplanar hex-tiled slickrock & sand/scree PBR normal + grain modulation from the ground-layer set
//   3. Arid weathering stack (lib/weather.gdshaderinc: windward abrasion, ochre dust ledges, ironstone desert varnish)
//   4. Seamless sand/talus skirt blending at the mesh's base (INSTANCE_CUSTOM.rgb = ground tint, .a = ground_y)
shader_type spatial;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/breakup.gdshaderinc"
#include "res://shaders/lib/hextile.gdshaderinc"
#include "res://shaders/lib/weather.gdshaderinc"

uniform sampler2DArray gl_albedo : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2DArray gl_nr : filter_linear_mipmap_anisotropic, repeat_enable;
uniform bool has_layers = false;
uniform float rock_tile_m = 4.2;      // slickrock (layer 4)
uniform float skirt_tile_m = 2.2;     // sand / talus skirt (layer 0 or 5)
uniform int family_mode = 0;          // 0 = boulder/breccia/tor, 1 = bedded sandstone (mesa/pedestal/hoodoo), 2 = fluted karst/evaporite
uniform float skirt_height = 3.5;     // metres of wind-banked sand / talus blend up from ground_y
uniform float varnish_strength = 0.65;
uniform vec4 weather_amt = vec4(1.0, 0.85, 0.65, 0.55);

varying vec3 v_wpos;
varying vec3 v_wnorm;
varying vec4 v_ground;   // rgb: local terrain sRGB tint; a: terrain height y in metres (or -1e8 if unset)

vec3 dr_tame(vec3 d) {
	float l = dot(d, vec3(0.3333));
	return clamp(mix(vec3(l), d, 0.36), vec3(0.58), vec3(1.58));
}

void vertex() {
	v_wpos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	v_wnorm = normalize((MODEL_MATRIX * vec4(NORMAL, 0.0)).xyz);
	v_ground = INSTANCE_CUSTOM;
}

void fragment() {
	vec3 wp = v_wpos;
	vec3 wn = normalize(v_wnorm);
	float dist = length(wp - CAMERA_POSITION_WORLD);
	vec3 d_wp_dx = dFdx(wp);
	vec3 d_wp_dy = dFdy(wp);
	float px_3d = max(max(length(d_wp_dx), length(d_wp_dy)), dist * 0.0018);

	// Convert sRGB vertex color to linear so lighting & kw_weather operate in linear space, then k_albedo at output
	vec3 c = k_tex(COLOR.rgb);
	float rough = 0.86;
	float spec = 0.28;
	float ao = 1.0;

	float steep = 1.0 - clamp(abs(wn.y), 0.0, 1.0);
	float near_str = 1.0 - smoothstep(450.0, 3800.0, dist);
	float mid_str = 1.0 - smoothstep(1400.0, 9500.0, dist);

	// --- 1. STRATIGRAPHIC BEDDING, JOINTS & FLUTING (Nyquist-gated by px_3d)
	if (mid_str > 0.01) {
		float warp = (km_n(vec3(wp.xz / 240.0, 7.0)) - 0.5) * 14.0 + (km_n(vec3(wp.xz / 48.0, 11.0)) - 0.5) * 3.2;
		float yy = wp.y + 0.045 * wp.x - 0.032 * wp.z + warp;

		if (family_mode == 1) {
			// Bedded sandstone / tuff (mesas, pedestals, hoodoos): warm/cool beds, cross-bedding & recessed partings
			float bed_maj = km_n(vec3(yy * 0.085, 2.3, 19.0));
			float bed_min = km_n(vec3(yy * 0.34, 6.1, 23.0));
			float parting = (1.0 - smoothstep(0.0, 0.13, abs(fract(yy * 0.11 + bed_maj * 0.22) - 0.5)))
				* (1.0 - smoothstep(0.6, 2.8, px_3d));
			float xb = km_n(vec3((abs(wn.x) > abs(wn.z) ? wp.z : wp.x) * 0.28 + yy * 0.45, yy * 1.6, 29.0));
			vec3 warm_b = c * vec3(1.20, 1.06, 0.90);
			vec3 cool_b = c * vec3(0.78, 0.80, 0.86);
			vec3 sc = mix(cool_b, warm_b, smoothstep(0.22, 0.78, bed_maj * 0.70 + bed_min * 0.30));
			sc *= 0.94 + 0.14 * xb * near_str;
			sc *= 1.0 - 0.26 * parting * steep;
			c = mix(c, sc, mid_str * 0.80);
			ao *= 1.0 - 0.28 * parting * steep * mid_str;
			wn = normalize(wn + vec3(0.0, -parting * 0.24 * steep * near_str, 0.0));
			rough = mix(rough, 0.76 + 0.18 * parting, mid_str * 0.6);
		} else if (family_mode == 2) {
			// Karst & evaporite pillars: vertical dissolution flutes / rillenkarren
			float flute_u = (abs(wn.x) > abs(wn.z) ? wp.z : wp.x) * 0.55 + (km_n(vec3(wp.xz / 9.0, 31.0)) - 0.5) * 1.4;
			float flute = abs(fract(flute_u) * 2.0 - 1.0);
			float groove = (1.0 - smoothstep(0.0, 0.35, flute)) * steep * (1.0 - smoothstep(0.25, 1.1, px_3d));
			c *= 1.0 - 0.18 * groove * near_str;
			ao *= 1.0 - 0.24 * groove * near_str;
			vec2 lat = normalize(vec2(-wn.z, wn.x) + vec2(1e-4));
			float f_side = (fract(flute_u) < 0.5 ? 1.0 : -1.0) * groove * 0.28 * near_str;
			wn = normalize(wn + vec3(lat.x * f_side, 0.0, lat.y * f_side));
			rough = mix(rough, 0.68, mid_str * 0.5);
		} else {
			// Boulders, tors & shocked breccia: conjugate fracture seams & clast mottling
			float clast = km_n(vec3(wp / 4.5)) * 0.65 + km_n(vec3(wp / 1.4 + 7.3)) * 0.35;
			float j_u = (wp.x * 0.11 + wp.y * 0.07 - wp.z * 0.09) + (clast - 0.5) * 0.55;
			float crack = (1.0 - smoothstep(0.0, 0.07, abs(fract(j_u) - 0.5))) * (1.0 - smoothstep(0.35, 1.8, px_3d));
			c *= 0.88 + 0.26 * clast * mid_str;
			c *= 1.0 - 0.28 * crack * near_str;
			ao *= 1.0 - 0.30 * crack * near_str;
		}
	}

	// --- 2. TRIPLANAR HEX-TILED ROCK GRAIN & NORMALS (from the region's packed ground layers, zero extra VRAM)
	float tex_w = (1.0 - smoothstep(600.0, 2200.0, dist));
	if (has_layers && tex_w > 0.01) {
		// Dominant lateral wall plane (ZY vs XY) blended with top plane (XZ)
		vec3 tw = pow(abs(wn), vec3(4.0));
		tw /= max(tw.x + tw.y + tw.z, 1e-4);
		float r_fl = family_mode == 2 ? 1.0 : 4.0;   // salt/limestone crust on evaporite/karst, slickrock on sandstone/tors
		float t_sc = 1.0 / max(rock_tile_m, 0.5);

		vec2 uv_side = tw.x > tw.z ? wp.zy * t_sc : wp.xy * t_sc;
		vec2 dx_side = (tw.x > tw.z ? d_wp_dx.zy : d_wp_dx.xy) * t_sc;
		vec2 dy_side = (tw.x > tw.z ? d_wp_dy.zy : d_wp_dy.xy) * t_sc;
		vec3 a_side; vec4 nr_side;
		kh_sample(gl_albedo, gl_nr, r_fl, uv_side, dx_side, dy_side, a_side, nr_side);

		vec3 a_top; vec4 nr_top;
		float top_sc = 1.0 / max(skirt_tile_m, 0.5);
		kh_sample(gl_albedo, gl_nr, 2.0, wp.xz * top_sc, d_wp_dx.xz * top_sc, d_wp_dy.xz * top_sc, a_top, nr_top);

		vec3 m_side = textureLod(gl_albedo, vec3(0.5, 0.5, r_fl), 9.0).rgb;
		vec3 m_top = textureLod(gl_albedo, vec3(0.5, 0.5, 2.0), 9.0).rgb;
		vec3 g_side = dr_tame(a_side / max(m_side, vec3(0.02)));
		vec3 g_top = dr_tame(a_top / max(m_top, vec3(0.02)));

		float top_share = tw.y;
		vec3 grain = mix(g_side, g_top, top_share);
		vec4 nr_mix = mix(nr_side, nr_top, top_share);

		c = mix(c, c * grain, tex_w * 0.78);
		vec2 tn = (nr_mix.rg * 2.0 - 1.0) * (0.75 * tex_w);
		vec3 n_pert = mix(
			tw.x > tw.z ? vec3(0.0, tn.y, tn.x) : vec3(tn.x, tn.y, 0.0),
			vec3(tn.x, 0.0, tn.y),
			top_share
		);
		wn = normalize(wn + n_pert);
		rough = mix(rough, clamp(0.68 + 0.26 * nr_mix.b, 0.52, 0.96), tex_w * 0.70);
	}

	// --- 3. ARID WEATHERING & DESERT VARNISH SHEEN
	kw_weather(wp, wn, weather_amt, c, rough);
	if (varnish_strength > 0.01 && family_mode != 2) {
		float varn = steep * steep * smoothstep(0.45, 0.80, km_n(vec3(wp.xz / 18.0, wp.y / 32.0 + 5.0))) * varnish_strength * mid_str;
		c = mix(c, c * vec3(0.52, 0.36, 0.28), varn * 0.48);
		rough = mix(rough, 0.46, varn * 0.55);
		spec = mix(spec, 0.44, varn * 0.65);
	}

	// --- 4. WIND-BANKED SAND / TALUS SKIRT BLEND INTO LOCAL GROUND
	if (v_ground.a > -90000.0 && skirt_height > 0.05) {
		float n_rag = 0.65 + 0.75 * km_n(vec3(wp.xz / max(skirt_height * 1.8, 2.0), 37.0));
		float h_above = wp.y - v_ground.a;
		float skirt = (1.0 - smoothstep(-skirt_height * 0.15, skirt_height * n_rag, h_above))
			* (1.0 - smoothstep(0.88, 0.99, -wn.y));
		if (skirt > 0.005) {
			vec3 g_lin = k_tex(v_ground.rgb);
			c = mix(c, g_lin, skirt * 0.88);
			wn = normalize(mix(wn, vec3(0.0, 1.0, 0.0), skirt * 0.58));
			rough = mix(rough, 0.93, skirt * 0.85);
			spec = mix(spec, 0.20, skirt);
		}
	}

	ALBEDO = k_albedo(c);
	NORMAL = normalize((VIEW_MATRIX * vec4(wn, 0.0)).xyz);
	ROUGHNESS = clamp(rough, 0.08, 1.0);
	SPECULAR = spec;
	AO = clamp(ao, 0.25, 1.0);
	AO_LIGHT_AFFECT = 0.42;
}
