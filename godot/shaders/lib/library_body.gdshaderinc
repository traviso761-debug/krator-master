// The material-library surface's body, shared by shaders/library.gdshader (opaque) and shaders/library_cutout.gdshader
// (alpha_test > 0: leaves, jali, valances, cards). K5 of GRAPHICS-TERRAIN-PROPOSAL.md 12d: the opaque shader never
// writes ALPHA or ALPHA_SCISSOR_THRESHOLD, so Godot keeps its depth prepass, early-Z and vertex-only shadow passes for
// every building and town (as library_interior.gdshader proved in Stage 7); the cut-out one defines KLIB_CUTOUT and
// scissors on the albedo's alpha. Pick one with KratorKmat.shader_for(alpha_test). The uniforms are the same in both, so
// a material's parameters carry across when it moves between them.
uniform sampler2D albedo_tex : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D normal_tex : hint_normal, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D rough_tex : hint_roughness_g, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D nrc_tex : filter_linear_mipmap_anisotropic, repeat_enable;
uniform bool has_normal = true;
uniform bool has_rough = true;
uniform bool use_nrc = false;             // Stage 5 M1 packVersion 2: RG=normal (xy or hemi-oct8), B=roughness, A=cavity
uniform int normal_enc = 0;               // 0 = xy6/xy8, 1 = Cigolle Hemisphere Octahedral (oct8)
uniform float cavity_k : hint_range(0.0, 1.0) = 0.85;
uniform float pom_depth : hint_range(0.0, 0.08) = 0.0;
uniform vec4 mip_var_lo = vec4(0.0);      // M2 Specular AA normal variance for mips 0..3
uniform vec4 mip_var_hi = vec4(0.0);      // M2 Specular AA normal variance for mips 4..7
uniform bool tint = true;                 // the record's tint: vertex colour multiplies the map
uniform vec3 uv_scale = vec3(1.0);
uniform vec3 uv_offset = vec3(0.0);
uniform float normal_scale = 1.0;
uniform float roughness_k : hint_range(0.0, 1.0) = 1.0;
uniform float metal : hint_range(0.0, 1.0) = 0.0;
uniform float specular_k : hint_range(0.0, 1.0) = 0.5;
uniform float bu_mix = 0.0;               // breakup {mix, macro, cell}
uniform float bu_macro = 0.0;
uniform float bu_cell = 8.0;
uniform bool world_uv = false;
uniform vec2 tile_m = vec2(2.0);
uniform bool world_uv_offset = true;
uniform vec3 colour = vec3(1.0);
uniform bool has_albedo = true;
uniform bool flip_v = false;
uniform vec3 emission = vec3(0.0);
uniform bool unlit = false;
uniform float alpha_test : hint_range(0.0, 1.0) = 0.0;
uniform bool triplanar = false;
uniform float tri_per_m = 2.0;
uniform float tri_gain = 1.0;

varying vec3 v_wp;
varying vec2 v_uv;
varying vec3 v_op;
varying vec3 v_on;

vec3 m1_decode_normal(vec2 rg01, int enc) {
	if (enc == 1) {
		vec2 e = rg01 * 2.0 - 1.0;
		vec2 p = vec2(e.x + e.y, e.x - e.y) * 0.5;
		return normalize(vec3(p.x, p.y, max(0.0, 1.0 - abs(p.x) - abs(p.y))));
	}
	vec2 xy = rg01 * 2.0 - 1.0;
	return normalize(vec3(xy, sqrt(max(0.0, 1.0 - dot(xy, xy)))));
}

float m1_rough_aa(float base_r, vec2 dx_uv, vec2 dy_uv, float tex_sz) {
	float px = max(dot(dx_uv, dx_uv), dot(dy_uv, dy_uv)) * (tex_sz * tex_sz);
	float mip = clamp(0.5 * log2(max(px, 1.0)), 0.0, 7.0);
	int i0 = int(floor(mip));
	float f = mip - float(i0);
	float v0 = i0 < 4 ? mip_var_lo[i0] : mip_var_hi[i0 - 4];
	int i1 = min(i0 + 1, 7);
	float v1 = i1 < 4 ? mip_var_lo[i1] : mip_var_hi[i1 - 4];
	float vr = mix(v0, v1, f);
	return sqrt(clamp(base_r * base_r + min(vr * 1.5, 0.45), 0.0004, 1.0));
}

void vertex() {
	v_wp = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	v_op = VERTEX;
	v_on = NORMAL;
	v_uv = UV * uv_scale.xy + uv_offset.xy;
	if (world_uv) {
		v_uv = wuv_box(UV, NORMAL, wuv_instance_scale(MODEL_MATRIX), 1.0 / tile_m) + (world_uv_offset ? wuv_box_offset(MODEL_MATRIX[3].xz) : vec2(0.0));
	}
	if (flip_v) {
		v_uv.y = 1.0 - v_uv.y;
	}
}

void fragment() {
	vec2 uv = v_uv;
	vec2 dx_uv = dFdx(uv);
	vec2 dy_uv = dFdy(uv);
	vec3 q0 = dFdx(VERTEX), q1 = dFdy(VERTEX);
	vec2 st0 = dx_uv, st1 = dy_uv;
	vec3 N_geom = normalize(NORMAL);
	vec3 q1perp = cross(q1, N_geom), q0perp = cross(N_geom, q0);
	vec3 T_vs = q1perp * st0.x + q0perp * st1.x;
	vec3 B_vs = q1perp * st0.y + q0perp * st1.y;
	float det = max(dot(T_vs, T_vs), dot(B_vs, B_vs));
	float sc = det == 0.0 ? 0.0 : sign(dot(cross(q0, q1), N_geom)) * inversesqrt(det);

	// Stage 5 M3 Planar POM (hero planar surfaces only; pre-loop derivatives + textureGrad for GLSL ES 3.00 compliance)
	if (use_nrc && pom_depth > 0.0001 && !triplanar && alpha_test <= 0.0 && det > 0.0) {
		vec3 T_unit = normalize(T_vs * sc);
		vec3 B_unit = normalize(-B_vs * sc);
		vec3 V_vs = normalize(VIEW);
		vec3 v_ts = vec3(dot(V_vs, T_unit), dot(V_vs, B_unit), max(dot(V_vs, N_geom), 0.18));
		vec2 d_uv = (v_ts.xy / v_ts.z) * pom_depth / 8.0;
		vec2 cur_uv = uv, prev_uv = uv;
		float cur_l = 0.0, prev_l = 0.0;
		float cur_d = 1.0 - textureGrad(albedo_tex, cur_uv, dx_uv, dy_uv).a;
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
			cur_d = 1.0 - textureGrad(albedo_tex, cur_uv, dx_uv, dy_uv).a;
		}
		float af = cur_d - cur_l;
		float bf = prev_d - prev_l;
		float w = abs(af - bf) > 1e-5 ? clamp(af / (af - bf), 0.0, 1.0) : 0.0;
		uv = mix(cur_uv, prev_uv, w);
	}

	float m = bu_mask(v_wp, bu_mix, bu_cell);
	vec4 a = has_albedo ? (triplanar ? tri_sample(albedo_tex, v_op, v_on, tri_per_m) : bu_tex(albedo_tex, uv, m)) : vec4(1.0);
	vec3 c = (has_albedo ? k_tex(a.rgb) * (triplanar ? tri_gain : 1.0) : vec3(1.0)) * colour * (tint ? COLOR.rgb : vec3(1.0));
	c *= bu_bright(v_wp, bu_macro, bu_cell);
	ALBEDO = unlit ? vec3(0.0) : k_albedo(c);
	EMISSION = unlit ? c : emission;

	if (use_nrc) {
		vec4 nrc = mix(textureGrad(nrc_tex, uv, dx_uv, dy_uv), textureGrad(nrc_tex, uv + KM_OFF, dx_uv, dy_uv), m);
		float r_base = roughness_k * nrc.b;
		float tsz = float(max(textureSize(nrc_tex, 0).x, 1));
		ROUGHNESS = m1_rough_aa(r_base, dx_uv, dy_uv, tsz);
		AO = mix(1.0, nrc.a, cavity_k);
		AO_LIGHT_AFFECT = 0.25;
		vec3 n = m1_decode_normal(nrc.rg, normal_enc);
		n.xy *= normal_scale;
		NORMAL = normalize(T_vs * (n.x * sc) - B_vs * (n.y * sc) + N_geom * n.z);
	} else {
		if (has_rough) {
			ROUGHNESS = roughness_k * bu_tex(rough_tex, uv, m).g;
		} else {
			ROUGHNESS = roughness_k;
		}
		if (has_normal) {
			vec3 n = bu_normal(normal_tex, uv, m);
			n.xy *= normal_scale;
			NORMAL = normalize(T_vs * (n.x * sc) - B_vs * (n.y * sc) + N_geom * n.z);
		}
	}
	METALLIC = metal;
	SPECULAR = specular_k;
#ifdef KLIB_CUTOUT
	if (alpha_test > 0.0 && has_albedo) {
		ALPHA = a.a;
		ALPHA_SCISSOR_THRESHOLD = alpha_test;
		ALPHA_ANTIALIASING_EDGE = 0.2;
		ALPHA_TEXTURE_COORDINATE = uv * vec2(textureSize(albedo_tex, 0));
	}
#endif
}

