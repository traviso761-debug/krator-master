// Open-world PBR terrain shader (GRAPHICS-TERRAIN-PROPOSAL Stages 3 + 4: S1 + S3 + S4 + S5):
//   - S1: 40 km 8-azimuth horizon elevation shadows & Dozier-Frew (1990) sky-visibility factor V + canyon ground bounce
//   - S3: 2x sub-grid chunk normal-and-crease textures (32 m texels on 64 m chunks) via B-spline bicubic filtering
//   - S4: Mikkelsen (2022) Real-Time Hex-Tiling over 6 PBR library Texture2DArray layers (lush grass, forest moss,
//         native alpine turf, gravel/scree, granite tor, flagstone paving) with tangent-space normal maps & roughness
//   - S5: Drifting core/atmos cloud shadows (atmCloudShade) attenuating direct directional sunlight in void light()
//   - F6: a wet world (the global atm_wet): darker, glossier ground and standing water on the level
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

// Continuous Pythagorean-rotated dual-scale granite lookup for vertical cliff walls (zero cell-boundary seams, exact mip derivatives)
void sample_cliff_granite(vec2 p, vec2 gdx, vec2 gdy, out vec3 out_alb, out vec4 out_nr) {
	vec2 p2 = rot_p1(p) * 0.41 + vec2(0.37, 0.73);
	vec2 gdx2 = rot_p1(gdx) * 0.41;
	vec2 gdy2 = rot_p1(gdy) * 0.41;
	vec3 a0 = k_tex(textureGrad(kgd_albedo_arr, vec3(p, 4.0), gdx, gdy).rgb);
	vec3 a1 = k_tex(textureGrad(kgd_albedo_arr, vec3(p2, 4.0), gdx2, gdy2).rgb);
	vec4 n0 = textureGrad(kgd_nr_arr, vec3(p, 4.0), gdx, gdy);
	vec4 n1 = textureGrad(kgd_nr_arr, vec3(p2, 4.0), gdx2, gdy2);
	float w = smoothstep(0.25, 0.75, kg_vn(p * 0.35, 47.0));
	out_alb = mix(a0, a1, w);
	out_nr = mix(n0, n1, w);
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
	float cav_broad;
	float wet;
	float pave_w = 0.0;
	float gravel_w = 0.0;

	// Compute horizontal XZ and full 3D world derivatives in uniform control flow for mip-accurate hex-tiling & vertical cliff AA
	vec2 d_det_dx = dFdx(v_detail_xz);
	vec2 d_det_dy = dFdy(v_detail_xz);
	vec3 d_reg_dx = dFdx(v_reg_pos);
	vec3 d_reg_dy = dFdy(v_reg_pos);
	float px_m = max(max(length(d_det_dx), length(d_det_dy)), dist * 0.0018);
	float px_3d = max(max(length(d_reg_dx), length(d_reg_dy)), dist * 0.0018);

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
		vec2 nc_step = 2.5 / max(nc_dims, vec2(1.0));
		float cb = 0.25 * (
			textureLod(normal_cav_tex, clamp(uv_nc + vec2(nc_step.x, 0.0), vec2(0.0), vec2(1.0)), 0.0).b +
			textureLod(normal_cav_tex, clamp(uv_nc - vec2(nc_step.x, 0.0), vec2(0.0), vec2(1.0)), 0.0).b +
			textureLod(normal_cav_tex, clamp(uv_nc + vec2(0.0, nc_step.y), vec2(0.0), vec2(1.0)), 0.0).b +
			textureLod(normal_cav_tex, clamp(uv_nc - vec2(0.0, nc_step.y), vec2(0.0), vec2(1.0)), 0.0).b
		);
		cav_broad = mix(cav, cb, 0.82);
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
		cav_broad = 1.0;
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

	// Dipping geological cliff strata + smooth conjugate rock fractures (strictly Nyquist-gated by px_3d)
	float cliff_ao = 1.0;
	float rw = rock_w * smoothstep(0.08, 0.32, steepness);
	if (rw > 0.01) {
		float warp_y = (kg_vn(rot_p1(v_macro_xz) * 0.0015625, 17.0) - 0.5) * 42.0 + (kg_vn(rot_p2(v_macro_xz) * 0.00625, 23.0) - 0.5) * 11.0;
		float yy = reg_pos.y + 0.13 * v_macro_xz.x - 0.09 * v_macro_xz.y + warp_y;
		float bed_major = kg_vn(vec2(yy * 0.032, 2.3), 31.0);
		float bed_minor = kg_vn(vec2(yy * 0.11, 8.7), 37.0);
		float w_lam = abs(fract(yy * 0.075) * 2.0 - 1.0);
		float ledge = (smoothstep(0.35, 0.72, w_lam) - smoothstep(0.72, 1.0, w_lam)) * (1.0 - smoothstep(0.45, 1.65, px_3d));
		float parting = (1.0 - smoothstep(0.0, 0.14, abs(fract(yy * 0.045 + bed_major * 0.25) - 0.5))) * (1.0 - smoothstep(0.9, 3.8, px_3d));
		float j_warp = (n_broad - 0.5) * 0.85 + (n_patch - 0.5) * 0.18;
		float j1_u = rot_p1(v_macro_xz).x * 0.036 + reg_pos.y * 0.0085 + j_warp;
		float j2_u = rot_p2(v_macro_xz).x * 0.024 - reg_pos.y * 0.0125 - j_warp * 0.7;
		float j1 = 1.0 - smoothstep(0.0, 0.085, abs(fract(j1_u) - 0.5));
		float j2 = 1.0 - smoothstep(0.0, 0.075, abs(fract(j2_u) - 0.5));
		float joint = max(j1, j2 * 0.72) * (0.45 + 0.55 * mid_w) * (1.0 - smoothstep(1.2, 7.5, px_3d));

		vec3 warm_bed = c * vec3(1.22, 1.11, 0.96);
		vec3 cool_bed = c * vec3(0.74, 0.77, 0.84);
		vec3 strata_c = mix(cool_bed, warm_bed, smoothstep(0.20, 0.80, bed_major * 0.72 + bed_minor * 0.28));
		strata_c *= 1.0 - 0.24 * parting * (0.4 + 0.6 * mid_w) - 0.24 * joint;
		c = mix(c, strata_c, rw * (0.62 + 0.32 * far_w));
		cliff_ao = 1.0 - rw * (0.24 * parting + 0.25 * joint) * (0.35 + 0.65 * mid_w);

		float ny_push = (ledge * 0.22 - parting * 0.18) * rw * (0.35 + 0.65 * mid_w);
		float lat_push = (joint * 0.22) * rw * (0.40 + 0.60 * mid_w);
		wn = normalize(wn + vec3(lat_push * 0.8, ny_push, lat_push * 0.6));
	}

	// Wall-plane (ZY / XY) unstretched granite crag facets up to 4.8 km on steep rock faces (> 45 deg)
	float cliff_wall_w = smoothstep(0.28, 0.58, steepness) * smoothstep(0.28, 0.65, rock_w) * (1.0 - pave_w);
	vec2 w_lat = pow(abs(wn.xz), vec2(4.0));
	w_lat /= max(w_lat.x + w_lat.y, 1e-4);
	float cliff_macro_w = cliff_wall_w * (1.0 - smoothstep(1200.0, 5200.0, dist));
	if (kgd_params.x > 0.5 && cliff_macro_w > 0.01) {
		const float M_SC = 1.0 / 28.0;
		float wy_m = mod(reg_pos.y, 32000.0);
		vec3 m_alb_zy, m_alb_xy;
		vec4 m_nr_zy, m_nr_xy;
		sample_cliff_granite(vec2(v_macro_xz.y, wy_m) * M_SC, d_reg_dx.zy * M_SC, d_reg_dy.zy * M_SC, m_alb_zy, m_nr_zy);
		sample_cliff_granite(vec2(v_macro_xz.x, wy_m) * M_SC, d_reg_dx.xy * M_SC, d_reg_dy.xy * M_SC, m_alb_xy, m_nr_xy);
		vec3 m_alb = m_alb_zy * w_lat.x + m_alb_xy * w_lat.y;
		vec4 m_nr = m_nr_zy * w_lat.x + m_nr_xy * w_lat.y;
		vec3 g_mean = layer_mean_lin(4);
		vec3 m_ratio = clamp(m_alb / g_mean, vec3(0.45), vec3(1.80));
		c = mix(c, c * m_ratio, cliff_macro_w * 0.72 * kgd_params.y);
		vec2 m_tn = (m_nr.rg * 2.0 - 1.0) * (1.10 * cliff_macro_w * kgd_params.y);
		wn = normalize(wn + vec3(m_tn.x * w_lat.y, m_tn.y, m_tn.x * w_lat.x));
	}

	// Stage 4 (S4): Real-Time Hex-Tiled PBR Texture2DArray Ground Detail (< 235 m), with wall-plane unstretched cliff blend
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
			float h_edge = clamp((nr1.a - nr0.a) * 1.8 + blend1 * 1.35 - 0.18, 0.0, 1.0);
			float bt = mix(blend1, h_edge, 0.55);
			s4_alb = mix(alb0, alb1, bt);
			s4_nr = mix(nr0, nr1, bt);
			s4_mean = mix(s4_mean, layer_mean_lin(lid1), bt);
		}

		// Replace top-down XZ stretch on sheer cliffs (> 45 deg) with unstretched 2.8 m wall-plane granite
		if (cliff_wall_w > 0.02) {
			const float N_SC = 1.0 / 2.80;
			float wy_n = mod(reg_pos.y, 4000.0);
			vec3 w_alb_zy, w_alb_xy;
			vec4 w_nr_zy, w_nr_xy;
			sample_cliff_granite(vec2(v_detail_xz.y, wy_n) * N_SC, d_reg_dx.zy * N_SC, d_reg_dy.zy * N_SC, w_alb_zy, w_nr_zy);
			sample_cliff_granite(vec2(v_detail_xz.x, wy_n) * N_SC, d_reg_dx.xy * N_SC, d_reg_dy.xy * N_SC, w_alb_xy, w_nr_xy);
			vec3 w_alb = w_alb_zy * w_lat.x + w_alb_xy * w_lat.y;
			vec4 w_nr = w_nr_zy * w_lat.x + w_nr_xy * w_lat.y;
			s4_alb = mix(s4_alb, w_alb, cliff_wall_w);
			s4_nr = mix(s4_nr, w_nr, cliff_wall_w);
			s4_mean = mix(s4_mean, layer_mean_lin(4), cliff_wall_w);
		}

		// Mean-preserving detail ratio keeps 100% seamless macro color match at 235 m while resolving crisp blades & clasts close-up
		vec3 det_ratio = clamp(s4_alb / max(s4_mean, vec3(0.035)), vec3(0.36), vec3(2.35));
		float lum_centered = s4_nr.a * 1.50 + 0.35;
		vec3 c_mod = c * mix(vec3(lum_centered), det_ratio, 0.58);
		c_mod = mix(c_mod, mix(c_mod, s4_alb * (0.72 + 0.45 * detail_mod), 0.32), close_w * (1.0 - rock_w * 0.4));
		c = mix(c, c_mod, near_w * kgd_params.y);

		// Perturb world normal: horizontal XZ tangent frame on ground, full 3D strike/dip frame on sheer cliffs
		vec2 t_nrm = (s4_nr.rg * 2.0 - 1.0) * (1.15 * near_w * kgd_params.y);
		vec3 n_flat = vec3(t_nrm.x, 0.0, t_nrm.y);
		vec3 n_cliff = vec3(t_nrm.x * w_lat.y, t_nrm.y, t_nrm.x * w_lat.x);
		wn = normalize(wn + mix(n_flat, n_cliff, cliff_wall_w));
		rough_dry = mix(rough_dry, clamp(s4_nr.b * 1.04, 0.28, 0.98), near_w * 0.85);
		micro_ao = mix(1.0, clamp(0.68 + 0.55 * s4_nr.a, 0.66, 1.04), near_w * 0.75);
	}

	// High-altitude (> 4,150 m) slope- & broad-couloir-gated alpine snow / neve (leaves sheer 60-85 deg crags bare!)
	float snow_w = 0.0;
	if (reg_pos.y > 4100.0 && pave_w < 0.5) {
		float snow_alt = smoothstep(4650.0, 5650.0, reg_pos.y + (n_broad - 0.5) * 340.0);
		float couloir_hold = clamp((0.76 - cav_broad) * 2.6, 0.0, 1.0) * (1.0 - smoothstep(0.84, 0.96, steepness));
		float max_snow_ny = mix(0.64, 0.36, couloir_hold);
		float snow_slope = smoothstep(max_snow_ny - 0.09, max_snow_ny + 0.14, wn.y);
		snow_w = clamp(snow_alt * snow_slope + couloir_hold * smoothstep(4150.0, 5050.0, reg_pos.y) * 0.78, 0.0, 1.0) * (1.0 - pave_w);
		vec3 snow_col = vec3(0.76, 0.80, 0.86) * (0.92 + 0.14 * n_patch);
		c = mix(c, snow_col, snow_w);
		rough_dry = mix(rough_dry, 0.42, snow_w);
	}

	// Porous wet-bank darkening, roughness response, and Stage 3 canyon ground bounce
	c *= mix(1.0, 0.58, wet * (1.0 - snow_w));
	float bounce_k = (1.0 - sky_vis) * clamp(atm_sun_dir.y * 2.2, 0.0, 1.0) * 0.16;
	c += c * vec3(1.18, 0.96, 0.74) * bounce_k;

	// F6 (GODOT-LOOK-PLAN.md section 7; krator/kair.gd sets atm_wet): a wet world. What the rain reaches goes darker and
	// glossier, earth more than rock; on level ground water stands in the hollows, more of it the wetter, and mirrors the sky.
	float rain_w = clamp(atm_wet, 0.0, 1.0) * (1.0 - snow_w);
	float puddle = 0.0;
	if (rain_w > 0.002) {
		float level = 1.0 - smoothstep(0.004, 0.02, steepness);   // full to 5 degrees, none past 11
		float pool_n = 0.6 * kg_vn(rot_p1(v_detail_xz) * 0.21, 23.0) + 0.4 * kg_vn(rot_p2(v_detail_xz) * 0.55, 29.0);
		float fill = 0.16 + 0.22 * rain_w + 0.10 * hollow;   // the share of level ground under water
		puddle = level * (1.0 - smoothstep(fill - 0.03, fill + 0.02, pool_n)) * smoothstep(0.2, 0.55, rain_w) * (1.0 - smoothstep(70.0, 160.0, dist));
		c *= mix(1.0, mix(0.64, 0.80, rock_w), rain_w);
		c = mix(c, c * 0.55, puddle);
		rough_dry = mix(rough_dry, 0.36, 0.7 * rain_w);
		wn = normalize(mix(wn, vec3(0.0, 1.0, 0.0), 0.97 * puddle));
	}

	ROUGHNESS = mix(clamp(mix(rough_dry, 0.22, wet * (1.0 - snow_w)), 0.14, 0.98), 0.04, puddle);
	SPECULAR = mix(mix(mix(0.26, 0.52, snow_w), 0.56, max(wet * (1.0 - snow_w), 0.6 * rain_w)), 0.5, puddle);
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
