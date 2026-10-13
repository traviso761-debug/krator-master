// The page's ground (the stage's ground look: KSTAGE.ground): its texture through the page's own uvs (repeat, offset,
// flipY), its material colour and vertex colours (linear), Lambert; and, when the export describes them (core/export's
// EXPORT.groundLayers: a material record with hook 'world-uv' and role 'ground'), the layers the page's ground hook
// multiplies over it: up to four world-xz maps in up to three terms, a term weighted by a channel of the weights texture
// (the crack field on the tile's grid), colour *= mix(1, gain * product(maps), amount * weight)
// (shaders/lib/world-uv.gdshaderinc). Not carried: the strata the biome hosts paint on rock (35-core-strata.js), the
// cave's occlusion.
shader_type spatial;
render_mode diffuse_lambert, specular_disabled;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/world-uv.gdshaderinc"

uniform sampler2D map_tex : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform bool has_map = false;
uniform vec3 colour = vec3(1.0);
uniform vec2 uv_repeat = vec2(1.0);
uniform vec2 uv_offset = vec2(0.0);
uniform bool flip_v = true;
uniform bool use_vc = false;

// the layers (world-uv): map i samples at xz * st.xy + st.zw, belongs to term layer_term[i]; the samples are the
// maps' stored bytes (no source_color: three reads them in its own uniform, undecoded)
uniform int layer_n = 0;
uniform sampler2D layer0 : filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D layer1 : filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D layer2 : filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D layer3 : filter_linear_mipmap_anisotropic, repeat_enable;
uniform vec4 layer_st[4];
uniform ivec4 layer_term = ivec4(0);
uniform ivec4 layer_flip = ivec4(1);
uniform int term_n = 0;
uniform vec4 term_k[3];                     // (gain, amount, weight channel (-1: none), 0)
uniform sampler2D weights_tex : filter_linear, repeat_disable;
uniform vec4 weights_box = vec4(0.0, 0.0, 1.0, 1.0);   // (x0, z0, 1 / step, 0): grid point i at x0 + i * step
uniform vec2 weights_n = vec2(1.0);                     // (nx, nz)

varying vec3 v_wp;

void vertex() {
	v_wp = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

vec3 layer_sample(int i, vec3 wp) {
	vec2 uv = wuv_planar(wp, layer_st[i].xy, layer_st[i].zw, layer_flip[i] != 0);
	if (i == 0) return texture(layer0, uv).rgb;
	if (i == 1) return texture(layer1, uv).rgb;
	if (i == 2) return texture(layer2, uv).rgb;
	return texture(layer3, uv).rgb;
}

void fragment() {
	vec2 uv = UV * uv_repeat + uv_offset;
	if (flip_v) uv.y = 1.0 - uv.y;
	vec3 c = colour * (has_map ? k_tex(texture(map_tex, uv).rgb) : vec3(1.0));
	if (use_vc) c *= COLOR.rgb;
	if (layer_n > 0) {
		// the weights between grid points, bilinear: grid point i is texel i's centre
		vec2 wuv = ((v_wp.xz - weights_box.xy) * weights_box.z + 0.5) / weights_n;
		vec4 wt = texture(weights_tex, wuv);
		vec3 s[4];
		for (int i = 0; i < 4; i++) s[i] = i < layer_n ? layer_sample(i, v_wp) : vec3(1.0);
		for (int t = 0; t < 3; t++) {
			if (t >= term_n) break;
			vec3 p = vec3(1.0);
			for (int i = 0; i < 4; i++) if (i < layer_n && layer_term[i] == t) p *= s[i];
			int ch = int(term_k[t].z);
			float w = ch < 0 ? 1.0 : wt[ch];
			c = wuv_layer(c, p, term_k[t].x, term_k[t].y * w);
		}
	}
	ALBEDO = k_albedo(c);
}
