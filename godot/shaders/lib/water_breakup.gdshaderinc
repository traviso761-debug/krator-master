// The breakup (core/water/ext/56-core-water-breakup.js, WATER.breakupGLSL): natural ripples over water drawn from a few sines. The surface's own
// slope times a slow noise envelope (bk_env over bk_env_size m: the stripes come and go in patches), plus two octaves of value-noise chop
// (bk_amp, bk_size m and half) drifting with bk_drift (open and still water) or with the current (a ribbon: wb_breakup_f), cross-faded over two
// phases (bk_t: phases per second of the clock, seconds per phase; whole cycles per wave period). Shading only. Off unless bk_on.
// Twin: KWater.breakup (krator/water.gd); krator/water_import.gd sets the uniforms (KWater.breakup_uniforms).
#ifndef K_WATER_BREAKUP
#define K_WATER_BREAKUP
#include "res://shaders/atmos_waves.gdshaderinc"

uniform bool bk_on = false;
uniform float bk_amp = 0.05;
uniform float bk_size = 4.0;
uniform vec2 bk_env = vec2(0.35, 1.3);
uniform float bk_env_size = 38.0;
uniform vec2 bk_drift = vec2(0.35, 0.22);
uniform vec2 bk_t = vec2(0.14166666666666666, 7.0588235294117645);

float wb_h(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float wb_n(vec2 p) {
	vec2 i = floor(p); vec2 u = p - i; vec2 a = u * u * (3.0 - 2.0 * u);
	return mix(mix(wb_h(i), wb_h(i + vec2(1.0, 0.0)), a.x), mix(wb_h(i + vec2(0.0, 1.0)), wb_h(i + vec2(1.0, 1.0)), a.x), a.y);
}
vec2 wb_g(vec2 p, float q, float s) {
	float e = 0.35 * s;
	return vec2(wb_n(vec2(p.x + e, p.y) * q) - wb_n(vec2(p.x - e, p.y) * q), wb_n(vec2(p.x, p.y + e) * q) - wb_n(vec2(p.x, p.y - e) * q)) / 0.7;
}
vec2 wb_c(vec2 p) { return wb_g(p, 1.0 / bk_size, bk_size) + 0.5 * wb_g(p + vec2(17.3, -9.1), 2.0 / bk_size, bk_size / 2.0); }
vec3 wb_breakup_v(vec3 n, vec2 p, vec2 d) {
	float p0 = fract(atm_wave_t * bk_t.x); float p1 = fract(p0 + 0.5); float w0 = 1.0 - abs(2.0 * p0 - 1.0);
	vec2 s = -n.xz / n.y;
	s *= bk_env.x + (bk_env.y - bk_env.x) * wb_n(vec2(p.x / bk_env_size + 3.7, p.y / bk_env_size - 1.3));
	d *= bk_t.y;
	s += bk_amp * (wb_c(p - d * p0) * w0 + wb_c(p - d * p1 + vec2(5.3, 2.9)) * (1.0 - w0));
	return normalize(vec3(-s.x, 1.0, -s.y));
}
vec3 wb_breakup(vec3 n, vec2 p) { return wb_breakup_v(n, p, bk_drift); }
vec3 wb_breakup_f(vec3 n, vec2 p, vec2 v) { return wb_breakup_v(n, p, v); }
#endif
