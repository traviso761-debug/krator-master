// The body of the material-library surface, shared by its three shaders (GODOT-LOOK-PLAN.md C5; the proposal's K5):
//   library.gdshader           opaque, back faces culled
//   library_twosided.gdshader  opaque, both faces (a record three draws DoubleSide, or an instanced piece that is mirrored)
//   library_cutout.gdshader    both faces and an alpha scissor (K_LIB_CUTOUT): the only one that writes ALPHA
// krator/kmat.gd picks one from a record (KratorKmat.variant); KratorKmat.is_lib answers "a library surface?" for all
// three. One define here, against the library's own rule (options are uniforms): a render mode and whether ALPHA is
// written at all cannot be a uniform.
#include "res://shaders/kcolour.gdshaderinc"   // three draws most library surfaces front-only; a few are double-sided, and glTF carries the flag per material
#include "res://shaders/lib/breakup.gdshaderinc"
#include "res://shaders/lib/world-uv.gdshaderinc"
#include "res://shaders/lib/triplanar.gdshaderinc"
#include "res://shaders/lib/weather.gdshaderinc"
#include "res://shaders/lib/detail.gdshaderinc"

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
// the weathering stack's amounts for this surface's class (krator/kweather.gd): drift, run-off and under, moss, top.
// The stack itself is off until a look turns it on (the global k_weather.x; lib/weather.gdshaderinc)
uniform vec4 weather_k = vec4(0.6, 0.4, 0.15, 0.3);
// detail at arm's length (M9; lib/detail.gdshaderinc): this surface's layer of the shared detail-normal array (under 0:
// none) and how many detail tiles one tile of its own uv holds
uniform float detail_layer = -1.0;
uniform vec2 detail_scale = vec2(6.0);
// M10: this material's meshes carry tangents (krator/world_import.gd sets it per mesh), so the normal map can stand on
// the engine's own frame when the look asks (k_surface.y); without them, and for triplanar, the derivative frame stays
uniform bool mesh_tangents = false;

varying vec3 v_wp;
varying vec2 v_uv;
varying vec3 v_op;
varying vec3 v_on;
varying vec3 v_wn;

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
	v_wn = (MODEL_MATRIX * vec4(NORMAL, 0.0)).xyz;
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

	vec3 n_ts = vec3(0.0, 0.0, 1.0);   // the tangent-space normal the maps give, and whether any did
	bool has_n = false;
	if (use_nrc) {
		vec4 nrc = mix(textureGrad(nrc_tex, uv, dx_uv, dy_uv), textureGrad(nrc_tex, uv + KM_OFF, dx_uv, dy_uv), m);
		float r_base = roughness_k * nrc.b;
		float tsz = float(max(textureSize(nrc_tex, 0).x, 1));
		ROUGHNESS = m1_rough_aa(r_base, dx_uv, dy_uv, tsz);
		AO = mix(1.0, nrc.a, cavity_k);
		AO_LIGHT_AFFECT = 0.25;
		n_ts = m1_decode_normal(nrc.rg, normal_enc);
		n_ts.xy *= normal_scale;
		has_n = true;
	} else {
		if (has_rough) {
			ROUGHNESS = roughness_k * bu_tex(rough_tex, uv, m).g;
		} else {
			ROUGHNESS = roughness_k;
		}
		if (has_normal) {
			n_ts = bu_normal(normal_tex, uv, m);
			n_ts.xy *= normal_scale;
			has_n = true;
		}
	}
	// detail at arm's length (M9): the class's detail normal over the map's, gone by six metres
	if (k_surface.x > 0.0 && detail_layer >= 0.0 && !triplanar) {
		n_ts = normalize(vec3(n_ts.xy + kd_detail(uv * detail_scale, detail_layer, length(VERTEX)) * k_surface.x, n_ts.z));
		has_n = true;
	}
	if (has_n) {
		if (mesh_tangents && k_surface.y > 0.5 && !triplanar) {
			// M10: the mesh's own tangent frame (the engine's path). BINORMAL runs against the uv's v (measured on 4.7.2:
			// it is minus the derivative frame's B), and flip_v turns the map's v over
			NORMAL = normalize(TANGENT * n_ts.x + BINORMAL * (flip_v ? -n_ts.y : n_ts.y) + N_geom * n_ts.z);
		} else {
			NORMAL = normalize(T_vs * (n_ts.x * sc) - B_vs * (n_ts.y * sc) + N_geom * n_ts.z);
		}
	}
	// the weathering stack (M7; lib/weather.gdshaderinc), on the colour and the roughness the maps gave. Off (k_weather.x
	// is 0) it returns at once, and the surface is as it was
	if (!unlit) {
		float r_w = ROUGHNESS;
		kw_weather(v_wp, normalize(v_wn), weather_k, c, r_w);
		ALBEDO = k_albedo(c);
		ROUGHNESS = r_w;
	}
	METALLIC = metal;
	SPECULAR = specular_k;
#ifdef K_LIB_CUTOUT
	// the cut-out variant alone (library_cutout.gdshader): a shader that writes ALPHA at all leaves the opaque pass, and
	// with it the depth prepass and early depth rejection
	if (alpha_test > 0.0 && has_albedo) {
		ALPHA = a.a;
		ALPHA_SCISSOR_THRESHOLD = alpha_test;
		ALPHA_ANTIALIASING_EDGE = 0.2;
		ALPHA_TEXTURE_COORDINATE = uv * vec2(textureSize(albedo_tex, 0));
	} else {
		ALPHA = 1.0;
		ALPHA_SCISSOR_THRESHOLD = 0.0;
	}
#endif
}

