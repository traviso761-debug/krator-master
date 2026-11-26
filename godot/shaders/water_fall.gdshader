// A fall's curtain from core/export's water section (krator/water_import.gd builds the mesh from KWater.curtain: the
// curtain ARCS, a parabola from the lip speed, widening toward its foot), drawn as WATER.drawFall draws it
// (core/water/51-core-water-kinds.js): streaks that fall with the water (wk_streak), whiter toward the foot, thinning at
// its edges and toward the spray. UV = (u across the lip, f down the fall).
// lip_k and foot_k (drawFall's lipK and footK, 2026-10-26/27; < 0: off, the old curtain): its alpha solid at the lip, and held toward its foot
// (white water arriving at its pool) instead of thinning to 0.6 of itself.
shader_type spatial;
render_mode blend_mix, cull_disabled, depth_draw_never;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/water_kinds.gdshaderinc"

uniform vec3 colour = vec3(0.48, 0.66, 0.68);   // linear
uniform float opacity = 0.92;
// the side fade (core/water W1, 2026-10-26): side_margin < 0 is the old fade over 8% of u at each side; else metres in from the lip's edge
// (u runs past 0..1 by margin / lip_w), from -side_margin to side_edge (WATER.curtainSide)
uniform float side_margin = -1.0;
uniform float side_edge = 0.0;
uniform float lip_w = 1.0;
uniform float lip_k = -1.0;
uniform float foot_k = -1.0;

float side(float u) {
	if (side_margin < 0.0) {
		return smoothstep(0.0, 0.08, u) * smoothstep(1.0, 0.92, u);
	}
	return smoothstep(-side_margin, side_edge, min(u, 1.0 - u) * lip_w);
}

void fragment() {
	float st = wk_streak(UV.x, UV.y);
	float fm = wk_fall_foam(UV.y, st);
	ALBEDO = k_albedo(mix(colour, vec3(0.95, 0.97, 0.97), fm));
	float base = lip_k < 0.0 ? 0.45 : min(1.0, mix(lip_k, 0.45, smoothstep(0.0, 0.35, UV.y)));
	float a = opacity * (base + 0.55 * smoothstep(0.25, 0.8, st)) * side(UV.x);
	ALPHA = foot_k < 0.0 ? a * mix(1.0, 0.6, smoothstep(0.55, 1.0, UV.y)) : max(a, opacity * foot_k * smoothstep(0.3, 1.0, UV.y) * side(UV.x));
	ROUGHNESS = 0.42;
	METALLIC = 0.0;
}
