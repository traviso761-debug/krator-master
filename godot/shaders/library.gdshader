// A material-library surface (core/materials/record: KMAT; Girder is the pilot). The pack (tools/textures/pack.py)
// has already baked the tint, brightness and roughness lift into the maps, so this shader adds what three.js did in
// its hooks (core/materials/record/25-matlib-host.js): the vertex or instance colour (tint), Godot's `specular`, and
// the repetition break-up: a world-space value noise of `cell` metres blends every map with a copy shifted by
// KM_OFF (up to `mix`), and a slower noise varies the brightness by +-`macro`. Maps keep their own UVs (and the
// glTF texture transform, uv_scale and uv_offset), except on instances with `world_uv` (below). The break-up and the
// world-unit tiling are the shader library's (shaders/lib/breakup.gdshaderinc, lib/world-uv.gdshaderinc: hooks
// 'breakup' and 'world-uv').
shader_type spatial;
render_mode cull_disabled;

#include "res://shaders/kcolour.gdshaderinc"   // three draws most library surfaces front-only; a few are double-sided, and glTF carries the flag per material
#include "res://shaders/lib/breakup.gdshaderinc"
#include "res://shaders/lib/world-uv.gdshaderinc"

uniform sampler2D albedo_tex : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D normal_tex : hint_normal, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D rough_tex : hint_roughness_g, filter_linear_mipmap_anisotropic, repeat_enable;
uniform bool has_normal = true;
uniform bool has_rough = true;
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
// world-unit tiling on instanced primitives (Girder's applyWorldUV, settlements/girder/src/45-kit.js; Voth's too): a
// unit box scaled into a post keeps one tile per `tile_m` metres instead of one stretched tile, and each instance
// starts at a hashed offset. three replaces the map's uv transform there, so uv_scale does not apply.
uniform bool world_uv = false;
uniform vec2 tile_m = vec2(2.0);

varying vec3 v_wp;
varying vec2 v_uv;

void vertex() {
	v_wp = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	v_uv = UV * uv_scale.xy + uv_offset.xy;
	if (world_uv) {   // MODEL_MATRIX is the instance's (the region node is unscaled), as instanceMatrix is in three
		v_uv = wuv_box(UV, NORMAL, wuv_instance_scale(MODEL_MATRIX), 1.0 / tile_m) + wuv_box_offset(MODEL_MATRIX[3].xz);
	}
}

void fragment() {
	vec2 uv = v_uv;
	float m = bu_mask(v_wp, bu_mix, bu_cell);
	vec4 a = bu_tex(albedo_tex, uv, m);
	vec3 c = k_tex(a.rgb) * (tint ? COLOR.rgb : vec3(1.0));
	c *= bu_bright(v_wp, bu_macro, bu_cell);
	ALBEDO = k_albedo(c);
	if (has_rough) {
		ROUGHNESS = roughness_k * bu_tex(rough_tex, uv, m).g;
	} else {
		ROUGHNESS = roughness_k;
	}
	METALLIC = metal;
	SPECULAR = specular_k;
	if (has_normal) {
		// three r128's perturbNormal2Arb: the tangent frame from screen derivatives, so the mesh needs no tangents (three's
		// exporter writes none, and NORMAL_MAP without them gives random glints). The face's own orientation replaces
		// three's faceDirection, so it holds whichever way the renderer's y runs. Godot's uv.y runs down the image
		// where three's v runs up it (flipY), so the map's green follows -B.
		vec3 n = bu_normal(normal_tex, uv, m);
		n.xy *= normal_scale;
		vec3 q0 = dFdx(VERTEX), q1 = dFdy(VERTEX);
		vec2 st0 = dFdx(uv), st1 = dFdy(uv);
		vec3 N = normalize(NORMAL);
		vec3 q1perp = cross(q1, N), q0perp = cross(N, q0);
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max(dot(T, T), dot(B, B));
		float sc = det == 0.0 ? 0.0 : sign(dot(cross(q0, q1), N)) * inversesqrt(det);
		NORMAL = normalize(T * (n.x * sc) - B * (n.y * sc) + N * n.z);
	}
}
