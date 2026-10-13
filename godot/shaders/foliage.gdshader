// The foliage card (biomes/GODOT.md, material kind 'leaf'; library hook 'foliage': shaders/lib/foliage.gdshaderinc holds
// the maths, the twin of BIO.foliageHook, core/biome/30-core-foliage.js).
// Instance data from the MultiMesh, packed by krator/biome_import.gd:
//   COLOR           = (r, g, b, c2.r)          instance colour (linear) times the vertex colour; alpha carries c2.r
//   INSTANCE_CUSTOM = (oct(aN).x, oct(aN).y, c2.g, c2.b)
// Colours are linear: read COLOR as it is (no source_color on it). The texture is sRGB: source_color.
shader_type spatial;
render_mode cull_disabled, diffuse_lambert, specular_disabled, skip_vertex_transform;

#include "res://shaders/atmos.gdshaderinc"
#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/foliage.gdshaderinc"

uniform sampler2D albedo_tex : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform bool has_tex = true;
uniform vec3 colour = vec3(1.0);         // the material colour (linear)
uniform vec2 uv_repeat = vec2(1.0);         // texture.repeat
uniform vec2 uv_offset = vec2(0.0);         // texture.offset (a card that shows one cell of a library sheet)
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
	float sc = length(MODEL_MATRIX[sway_axis].xyz);
	float wg = sway_c + dot(sway_w, VERTEX);
	wp += fol_sway(VERTEX, MODEL_MATRIX[3].xyz, sc, wg, atm_time, atm_wind, sway_a);
	v_wp = wp;
	vec3 n;
	if (use_an) {
		n = oct_decode(INSTANCE_CUSTOM.xy);
	} else {
		n = fol_card_normal(mat3(MODEL_MATRIX) * NORMAL);
	}
	v_c2 = vec3(COLOR.a, INSTANCE_CUSTOM.z, INSTANCE_CUSTOM.w);
	VERTEX = (VIEW_MATRIX * vec4(wp, 1.0)).xyz;
	NORMAL = normalize((VIEW_MATRIX * vec4(n, 0.0)).xyz);
	v_depth = -VERTEX.z;
}

void fragment() {
	vec2 tuv = UV * uv_repeat + uv_offset;   // three's uv transform (repeat, then offset), then its flipY
	vec4 tx = has_tex ? texture(albedo_tex, vec2(tuv.x, flip_v ? 1.0 - tuv.y : tuv.y)) : vec4(1.0);
	vec3 c = COLOR.rgb * colour;
	if (irid) {
		vec3 V = normalize(CAMERA_POSITION_WORLD - v_wp);
		vec3 N = normalize((INV_VIEW_MATRIX * vec4(NORMAL, 0.0)).xyz);
		c = mix(v_c2 * colour, c, fol_irid(N, V, atm_sun_dir, v_wp, atm_time));
	}
	ALBEDO = k_albedo(k_tex(tx.rgb) * c);
	// far cards keep more of their cut-out (three: diffuseColor.a *= 1 + clamp(d/650, 0, 1.1))
	ALPHA = fol_far_alpha(tx.a, v_depth);
	ALPHA_SCISSOR_THRESHOLD = alpha_test;
	BACKLIGHT = vec3(back_light);
}
