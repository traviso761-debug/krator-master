// A fall's curtain from core/export's water section (krator/water_import.gd builds the mesh from KWater.curtain: the
// curtain ARCS, a parabola from the lip speed, widening toward its foot), drawn as WATER.drawFall draws it
// (core/water/51-core-water-kinds.js): streaks that fall with the water (wk_streak), whiter toward the foot, thinning at
// its edges and toward the spray. UV = (u across the lip, f down the fall).
shader_type spatial;
render_mode blend_mix, cull_disabled, depth_draw_never;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/water_kinds.gdshaderinc"

uniform vec3 colour = vec3(0.48, 0.66, 0.68);   // linear
uniform float opacity = 0.92;

void fragment() {
	float st = wk_streak(UV.x, UV.y);
	float fm = wk_fall_foam(UV.y, st);
	ALBEDO = k_albedo(mix(colour, vec3(0.95, 0.97, 0.97), fm));
	ALPHA = opacity * (0.45 + 0.55 * smoothstep(0.25, 0.8, st)) * smoothstep(0.0, 0.08, UV.x) * smoothstep(1.0, 0.92, UV.x) * mix(1.0, 0.6, smoothstep(0.55, 1.0, UV.y));
	ROUGHNESS = 0.42;
	METALLIC = 0.0;
}
