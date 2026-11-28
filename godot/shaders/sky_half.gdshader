// Krator's shared sky with its cloud layers in Godot's half-resolution sky pass (GODOT-LOOK-PLAN.md section 5, C9): the
// clouds are the sky's noise (two five-octave fields and a four-octave cirrus a pixel) and hold no edge a half-size
// buffer loses, while the sun's disc, the stars, the moons, the giant and the ridges stay at full size. One composite
// (atmSkyC, generated beside atmSky), so the two shaders cannot drift. krator/sky.gd swaps to this one when its
// half_res_clouds is set (krator/look.gd: the low tier). The radiance map's own half-size pass takes the same branch.
shader_type sky;
render_mode use_half_res_pass;
#include "res://shaders/atmos_sky.gdshaderinc"

uniform vec4 uDustMurk = vec4(0.0);
uniform vec3 uDustCol = vec3(0.54, 0.39, 0.22);

vec3 apply_dust_sky(vec3 c, vec3 dir) {
	float m = clamp(uDustMurk.x, 0.0, 1.0);
	if (m <= 0.0001) {
		return c;
	}
	vec3 d = normalize(dir);
	float wall = exp(-max(d.y, 0.0) / mix(0.14, 0.85, m));
	float veil = clamp(m * (0.55 + 0.55 * wall), 0.0, 0.96);
	vec3 dc = uDustCol * max(uDustMurk.w, 0.55);
	c = mix(c, dc, veil * 0.52);
	float cs = dot(d, normalize(uSunDir));
	float g = 0.74;
	float hg = (1.0 - g * g) / (4.0 * 3.14159265 * pow(max(1.0 + g * g - 2.0 * g * cs, 1e-4), 1.5));
	c += uSunC * mix(vec3(1.0), uDustCol * 1.4, 0.65) * clamp(hg * 0.14, 0.0, 0.75) * uDustMurk.y * smoothstep(-0.08, 0.18, uSunDir.y);
	return c;
}

void sky() {
	if (AT_HALF_RES_PASS) {
		vec3 d = normalize(EYEDIR);
		vec4 cl = atmSkyClouds(d, atmSkyAir(d));
		COLOR = cl.rgb;   // display colour, as the include works in; decoded with the rest below
		ALPHA = cl.a;
	} else {
		vec3 c = apply_dust_sky(atmSkyC(EYEDIR, HALF_RES_COLOR, true), EYEDIR);
		COLOR = pow(max(c, vec3(0.0)), vec3(2.2));
	}
}
