// The shader library: hook 'flag' (godot/README.md, "The shader library"). The twin of the Ring Sea kit's flag flutter
// (kits/ringsea/src/40-rs-core.js, RS_AUX_GLSL and rsAuxVS: the kit's pennants and ensigns; the post-apoc and islander
// kits' cloth flutter is the same idea, each its own copy). A flag's vertex carries its root (the pivot, rsAux.xyz), its
// distance along the flag from the root (rsAux2.w), and the axis it turns about (rsAux2.xy: the lean of a vertical axis);
// it ripples by its distance, then the whole flag turns about the axis through the root (the wind's heading, uRsFlag).
// No core/ hook draws flags in three.js yet (core/sockets places them as static cloth). Pure functions: include anywhere.
#ifndef K_FLAG
#define K_FLAG

// the ripple: a wave running out along the flag, growing with the distance d from the root (metres), at time t (s)
vec3 flag_flutter(vec3 p, float d, vec3 root, float t) {
	if (d > 0.0) {
		float w = sin(t * 5.3 - d * 1.9 + root.x * 0.37 + root.z * 0.23);
		p.z += d * (0.05 + 0.01 * d) * w;
		p.y += d * 0.025 * sin(t * 3.1 - d * 1.3 + root.x * 0.2);
	}
	return p;
}

// the turn about the axis normalize(lean.x, 1, lean.y) by angle a (rsAuxR, column-major as in GLSL)
mat3 flag_turn(vec2 lean, float a) {
	vec3 k = normalize(vec3(lean.x, 1.0, lean.y));
	float c = cos(a), s = sin(a), t = 1.0 - c;
	return mat3(vec3(t * k.x * k.x + c, t * k.x * k.y + s * k.z, t * k.x * k.z - s * k.y),
	            vec3(t * k.x * k.y - s * k.z, t * k.y * k.y + c, t * k.y * k.z + s * k.x),
	            vec3(t * k.x * k.z + s * k.y, t * k.y * k.z - s * k.x, t * k.z * k.z + c));
}

// a flag vertex posed: flutter, then the turn about the root (weight w scales the angle, as rsAux2.z does)
vec3 flag_pose(vec3 p, float d, vec3 root, vec2 lean, float w, float a, float t) {
	return root + flag_turn(lean, a * w) * (flag_flutter(p, d, root, t) - root);
}
#endif
