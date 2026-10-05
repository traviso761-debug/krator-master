// A material-library surface (core/materials/record: KMAT; Girder is the pilot). The pack (tools/textures/pack.py)
// has already baked the tint, brightness and roughness lift into the maps, so this shader adds what three.js did in
// its hooks (core/materials/record/25-matlib-host.js): the vertex or instance colour (tint), Godot's `specular`, and
// the repetition break-up: a world-space value noise of `cell` metres blends every map with a copy shifted by
// KM_OFF (up to `mix`), and a slower noise varies the brightness by +-`macro`. Maps keep their own UVs (and the
// glTF texture transform, uv_scale and uv_offset).
shader_type spatial;
render_mode cull_disabled;   // three draws most library surfaces front-only; a few are double-sided, and glTF carries the flag per material

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

const vec2 KM_OFF = vec2(0.371, 0.613);
varying vec3 v_wp;

// the hash and value noise of 25-matlib-host.js (sin-based: matches three.js within float precision, not bit for bit)
float km_h(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float km_n(vec3 p) {
	vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
	return mix(mix(mix(km_h(i), km_h(i + vec3(1., 0., 0.)), f.x), mix(km_h(i + vec3(0., 1., 0.)), km_h(i + vec3(1., 1., 0.)), f.x), f.y),
	           mix(mix(km_h(i + vec3(0., 0., 1.)), km_h(i + vec3(1., 0., 1.)), f.x), mix(km_h(i + vec3(0., 1., 1.)), km_h(i + vec3(1., 1., 1.)), f.x), f.y), f.z);
}

void vertex() { v_wp = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz; }

void fragment() {
	vec2 uv = UV * uv_scale.xy + uv_offset.xy;
	float m = smoothstep(0.3, 0.7, km_n(v_wp / bu_cell)) * bu_mix;
	vec4 a = mix(texture(albedo_tex, uv), texture(albedo_tex, uv + KM_OFF), m);
	vec3 c = a.rgb * (tint ? COLOR.rgb : vec3(1.0));
	c *= 1.0 + bu_macro * (km_n(v_wp / (bu_cell * 2.7) + 19.1) * 2.0 - 1.0);
	ALBEDO = c;
	if (has_rough) {
		ROUGHNESS = roughness_k * mix(texture(rough_tex, uv).g, texture(rough_tex, uv + KM_OFF).g, m);
	} else {
		ROUGHNESS = roughness_k;
	}
	METALLIC = metal;
	SPECULAR = specular_k;
	if (has_normal) {
		vec3 n = normalize(mix(texture(normal_tex, uv).xyz * 2.0 - 1.0, texture(normal_tex, uv + KM_OFF).xyz * 2.0 - 1.0, m));
		NORMAL_MAP = n * 0.5 + 0.5;
		NORMAL_MAP_DEPTH = normal_scale;
	}
}
