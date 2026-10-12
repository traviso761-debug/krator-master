// The eyes of a MakeHuman figure (kchar_figure.gd): make_mpfb.py greys the irises and stores their mask in the
// texture's alpha; the eye colour (linear, gain folded in) multiplies in by that mask, so the whites stay white.
// The twin of irisTint() in kits/characters/src/50-figure.js.
shader_type spatial;

uniform sampler2D tex : source_color, filter_linear_mipmap;
uniform vec3 tint = vec3(1.0);

void fragment() {
	vec4 t = texture(tex, UV);
	ALBEDO = t.rgb * mix(vec3(1.0), tint, t.a);
	ROUGHNESS = 0.35;
}
