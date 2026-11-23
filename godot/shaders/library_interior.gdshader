// Stage 7 (GRAPHICS-TERRAIN-PROPOSAL.md section 8, I1-I4): Indoor material-library & furniture shader.
//   I1: Paired with VisualInstance3D.layers = 2 (masked out of exterior DirectionalLight3D light_cull_mask = 1)
//       + `ambient_light_disabled` to block exterior directional sun and exterior sky ambient completely (0.000 leak),
//       while keeping outdoor sun at 100% on Layer 1 exterior mountains/courtyards seen out windows.
//   I2: Reads non-interpolated room-graph BFS portal daylight and lamp ambience from `room_light_tex` (`filter_nearest`)
//       indexed by `UV2.x` (shells) or `INSTANCE_CUSTOM.x` (instanced furniture). Zero bleed across solid walls.
//   I3: Uses Godot's native spatial light pipeline so room-gated `OmniLight3D`s (with `light_cull_mask = 2` and
//       native `SHADOW_DUAL_PARABOLOID` shadows on the 2 brightest hero lamps) shade indoor surfaces & cast shadows.
//   I4: Applies per-vertex analytic dihedral/trihedral corner darkening baked into `COLOR.a` via `AO` and `EMISSION`.
shader_type spatial;
render_mode ambient_light_disabled;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/breakup.gdshaderinc"
#include "res://shaders/lib/world-uv.gdshaderinc"
#include "res://shaders/lib/triplanar.gdshaderinc"

uniform sampler2D albedo_tex : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D normal_tex : hint_normal, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D rough_tex : hint_roughness_g, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D nrc_tex : filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D room_light_tex : filter_nearest, repeat_disable;

uniform bool has_normal = false;
uniform bool has_rough = false;
uniform bool use_nrc = false;
uniform int normal_enc = 0;
uniform float cavity_k : hint_range(0.0, 1.0) = 0.85;
uniform bool tint = true;
uniform vec3 uv_scale = vec3(1.0);
uniform vec3 uv_offset = vec3(0.0);
uniform float normal_scale = 1.0;
uniform float roughness_k : hint_range(0.0, 1.0) = 0.9;
uniform float metal : hint_range(0.0, 1.0) = 0.0;
uniform float specular_k : hint_range(0.0, 1.0) = 0.5;
uniform float bu_mix = 0.0;
uniform float bu_macro = 0.0;
uniform float bu_cell = 8.0;
uniform bool world_uv = false;
uniform vec2 tile_m = vec2(2.0);
uniform bool world_uv_offset = true;
uniform vec3 colour = vec3(1.0);
uniform bool has_albedo = false;
uniform bool flip_v = false;
uniform vec3 emission = vec3(0.0);
uniform bool unlit = false;
uniform float alpha_test : hint_range(0.0, 1.0) = 0.0;
uniform bool triplanar = false;
uniform float tri_per_m = 2.0;
uniform float tri_gain = 1.0;

// Stage 7 I2-I4 uniforms
uniform bool use_instancing_room = false;
uniform bool use_corner_ao = true;
uniform float sun_day_factor : hint_range(0.0, 2.0) = 1.0;
uniform float lamp_amb_scale : hint_range(0.0, 3.0) = 1.0;

varying vec3 v_wp;
varying vec2 v_uv;
varying vec3 v_op;
varying vec3 v_on;
varying flat float v_room_u;
varying float v_corner_ao;

vec3 m1_decode_normal(vec2 rg01, int enc) {
	if (enc == 1) {
		vec2 e = rg01 * 2.0 - 1.0;
		vec2 p = vec2(e.x + e.y, e.x - e.y) * 0.5;
		return normalize(vec3(p.x, p.y, max(0.0, 1.0 - abs(p.x) - abs(p.y))));
	}
	vec2 xy = rg01 * 2.0 - 1.0;
	return normalize(vec3(xy, sqrt(max(0.0, 1.0 - dot(xy, xy)))));
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
	v_room_u = use_instancing_room ? INSTANCE_CUSTOM.x : UV2.x;
	v_corner_ao = use_corner_ao ? (use_instancing_room ? clamp(INSTANCE_CUSTOM.y, 0.44, 1.0) : clamp(COLOR.a, 0.44, 1.0)) : 1.0;
}

void fragment() {
	vec2 uv = v_uv;
	vec3 q0 = dFdx(VERTEX), q1 = dFdy(VERTEX);
	vec2 st0 = dFdx(uv), st1 = dFdy(uv);
	vec3 N_geom = normalize(NORMAL);
	vec3 q1perp = cross(q1, N_geom), q0perp = cross(N_geom, q0);
	vec3 T_vs = q1perp * st0.x + q0perp * st1.x;
	vec3 B_vs = q1perp * st0.y + q0perp * st1.y;
	float det = max(dot(T_vs, T_vs), dot(B_vs, B_vs));
	float sc = det == 0.0 ? 0.0 : sign(dot(cross(q0, q1), N_geom)) * inversesqrt(det);

	float m = bu_mask(v_wp, bu_mix, bu_cell);
	vec4 a = has_albedo ? (triplanar ? tri_sample(albedo_tex, v_op, v_on, tri_per_m) : bu_tex(albedo_tex, uv, m)) : vec4(1.0);
	vec3 c = (has_albedo ? k_tex(a.rgb) * (triplanar ? tri_gain : 1.0) : vec3(1.0)) * colour * (tint ? COLOR.rgb : vec3(1.0));
	c *= bu_bright(v_wp, bu_macro, bu_cell);
	vec3 alb = k_albedo(c);
	ALBEDO = unlit ? vec3(0.0) : alb;

	float cav = 1.0;
	if (use_nrc) {
		vec4 nrc = mix(texture(nrc_tex, uv), texture(nrc_tex, uv + KM_OFF), m);
		ROUGHNESS = roughness_k * nrc.b;
		cav = mix(1.0, nrc.a, cavity_k);
		vec3 n = m1_decode_normal(nrc.rg, normal_enc);
		n.xy *= normal_scale;
		NORMAL = normalize(T_vs * (n.x * sc) - B_vs * (n.y * sc) + N_geom * n.z);
	} else {
		ROUGHNESS = has_rough ? roughness_k * bu_tex(rough_tex, uv, m).g : roughness_k;
		if (has_normal) {
			vec3 n = bu_normal(normal_tex, uv, m);
			n.xy *= normal_scale;
			NORMAL = normalize(T_vs * (n.x * sc) - B_vs * (n.y * sc) + N_geom * n.z);
		}
	}

	vec4 rl0 = texture(room_light_tex, vec2(clamp(v_room_u, 0.0, 1.0), 0.25));
	vec4 rl1 = texture(room_light_tex, vec2(clamp(v_room_u, 0.0, 1.0), 0.75));
	float n_lift = 0.88 + 0.12 * clamp(v_on.y, -1.0, 1.0);
	vec3 room_irr = (rl0.rgb * sun_day_factor * n_lift) + (rl0.a * lamp_amb_scale * rl1.rgb);
	float ao_comb = v_corner_ao * cav;
	AO = ao_comb;
	AO_LIGHT_AFFECT = 0.45;
	EMISSION = unlit ? c : (emission + alb * room_irr * ao_comb * (1.0 - metal * 0.75));

	METALLIC = metal;
	SPECULAR = specular_k;
}
