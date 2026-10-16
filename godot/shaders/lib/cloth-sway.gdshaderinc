// The shader library: hook 'cloth-sway' (godot/README.md, "The shader library"). The twin of Girder's applyClothSway
// (settlements/girder/src/45-kit.js; the same hook in Voth's 45-kit.js, and named by the 'world-uv+cloth-sway' records of
// Voth, Yuni, Locus and Mav's 47-texture.js): an instanced cloth box hangs from its local y = 1 edge and swings its
// y = 0 edge, the swing growing as (1 - y)^2, each instance at its own phase (a hash of its xz). No core/ hook draws it
// in three.js yet: the cloth buckets of the Voth-lineage builds do, each its own copy. The clock is the caller's
// (atm_time: three's uWindTime is the page's seconds). Pure functions: include anywhere.
#ifndef K_CLOTH_SWAY
#define K_CLOTH_SWAY

// the instance's phase, 0..2 pi, from its origin's xz (MODEL_MATRIX[3].xz; three: instanceMatrix[3].xz)
float cloth_phase(vec2 origin_xz) {
	return fract(sin(dot(origin_xz, vec2(12.9898, 78.233))) * 43758.5453) * 6.28318;
}

// the swung local position (before the instance matrix), at time t
vec3 cloth_sway(vec3 local, vec2 origin_xz, float t) {
	float ph = cloth_phase(origin_xz);
	float amt = (1.0 - local.y) * (1.0 - local.y);
	float s = sin(t * 1.6 + ph) * 0.16 + sin(t * 2.7 + ph * 1.3) * 0.07;
	return local + vec3(s * amt, 0.0, s * amt);
}
#endif
