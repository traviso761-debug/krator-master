// The shader library: hook 'water' (godot/README.md, "The shader library"; core/water/README.md, "Godot"). The open
// surface of core/water, the same maths as WATER.glsl (core/water/50-core-water-draw.js) and its CPU twins
// (20-core-water.js), read from core/export's water section (krator-water) instead of written as literals: one shader
// for every surface, its waves as uniform arrays (options are uniforms, not #defines). The CPU twin in Godot is
// krator/water.gd (KWater), which krator/water_import.gd also uses to set these uniforms.
//   a rest point p0 moves to p = p0 + m * sum H D cos(th), y = level + m * (sum A sin(th) + field * atm_wave_height(p)),
//   th = 2 pi (fract(p0.x tx) + fract(p0.z tz) - fract(t tc)) + phase, m = smoothstep(0, damp, depth) from the bed
// The clock is the global atm_wave_t (the Atmos autoload: the module clock wrapped at PRESETS.waves.period, which the
// section's period must equal). Each wave's products (H dx, A k dx, dx dz...) come premultiplied, in doubles, as
// WATER.glsl writes them as literals, so the float rounding is the same. Functions:
//   wtr_surface(p0, sp)  the drawn point (x, y, z, m) for rest point p0, vertex spacing sp (twin: S.surfaceAt)
//   wtr_height(p)        the height at a world point, 3 Newton steps (twin: S.heightAt with 3 steps)
//   wtr_tro_nj(p0, mpp, t), wtr_normal(nj, p, d, m)   the shading frame and normal (twins: troNJ, S.normalAt)
//   wtr_foam(p0, mpp, j0), wtr_depth(p), wtr_damp(p)  the decayed whitecap, the bed's depth and its calm
#ifndef K_WATER
#define K_WATER
#include "res://shaders/atmos_waves.gdshaderinc"

const int WTR_MAX = 8;
uniform int wtr_n = 0;                              // trochoids (at most WTR_MAX)
uniform vec4 wtr_k[8];                              // (tx, tz, tc, phase): turns per metre in x and z, cycles per second
uniform vec4 wtr_a[8];                              // (A, H dx, H dz, k)
uniform vec4 wtr_q[8];                              // (H k, A k dx, A k dz, 0)
uniform vec4 wtr_dd[8];                             // (dx dx, dx dz, dz dz, 0)
uniform float wtr_level = 0.0;                      // the level now
uniform float wtr_base = 0.0;                       // the level the bed was baked at
uniform float wtr_field = 0.0;                      // the share of the shared wave field (0 without core/atmos)
uniform float wtr_chop = 0.0;                       // the field's chop displaced (0: it only shades)
uniform float wtr_kchop = 0.0;                      // the chop's largest wave number
uniform float wtr_tilt_k = 0.0;                     // field * tilt * presets.waves.tilt: the field's shading slope
uniform vec2 wtr_lod = vec2(1.2, 2.4);              // a wave's displacement fades as k * spacing goes a..b
uniform vec2 wtr_px = vec2(0.35, 1.1);              // its shading fades as k * (metres per pixel) goes a..b
uniform float wtr_damp_depth = 3.0;                 // metres of depth over which the bed calms the water
uniform bool wtr_has_bed = false;
uniform sampler2D wtr_bed : filter_linear, repeat_disable;   // the bed's bytes (RGBA8, raw: R the deep channel, G the fine)
uniform vec4 wtr_bed_box = vec4(0.0, 0.0, 1.0, 1.0);        // (x0, z0, 1 / (cell nx), 1 / (cell nz))
uniform vec4 wtr_bed_enc = vec4(-2.0, 5.0, -4.0, 44.0);     // (fine0, fine1 - fine0, deep0, deep1 - deep0): PRESETS.bed
uniform vec2 wtr_foam_j = vec2(0.3, 0.5);                   // PRESETS.foam.j
uniform vec4 wtr_foam_t = vec4(4.0, 0.45, 1.8, 0.8);        // (taps, step s, decay s, amount)

float wtr_ph(vec2 p, vec3 k, float ph, float t) {
	return 6.283185307 * (fract(p.x * k.x) + fract(p.y * k.y) - fract(t * k.z)) + ph;
}

// the trochoids' displacement of rest point p at time t: (dx, h, dz), each faded by k * sp
vec3 wtr_tro_d(vec2 p, float sp, float t) {
	vec3 r = vec3(0.0);
	for (int i = 0; i < WTR_MAX; i++) {
		if (i >= wtr_n) break;
		float a = wtr_ph(p, wtr_k[i].xyz, wtr_k[i].w, t);
		float l = 1.0 - smoothstep(wtr_lod.x, wtr_lod.y, wtr_a[i].w * sp);
		r += vec3(cos(a) * wtr_a[i].y, sin(a) * wtr_a[i].x, cos(a) * wtr_a[i].z) * l;
	}
	return r;
}

// the frame at rest point p: (normal, Jacobian determinant), each wave faded by k * mpp
vec4 wtr_tro_nj(vec2 p, float mpp, float t) {
	vec3 gx = vec3(1.0, 0.0, 0.0);
	vec3 gz = vec3(0.0, 0.0, 1.0);
	for (int i = 0; i < WTR_MAX; i++) {
		if (i >= wtr_n) break;
		float a = wtr_ph(p, wtr_k[i].xyz, wtr_k[i].w, t);
		float c = cos(a), s = sin(a);
		float l = 1.0 - smoothstep(wtr_px.x, wtr_px.y, wtr_a[i].w * mpp);
		float q = wtr_q[i].x * s * l;
		gx += vec3(-q * wtr_dd[i].x, c * wtr_q[i].y * l, -q * wtr_dd[i].y);
		gz += vec3(-q * wtr_dd[i].y, c * wtr_q[i].z * l, -q * wtr_dd[i].z);
	}
	return vec4(normalize(cross(gz, gx)), gx.x * gz.z - gx.z * gz.x);
}

// the horizontal map's Jacobian terms (jxx, jxz, jzz): the foam's past taps and the Newton steps
vec3 wtr_tro_jv(vec2 p, float mpp, float t) {
	vec3 j = vec3(1.0, 0.0, 1.0);
	for (int i = 0; i < WTR_MAX; i++) {
		if (i >= wtr_n) break;
		float q = wtr_q[i].x * sin(wtr_ph(p, wtr_k[i].xyz, wtr_k[i].w, t)) * (1.0 - smoothstep(wtr_px.x, wtr_px.y, wtr_a[i].w * mpp));
		j -= q * wtr_dd[i].xyz;
	}
	return j;
}

float wtr_cap(float j) { return 1.0 - smoothstep(wtr_foam_j.x, wtr_foam_j.y, j); }

// the whitecap now (from j0, the Jacobian at t) and at the past taps, each decayed
float wtr_foam(vec2 p, float mpp, float j0) {
	float f = wtr_cap(j0);
	for (int i = 1; i < 8; i++) {
		if (float(i) >= wtr_foam_t.x) break;
		vec3 j = wtr_tro_jv(p, mpp, atm_wave_t - float(i) * wtr_foam_t.y);
		f = max(f, wtr_cap(j.x * j.z - j.y * j.y) * exp(-float(i) * wtr_foam_t.y / wtr_foam_t.z));
	}
	return f;
}

// the bed's two channels to metres below the base level (core/water's bedDecode)
float wtr_bed_decode(vec2 c) {
	return (c.y > 0.004 && c.y < 0.996) ? wtr_bed_enc.x + c.y * wtr_bed_enc.y : wtr_bed_enc.z + c.x * c.x * wtr_bed_enc.w;
}
float wtr_depth(vec2 p) {
	if (!wtr_has_bed) return 1.0e9;
	vec2 uv = (p - wtr_bed_box.xy) * wtr_bed_box.zw;
	if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return wtr_level - wtr_base + wtr_bed_enc.z + wtr_bed_enc.w;
	return wtr_level - wtr_base + wtr_bed_decode(texture(wtr_bed, uv).xy);
}
float wtr_damp(vec2 p) { return wtr_has_bed ? smoothstep(0.0, wtr_damp_depth, wtr_depth(p)) : 1.0; }

// the drawn surface at rest point p0 with vertex spacing sp: (x, y, z, damping)
vec4 wtr_surface(vec2 p0, float sp) {
	vec3 d = wtr_tro_d(p0, sp, atm_wave_t);
	float m = wtr_damp(p0);
	vec2 p = p0 + d.xz * m;
	float h = d.y;
	if (wtr_field > 0.0) h += wtr_field * atm_wave_height(p, wtr_chop * (1.0 - smoothstep(wtr_lod.x, wtr_lod.y, wtr_kchop * sp)));
	return vec4(p.x, wtr_level + h * m, p.y, m);
}

// the height at a world point: three Newton steps back to its rest point, then the surface there
float wtr_height(vec2 p) {
	vec2 p0 = p;
	for (int i = 0; i < 3; i++) {
		if (wtr_n == 0) break;
		vec3 d = wtr_tro_d(p0, 0.0, atm_wave_t);
		vec3 j = wtr_tro_jv(p0, 0.0, atm_wave_t);
		float m = wtr_damp(p0);
		float a = 1.0 + (j.x - 1.0) * m, b = j.y * m, c = 1.0 + (j.z - 1.0) * m;
		vec2 r = p0 + d.xz * m - p;
		p0 -= vec2(c * r.x - b * r.y, a * r.y - b * r.x) / (a * c - b * b);
	}
	return wtr_surface(p0, 0.0).y;
}

// the shading normal: the trochoids' frame plus the field's slope (tilted), calmed by the damping m; d the camera's distance
vec3 wtr_normal(vec4 nj, vec2 p, float d, float m) {
	vec2 s = -nj.xz / nj.y;
	if (wtr_field > 0.0) s += atm_wave_slope(p, d).xy * wtr_tilt_k;
	s *= m;
	return normalize(vec3(-s.x, 1.0, -s.y));
}

// the foam's breakup noise, fixed to rest-point space (WATER.draw's wtrHash and wtrNoise)
float wtr_hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float wtr_noise(vec2 p) {
	vec2 i = floor(p); vec2 u = fract(p); u = u * u * (3.0 - 2.0 * u);
	return mix(mix(wtr_hash(i), wtr_hash(i + vec2(1.0, 0.0)), u.x), mix(wtr_hash(i + vec2(0.0, 1.0)), wtr_hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
#endif
