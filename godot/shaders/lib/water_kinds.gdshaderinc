// The shader library: hook 'water' (core/water/README.md, "Godot"), its other kinds: FLOW (a river's ribbon), FALL (an
// arcing curtain and its plunge pool) and STILL (a pool, a trough, a fountain basin), the same maths as
// core/water/51-core-water-kinds.js's chunks (WATER.flowGLSL, fallGLSL, stillGLSL) with their numbers as uniforms, set
// by krator/water.gd (KWater.kind_uniforms) from core/export's water section. Twins: WATER.flowNormal, flowFoam,
// fallStreak, fallFoam, plungeAt, stillNormal (22-core-water-flow.js), and KWater's flow_normal ... still_normal.
// One clock: the global atm_wave_t, every pattern a whole number of cycles per wave period.
#ifndef K_WATER_KINDS
#define K_WATER_KINDS
#include "res://shaders/atmos_waves.gdshaderinc"

// ---- the value noise (WATER.hash2, WATER.noiseP: repeats every `per` cells in y)
float wk_hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float wk_noise(vec2 p) {
	vec2 i = floor(p); vec2 u = fract(p); u = u * u * (3.0 - 2.0 * u);
	return mix(mix(wk_hash(i), wk_hash(i + vec2(1.0, 0.0)), u.x), mix(wk_hash(i + vec2(0.0, 1.0)), wk_hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float wk_noise_p(vec2 p, float per) {
	vec2 i = floor(p); vec2 u = fract(p);
	float a = u.x * u.x * (3.0 - 2.0 * u.x); float b = u.y * u.y * (3.0 - 2.0 * u.y);
	float j0 = i.y - per * floor(i.y / per); float j1 = (i.y + 1.0) - per * floor((i.y + 1.0) / per);
	float h00 = wk_hash(vec2(i.x, j0)); float h10 = wk_hash(vec2(i.x + 1.0, j0));
	float h01 = wk_hash(vec2(i.x, j1)); float h11 = wk_hash(vec2(i.x + 1.0, j1));
	return (h00 * (1.0 - a) + h10 * a) * (1.0 - b) + (h01 * (1.0 - a) + h11 * a) * b;
}

// ---- FLOW: ripples advected along the current (the flow-map trick), rougher on the rapids
uniform int wk_rip_n = 0;
uniform vec4 wk_rip[4];                          // (slope, 2 pi / wavelength, cos a, sin a): a turned from the current
uniform vec4 wk_flow_t = vec4(0.25, 4.0, 1.147, 1.891);   // (phases per second, seconds per phase, 0.37 l0, 0.61 l0)
uniform vec4 wk_flow_r = vec4(0.012, 0.07, 2.4, 1.6);     // (rapids from, rapids to, rapids gain, edge m)
uniform vec2 wk_flow_f = vec2(0.75, 0.45);                 // foam: (rapids, edge)

vec2 wk_rip_g(vec2 q, vec2 c) {
	vec2 g = vec2(0.0);
	for (int i = 0; i < 4; i++) {
		if (i >= wk_rip_n) break;
		vec2 d = vec2(c.x * wk_rip[i].z - c.y * wk_rip[i].w, c.y * wk_rip[i].z + c.x * wk_rip[i].w);
		g += cos((q.x * d.x + q.y * d.y) * wk_rip[i].y) * wk_rip[i].x * d;
	}
	return g;
}
vec3 wk_flow_n(vec2 p, vec2 v, float slope) {
	float p0 = fract(atm_wave_t * wk_flow_t.x);
	float p1 = fract(p0 + 0.5);
	float T = wk_flow_t.y;
	float sp = length(v);
	vec2 c = sp > 1.0e-6 ? v / sp : vec2(1.0, 0.0);
	vec2 g0 = wk_rip_g(p - v * p0 * T, c);
	vec2 g1 = wk_rip_g(p - v * p1 * T + wk_flow_t.zw, c);
	float w0 = 1.0 - abs(2.0 * p0 - 1.0);
	float k = 1.0 + wk_flow_r.z * smoothstep(wk_flow_r.x, wk_flow_r.y, slope);
	vec2 s = (g0 * w0 + g1 * (1.0 - w0)) * k;
	return normalize(vec3(-s.x, 1.0, -s.y));
}
float wk_flow_foam(float slope, float bank) {
	return max(wk_flow_f.x * smoothstep(wk_flow_r.x, wk_flow_r.y, slope), wk_flow_f.y * (1.0 - smoothstep(0.0, wk_flow_r.w, bank)));
}

// ---- FALL: streaks that fall with the water, the aeration toward the foot, the plunge pool's churn
uniform vec4 wk_fall = vec4(0.5, 1.0, 10.0, 0.0);          // (streak cycles per second, tFall x that, lip width x across, 0)
uniform vec4 wk_plunge = vec4(0.0, 0.0, 10.0, 0.0);        // (x, z, r, 0)
uniform vec2 wk_plunge_k = vec2(0.2857, 0.3667);           // (1 / ring wavelength, ring cycles per second)

float wk_streak(float u, float fl) {
	float th = fract(atm_wave_t * wk_fall.x - fl * wk_fall.y);
	float lw = wk_fall.z;
	return 0.55 * wk_noise_p(vec2(u * (lw * 2.2), th * 6.0), 6.0) + 0.3 * wk_noise_p(vec2(u * (lw * 5.1) + 3.7, th * 14.0), 14.0)
		+ 0.15 * wk_noise_p(vec2(u * (lw * 11.0) + 9.1, th * 30.0), 30.0);
}
float wk_fall_foam(float fl, float s) { return clamp(0.25 + 0.6 * smoothstep(0.0, 0.4, fl) + 0.7 * (s - 0.5), 0.0, 1.0); }
vec2 wk_plunge_at(vec2 p) {
	vec2 d = p - wk_plunge.xy;
	float r = length(d);
	float ph = fract(atm_wave_t * wk_plunge_k.y);
	float a = 6.283185307 * (fract(r * wk_plunge_k.x) - ph);
	float e = exp(-r / wk_plunge.z);
	float nz = wk_noise_p(vec2(d.x * 0.45 + d.y * 0.21, ph * 12.0 + r * 0.3), 12.0);
	return vec2(e * clamp(0.35 + 0.25 * sin(a) + 0.8 * (nz - 0.35), 0.0, 1.0), 0.08 * e * sin(a));
}

// ---- STILL: a faint ripple, a fountain's rings
uniform int wk_still_n = 0;
uniform vec4 wk_still[4];                        // (slope, cos a / wavelength, sin a / wavelength, cycles per second)
uniform vec4 wk_still_d[4];                      // (cos a, sin a, 0, 0)
uniform vec4 wk_fountain = vec4(0.0, 0.0, 0.0, 0.0);      // (x, z, on, 0)
uniform vec4 wk_fountain_k = vec4(1.667, 0.7, 0.333, 0.0); // (1 / ring wavelength, cycles per second, 1 / decay r, 0)

vec3 wk_still_n(vec2 p) {
	vec2 s = vec2(0.0);
	for (int i = 0; i < 4; i++) {
		if (i >= wk_still_n) break;
		float c = cos(6.283185307 * (fract(p.x * wk_still[i].y) + fract(p.y * wk_still[i].z) - fract(atm_wave_t * wk_still[i].w))) * wk_still[i].x;
		s += c * wk_still_d[i].xy;
	}
	if (wk_fountain.z > 0.5) {
		vec2 dv = p - wk_fountain.xy;
		float r = length(dv);
		if (r > 1.0e-6) {
			float c = cos(6.283185307 * (fract(r * wk_fountain_k.x) - fract(atm_wave_t * wk_fountain_k.y))) * 0.06 * exp(-r * wk_fountain_k.z);
			s += c * dv / r;
		}
	}
	return normalize(vec3(-s.x, 1.0, -s.y));
}
#endif
