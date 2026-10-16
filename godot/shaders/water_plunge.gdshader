// A fall's plunge pool: a disc of churned white water at the curtain's foot, its rings running out (wk_plunge_at; twin
// WATER.plungeAt), as WATER.drawFall draws it (core/water/51-core-water-kinds.js).
shader_type spatial;
render_mode blend_mix, cull_back, depth_draw_never;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/water_kinds.gdshaderinc"

varying vec2 v_w;

void vertex() {
	v_w = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xz;
}

void fragment() {
	vec2 pl = wk_plunge_at(v_w);
	ALBEDO = k_albedo(vec3(0.87, 0.91, 0.91));
	ALPHA = clamp(pl.x * 1.15, 0.0, 0.95);
	ROUGHNESS = 0.6;
}
