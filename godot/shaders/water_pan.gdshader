// A salt pan (core/water/ext/54, WATER.pan; drawn as WATER.drawPan draws it, 54b's wtrPan): crust in polygon cells whose cracks wet first after
// rain and whose low cells flood with brine by the wetness (the weather's W.wet: `wet`, set each frame by the port). Twin: KWater.pan_at.
// krator/water_import.gd builds the flat mesh `lift` over the level and sets the uniforms from the record.
shader_type spatial;
render_mode blend_mix, cull_back, depth_draw_opaque;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/water_cells.gdshaderinc"

uniform float cell = 3.0;
uniform float jitter = 0.85;
uniform float crack = 0.07;
uniform float flood = 0.55;
uniform vec3 salt = vec3(0.937, 0.918, 0.878);    // the record's colours as the page writes them (display values used as three uses them)
uniform vec3 crack_colour = vec3(0.722, 0.643, 0.529);
uniform float damp_k = 0.7;
uniform vec3 brine = vec3(0.17, 0.61, 0.57);
uniform vec2 rough = vec2(0.85, 0.08);
uniform float wet = 0.0;

varying vec2 v_w;

void vertex() {
	v_w = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xz;
	NORMAL = vec3(0.0, 1.0, 0.0);
}

void fragment() {
	vec4 C = wc_cells(v_w, cell, jitter);
	float c = wc_crack(C, crack);
	float low = wc_h(C.zw + vec2(3.1, 11.7));
	float w = clamp(wet, 0.0, 1.0);
	float film = max(c * smoothstep(0.0, 0.3, w), smoothstep(low, low + 0.12, w * flood));
	float damp = smoothstep(0.0, 0.5, w);
	vec3 col = mix(salt, crack_colour, c);
	col = mix(col, col * damp_k, damp);
	col = mix(col, brine, film * 0.9);
	ALBEDO = k_albedo(col);
	ROUGHNESS = mix(rough.x, rough.y, max(film, damp * 0.3));
	METALLIC = 0.0;
}
