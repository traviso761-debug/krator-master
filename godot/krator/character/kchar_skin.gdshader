// The skin, one surface for all its regions (kchar_figure.gd _join): each vertex's CUSTOM0 is its region, the groups
// of triangles the same items cover (tools/make_mpfb.py godot_shapes); a region a worn item covers (its texel in hide_tex 1) is
// drawn as nothing. The look is the imported skin material's, tinted (_skin_mat).
shader_type spatial;
render_mode cull_back;

uniform sampler2D tex : source_color, hint_default_white, filter_linear_mipmap, repeat_enable;
uniform vec4 albedo : source_color = vec4(1.0);
uniform sampler2D ntex : hint_normal, filter_linear_mipmap, repeat_enable;
uniform float nscale = 0.0;
uniform float rough = 0.7;
// one texel per region, red 1 where a worn item hides it (as many regions as the kit has: no fixed limit)
uniform sampler2D hide_tex : filter_nearest;

varying flat float hidden;

void vertex() {
	hidden = texelFetch(hide_tex, ivec2(int(CUSTOM0.x + 0.5), 0), 0).r;
}

void fragment() {
	if (hidden > 0.5) {
		discard;
	}
	ALBEDO = texture(tex, UV).rgb * albedo.rgb;
	NORMAL_MAP = texture(ntex, UV).rgb;
	NORMAL_MAP_DEPTH = nscale;
	ROUGHNESS = rough;
}
