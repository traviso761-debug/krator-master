// Krator's shared sky with its cloud layers in Godot's half-resolution sky pass (GODOT-LOOK-PLAN.md section 5, C9): the
// clouds are the sky's noise (two five-octave fields and a four-octave cirrus a pixel) and hold no edge a half-size
// buffer loses, while the sun's disc, the stars, the moons, the giant and the ridges stay at full size. One composite
// (atmSkyC, generated beside atmSky), so the two shaders cannot drift. krator/sky.gd swaps to this one when its
// half_res_clouds is set (krator/look.gd: the low tier). The radiance map's own half-size pass takes the same branch.
shader_type sky;
render_mode use_half_res_pass;
#include "res://shaders/atmos_sky.gdshaderinc"

void sky() {
	if (AT_HALF_RES_PASS) {
		vec3 d = normalize(EYEDIR);
		vec4 cl = atmSkyClouds(d, atmSkyAir(d));
		COLOR = cl.rgb;   // display colour, as the include works in; decoded with the rest below
		ALPHA = cl.a;
	} else {
		vec3 c = atmSkyC(EYEDIR, HALF_RES_COLOR, true);
		COLOR = pow(max(c, vec3(0.0)), vec3(2.2));
	}
}
