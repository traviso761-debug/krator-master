// Open-world PBR terrain shader (GRAPHICS-TERRAIN-PROPOSAL S3 + S4): replaces the 16-line Lambert placeholder with
// smooth sub-grid texel normals, multi-ring gully/canyon cavity AO, wet-shore darkening and specular sheen, biome
// ground palettes + road gravel (albedo_rock_tex from core/world 94, or synthesized by KData._bind_terrain_surface),
// sedimentary cliff bedding + fracture relief on steep rock, and distance-faded close-range clast/soil micro-detail
// (shaders/lib/kground_kinds.gdshaderinc). Coordinates derive from VERTEX + case_origin / detail_origin so floating-
// origin rebases in KratorWorldStream never swim and chunk seams match to the millimetre.
shader_type spatial;
render_mode cull_disabled;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/kground_kinds.gdshaderinc"

uniform vec3 low = vec3(0.16, 0.13, 0.08);
uniform vec3 high = vec3(0.10, 0.14, 0.06);
uniform vec3 steep = vec3(0.22, 0.20, 0.17);

uniform bool has_surface_tex = false;
uniform sampler2D albedo_rock_tex : source_color, filter_linear, repeat_disable;
uniform sampler2D normal_cav_tex : filter_linear, repeat_disable;
uniform vec3 case_origin = vec3(0.0);
uniform vec2 detail_origin = vec2(0.0);
uniform float grid_step = 32.0;
uniform float micro_strength = 1.0;

varying vec3 v_local_p;
varying vec2 v_reg_xz;
varying vec2 v_detail_xz;
varying vec3 v_obj_n;

void vertex() {
	v_local_p = VERTEX;
	v_reg_xz = VERTEX.xz + case_origin.xz;
	v_detail_xz = VERTEX.xz + detail_origin;
	v_obj_n = NORMAL;
}

void fragment() {
	float dist = length(VERTEX);
	vec3 wn;
	vec3 c;
	float rock_w;
	float cav;
	float wet;

	if (has_surface_tex) {
		vec4 nc = texture(normal_cav_tex, UV);
		vec2 nxz = nc.rg * 2.0 - 1.0;
		float ny = sqrt(max(0.015, 1.0 - dot(nxz, nxz)));
		wn = normalize(vec3(nxz.x, ny, nxz.y));
		cav = nc.b;
		wet = nc.a;
		vec4 ar = texture(albedo_rock_tex, UV);
		c = k_tex(ar.rgb);
		rock_w = ar.a;
	} else {
		wn = normalize(v_obj_n);
		float s = 1.0 - clamp(wn.y, 0.0, 1.0);
		c = mix(mix(low, high, clamp(v_local_p.y / 600.0, 0.0, 1.0)), steep, smoothstep(0.25, 0.6, s));
		rock_w = smoothstep(0.28, 0.58, s);
		cav = 1.0;
		wet = 0.0;
	}

	float near_w = (1.0 - smoothstep(35.0, 135.0, dist)) * micro_strength;
	float mid_w = 1.0 - smoothstep(160.0, 1400.0, dist);
	float far_w = 1.0 - smoothstep(1400.0, 9500.0, dist);

	// Multi-scale tonal breakup (prevents flat plastic triangles from 100 m to 9 km, matching 81-world-terrain.js)
	float n_far = kg_vn(v_reg_xz * 0.0014, 3.0);
	float n_mid = kg_vn(v_reg_xz * 0.018 + vec2(11.3, 7.1), 9.0);
	float n_fine_m = kg_vn(v_detail_xz * 0.25, 15.0);
	float detail_mod = mix(1.0, 0.88 + 0.24 * n_far, 0.55 + 0.45 * far_w);
	detail_mod *= mix(1.0, 0.86 + 0.28 * n_mid, mid_w);
	detail_mod *= mix(1.0, 0.90 + 0.20 * n_fine_m, near_w * 0.7 + mid_w * 0.3);
	c *= detail_mod;

	// Sedimentary cliff bedding + vertical jointing on steep rock faces (Oidong/High Rift scarps & Pinnacle sandstone)
	float cliff_ao = 1.0;
	float steepness = 1.0 - clamp(wn.y, 0.0, 1.0);
	float rw = rock_w * smoothstep(0.08, 0.32, steepness);
	if (rw > 0.01) {
		float warp_y = (kg_vn(v_reg_xz * 0.0016, 17.0) - 0.5) * 36.0 + (kg_vn(v_reg_xz * 0.011, 23.0) - 0.5) * 6.0;
		float yy = v_local_p.y + warp_y;
		float bed_major = kg_vn(vec2(yy * 0.075, 2.3), 31.0);
		float bed_minor = kg_vn(vec2(yy * 0.34, 8.7), 37.0);
		float bed_lam = fract(yy * 0.42);
		float ledge = smoothstep(0.84, 0.96, bed_lam) - smoothstep(0.96, 1.0, bed_lam);
		float parting = 1.0 - smoothstep(0.0, 0.09, abs(fract(yy * 0.14 + bed_minor * 0.18) - 0.5));
		float joint_u = dot(v_reg_xz, vec2(0.8, 0.6)) * 0.22 + (bed_minor - 0.5) * 1.4;
		float joint = 1.0 - smoothstep(0.0, 0.07, abs(fract(joint_u) - 0.5)) * mid_w;

		vec3 warm_bed = c * vec3(1.16, 1.09, 0.98);
		vec3 cool_bed = c * vec3(0.80, 0.81, 0.84);
		vec3 strata_c = mix(cool_bed, warm_bed, smoothstep(0.22, 0.78, bed_major * 0.7 + bed_minor * 0.3));
		strata_c *= 1.0 - 0.28 * parting * (0.4 + 0.6 * mid_w) - 0.22 * joint;
		c = mix(c, strata_c, rw * (0.55 + 0.35 * far_w));
		cliff_ao = 1.0 - rw * (0.30 * parting + 0.24 * joint) * (0.35 + 0.65 * mid_w);

		// Ledge & joint normal tilt on cliff faces
		float ny_push = (ledge * 0.38 - parting * 0.26) * rw * (0.35 + 0.65 * mid_w);
		float lat_push = (joint * 0.22) * rw * mid_w;
		wn = normalize(wn + vec3(lat_push * 0.8, ny_push, lat_push * 0.6));
	}

	// Close-range clast / soil polygon & rill micro-relief (< 135 m, frequencies strictly multiples of 0.25 for 40 km periodicity)
	float micro_ao = 1.0;
	if (near_w > 0.01) {
		vec3 cell_q;
		float fp = max(0.025, dist * 0.0045);
		vec3 poly = kg_polygon(v_detail_xz, vec4(1.25, 0.085, 0.18, 0.85), 0.055, fp, 7.0, cell_q);
		float e = 0.12;
		float h0 = kg_vn(v_detail_xz * 2.5, 53.0);
		float hx = kg_vn((v_detail_xz + vec2(e, 0.0)) * 2.5, 53.0) - h0;
		float hz = kg_vn((v_detail_xz + vec2(0.0, e)) * 2.5, 53.0) - h0;
		float clast_amp = mix(0.24, 0.48, rock_w) * (1.0 - wet * 0.45);
		vec2 g_micro = vec2(hx, hz) / e * clast_amp + (cell_q.xy - 0.5) * poly.y * 0.35;
		wn = normalize(wn + vec3(-g_micro.x, 0.0, -g_micro.y) * near_w);

		c *= 1.0 + ((cell_q.x - 0.5) * 0.14 - poly.x * 0.16 + poly.y * 0.06) * near_w;
		micro_ao = 1.0 - poly.x * 0.28 * near_w;
	}

	// Porous wet-bank / rainforest-humus darkening and roughness response
	c *= mix(1.0, 0.58, wet);
	float rough_dry = mix(0.89, 0.73, rock_w) + (n_mid - 0.5) * 0.06 * mid_w;
	ROUGHNESS = clamp(mix(rough_dry, 0.22, wet), 0.14, 0.98);
	SPECULAR = mix(0.32, 0.56, wet);
	METALLIC = 0.0;

	vec3 vn = normalize(mat3(VIEW_MATRIX) * (MODEL_NORMAL_MATRIX * wn));
	NORMAL = FRONT_FACING ? vn : -vn;
	AO = clamp(cav * cliff_ao * micro_ao, 0.08, 1.0);
	AO_LIGHT_AFFECT = 0.62;
	ALBEDO = k_albedo(c);
}
