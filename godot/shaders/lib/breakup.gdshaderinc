// The shader library: hook 'breakup' (godot/README.md, "The shader library"). The twin of KMAT.breakupHook
// (core/materials/record/25-matlib-host.js), read from a material record's `breakup` {mix, macro, cell}: a world-space
// value noise of `cell` metres blends every map with a copy shifted by KM_OFF (up to `mix`), the same mask for colour,
// normal and roughness so they stay in register; a slower noise (cell * 2.7) varies the brightness by +-`macro`.
// The hash is three's sin-based one: it matches three.js within float precision, not bit for bit (nothing on the CPU
// shares it). Pure functions: include anywhere.
#ifndef K_BREAKUP
#define K_BREAKUP

const vec2 KM_OFF = vec2(0.371, 0.613);

float km_h(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float km_n(vec3 p) {
	vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
	return mix(mix(mix(km_h(i), km_h(i + vec3(1., 0., 0.)), f.x), mix(km_h(i + vec3(0., 1., 0.)), km_h(i + vec3(1., 1., 0.)), f.x), f.y),
	           mix(mix(km_h(i + vec3(0., 0., 1.)), km_h(i + vec3(1., 0., 1.)), f.x), mix(km_h(i + vec3(0., 1., 1.)), km_h(i + vec3(1., 1., 1.)), f.x), f.y), f.z);
}

// the blend toward the shifted copy at world point wp: 0..mx
float bu_mask(vec3 wp, float mx, float cell) {
	return smoothstep(0.3, 0.7, km_n(wp / max(cell, 1e-3))) * mx;
}

// the brightness factor: 1 +- macro
float bu_bright(vec3 wp, float macro, float cell) {
	return 1.0 + macro * (km_n(wp / (max(cell, 1e-3) * 2.7) + 19.1) * 2.0 - 1.0);
}

// a map sampled with its shifted copy blended in by m (bu_mask)
vec4 bu_tex(sampler2D t, vec2 uv, float m) {
	return mix(texture(t, uv), texture(t, uv + KM_OFF), m);
}

// a normal map's tangent-space normal, blended the same way (three blends the unpacked vectors, then normalises)
vec3 bu_normal(sampler2D t, vec2 uv, float m) {
	return normalize(mix(texture(t, uv).xyz * 2.0 - 1.0, texture(t, uv + KM_OFF).xyz * 2.0 - 1.0, m));
}
#endif
