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
uniform vec2 macro_origin = vec2(0.0);    // fposmod(org.xz, 32000.0): exact across 16 km chunks, < 32 km float32
uniform vec2 detail_origin = vec2(0.0);   // fposmod(org.xz, 4000.0): exact across 64 m/16 km lattices, sub-mm float32
uniform float grid_step = 32.0;
uniform float micro_strength = 1.0;

varying vec3 v_local_p;
varying vec2 v_macro_xz;
varying vec2 v_detail_xz;
varying vec3 v_obj_n;

// Exact Pythagorean rational rotations: map any multiple of 25 m (including 4,000 m and 32,000 m wraps) to exact integers!
vec2 rot_p1(vec2 p) { return vec2(0.8 * p.x - 0.6 * p.y, 0.6 * p.x + 0.8 * p.y); }             // 36.87 deg (3-4-5)
vec2 rot_p2(vec2 p) { return vec2(0.28 * p.x - 0.96 * p.y, 0.96 * p.x + 0.28 * p.y); }          // 73.74 deg (7-24-25)

// 4-tap B-spline bicubic filter using hardware bilinear fetches: eliminates 64 m RGBA8 normal/albedo Mach bands on slopes
vec4 tex_bspline(sampler2D tex, vec2 uv) {
	vec2 res = vec2(textureSize(tex, 0));
	vec2 inv = 1.0 / max(res, vec2(1.0));
	vec2 tc = uv * res - 0.5;
	vec2 f = fract(tc);
	vec2 i = floor(tc);
	vec2 f2 = f * f;
	vec2 f3 = f2 * f;
	vec2 w0 = (1.0 - f) * (1.0 - f) * (1.0 - f) * (1.0 / 6.0);
	vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) * (1.0 / 6.0);
	vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) * (1.0 / 6.0);
	vec2 w3 = f3 * (1.0 / 6.0);
	vec2 s0 = w0 + w1;
	vec2 s1 = w2 + w3;
	vec2 uv0 = (i + 0.5 + w1 / max(s0, vec2(1e-5))) * inv;
	vec2 uv1 = (i + 2.5 + w3 / max(s1, vec2(1e-5))) * inv;
	return (texture(tex, vec2(uv0.x, uv0.y)) * s0.x + texture(tex, vec2(uv1.x, uv0.y)) * s1.x) * s0.y
		+ (texture(tex, vec2(uv0.x, uv1.y)) * s0.x + texture(tex, vec2(uv1.x, uv1.y)) * s1.x) * s1.y;
}

// Analytical-derivative Quintic value noise (zero grid-square bilinear kinks, smooth C2 normals)
vec3 kg_vnd(vec2 p, float sd) {
	vec2 i = floor(p);
	vec2 f = p - i;
	vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
	vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
	float a = kg_hash3(vec3(i, sd)).x;
	float b = kg_hash3(vec3(i + vec2(1.0, 0.0), sd)).x;
	float c = kg_hash3(vec3(i + vec2(0.0, 1.0), sd)).x;
	float d = kg_hash3(vec3(i + vec2(1.0, 1.0), sd)).x;
	float k0 = b - a;
	float k1 = c - a;
	float k2 = a - b - c + d;
	float val = a + k0 * u.x + k1 * u.y + k2 * u.x * u.y;
	vec2 grad = du * vec2(k0 + k2 * u.y, k1 + k2 * u.x);
	return vec3(val, grad);
}

void vertex() {
	v_local_p = VERTEX;
	v_macro_xz = VERTEX.xz + macro_origin;
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

	// Compute screen-space world footprint in uniform control flow for clean mip-like procedural anti-aliasing
	vec2 fw_det = fwidth(v_detail_xz);
	float px_m = max(max(fw_det.x, fw_det.y), dist * 0.0018);

	if (has_surface_tex) {
		vec4 nc = grid_step >= 16.0 ? tex_bspline(normal_cav_tex, UV) : texture(normal_cav_tex, UV);
		vec2 nxz = nc.rg * 2.0 - 1.0;
		float ny = sqrt(max(0.015, 1.0 - dot(nxz, nxz)));
		wn = normalize(vec3(nxz.x, ny, nxz.y));
		cav = nc.b;
		wet = nc.a;
		vec4 ar = grid_step >= 16.0 ? tex_bspline(albedo_rock_tex, UV) : texture(albedo_rock_tex, UV);
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

	float near_w = (1.0 - smoothstep(32.0, 130.0, dist)) * micro_strength;
	float mid_w = 1.0 - smoothstep(180.0, 1600.0, dist);
	float far_w = 1.0 - smoothstep(1600.0, 12000.0, dist);

	// Rotated multi-scale ecological & geological variation (frequencies multiples of 1/1280 on macro, 1/160 on detail)
	float n_broad = 0.62 * kg_vn(rot_p1(v_macro_xz) * 0.0015625, 3.0) + 0.38 * kg_vn(rot_p2(v_macro_xz) * 0.00390625, 5.0);
	float n_patch = 0.58 * kg_vn(rot_p2(v_macro_xz) * 0.0125 + vec2(7.3, 3.1), 9.0) + 0.42 * kg_vn(rot_p1(v_detail_xz) * 0.0375, 13.0);
	float n_tuft = 0.60 * kg_vn(rot_p1(v_detail_xz) * 0.15, 15.0) + 0.40 * kg_vn(rot_p2(v_detail_xz) * 0.35, 19.0) * (1.0 - smoothstep(0.4, 1.4, px_m));

	// Chromatic ecological shifts: sun-warmed tussock/ochre on south-west slopes, cool sage/slate on north-east faces,
	// russet heather patches on mid slopes, and lush valley sedge in concave hollows
	float steepness = 1.0 - clamp(wn.y, 0.0, 1.0);
	float sun_aspect = clamp(dot(wn.xz, vec2(-0.55, 0.83)) * 1.6, -1.0, 1.0) * smoothstep(0.03, 0.22, steepness);
	float hollow = clamp((0.92 - cav) * 2.4 + wet * 0.65, 0.0, 1.0) * (1.0 - rock_w * 0.8);
	float heather = smoothstep(0.54, 0.82, n_patch) * (1.0 - rock_w) * (1.0 - hollow * 0.7);
	vec3 aspect_tint = mix(vec3(0.91, 0.96, 1.04), vec3(1.10, 1.03, 0.90), sun_aspect * 0.5 + 0.5);
	c *= mix(vec3(1.0), aspect_tint, 0.65);
	c = mix(c, c * vec3(1.14, 0.94, 0.84), heather * 0.34);
	c = mix(c, c * vec3(0.82, 1.06, 0.78), hollow * 0.42);

	float detail_mod = mix(1.0, 0.86 + 0.28 * n_broad, 0.60 + 0.40 * far_w);
	detail_mod *= mix(1.0, 0.87 + 0.26 * n_patch, 0.35 + 0.65 * mid_w);
	detail_mod *= mix(1.0, 0.90 + 0.20 * n_tuft, near_w * 0.65 + mid_w * 0.35);
	c *= detail_mod;

	// Sedimentary cliff bedding + vertical jointing on steep rock faces (Oidong/High Rift scarps & Pinnacle sandstone)
	float cliff_ao = 1.0;
	float rw = rock_w * smoothstep(0.08, 0.32, steepness);
	if (rw > 0.01) {
		float warp_y = (kg_vn(rot_p1(v_macro_xz) * 0.0015625, 17.0) - 0.5) * 34.0 + (kg_vn(rot_p2(v_macro_xz) * 0.0125, 23.0) - 0.5) * 6.5;
		float yy = v_local_p.y + warp_y + case_origin.y;
		float bed_major = kg_vn(vec2(yy * 0.075, 2.3), 31.0);
		float bed_minor = kg_vn(vec2(yy * 0.32, 8.7), 37.0);
		float bed_lam = fract(yy * 0.40);
		float ledge = (smoothstep(0.82, 0.95, bed_lam) - smoothstep(0.95, 1.0, bed_lam)) * (1.0 - smoothstep(1.2, 4.5, px_m));
		float parting = (1.0 - smoothstep(0.0, 0.10, abs(fract(yy * 0.13 + bed_minor * 0.18) - 0.5))) * (1.0 - smoothstep(1.8, 6.0, px_m));
		float joint_u = rot_p1(v_detail_xz).x * 0.20 + (bed_minor - 0.5) * 1.3;
		float joint = (1.0 - smoothstep(0.0, 0.08, abs(fract(joint_u) - 0.5))) * mid_w * (1.0 - smoothstep(0.8, 2.8, px_m));

		vec3 warm_bed = c * vec3(1.17, 1.09, 0.97);
		vec3 cool_bed = c * vec3(0.79, 0.81, 0.86);
		vec3 strata_c = mix(cool_bed, warm_bed, smoothstep(0.22, 0.78, bed_major * 0.7 + bed_minor * 0.3));
		strata_c *= 1.0 - 0.26 * parting * (0.4 + 0.6 * mid_w) - 0.20 * joint;
		c = mix(c, strata_c, rw * (0.55 + 0.35 * far_w));
		cliff_ao = 1.0 - rw * (0.28 * parting + 0.22 * joint) * (0.35 + 0.65 * mid_w);

		float ny_push = (ledge * 0.36 - parting * 0.24) * rw * (0.35 + 0.65 * mid_w);
		float lat_push = (joint * 0.20) * rw * mid_w;
		wn = normalize(wn + vec3(lat_push * 0.8, ny_push, lat_push * 0.6));
	}

	// Close-range organic tussock/soil & scree micro-relief (< 130 m): C2 quintic rotated octaves, zero grid squares or mud-crack worms
	float micro_ao = 1.0;
	if (near_w > 0.01) {
		float w_o1 = 1.0 - smoothstep(0.35, 1.10, px_m);
		float w_o2 = 1.0 - smoothstep(0.14, 0.45, px_m);
		float w_o3 = 1.0 - smoothstep(0.05, 0.18, px_m);
		vec2 p1 = rot_p1(v_detail_xz) * 0.65;
		vec2 p2 = rot_p2(v_detail_xz) * 1.65;
		vec2 p3 = (v_detail_xz + vec2(3.7, 9.1)) * 3.75;
		vec3 d1 = kg_vnd(p1, 43.0);
		vec3 d2 = kg_vnd(p2, 53.0);
		vec3 d3 = kg_vnd(p3, 61.0);
		// Unrotate each octave's gradient back into world XZ
		vec2 g1 = vec2(0.8 * d1.y + 0.6 * d1.z, -0.6 * d1.y + 0.8 * d1.z) * (0.55 * w_o1);
		vec2 g2 = vec2(0.28 * d2.y + 0.96 * d2.z, -0.96 * d2.y + 0.28 * d2.z) * (0.32 * w_o2);
		vec2 g3 = d3.yz * (0.18 * w_o3);
		float amp = mix(0.22, 0.46, rock_w) * (1.0 - wet * 0.45);
		vec2 g_micro = (g1 + g2 + g3) * amp;
		float h_micro = (d1.x - 0.5) * 0.55 * w_o1 + (d2.x - 0.5) * 0.30 * w_o2 + (d3.x - 0.5) * 0.15 * w_o3;
		// Subtle talus stones only on rocky scree (rock_w > 0.25), never across open grass/soil
		if (rock_w > 0.25 && w_o2 > 0.05) {
			vec2 cid;
			vec2 rl;
			vec2 v_talus = kg_vor2(rot_p1(v_detail_xz) * 1.25, 0.85, 71.0, cid, rl);
			float rw_k = smoothstep(0.25, 0.65, rock_w) * w_o2;
			float edge_ao = (1.0 - smoothstep(0.0, 0.14, v_talus.y)) * rw_k;
			g_micro += rl * (0.28 * rw_k);
			h_micro -= edge_ao * 0.22;
		}
		wn = normalize(wn + vec3(-g_micro.x, 0.0, -g_micro.y) * near_w);
		c *= 1.0 + h_micro * 0.24 * near_w;
		micro_ao = clamp(1.0 + min(0.0, h_micro) * 0.45 * near_w, 0.65, 1.0);
	}

	// Porous wet-bank / rainforest-humus darkening and roughness response
	c *= mix(1.0, 0.58, wet);
	float rough_dry = mix(0.89, 0.74, rock_w) + (n_patch - 0.5) * 0.06 * mid_w;
	ROUGHNESS = clamp(mix(rough_dry, 0.22, wet), 0.14, 0.98);
	SPECULAR = mix(0.30, 0.56, wet);
	METALLIC = 0.0;

	vec3 vn = normalize(mat3(VIEW_MATRIX) * (MODEL_NORMAL_MATRIX * wn));
	NORMAL = FRONT_FACING ? vn : -vn;
	AO = clamp(cav * cliff_ao * micro_ao, 0.08, 1.0);
	AO_LIGHT_AFFECT = 0.62;
	ALBEDO = k_albedo(c);
}
