// The shader library: hook 'anim-phase' (swbay's and nwbay's animMat, biomes/swbay/src/75-biome-swbay-fauna.js): a body
// that beats on its own phase, line for line the kits' GLSL. p the unmoved vertex (three's position), t the wind clock
// (BIO.WIND.t, atm_time here), ph the instance's aPh (its rate and phase). mode 0 'bird' (the wings fold on |x| > 0.12,
// the body bobs), 1 'swim' (a bob and a pitch along z), 2 'grazer' (the legs under y 0.5 swing in diagonal pairs).
// The path itself is the baked motion (krator/kmotion.gd), not this include. Used by shaders/anim_phase.gdshader.
#ifndef K_ANIM_PHASE
#define K_ANIM_PHASE

vec3 aph_beat(int mode, vec3 p, float t, float ph) {
	vec3 tr = p;
	if (mode == 0) {
		float w = abs(p.x) - 0.12;
		if (w > 0.0) {
			float fl = sin(t * ph + ph * 7.0) * 0.75;
			tr.y += w * sin(fl) * 0.9;
			tr.x = sign(p.x) * (0.12 + w * cos(fl));
		}
		tr.y += 0.03 * sin(t * ph * 0.5 + ph);
	} else if (mode == 1) {
		float bob = sin(t * ph + ph * 5.0);
		tr.y += bob * 0.16 - 0.06;
		tr.y += p.z * sin(t * ph * 0.9 + ph) * 0.12;
	} else {
		if (p.y < 0.5) {
			float side = sign(p.x) * sign(p.z);
			float sw = sin(t * ph + ph * 3.0 + (side > 0.0 ? 0.0 : 3.14159)) * 0.55;
			tr.z += (0.5 - p.y) * sw;
		}
		tr.y += 0.02 * sin(t * ph * 2.0 + ph);
	}
	return tr;
}

#endif
