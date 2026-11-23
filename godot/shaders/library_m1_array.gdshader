// Stage 5 M1 Texture2DArray Material Shader (v3 3-array & v4 2-array variants, GRAPHICS-TERRAIN-PROPOSAL.md Section 6).
// Supports both 3-layer blended ground (`blend_ground = true`) and single-layer hero/swatch assets (`layer_idx`)
// using only 2 fragment samplers (`alb_arr` + `nrc_arr` when `use_nrc = true`) or 3 samplers (`v3` baseline).
shader_type spatial;
render_mode cull_disabled;

#include "res://shaders/kcolour.gdshaderinc"

uniform sampler2DArray alb_arr : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2DArray nrc_arr : filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2DArray rgh_arr : filter_linear_mipmap_anisotropic, repeat_enable;

uniform bool use_nrc = true;
uniform int normal_enc = 1;               // 0 = xy, 1 = Cigolle Hemisphere Octahedral (oct8)
uniform bool blend_ground = false;
uniform float layer_idx = 0.0;
uniform float uv_repeat = 2.0;
uniform float normal_scale = 1.0;
uniform float specular_k : hint_range(0.0, 1.0) = 0.4;
uniform float cavity_k : hint_range(0.0, 1.0) = 0.85;
uniform float pom_depth : hint_range(0.0, 0.08) = 0.0;
uniform vec4 mip_var_lo = vec4(0.0);
uniform vec4 mip_var_hi = vec4(0.0);

varying vec3 v_wp;
varying vec2 v_uv;

vec3 m1a_dec_n(vec2 rg01, int enc) {
	if (enc == 1) {
		vec2 e = rg01 * 2.0 - 1.0;
		vec2 p = vec2(e.x + e.y, e.x - e.y) * 0.5;
		return normalize(vec3(p.x, p.y, max(0.0, 1.0 - abs(p.x) - abs(p.y))));
	}
	vec2 xy = rg01 * 2.0 - 1.0;
	return normalize(vec3(xy, sqrt(max(0.0, 1.0 - dot(xy, xy)))));
}

float m1a_rough_aa(float base_r, vec2 dx_uv, vec2 dy_uv, float tex_sz) {
	float px = max(dot(dx_uv, dx_uv), dot(dy_uv, dy_uv)) * (tex_sz * tex_sz);
	float mip = clamp(0.5 * log2(max(px, 1.0)), 0.0, 7.0);
	int i0 = int(floor(mip));
	float f = mip - float(i0);
	float v0 = i0 < 4 ? mip_var_lo[i0] : mip_var_hi[i0 - 4];
	int i1 = min(i0 + 1, 7);
	float v1 = i1 < 4 ? mip_var_lo[i1] : mip_var_hi[i1 - 4];
	return sqrt(clamp(base_r * base_r + min(mix(v0, v1, f) * 1.5, 0.45), 0.0004, 1.0));
}

void vertex() {
	v_wp = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	v_uv = UV * uv_repeat;
}

void fragment() {
	vec2 uv = v_uv;
	vec2 dx_uv = dFdx(uv);
	vec2 dy_uv = dFdy(uv);
	vec3 q0 = dFdx(VERTEX), q1 = dFdy(VERTEX);
	vec3 N_geom = normalize(NORMAL);
	vec3 q1perp = cross(q1, N_geom), q0perp = cross(N_geom, q0);
	vec3 T_vs = q1perp * dx_uv.x + q0perp * dy_uv.x;
	vec3 B_vs = q1perp * dx_uv.y + q0perp * dy_uv.y;
	float det = max(dot(T_vs, T_vs), dot(B_vs, B_vs));
	float sc = det == 0.0 ? 0.0 : sign(dot(cross(q0, q1), N_geom)) * inversesqrt(det);

	vec3 alb_lin;
	vec3 n_ts;
	float rgh = 0.7;
	float cav = 1.0;

	if (blend_ground) {
		float w0 = clamp(0.5 + 0.5 * sin(v_wp.x * 0.55), 0.0, 1.0);
		float w1 = clamp(0.5 + 0.5 * cos(v_wp.z * 0.65), 0.0, 1.0) * (1.0 - w0);
		float w2 = max(0.0, 1.0 - w0 - w1);
		vec3 a0 = k_tex(textureGrad(alb_arr, vec3(uv, 0.0), dx_uv, dy_uv).rgb);
		vec3 a1 = k_tex(textureGrad(alb_arr, vec3(uv, 1.0), dx_uv, dy_uv).rgb);
		vec3 a2 = k_tex(textureGrad(alb_arr, vec3(uv, 2.0), dx_uv, dy_uv).rgb);
		alb_lin = a0 * w0 + a1 * w1 + a2 * w2;
		vec4 n0 = textureGrad(nrc_arr, vec3(uv, 0.0), dx_uv, dy_uv);
		vec4 n1 = textureGrad(nrc_arr, vec3(uv, 1.0), dx_uv, dy_uv);
		vec4 n2 = textureGrad(nrc_arr, vec3(uv, 2.0), dx_uv, dy_uv);
		n_ts = normalize(m1a_dec_n(n0.rg, normal_enc) * w0 + m1a_dec_n(n1.rg, normal_enc) * w1 + m1a_dec_n(n2.rg, normal_enc) * w2);
		if (use_nrc) {
			rgh = n0.b * w0 + n1.b * w1 + n2.b * w2;
			cav = n0.a * w0 + n1.a * w1 + n2.a * w2;
		} else {
			rgh = textureGrad(rgh_arr, vec3(uv, 0.0), dx_uv, dy_uv).g * w0
				+ textureGrad(rgh_arr, vec3(uv, 1.0), dx_uv, dy_uv).g * w1
				+ textureGrad(rgh_arr, vec3(uv, 2.0), dx_uv, dy_uv).g * w2;
		}
	} else {
		if (use_nrc && pom_depth > 0.0001 && det > 0.0) {
			vec3 T_unit = normalize(T_vs * sc);
			vec3 B_unit = normalize(-B_vs * sc);
			vec3 V_vs = normalize(VIEW);
			vec3 v_ts = vec3(dot(V_vs, T_unit), dot(V_vs, B_unit), max(dot(V_vs, N_geom), 0.18));
			vec2 d_uv = (v_ts.xy / v_ts.z) * pom_depth / 8.0;
			vec2 cur_uv = uv, prev_uv = uv;
			float cur_l = 0.0, prev_l = 0.0;
			float cur_d = 1.0 - textureGrad(alb_arr, vec3(cur_uv, layer_idx), dx_uv, dy_uv).a;
			float prev_d = cur_d;
			for (int s = 0; s < 8; s++) {
				if (cur_l >= cur_d) {
					break;
				}
				prev_uv = cur_uv;
				prev_d = cur_d;
				prev_l = cur_l;
				cur_uv -= d_uv;
				cur_l += 0.125;
				cur_d = 1.0 - textureGrad(alb_arr, vec3(cur_uv, layer_idx), dx_uv, dy_uv).a;
			}
			float af = cur_d - cur_l;
			float bf = prev_d - prev_l;
			float w = abs(af - bf) > 1e-5 ? clamp(af / (af - bf), 0.0, 1.0) : 0.0;
			uv = mix(cur_uv, prev_uv, w);
		}
		vec4 ah = textureGrad(alb_arr, vec3(uv, layer_idx), dx_uv, dy_uv);
		alb_lin = k_tex(ah.rgb);
		vec4 nr = textureGrad(nrc_arr, vec3(uv, layer_idx), dx_uv, dy_uv);
		n_ts = m1a_dec_n(nr.rg, normal_enc);
		float tsz = float(max(textureSize(nrc_arr, 0).x, 1));
		if (use_nrc) {
			rgh = m1a_rough_aa(nr.b, dx_uv, dy_uv, tsz);
			cav = nr.a;
		} else {
			rgh = textureGrad(rgh_arr, vec3(uv, layer_idx), dx_uv, dy_uv).g;
		}
	}

	ALBEDO = k_albedo(alb_lin);
	ROUGHNESS = rgh;
	METALLIC = 0.0;
	SPECULAR = specular_k;
	AO = mix(1.0, cav, cavity_k);
	AO_LIGHT_AFFECT = 0.25;
	n_ts.xy *= normal_scale;
	NORMAL = normalize(T_vs * (n_ts.x * sc) - B_vs * (n_ts.y * sc) + N_geom * n_ts.z);
}
