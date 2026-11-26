// Krator's shared sky as a Godot Sky (core/atmos/SKY-PLAN.md, section 4): the generated include draws every layer;
// krator/sky.gd sets its uniforms each frame from the sky model. The chunk works in display colour, as the three.js
// pages draw it untonemapped; Godot's sky radiance is linear, so the colour is decoded here.
shader_type sky;
#include "res://shaders/atmos_sky.gdshaderinc"

void sky() {
	vec3 c = atmSky(EYEDIR);
	COLOR = pow(max(c, vec3(0.0)), vec3(2.2));
}
