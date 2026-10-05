// The page's ground (the stage's ground look: KSTAGE.ground): its texture through the page's own uvs (repeat, offset,
// flipY), its material colour and vertex colours (linear), Lambert. Hooks on the page's ground material (detail
// maps, cracks) are not carried.
shader_type spatial;
render_mode diffuse_lambert, specular_disabled;

uniform sampler2D map_tex : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform bool has_map = false;
uniform vec3 colour = vec3(1.0);
uniform vec2 uv_repeat = vec2(1.0);
uniform vec2 uv_offset = vec2(0.0);
uniform bool flip_v = true;
uniform bool use_vc = false;

void fragment() {
	vec2 uv = UV * uv_repeat + uv_offset;
	if (flip_v) uv.y = 1.0 - uv.y;
	vec3 c = colour * (has_map ? texture(map_tex, uv).rgb : vec3(1.0));
	if (use_vc) c *= COLOR.rgb;
	ALBEDO = c;
}
