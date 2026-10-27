// The skin, one surface for all its regions (kchar_figure.gd _join): each vertex's CUSTOM0 is its region, the groups
// of triangles the same items cover (tools/make_mpfb.py godot_shapes); a region a worn item covers (its texel in hide_tex 1) is
// drawn as nothing. The look is the imported skin material's, tinted (_skin_mat); under a lizard's head its scales
// instead (detail_repeat over 0: the head's maps repeated across the skin's UVs, kit item skin_detail); under a frog's
// its pattern too (pattern_on: the body's pattern texture at the skin's own UVs, coloured as kchar_pattern.gdshader).
shader_type spatial;
render_mode cull_back;

uniform sampler2D tex : source_color, hint_default_white, filter_linear_mipmap, repeat_enable;
uniform vec4 albedo : source_color = vec4(1.0);
uniform sampler2D ntex : hint_normal, filter_linear_mipmap, repeat_enable;
uniform float nscale = 0.0;
uniform float rough = 0.7;
uniform sampler2D detail_tex : source_color, hint_default_white, filter_linear_mipmap, repeat_enable;
uniform sampler2D detail_ntex : hint_normal, filter_linear_mipmap, repeat_enable;
uniform float detail_repeat = 0.0;
uniform sampler2D mask_tex : hint_default_black, filter_linear;
uniform float pattern_on = 0.0;
uniform vec3 c1 : source_color = vec3(1.0);
uniform vec3 c2 : source_color = vec3(0.0);
uniform vec3 c3 : source_color = vec3(1.0);
uniform float kind = 0.0;
uniform float amount = 0.4;
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
	if (detail_repeat > 0.0) {
		vec2 uv = UV * detail_repeat;
		ALBEDO = texture(detail_tex, uv).rgb * albedo.rgb;
		NORMAL_MAP = texture(detail_ntex, uv).rgb;
		NORMAL_MAP_DEPTH = 1.0;
	} else {
		ALBEDO = texture(tex, UV).rgb * albedo.rgb;
		NORMAL_MAP = texture(ntex, UV).rgb;
		NORMAL_MAP_DEPTH = nscale;
	}
	if (pattern_on > 0.5) {
		vec4 pm = texture(mask_tex, UV);
		float m = 0.0;
		if (kind > 0.5 && kind < 1.5) {
			m = 1.0 - smoothstep(0.6 * amount, 0.6 * amount + 0.05, pm.r);
		} else if (kind > 1.5 && kind < 2.5) {
			m = 1.0 - smoothstep(0.3 * amount, 0.3 * amount + 0.04, pm.g);
		} else if (kind > 2.5) {
			m = smoothstep(1.0 - amount - 0.04, 1.0 - amount + 0.04, pm.b);
		}
		ALBEDO = ALBEDO / max(albedo.rgb, vec3(1e-4)) * mix(mix(c1, c2, m), c3, pm.a);
	}
	ROUGHNESS = rough;
}
