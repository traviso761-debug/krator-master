// A frozen lake (core/water/ext/54, WATER.ice; drawn as WATER.drawIce draws it, 54b's wtrIce): black ice cracked in big polygons, a salt rim, snow
// round the drifts. The rim and the drift come from the bake (ice_map: R rim, G drift normalised by the deepest; KWater.ice_bake, the page's
// I.bake), over box (x0, z0, width, depth). Twin: KWater.ice_colour. The drifts themselves are their own mesh (KWater.drift_mesh).
shader_type spatial;
render_mode blend_mix, cull_back, depth_draw_opaque;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/water_cells.gdshaderinc"

uniform sampler2D ice_map : filter_linear, repeat_disable;
uniform vec4 box = vec4(0.0, 0.0, 1.0, 1.0);
uniform float crack_cell = 22.0;
uniform float crack_jitter = 0.8;
uniform float crack_width = 0.035;
uniform bool salt_rim = false;
uniform vec3 ice = vec3(0.106, 0.165, 0.192);
uniform vec3 crack_colour = vec3(0.776, 0.867, 0.902);
uniform vec3 salt = vec3(0.925, 0.89, 0.812);
uniform vec3 snow = vec3(0.89, 0.918, 0.925);
uniform vec2 rough = vec2(0.12, 0.9);

varying vec2 v_w;

void vertex() {
	v_w = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xz;
	NORMAL = vec3(0.0, 1.0, 0.0);
}

void fragment() {
	vec2 uv = (v_w - box.xy) / box.zw;
	vec2 rd = (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) ? vec2(0.0) : texture(ice_map, uv).xy;
	float c = wc_crack(wc_cells(v_w, crack_cell, crack_jitter), crack_width);
	vec3 col = mix(ice, crack_colour, c * 0.8);
	if (salt_rim) col = mix(col, salt, rd.x);
	col = mix(col, snow, smoothstep(0.0, 0.25, rd.y));
	ALBEDO = k_albedo(col);
	ROUGHNESS = mix(rough.x, rough.y, smoothstep(0.0, 0.25, rd.y));
	METALLIC = 0.0;
}
