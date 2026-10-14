// Still water from core/export's water section (a pool, a trough, a fountain basin: krator/water_import.gd builds its
// flat mesh at the level), drawn as WATER.drawStill draws it (core/water/51-core-water-kinds.js): the sky in it (the
// WorldEnvironment's), a faint ripple and a fountain's rings (wk_still_n; twin WATER.stillNormal).
shader_type spatial;
render_mode blend_mix, cull_back, depth_draw_opaque;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/water_kinds.gdshaderinc"

uniform vec3 colour = vec3(0.018, 0.058, 0.05);   // linear
uniform float roughness = 0.06;
uniform float metal = 0.15;
uniform float opacity = 1.0;

varying vec2 v_w;

void vertex() {
	v_w = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xz;
	NORMAL = vec3(0.0, 1.0, 0.0);
}

void fragment() {
	ALBEDO = k_albedo(colour);
	ALPHA = opacity;
	ROUGHNESS = roughness;
	METALLIC = metal;
	NORMAL = normalize((VIEW_MATRIX * vec4(wk_still_n(v_w), 0.0)).xyz);
}
