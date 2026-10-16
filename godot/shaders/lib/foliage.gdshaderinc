// The shader library: hook 'foliage' (the biome kits' material kind 'leaf'; godot/README.md, "The shader library").
// The twin of BIO.foliageHook (core/biome/30-core-foliage.js): the clump's sway in the wind, the card's softened
// lighting normal, the prism gum's two colours by view and sun, and the far cards' thicker cut-out. The cut-out itself is
// ALPHA_SCISSOR_THRESHOLD (never alpha blending: the cards keep their shadows and the depth prepass). Used by
// shaders/foliage.gdshader. Pure functions of their arguments: the caller passes atm_time and atm_wind (atmos.gdshaderinc).
#ifndef K_FOLIAGE
#define K_FOLIAGE

// the sway in world space for a vertex at `local` (the mesh's own position) of an instance at `origin` whose amplitude
// axis has length sc; wg is the vertex's weight (the record's sway: c + dot(w, local)), a its swayA. With no wind the
// sway is exactly the calm breeze's; with wind it grows with the wind's strength and leans downwind, pulsing.
vec3 fol_sway(vec3 local, vec3 origin, float sc, float wg, float t, vec2 wind, float a) {
	float ph = dot(origin, vec3(0.131, 0.073, 0.117));
	float on = step(1e-4, length(wind));
	float wk = mix(1.0, max(0.3, length(wind)), on);
	vec3 lean = on * vec3(wind.x, 0.0, wind.y) * (0.9 + 0.6 * sin(t * 0.45 + ph * 2.1));
	return wg * sc * (vec3(
		sin(t * 0.9 + ph) + 0.45 * sin(t * 2.3 + ph * 1.7 + local.x * 5.0),
		0.40 * sin(t * 1.6 + ph * 0.6 + local.z * 5.0),
		cos(t * 0.7 + ph * 1.3) + 0.45 * sin(t * 2.9 + ph + local.y * 5.0)) * wk + lean) * a;
}

// a card's lighting normal without the clump's own (aN): its face normal pulled 45% toward up, so a clump reads as a mass
vec3 fol_card_normal(vec3 n_world) {
	return normalize(mix(normalize(n_world), vec3(0.0, 1.0, 0.0), 0.45));
}

// the prism gum (o.irid): 0 shows the second colour, 1 the first, by the sun on the face, the view's grazing and a slow shimmer
float fol_irid(vec3 n, vec3 v, vec3 sun, vec3 wp, float t) {
	float fr = 1.0 - abs(dot(n, v));
	float sf = dot(n, normalize(sun)) * 0.5 + 0.5;
	float sh = 0.16 * sin(t * 0.8 + dot(wp, vec3(0.045, 0.083, 0.037))) + 0.08 * sin(t * 1.9 + dot(wp, vec3(-0.21, 0.13, 0.17)));
	return smoothstep(0.22, 0.78, sf * 1.15 - fr * 0.80 + 0.30 + sh);
}

// far cards keep more of their cut-out (three: diffuseColor.a *= 1 + clamp(d / 650, 0, 1.1)), depth in metres
float fol_far_alpha(float a, float depth) {
	return a * (1.0 + clamp(depth / 650.0, 0.0, 1.1));
}
#endif
