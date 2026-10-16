// The shader library: hook 'anim' (the biome kits' material kind 'anim': fauna on a path; godot/README.md, "The shader
// library"). The twin of BIO.animHook (core/biome/35-core-anim.js), line for line: an instance stands at its path's
// centre and the vertex shader moves and turns it along the path from the wind clock (three's BIO.WIND.t, atm_time here).
//   p1 = aP1 = (speed, phase, vertical amplitude, eccentricity); rad = aP0.w, the path's radius (aP0.xyz, the centre, is
//   the instance's own position, which three reads from the instance matrix too)
//   mode 0 'orbit' a level ellipse round the centre, banked; 1 'flit' a lissajous wander inside a box, heading and pitch
//   from the velocity; 2 'walk' no path (three's host moves the matrix; p1.x is the gait phase, p1.y the flap phase)
// The body is modelled with +x forward and +y up. Pure functions of their arguments: the caller passes the clock.
// GDScript twin: krator/kanim.gd (tests/anim/anim_test.gd; tests/shaders/library_gpu_check.gd reads these on a GPU).
#ifndef K_ANIM
#define K_ANIM

// three's mat3(c,0,s, 0,1,0, -s,0,c) and friends, column by column
mat3 anm_hdg(float a) { float c = cos(a); float s = sin(a); return mat3(vec3(c, 0.0, s), vec3(0.0, 1.0, 0.0), vec3(-s, 0.0, c)); }
mat3 anm_rz(float a) { float c = cos(a); float s = sin(a); return mat3(vec3(c, s, 0.0), vec3(-s, c, 0.0), vec3(0.0, 0.0, 1.0)); }
mat3 anm_rx(float a) { float c = cos(a); float s = sin(a); return mat3(vec3(1.0, 0.0, 0.0), vec3(0.0, c, s), vec3(0.0, -s, c)); }

// the offset from the centre (P) and the body's turn (M) at time t
void anm_pose(int mode, float rad, vec4 p1, float t, out mat3 M, out vec3 P) {
	if (mode == 0) {
		float th = p1.y + p1.x * t;
		float e = max(p1.w, 0.15);
		P = vec3(cos(th) * rad, p1.z * (0.6 * sin(th * 2.3 + p1.y) + 0.4 * sin(th * 0.7 + 2.0 * p1.y)), sin(th) * rad * e);
		vec2 d = normalize(vec2(-sin(th), cos(th) * e));
		float yaw = atan(d.y, d.x);
		float bank = -0.42 * sign(p1.x) * (0.7 + 0.3 * sin(th * 3.1 + p1.y));
		float pit = 0.25 * p1.z * (1.38 * cos(th * 2.3 + p1.y)) / max(1.0, rad) * 4.0;
		M = anm_hdg(yaw) * anm_rz(clamp(pit, -0.3, 0.3)) * anm_rx(bank);
	} else if (mode == 1) {
		float t1 = p1.y + p1.x * t;
		float e = max(p1.w, 0.15);
		P = vec3(sin(t1) * rad, p1.z * sin(t1 * 1.7 + 1.0), cos(t1 * 0.83 + 0.5) * rad * e);
		vec3 v = vec3(cos(t1) * rad, p1.z * 1.7 * cos(t1 * 1.7 + 1.0), -0.83 * sin(t1 * 0.83 + 0.5) * rad * e);
		float yaw = atan(v.z, v.x);
		float pit = atan(v.y, max(0.001, length(v.xz))) * 0.6;
		M = anm_hdg(yaw) * anm_rz(clamp(pit, -0.6, 0.6));
	} else {
		P = vec3(0.0);
		M = mat3(1.0);
	}
}

// wings: vertices beyond |z| > root hinge up and down (o.flap: rate, amp, root); walk adds the gait phase
vec3 anm_flap(vec3 pos, vec3 tr, float t, vec4 p1, bool walk, float rate, float amp, float root) {
	float w = max(0.0, abs(pos.z) - root);
	float f = sin(t * rate + p1.y * 7.0 + (walk ? p1.x : 0.0));
	tr.y += w * f * amp;
	tr.z -= sign(pos.z) * w * (1.0 - cos(f * amp)) * 0.5;
	return tr;
}

// legs: vertices below y < top swing fore and aft in diagonal pairs, the body bobs (o.legs: top, amp; lift = amp * 0.35)
vec3 anm_legs(vec3 pos, vec3 tr, vec4 p1, float top, float amp, float lift) {
	if (pos.y < top) {
		float k = (top - pos.y) / top;
		float ph = p1.x + (pos.x > 0.0 ? 0.0 : 3.14159) + (pos.z > 0.0 ? 0.0 : 3.14159);
		tr.x += k * sin(ph) * amp;
		tr.y += k * max(0.0, cos(ph)) * lift;
	} else {
		tr.y += 0.02 * sin(p1.x * 2.0);
	}
	return tr;
}

#endif
