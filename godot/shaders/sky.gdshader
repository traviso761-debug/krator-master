// Krator's shared sky as a Godot Sky (core/atmos/SKY-PLAN.md, section 4): the generated include draws every layer;
// krator/sky.gd sets its uniforms each frame from the sky model. The chunk works in display colour, as the three.js
// pages draw it untonemapped; Godot's sky radiance is linear, so the colour is decoded here.
// The volumetric clouds (W6, core/atmos/sky/89-atmos-m-volclouds.js): with uVolOn the flat cumulus steps aside and the
// quarter-res pass marches the volumes (atmVolSky, the pages' march with the footprint from the same field), laid over the
// sky here; the radiance cubemap keeps the flat layer (its pass is small and the volumes would cost it every update).
shader_type sky;
render_mode use_quarter_res_pass;
#include "res://shaders/atmos_sky.gdshaderinc"
#include "res://shaders/atmos_volclouds.gdshaderinc"

void sky() {
	if (AT_QUARTER_RES_PASS) {
		vec4 v = vec4(0.0);
		if (uVolOn > 0.5) {
			v = atmVolSky(EYEDIR, uCamPos, fract(52.9829189 * fract(dot(FRAGCOORD.xy, vec2(0.06711056, 0.00583715))) + uVolP.y));
		}
		COLOR = v.rgb;
		ALPHA = v.a;
	} else {
		vec3 c = atmSky(EYEDIR);
		if (uVolOn > 0.5 && !AT_CUBEMAP_PASS) {
			c = c * (1.0 - QUARTER_RES_COLOR.a) + QUARTER_RES_COLOR.rgb;
		}
		COLOR = pow(max(c, vec3(0.0)), vec3(2.2));
	}
}
