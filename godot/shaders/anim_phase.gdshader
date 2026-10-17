// A body that beats on its own phase (material kind 'anim-phase': swbay's and nwbay's animMat, a Lambert with vertex
// colours, both sides): mode 0 'bird' (the wings fold on |x| > 0.12 and the body bobs), 1 'swim' (a bob and a pitch
// along z), 2 'grazer' (the legs under y 0.5 swing in diagonal pairs). Line for line the kits' GLSL (lib/anim-phase.gdshaderinc), uT = the wind clock
// (three's BIO.WIND.t, atm_time here), aPh the instance's rate and phase (INSTANCE_CUSTOM.x: krator/biome_import.gd and
// krator/gltf_instancing.gd pack it). The path itself is the baked motion (krator/kmotion.gd), not this shader.
shader_type spatial;
render_mode cull_disabled, diffuse_lambert, specular_disabled;

#include "res://shaders/atmos.gdshaderinc"
#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/anim-phase.gdshaderinc"

uniform int mode = 0;
uniform vec3 colour = vec3(1.0);

void vertex() {
	VERTEX = aph_beat(mode, VERTEX, atm_time, INSTANCE_CUSTOM.x);
}

void fragment() {
	ALBEDO = k_albedo(COLOR.rgb * colour);
}
