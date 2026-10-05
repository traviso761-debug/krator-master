// The foliage card (biomes/GODOT.md, material kind 'leaf'): a port of BIO.foliageHook (core/biome/30-core-foliage.js).
// Instance data from the MultiMesh, packed by krator/biome_import.gd:
//   COLOR           = (r, g, b, c2.r)          instance colour (linear) times the vertex colour; alpha carries c2.r
//   INSTANCE_CUSTOM = (oct(aN).x, oct(aN).y, c2.g, c2.b)
// Colours are linear: read COLOR as it is (no source_color on it). The texture is sRGB: source_color.
shader_type spatial;
render_mode cull_disabled, diffuse_lambert, specular_disabled, skip_vertex_transform;

#include "res://shaders/atmos.gdshaderinc"

uniform sampler2D albedo_tex : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform bool has_tex = true;
uniform vec3 colour = vec3(1.0);         // the material colour (linear)
uniform vec2 uv_repeat = vec2(1.0);         // texture.repeat
uniform bool flip_v = true;                // the texture's flipY: a canvas (true) is uploaded flipped, a DataTexture (false) is not
uniform float alpha_test = 0.42;
uniform float sway_a = 0.06;             // o.swayA
uniform float sway_c = 1.0;              // o.swayW as c + dot(sway_w, position): '1.0' -> c=1; '(-position.y)' -> w=(0,-1,0)
uniform vec3 sway_w = vec3(0.0);
uniform int sway_axis = 0;               // o.axis: which basis column sets the amplitude
uniform bool use_an = false;             // o.aN: the clump's own lighting normal (world space)
uniform bool irid = false;               // o.irid: the prism gum's two colours
uniform float back_light = 0.30;

varying vec3 v_wp;
varying vec3 v_c2;
varying float v_depth;

void vertex() {
	// MODEL_MATRIX already holds the instance's transform for a MultiMesh
	vec3 wp = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	float ph = dot(MODEL_MATRIX[3].xyz, vec3(0.131, 0.073, 0.117));
	float sc = length(MODEL_MATRIX[sway_axis].xyz);
	float wg = sway_c + dot(sway_w, VERTEX);
	float on = step(1e-4, length(atm_wind));
	vec2 w = atm_wind;
	float wk = mix(1.0, max(0.3, length(w)), on);
	vec3 lean = on * vec3(w.x, 0.0, w.y) * (0.9 + 0.6 * sin(atm_time * 0.45 + ph * 2.1));
	float t = atm_time;
	wp += wg * sc * (vec3(
		sin(t * 0.9 + ph) + 0.45 * sin(t * 2.3 + ph * 1.7 + VERTEX.x * 5.0),
		0.40 * sin(t * 1.6 + ph * 0.6 + VERTEX.z * 5.0),
		cos(t * 0.7 + ph * 1.3) + 0.45 * sin(t * 2.9 + ph + VERTEX.y * 5.0)) * wk + lean) * sway_a;
	v_wp = wp;
	vec3 n;
	if (use_an) {
		n = oct_decode(INSTANCE_CUSTOM.xy);
	} else {
		n = normalize(mat3(MODEL_MATRIX) * NORMAL);
		n = normalize(mix(n, vec3(0.0, 1.0, 0.0), 0.45));
	}
	v_c2 = vec3(COLOR.a, INSTANCE_CUSTOM.z, INSTANCE_CUSTOM.w);
	VERTEX = (VIEW_MATRIX * vec4(wp, 1.0)).xyz;
	NORMAL = normalize((VIEW_MATRIX * vec4(n, 0.0)).xyz);
	v_depth = -VERTEX.z;
}

void fragment() {
	vec4 tx = has_tex ? texture(albedo_tex, vec2(UV.x * uv_repeat.x, flip_v ? 1.0 - UV.y * uv_repeat.y : UV.y * uv_repeat.y)) : vec4(1.0);
	vec3 c = COLOR.rgb * colour;
	if (irid) {
		vec3 V = normalize(CAMERA_POSITION_WORLD - v_wp);
		vec3 N = normalize((INV_VIEW_MATRIX * vec4(NORMAL, 0.0)).xyz);
		float fr = 1.0 - abs(dot(N, V));
		float sf = dot(N, normalize(atm_sun_dir)) * 0.5 + 0.5;
		float sh = 0.16 * sin(atm_time * 0.8 + dot(v_wp, vec3(0.045, 0.083, 0.037))) + 0.08 * sin(atm_time * 1.9 + dot(v_wp, vec3(-0.21, 0.13, 0.17)));
		float k = smoothstep(0.22, 0.78, sf * 1.15 - fr * 0.80 + 0.30 + sh);
		c = mix(v_c2 * colour, c, k);
	}
	ALBEDO = tx.rgb * c;
	// far cards keep more of their cut-out (three: diffuseColor.a *= 1 + clamp(d/650, 0, 1.1))
	ALPHA = tx.a * (1.0 + clamp(v_depth / 650.0, 0.0, 1.1));
	ALPHA_SCISSOR_THRESHOLD = alpha_test;
	BACKLIGHT = vec3(back_light);
}
