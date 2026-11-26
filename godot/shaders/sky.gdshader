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

uniform vec4 uDustMurk = vec4(0.0);               // x: murk 0..1, y: sun Mie aureole 0..1, z: ceiling sharpness, w: lit scale
uniform vec3 uDustCol = vec3(0.54, 0.39, 0.22);   // display-space dust/storm tint

vec3 apply_dust_sky(vec3 c, vec3 dir) {
	float m = clamp(uDustMurk.x, 0.0, 1.0);
	if (m <= 0.0001) {
		return c;
	}
	vec3 d = normalize(dir);
	// Horizon dust wall arrives first and climbs toward zenith as murk thickens
	float wall = exp(-max(d.y, 0.0) / mix(0.14, 0.85, m));
	float veil = clamp(m * (0.55 + 0.55 * wall), 0.0, 0.96);
	vec3 dc = uDustCol * max(uDustMurk.w, 0.55);
	c = mix(c, dc, veil * 0.52);
	// Broad Henyey-Greenstein Mie dust aureole around the dimmed sun
	float cs = dot(d, normalize(uSunDir));
	float g = 0.74;
	float hg = (1.0 - g * g) / (4.0 * 3.14159265 * pow(max(1.0 + g * g - 2.0 * g * cs, 1e-4), 1.5));
	c += uSunC * mix(vec3(1.0), uDustCol * 1.4, 0.65) * clamp(hg * 0.14, 0.0, 0.75) * uDustMurk.y * smoothstep(-0.08, 0.18, uSunDir.y);
	return c;
}

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
		c = apply_dust_sky(c, EYEDIR);
		COLOR = pow(max(c, vec3(0.0)), vec3(2.2));
	}
}
