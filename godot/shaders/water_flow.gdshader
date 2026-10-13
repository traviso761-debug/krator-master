// A river's ribbon from core/export's water section (krator/water_import.gd builds the mesh from KWater.ribbon: the same
// vertices as core/water's WATER.ribbon), drawn as WATER.drawFlow draws it (core/water/51-core-water-kinds.js): the
// surface falls with the line (the mesh carries it), the normals advected along the current (lib/water_kinds' wk_flow_n),
// white water on the rapids and along the banks, paler toward the banks, fading under them. CUSTOM0 = (vx, vz, slope, bank).
shader_type spatial;
render_mode blend_mix, cull_back, depth_draw_opaque;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/water_kinds.gdshaderinc"

uniform vec3 shallow = vec3(0.16, 0.32, 0.26);   // linear
uniform vec3 deep = vec3(0.012, 0.05, 0.058);
uniform float roughness = 0.12;
uniform float metal = 0.1;
uniform float margin = 1.5;
uniform bool transparent = true;

varying vec4 v_f;
varying vec2 v_w;

void vertex() {
	v_f = CUSTOM0;
	v_w = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xz;
	NORMAL = vec3(0.0, 1.0, 0.0);
}

void fragment() {
	vec2 v = v_f.xy;
	float p0 = fract(atm_wave_t * wk_flow_t.x);
	float w0 = 1.0 - abs(2.0 * p0 - 1.0);
	float nz = mix(wk_noise((v_w - v * fract(p0 + 0.5) * wk_flow_t.y) * 0.55 + 7.3), wk_noise((v_w - v * p0 * wk_flow_t.y) * 0.55), w0);
	float fo = wk_flow_foam(v_f.z, v_f.w);
	float fk = fo * smoothstep(0.35, 0.75, nz + 0.25 * fo);
	vec3 c = mix(shallow, deep, smoothstep(0.3, 3.5, v_f.w));
	c = mix(c, vec3(0.86, 0.9, 0.9), fk);
	ALBEDO = k_albedo(c);
	ALPHA = transparent ? mix(0.78, 0.95, smoothstep(0.0, 3.0, v_f.w)) * smoothstep(-margin, 0.25, v_f.w) : 1.0;
	ROUGHNESS = mix(roughness, 0.8, fk);
	METALLIC = metal;
	NORMAL = normalize((VIEW_MATRIX * vec4(wk_flow_n(v_w, v, v_f.z), 0.0)).xyz);
}
