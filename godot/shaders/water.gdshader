// An open water surface from core/export's water section (krator/water_import.gd builds the mesh and sets the uniforms
// from KWater): the library's water (shaders/lib/water.gdshaderinc) drawn the way WATER.draw draws it in three.js
// (core/water/50-core-water-draw.js): the vertex at wtr_surface(rest point), the normal from the trochoids' frame plus
// the field's slope, the whitecaps, and with a bed the shallow-to-deep tint, the surf lap and (transparent) the fade over
// the sand. The mesh is a regular grid in world space (the node at the origin) with `spacing` metres between vertices:
// waves finer than it can carry are faded out of the displacement and kept in the shading, as on the CDLOD mesh. The sky
// in the water is the WorldEnvironment's (WATER.draw's skylight capture is [G native] here).
shader_type spatial;
render_mode blend_mix, cull_back, depth_draw_opaque;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/water.gdshaderinc"

uniform float spacing = 2.0;                 // the grid's vertex spacing (m)
uniform vec3 colour = vec3(0.012, 0.06, 0.08);   // linear (the export's look)
uniform vec3 shallow = vec3(0.025, 0.085, 0.075);
uniform vec3 deep = vec3(0.004, 0.025, 0.03);
uniform vec3 foam_colour = vec3(0.72, 0.80, 0.82);   // PRESETS.foam.color, used as three uses it (as a working, linear value)
uniform float roughness = 0.2;
uniform float metal = 0.2;
uniform bool transparent = false;
uniform float surf_cycles = 153.0;          // the surf lap's cycles per period
uniform float period = 600.0;
uniform vec4 bounds = vec4(-1e9, -1e9, 1e9, 1e9);
uniform vec2 foam_noise = vec2(0.16, 0.9);
// a flat sky in the water, for a page that draws its own water with one (the export's look.sky: colour, base, grazing):
// c = mix(c, sky, base + grazing * (1 - n.v)^3). A surface WATER.draw draws reflects the WorldEnvironment instead (0, 0)
uniform vec3 sky_colour = vec3(0.75, 0.8, 0.84);
uniform vec2 sky_k = vec2(0.0);
// a page whose own water shader takes no light (look.unlit: sedesert's MAT_WATER): its colour is emitted, not lit; the
// sun's highlight still comes from the specular term
uniform bool unlit = false;

varying vec2 v_p0;
varying vec2 v_p;
varying float v_m;

void vertex() {
	vec2 p0 = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xz;
	vec4 s = wtr_surface(p0, spacing);
	v_p0 = p0;
	v_p = s.xz;
	v_m = s.w;
	VERTEX = (inverse(MODEL_MATRIX) * vec4(s.xyz, 1.0)).xyz;
	NORMAL = vec3(0.0, 1.0, 0.0);
}

void fragment() {
	if (v_p.x < bounds.x || v_p.y < bounds.y || v_p.x > bounds.z || v_p.y > bounds.w) discard;
	if (!wtr_wet(v_p)) discard;   // a shore grid: the flood never reached here (a lower hollow beside the lake)
	float mpp = max(length(fwidth(v_p0)), 1e-4);
	vec4 nj = wtr_tro_nj(v_p0, mpp, atm_wave_t);
	vec3 n = wtr_normal(nj, v_p, distance(CAMERA_POSITION_WORLD, vec3(v_p.x, wtr_level, v_p.y)), v_m);
	float dp = wtr_depth(v_p);
	float fk = wtr_foam_t.w * wtr_foam(v_p0, mpp, nj.w)
		* smoothstep(0.55, 0.85, wtr_noise(v_p0 * foam_noise.x) * 0.55 + wtr_noise(v_p0 * foam_noise.y) * 0.45)
		* mix(1.0, 0.45, smoothstep(1.0, 6.0, mpp)) * v_m;
	if (wtr_has_shore) fk = max(fk, wtr_surf_foam(v_p));
	vec3 c = colour;
	float a = 1.0;
	if (wtr_has_bed) {
		c = mix(shallow, deep, smoothstep(0.5, 9.0, dp));
		fk = max(fk, 0.55 * (1.0 - smoothstep(0.1, 1.4, dp)) * (0.5 + 0.5 * sin(dp * 5.0 - 6.283185307 * fract(atm_wave_t * surf_cycles / period) + sin(v_p.x * 0.05) * 2.0)));
		if (transparent) a = mix(0.86, 0.97, smoothstep(0.0, 2.0, dp)) * smoothstep(-0.1, 0.15, dp);
		if (dp < -0.1) discard;   // dry ground inside the surface's bounds: nothing to draw (three's alpha is 0 there too)
	}
	if (sky_k.x + sky_k.y > 0.0) {
		vec3 wp = (INV_VIEW_MATRIX * vec4(VERTEX, 1.0)).xyz;
		float fr = 1.0 - clamp(dot(n, normalize(CAMERA_POSITION_WORLD - wp)), 0.0, 1.0);
		c = mix(c, sky_colour, clamp(sky_k.x + sky_k.y * fr * fr * fr, 0.0, 1.0));
	}
	c = mix(c, foam_colour, fk);
	if (unlit) {
		ALBEDO = vec3(0.0);
		EMISSION = c;
	} else {
		ALBEDO = k_albedo(c);
	}
	ALPHA = a;
	ROUGHNESS = mix(roughness, 0.85, fk);
	METALLIC = metal * (1.0 - fk);
	NORMAL = normalize((VIEW_MATRIX * vec4(n, 0.0)).xyz);
}
