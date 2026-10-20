// An animated fauna body (material kind 'anim', BIO.animMat's Lambert; library hook 'anim'): rays orbiting, darts and
// butterflies flitting, striders' legs and every wing flapping, all in the vertex stage (shaders/anim_body.gdshaderinc).
// Wings and hides are lit from both sides like leaves (three: directDiffuse = front + 0.35 back): BACKLIGHT.
shader_type spatial;
render_mode cull_disabled, diffuse_lambert, specular_disabled, skip_vertex_transform;

#include "res://shaders/anim_body.gdshaderinc"

void fragment() {
	vec4 tx = anm_texel(UV);
	ALBEDO = k_albedo(k_tex(tx.rgb) * COLOR.rgb * colour);
	if (alpha_test > 0.0) {
		ALPHA = tx.a;
		ALPHA_SCISSOR_THRESHOLD = alpha_test;
	}
	BACKLIGHT = vec3(0.35);
}
