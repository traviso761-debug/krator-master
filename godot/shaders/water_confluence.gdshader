// A confluence (core/water/ext/55, WATER.drawConfluence) from the export's group record: one surface over a junction, its grid built by
// krator/water_import.gd (KWater.confluence_mesh: the page's C.mesh()), shaded with the ribbon's own text (water_flow.gdshader: the colour from
// the bank distance, foam from the slope and the bank, the ripples advected by wk_flow_n along its blended current), its alpha times the disc's
// weight, a faint churn where the currents meet. CUSTOM0 = (vx, vz, slope, bank), CUSTOM1 = (fade, meet).
shader_type spatial;
render_mode blend_mix, cull_back, depth_draw_opaque;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/water_kinds.gdshaderinc"
#include "res://shaders/lib/water_breakup.gdshaderinc"

uniform vec3 shallow = vec3(0.16, 0.32, 0.26);   // linear
uniform vec3 deep = vec3(0.012, 0.05, 0.058);
uniform float roughness = 0.12;
uniform float metal = 0.1;
uniform float margin = 1.5;
uniform float meet_k = 0.12;

varying vec4 v_f;
varying vec2 v_m;
varying vec2 v_w;

void vertex() {
	v_f = CUSTOM0;
	v_m = CUSTOM1.xy;
	v_w = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xz;
	NORMAL = vec3(0.0, 1.0, 0.0);
}

void fragment() {
	vec2 v = v_f.xy;
	float p0 = fract(atm_wave_t * wk_flow_t.x);
	float w0 = 1.0 - abs(2.0 * p0 - 1.0);
	float nz = mix(wk_noise((v_w - v * fract(p0 + 0.5) * wk_flow_t.y) * 0.55 + 7.3), wk_noise((v_w - v * p0 * wk_flow_t.y) * 0.55), w0);
	float fb = min(1.0, wk_flow_foam(v_f.z, v_f.w) + meet_k * v_m.y);
	float fk = fb * smoothstep(0.42, 0.82, nz + 0.15 * fb);
	vec3 c = mix(shallow, deep, smoothstep(0.3, 3.5, v_f.w));
	c = mix(c, vec3(0.86, 0.9, 0.9), fk);
	ALBEDO = k_albedo(c);
	ALPHA = mix(0.78, 0.95, smoothstep(0.0, 3.0, v_f.w)) * smoothstep(-margin, 0.25, v_f.w) * v_m.x;
	ROUGHNESS = mix(roughness, 0.8, fk);
	METALLIC = metal;
	vec3 n = wk_flow_n(v_w, v, v_f.z);
	if (bk_on) {
		n = wb_breakup_f(n, v_w, v);
	}
	NORMAL = normalize((VIEW_MATRIX * vec4(n, 0.0)).xyz);
}
