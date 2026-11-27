// Ground-hugging 3D open-world road & village track ribbon (krator/world_stream.gd RoadRibbon).
// UV.x spans [-1.45, +1.45] across the cross-section ([-1, +1] compacted carriageway, +/-1..1.45 feathered gravel shoulder);
// UV.y is cumulative arc distance in metres along the road.
shader_type spatial;
render_mode blend_mix, depth_draw_opaque, cull_back;

#include "res://shaders/kcolour.gdshaderinc"

uniform vec3 road_colour = vec3(0.39, 0.35, 0.28);
uniform vec3 shoulder_colour = vec3(0.33, 0.30, 0.24);
uniform float roughness_val = 0.88;

float rd_hash(vec2 p) {
	vec3 q = fract(vec3(p.xyx) * 0.1031);
	q += dot(q, q.yzx + 33.33);
	return fract((q.x + q.y) * q.z);
}

float rd_noise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	return mix(
		mix(rd_hash(i), rd_hash(i + vec2(1.0, 0.0)), f.x),
		mix(rd_hash(i + vec2(0.0, 1.0)), rd_hash(i + vec2(1.0, 1.0)), f.x),
		f.y
	);
}

void fragment() {
	float ax = abs(UV.x);
	float grit = rd_noise(vec2(UV.x * 5.5, UV.y * 1.35)) * 0.65 + rd_noise(vec2(UV.x * 16.0, UV.y * 4.2)) * 0.35;
	float rut = exp(-pow((ax - 0.46) / 0.18, 2.0));
	float sh = smoothstep(0.88, 1.38, ax);
	vec3 base = mix(road_colour, shoulder_colour, sh);
	base *= 0.90 + 0.18 * grit - 0.07 * rut * (1.0 - sh);
	ALBEDO = k_albedo(base);
	ROUGHNESS = clamp(roughness_val + 0.06 * sh - 0.04 * rut, 0.55, 0.98);
	METALLIC = 0.0;
	ALPHA = 1.0 - smoothstep(1.05, 1.44, ax);
}
