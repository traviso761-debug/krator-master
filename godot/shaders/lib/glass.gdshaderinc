// The shader library: hook 'glass' (godot/README.md, "The shader library"). The twin of MAT.glass's hook
// (core/materials/22-materials.js, "GLASS FRESNEL"; the same in the Ancients-lineage kits' 30-kit.js): real glass turns
// pale and reflective at grazing angles, so the lit colour gains a cool rim and the opacity rises with the cubed
// Fresnel term. three adds the rim to its outgoing light, after lighting: in Godot that is EMISSION. Glass is one of
// the three things `transparent` is for (glass, water, smoke: GODOT-PLAN.md Phase 3's rules). The cube is written out
// and its base clamped (pow of a negative base is NaN on a real GPU). Pure functions: include anywhere.
#ifndef K_GLASS
#define K_GLASS

const vec3 GLASS_RIM = vec3(0.30, 0.44, 0.58);

// (1 - |n.v|)^3 for a surface normal n and the direction v toward the eye (any lengths)
float glass_fresnel(vec3 n, vec3 v) {
	float f = 1.0 - clamp(abs(dot(normalize(n), normalize(v))), 0.0, 1.0);
	f = clamp(f, 0.0, 1.0);
	return f * f * f;
}

// the light the rim adds (Godot: EMISSION += glass_rim(fr))
vec3 glass_rim(float fr) {
	return GLASS_RIM * fr * 0.85;
}

// the opacity: the material's alpha raised toward opaque at grazing angles
float glass_alpha(float a, float fr) {
	return clamp(a + fr * 0.42, 0.0, 1.0);
}
#endif
