// What lies underfoot (GODOT-LOOK-PLAN.md P7; krator/world_grass.gd): stones, twigs, leaf litter and flowers as small
// instanced geometry within a dozen metres of the camera, so the ground at arm's length is not a painted plane.
//   INSTANCE_CUSTOM.rgb  the instance's colour, linear (a stone takes the ground's rock tone, a flower its own)
//   INSTANCE_CUSTOM.a    0..1 a variant; COLOR.r of the mesh: 1 where a flower's petals are (they keep their colour and glow through)
// Shrinks to nothing at the ring's edge, so nothing pops; glossier in a wet world (atm_wet).
shader_type spatial;
render_mode cull_disabled;

#include "res://shaders/kcolour.gdshaderinc"

global uniform float atm_wet;
uniform float fade_start = 8.0;
uniform float fade_end = 11.5;
uniform float rough = 0.85;

varying vec3 v_col;
varying float v_petal;

void vertex() {
	vec3 cam_w = INV_VIEW_MATRIX[3].xyz;
	vec3 base = (MODEL_MATRIX * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
	VERTEX *= 1.0 - smoothstep(fade_start, fade_end, length(base - cam_w));
	v_col = INSTANCE_CUSTOM.rgb;
	v_petal = COLOR.r;
}

void fragment() {
	if (!FRONT_FACING) {
		NORMAL = -NORMAL;
	}
	vec3 c = v_col * mix(0.82, 1.0, v_petal);
	c *= mix(1.0, 0.7, clamp(atm_wet, 0.0, 1.0) * (1.0 - v_petal));
	ALBEDO = k_albedo(c);
	ROUGHNESS = mix(rough, 0.3, 0.7 * clamp(atm_wet, 0.0, 1.0));
	SPECULAR = 0.35;
	BACKLIGHT = k_albedo(c * 0.4 * v_petal);
}
