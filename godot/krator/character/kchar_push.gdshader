// A garment as kchar_push.gdshaderinc moves it (the twin of pushOut in core/charactermodels/src/50-figure.js): the
// garment's own look (albedo texture and colour, alpha cutoff, normal map, roughness, metallic, from the imported
// material: kchar_figure.gd _garment) and the push after skinning.
shader_type spatial;
render_mode cull_disabled;

uniform sampler2D tex : source_color, hint_default_white, filter_linear_mipmap, repeat_enable;
uniform vec4 albedo : source_color = vec4(1.0);
uniform float alpha_cut = 0.0;
uniform sampler2D ntex : hint_normal, filter_linear_mipmap, repeat_enable;
uniform float nscale = 0.0;
uniform float rough = 0.85;
uniform float metal = 0.0;
#include "res://krator/character/kchar_push.gdshaderinc"

void vertex() {
	kc_push(VERTEX, NORMAL);
}

void fragment() {
	vec4 c = texture(tex, UV) * albedo;
	ALBEDO = c.rgb;
	ALPHA = c.a;
	ALPHA_SCISSOR_THRESHOLD = alpha_cut;
	NORMAL_MAP = texture(ntex, UV).rgb;
	NORMAL_MAP_DEPTH = nscale;
	ROUGHNESS = rough;
	METALLIC = metal;
	// a back face drawn BACK_DEPTH further from the eye: where the cloth folds over itself its inside lay at the
	// outside's depth and showed through it in patches (BACK_DEPTH in 50-figure.js); an inside nothing covers still shows
	vec4 bc = PROJECTION_MATRIX * vec4(VERTEX.xy, VERTEX.z - BACK_DEPTH, 1.0);
	DEPTH = FRONT_FACING ? FRAGCOORD.z : bc.z / bc.w;
}
