// Open-world PBR terrain shader (GRAPHICS-TERRAIN-PROPOSAL Stages 3 + 4: S1 + S3 + S4 + S5):
//   - S1: 40 km 8-azimuth horizon elevation shadows & Dozier-Frew (1990) sky-visibility factor V + canyon ground bounce
//   - S3: 2x sub-grid chunk normal-and-crease textures (32 m texels on 64 m chunks) via B-spline bicubic filtering
//   - S4: Mikkelsen (2022) Real-Time Hex-Tiling over 6 PBR library Texture2DArray layers (lush grass, forest moss,
//         native alpine turf, gravel/scree, granite tor, flagstone paving) with tangent-space normal maps & roughness
//   - S5: Drifting core/atmos cloud shadows (atmCloudShade) attenuating direct directional sunlight in void light()
shader_type spatial;
render_mode cull_disabled;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/kground_kinds.gdshaderinc"
#include "res://shaders/lib/khorizon.gdshaderinc"

global uniform sampler2DArray kgd_albedo_arr : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
global uniform sampler2DArray kgd_nr_arr : filter_linear_mipmap_anisotropic, repeat_enable;
global uniform vec4 kgd_params;   // (enabled, strength, layer_count, 0)

uniform vec3 low = vec3(0.16, 0.13, 0.08);
uniform vec3 high = vec3(0.10, 0.14, 0.06);
uniform vec3 steep = vec3(0.22, 0.20, 0.17);

uniform bool has_surface_tex = false;
uniform sampler2D albedo_rock_tex : source_color, filter_linear, repeat_disable;
uniform sampler2D normal_cav_tex : filter_linear, repeat_disable;
uniform sampler2D pave_zone_tex : filter_linear, repeat_disable;
uniform bool has_pave_zone = false;
uniform vec2 ar_dims = vec2(251.0, 251.0);
uniform vec2 nc_dims = vec2(251.0, 251.0);
uniform vec3 case_origin = vec3(0.0);
uniform float case_ry = 0.0;
uniform vec2 macro_origin = vec2(0.0);    // fposmod(org.xz, 32000.0): exact across 16 km chunks, < 32 km float32
uniform vec2 detail_origin = vec2(0.0);   // fposmod(org.xz, 4000.0): exact across 64 m/16 km lattices, sub-mm float32
uniform float grid_step = 32.0;
uniform float micro_strength = 1.0;

varying vec3 v_reg_pos;
varying vec2 v_macro_xz;
varying vec2 v_detail_xz;
varying vec3 v_obj_n;

// Exact Pythagorean rational rotations: map any multiple of 25 m (including 4,000 m and 32,000 m wraps) to exact integers
vec2 rot_p1(vec2 p) { return vec2(0.8 * p.x - 0.6 * p.y, 0.6 * p.x + 0.8 * p.y); }
vec2 rot_p2(vec2 p) { return vec2(0.28 * p.x - 0.96 * p.y, 0.96 * p.x + 0.28 * p.y); }

// 4-tap B-spline bicubic filter using hardware bilinear fetches
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

// Mikkelsen (2022) Real-Time Hex-Tiling over Texture2DArray: eliminates grid repetition with 3 rotated hex taps
vec2 hex_hash2(vec2 p) {
	vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
	q += dot(q, q.yzx + 33.33);
	return fract((q.xx + q.yz) * q.zy);
}

void sample_hex_layer(int layer_id, vec2 p, vec2 dpdx, vec2 dpdy, out vec3 out_alb, out vec4 out_nr) {
	// Equilateral triangle lattice transform
	vec2 skew = vec2(p.x - 0.57735027 * p.y, 1.15470054 * p.y);
	vec2 base_i = floor(skew);
	vec2 f = fract(skew);
	float upper = step(1.0, f.x + f.y);
	vec2 v1 = base_i + vec2(upper, upper);
	vec2 v2 = base_i + vec2(1.0, 0.0);
	vec2 v3 = base_i + vec2(0.0, 1.0);

	float w1 = abs(1.0 - f.x - f.y);
	float w2 = upper > 0.5 ? (1.0 - f.y) : f.x;
	float w3 = upper > 0.5 ? (1.0 - f.x) : f.y;
	vec3 w = pow(max(vec3(w1, w2, w3), vec3(1e-4)), vec3(5.0));
	w /= (w.x + w.y + w.z);

	vec2 vs[3] = vec2[3](v1, v2, v3);
	float ws[3] = float[3](w.x, w.y, w.z);
	out_alb = vec3(0.0);
	out_nr = vec4(0.0);
	float fl = float(layer_id);

	for (int k = 0; k < 3; k++) {
		if (ws[k] < 0.008) {
			continue;
		}
		vec2 h = hex_hash2(vs[k] + vec2(fl * 13.0, fl * 7.0));
		float ang = floor(h.x * 6.0) * 1.04719755 + (h.y - 0.5) * 0.25;
		float cs = cos(ang);
		float sn = sin(ang);
		vec2 vc = vec2(vs[k].x + 0.5 * vs[k].y, 0.8660254 * vs[k].y);
		vec2 rel = p - vc;
		vec2 ruv = vec2(cs * rel.x - sn * rel.y, sn * rel.x + cs * rel.y) + h;
		vec2 gdx = vec2(cs * dpdx.x - sn * dpdx.y, sn * dpdx.x + cs * dpdx.y);
		vec2 gdy = vec2(cs * dpdy.x - sn * dpdy.y, sn * dpdy.x + cs * dpdy.y);
		out_alb += k_tex(textureGrad(kgd_albedo_arr, vec3(ruv, fl), gdx, gdy).rgb) * ws[k];
		out_nr += textureGrad(kgd_nr_arr, vec3(ruv, fl), gdx, gdy) * ws[k];
	}
}

vec3 layer_mean_lin(int lid) {
	if (lid == 0) return vec3(0.1069, 0.2524, 0.0209);
	if (lid == 1) return vec3(0.2516, 0.2474, 0.1304);
	if (lid == 2) return vec3(0.1703, 0.1623, 0.0895);
	if (lid == 3) return vec3(0.2463, 0.2167, 0.1635);
	if (lid == 4) return vec3(0.3685, 0.3052, 0.2515);
	return vec3(0.2008, 0.1673, 0.1117);
}

float layer_tile_scale(int lid) {
	if (lid == 0) return 1.0 / 1.65;
	if (lid == 1) return 1.0 / 1.55;
	if (lid == 2) return 1.0 / 1.75;
	if (lid == 3) return 1.0 / 1.45;
	if (lid == 4) return 1.0 / 2.80;
	return 1.0 / 2.40;
}

void vertex() {
	float cs_r = cos(case_ry);
	float sn_r = sin(case_ry);
	vec3 rot_v = vec3(VERTEX.x * cs_r + VERTEX.z * sn_r, VERTEX.y, -VERTEX.x * sn_r + VERTEX.z * cs_r);
	v_reg_pos = rot_v + case_origin;
	v_macro_xz = rot_v.xz + macro_origin;
	v_detail_xz = rot_v.xz + detail_origin;
	v_obj_n = NORMAL;
}

void fragment() {
	float dist = length(VERTEX);
	vec3 reg_pos = v_reg_pos;
	vec3 wn;
	vec3 c;
	float rock_w;
	float cav;
	float wet;
	float pave_w = 0.0;
	float gravel_w = 0.0;

	// Compute screen-space world derivatives in uniform control flow for clean mip-accurate hex-tiling & procedural AA
	vec2 d_det_dx = dFdx(v_detail_xz);
	vec2 d_det_dy = dFdy(v_detail_xz);
	float px_m = max(max(length(d_det_dx), length(d_det_dy)), dist * 0.0018);

	if (has_surface_tex) {
		// Exact grid-vertex [0..1] parameterization so 1x albedo_rock_tex and 2x S3 normal_cav_tex share millimeter alignment
		vec2 u01 = clamp((UV * ar_dims - 0.5) / max(ar_dims - 1.0, vec2(1.0)), vec2(0.0), vec2(1.0));
		vec2 uv_ar = (u01 * (ar_dims - 1.0) + 0.5) / ar_dims;
		vec2 uv_nc = (u01 * (nc_dims - 1.0) + 0.5) / nc_dims;

		vec4 nc = grid_step >= 16.0 ? tex_bspline(normal_cav_tex, uv_nc) : texture(normal_cav_tex, uv_nc);
		vec2 nxz = nc.rg * 2.0 - 1.0;
		float ny = sqrt(max(0.015, 1.0 - dot(nxz, nxz)));
		vec3 obj_n = normalize(vec3(nxz.x, ny, nxz.y));
		wn = normalize((MODEL_MATRIX * vec4(obj_n, 0.0)).xyz);
		cav = nc.b;
		wet = nc.a >= 0.985 ? 0.95 : nc.a;
		vec4 ar = grid_step >= 16.0 ? tex_bspline(albedo_rock_tex, uv_ar) : texture(albedo_rock_tex, uv_ar);
		c = k_tex(ar.rgb);
		rock_w = ar.a;
		if (has_pave_zone) {
			vec4 pz = texture(pave_zone_tex, uv_ar);
			pave_w = pz.r;
			gravel_w = pz.g;
		}
	} else {
		wn = normalize((MODEL_MATRIX * vec4(v_obj_n, 0.0)).xyz);
		float s = 1.0 - clamp(wn.y, 0.0, 1.0);
		c = mix(mix(low, high, clamp(reg_pos.y / 600.0, 0.0, 1.0)), steep, smoothstep(0.25, 0.6, s));
		rock_w = smoothstep(0.28, 0.58, s);
		cav = 1.0;
		wet = 0.0;
	}

	// Stage 3 (S1 + S5): Dozier-Frew sky visibility V in fragment(), horizon + cloud sun shadow in light()
	float sky_vis = khz_evaluate(reg_pos).y;

	float near_w = (1.0 - smoothstep(45.0, 235.0, dist)) * micro_strength;
	float close_w = (1.0 - smoothstep(18.0, 72.0, dist)) * micro_strength;
	float mid_w = 1.0 - smoothstep(180.0, 1600.0, dist);
	float far_w = 1.0 - smoothstep(1600.0, 12000.0, dist);

	// Rotated multi-scale ecological & geological variation
	float n_broad = 0.62 * kg_vn(rot_p1(v_macro_xz) * 0.0015625, 3.0) + 0.38 * kg_vn(rot_p2(v_macro_xz) * 0.00390625, 5.0);
	float n_patch = 0.58 * kg_vn(rot_p2(v_macro_xz) * 0.0125 + vec2(7.3, 3.1), 9.0) + 0.42 * kg_vn(rot_p1(v_detail_xz) * 0.0375, 13.0);
	float n_tuft = 0.60 * kg_vn(rot_p1(v_detail_xz) * 0.15, 15.0) + 0.40 * kg_vn(rot_p2(v_detail_xz) * 0.35, 19.0) * (1.0 - smoothstep(0.4, 1.4, px_m));

	float steepness = 1.0 - clamp(wn.y, 0.0, 1.0);
	float sun_aspect = clamp(dot(wn.xz, vec2(-0.55, 0.83)) * 1.6, -1.0, 1.0) * smoothstep(0.03, 0.22, steepness);
	float hollow = clamp((0.92 - cav) * 2.4 + wet * 0.65, 0.0, 1.0) * (1.0 - rock_w * 0.8);
	float heather = smoothstep(0.54, 0.82, n_patch) * (1.0 - rock_w) * (1.0 - hollow * 0.7) * (1.0 - pave_w);
	vec3 aspect_tint = mix(vec3(0.91, 0.96, 1.04), vec3(1.10, 1.03, 0.90), sun_aspect * 0.5 + 0.5);
	c *= mix(vec3(1.0), aspect_tint, 0.62 * (1.0 - pave_w));
	c = mix(c, c * vec3(1.14, 0.94, 0.84), heather * 0.32);
	c = mix(c, c * vec3(0.82, 1.06, 0.78), hollow * 0.40 * (1.0 - pave_w));

	float detail_mod = mix(1.0, 0.86 + 0.28 * n_broad, 0.60 + 0.40 * far_w);
	detail_mod *= mix(1.0, 0.87 + 0.26 * n_patch, 0.35 + 0.65 * mid_w);
	detail_mod *= mix(1.0, 0.91 + 0.18 * n_tuft, mid_w * 0.45);
	c *= mix(detail_mod, 1.0, pave_w * 0.75);

	// Sedimentary cliff bedding + vertical jointing on steep rock faces
	float cliff_ao = 1.0;
	float rw = rock_w * smoothstep(0.08, 0.32, steepness);
	if (rw > 0.01) {
		float warp_y = (kg_vn(rot_p1(v_macro_xz) * 0.0015625, 17.0) - 0.5) * 34.0 + (kg_vn(rot_p2(v_macro_xz) * 0.0125, 23.0) - 0.5) * 6.5;
		float yy = reg_pos.y + warp_y;
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

	// Stage 4 (S4): Real-Time Hex-Tiled PBR Texture2DArray Ground Detail (< 235 m)
	float rough_dry = mix(0.89, 0.74, rock_w) + (n_patch - 0.5) * 0.05 * mid_w;
	float micro_ao = 1.0;

	if (kgd_params.x > 0.5 && near_w > 0.01) {
		// Ecological base layer: 0=lush grass, 1=forest moss, 2=High Rift/alpine turf, 3=gravel/scree, 4=granite, 5=flagstone
		float step_east = smoothstep(-58000.0, -18000.0, reg_pos.x);
		float high_alt = smoothstep(2850.0, 3350.0, reg_pos.y);
		float turf_pref = max(step_east, high_alt);
		float moss_pref = clamp(hollow * 0.85 + wet * 0.90 + (1.0 - sun_aspect * 0.5 - 0.5) * 0.25 - 0.32, 0.0, 1.0) * (1.0 - turf_pref * 0.6);

		int lid0 = 0;
		if (turf_pref > 0.52) {
			lid0 = 2;
		} else if (moss_pref > 0.42) {
			lid0 = 1;
		}

		// Secondary geological / architectural transition layer (paving > granite > gravel/talus > moss/turf)
		int lid1 = lid0;
		float blend1 = 0.0;
		if (pave_w > 0.08) {
			lid1 = 5;
			blend1 = smoothstep(0.08, 0.55, pave_w);
		} else if (rock_w > 0.36) {
			lid1 = 4;
			blend1 = smoothstep(0.36, 0.72, rock_w);
		} else if (gravel_w > 0.12 || rock_w > 0.16) {
			lid1 = 3;
			blend1 = clamp(max(gravel_w * 1.15, smoothstep(0.16, 0.42, rock_w)), 0.0, 1.0);
		} else if (lid0 == 0 && moss_pref > 0.14) {
			lid1 = 1;
			blend1 = smoothstep(0.14, 0.48, moss_pref);
		} else if (lid0 == 0 && turf_pref > 0.18) {
			lid1 = 2;
			blend1 = smoothstep(0.18, 0.55, turf_pref);
		}

		float sc0 = layer_tile_scale(lid0);
		vec3 alb0;
		vec4 nr0;
		sample_hex_layer(lid0, v_detail_xz * sc0, d_det_dx * sc0, d_det_dy * sc0, alb0, nr0);

		vec3 s4_alb = alb0;
		vec4 s4_nr = nr0;
		vec3 s4_mean = layer_mean_lin(lid0);
		if (blend1 > 0.02 && lid1 != lid0) {
			float sc1 = layer_tile_scale(lid1);
			vec3 alb1;
			vec4 nr1;
			sample_hex_layer(lid1, v_detail_xz * sc1, d_det_dx * sc1, d_det_dy * sc1, alb1, nr1);
			// Height/luminance-modulated transition so pebbles & flagstones poke crisply through grass edges
			float h_edge = clamp((nr1.a - nr0.a) * 1.8 + blend1 * 1.35 - 0.18, 0.0, 1.0);
			float bt = mix(blend1, h_edge, 0.55);
			s4_alb = mix(alb0, alb1, bt);
			s4_nr = mix(nr0, nr1, bt);
			s4_mean = mix(s4_mean, layer_mean_lin(lid1), bt);
		}

		// Mean-preserving detail ratio keeps 100% seamless macro color match at 235 m while resolving crisp blades & clasts close-up
		vec3 det_ratio = clamp(s4_alb / max(s4_mean, vec3(0.035)), vec3(0.36), vec3(2.35));
		float lum_centered = s4_nr.a * 1.50 + 0.35;
		vec3 c_mod = c * mix(vec3(lum_centered), det_ratio, 0.58);
		// Close underfoot (< 72 m), blend 26% directly toward the library's true blade/stone chromaticity for lush foliage separation
		c_mod = mix(c_mod, mix(c_mod, s4_alb * (0.72 + 0.45 * detail_mod), 0.32), close_w * (1.0 - rock_w * 0.4));
		c = mix(c, c_mod, near_w * kgd_params.y);

		// Perturb world normal in horizontal XZ tangent frame from PBR normal map
		vec2 t_nrm = (s4_nr.rg * 2.0 - 1.0) * (1.15 * near_w * kgd_params.y);
		wn = normalize(wn + vec3(t_nrm.x, 0.0, t_nrm.y));
		rough_dry = mix(rough_dry, clamp(s4_nr.b * 1.04, 0.28, 0.98), near_w * 0.85);
		micro_ao = mix(1.0, clamp(0.68 + 0.55 * s4_nr.a, 0.66, 1.04), near_w * 0.75);
	}

	// Porous wet-bank darkening, roughness response, and Stage 3 canyon ground bounce
	c *= mix(1.0, 0.58, wet);
	float bounce_k = (1.0 - sky_vis) * clamp(atm_sun_dir.y * 2.2, 0.0, 1.0) * 0.16;
	c += c * vec3(1.18, 0.96, 0.74) * bounce_k;

	ROUGHNESS = clamp(mix(rough_dry, 0.22, wet), 0.14, 0.98);
	SPECULAR = mix(0.26, 0.56, wet);
	METALLIC = 0.0;
	ALBEDO = k_albedo(c);
	NORMAL = normalize((VIEW_MATRIX * vec4(wn, 0.0)).xyz);
	AO = clamp(cav * cliff_ao * micro_ao * sky_vis, 0.14, 1.0);
	AO_LIGHT_AFFECT = 0.38;
}

void light() {
	float att = ATTENUATION;
	vec3 sun_view = normalize((VIEW_MATRIX * vec4(atm_sun_dir, 0.0)).xyz);
	if (LIGHT_IS_DIRECTIONAL && dot(LIGHT, sun_view) > 0.70) {
		att *= khz_evaluate(v_reg_pos).x;
	}
	float ndl = max(dot(NORMAL, LIGHT), 0.0);
	float rough2 = ROUGHNESS * ROUGHNESS;
	vec3 H = normalize(LIGHT + VIEW);
	float ndh = max(dot(NORMAL, H), 0.0);
	float d_denom = ndh * ndh * (rough2 - 1.0) + 1.0;
	float D = rough2 / max(3.14159265 * d_denom * d_denom, 1e-4);
	float spec = min(D * 0.25 * SPECULAR_AMOUNT, 1.2) * ndl;

	DIFFUSE_LIGHT += (ndl / 3.14159265) * LIGHT_COLOR * att;
	SPECULAR_LIGHT += LIGHT_COLOR * spec * att;
}
