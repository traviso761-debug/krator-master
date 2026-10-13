// The shader library: hook 'bark' (the biome kits' bark buckets and their kit kinds; godot/README.md, "The shader library").
// The maths of the kinds the biome export names (core/biome/42-core-export.js HOOK_KINDS), each the twin of a kit's
// three.js hook: 'irid' (BIO.iridBarkMat: two tints by the view angle and a slow shimmer), 'gloss' (barkMat2: the sun's
// highlight on the unmasked bark), 'far' (rift's and swlowlands' impostors: a second colour packed in uv), 'hang'
// (nhighlands' bulbs: a swing on their threads). Used by shaders/bark.gdshader. Pure functions: the caller passes
// atm_time and atm_sun_dir (atmos.gdshaderinc). Variants of one family belong in one sampler2DArray (GODOT-PLAN.md
// Phase 3's rules), the layer picked per instance: not needed by any export yet.
#ifndef K_BARK
#define K_BARK

// 'irid': the colour factor between tint a and tint b by the view's grazing and a slow world-space shimmer
vec3 bark_irid(vec3 n, vec3 v, vec3 wp, float t, vec3 a, vec3 b) {
	float fr = 1.0 - abs(dot(n, v));
	float sh = 0.5 + 0.5 * sin(dot(wp, vec3(0.21, 0.37, 0.29)) + t * 0.35);
	return mix(a, b, smoothstep(0.12, 0.82, fr * 0.85 + sh * 0.3));
}

// the sun's highlight on a face (gloss and the far impostors): Blinn-Phong, exponent 26, only where the sun reaches.
// n is turned toward the viewer first (two-sided bark)
float bark_sun_spec(vec3 n, vec3 v, vec3 sun) {
	if (dot(n, v) < 0.0) n = -n;
	vec3 l = normalize(sun);
	return pow(max(dot(n, normalize(l + v)), 0.0), 26.0) * step(0.0, dot(n, l));
}

// 'far' (RIFT.farMat): uv.x packs a second colour as r*65536 + g*256 + b (bytes, squared to linear)
vec3 bark_c2_unpack(float p) {
	float r = floor(p * (1.0 / 65536.0)); p -= r * 65536.0;
	float g = floor(p * (1.0 / 256.0)); float b = p - g * 256.0;
	vec3 c2 = vec3(r, g, b) * (1.0 / 255.0);
	return c2 * c2;
}

// 'far': how far toward the packed colour. rule < 1.5: the prism gum's (by the sun, as fol_irid inverted); else by grazing
float bark_far_k(vec3 n, vec3 v, vec3 sun, vec3 wp, float t, float rule) {
	float fr = 1.0 - abs(dot(n, v));
	float sh = 0.12 * sin(t * 0.5 + dot(wp, vec3(0.011, 0.017, 0.013)));
	if (rule < 1.5) {
		float sf = dot(n, normalize(sun)) * 0.5 + 0.5;
		return 1.0 - smoothstep(0.22, 0.78, sf * 1.15 - fr * 0.80 + 0.30 + sh);
	}
	return smoothstep(0.12, 0.82, fr * 0.85 + 0.15 + sh);
}

// 'hang': the bulbs swing on their threads (local position, before the instance matrix; the thread hangs from y = 0)
vec3 bark_hang(vec3 local, vec3 origin, float t, float a) {
	float ph = dot(origin, vec3(0.13, 0.07, 0.11));
	return local + vec3(-local.y * a * sin(t * 1.1 + ph), 0.0, -local.y * a * cos(t * 0.8 + ph * 1.3));
}
#endif
