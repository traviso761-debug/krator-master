// A glowing animated mote (material kind 'anim' with o.basic and o.additive: BIO.animMat's MeshBasicMaterial, additive,
// no depth write): unlit, added to what is behind it, fogged. The vertex stage is shaders/anim_body.gdshaderinc.
shader_type spatial;
render_mode cull_disabled, unshaded, blend_add, depth_draw_never, skip_vertex_transform;

#include "res://shaders/anim_body.gdshaderinc"

void fragment() {
	vec4 tx = anm_texel(UV);
	ALBEDO = k_albedo(k_tex(tx.rgb) * COLOR.rgb * colour);
	ALPHA = tx.a;
}
