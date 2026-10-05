// Bark and wood buckets (material kind 'bark'): vertex-coloured, textured, double-sided, Lambert.
// Also used for 'plain' instanced solids, where COLOR is the instance colour.
shader_type spatial;
render_mode cull_disabled, diffuse_lambert, specular_disabled;

uniform sampler2D albedo_tex : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform bool has_tex = false;
uniform vec3 colour = vec3(1.0);
uniform vec2 uv_repeat = vec2(1.0);         // texture.repeat
uniform bool flip_v = true;                // the texture's flipY: a canvas (true) is uploaded flipped, a DataTexture (false) is not
uniform float alpha_test = 0.0;

void fragment() {
	vec4 tx = has_tex ? texture(albedo_tex, vec2(UV.x * uv_repeat.x, flip_v ? 1.0 - UV.y * uv_repeat.y : UV.y * uv_repeat.y)) : vec4(1.0);
	ALBEDO = tx.rgb * COLOR.rgb * colour;
	if (alpha_test > 0.0) {
		ALPHA = tx.a;
		ALPHA_SCISSOR_THRESHOLD = alpha_test;
	}
}
