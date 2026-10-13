// The shader library: hook 'coursing' (godot/README.md, "The shader library"; core/materials/PLAN.md, "From spiderbench":
// analytic coursing instead of painted joints). Ashlar and brick joints from uv arithmetic, no joint texture: no repeat,
// and no mip smear of the joints at distance (the box filter below averages them over the pixel instead). The base
// library map (stone.cut, brick) stays underneath as the surface; this draws the joints and a per-block tone.
// Parameters, a record's `coursing` {courseH, blockW, slide, joint, tone, seed}: course height and block width (m), the
// per-course slide (0..1: each course shifted by a random fraction of a block, up to `slide`; negative: courses
// alternate by |slide| of a block, -0.5 a running bond), joint width (m), tone (+- brightness per block), seed.
// uv in metres: u along the wall, v up it. No three.js hook draws it yet: the TEX kind 'coursing' (the same formula as a
// pixel function) waits for its pilot, Voth's canton walls (TODO.md), which belong to the Voth branch. The hash is an
// integer one (lowbias32), so a CPU twin can match it exactly (godot/tests/shaders/library_gpu_check.gd has one).
#ifndef K_COURSING
#define K_COURSING

uint crs_mix(uint x) {   // lowbias32 (C. Wellons)
	x ^= x >> 16u; x *= 0x7feb352du; x ^= x >> 15u; x *= 0x846ca68bu; x ^= x >> 16u;
	return x;
}
// a hash of two cell indices and a seed, 0..1
float crs_h(int a, int b, uint seed) {
	uint h = crs_mix(uint(a + 1048576) * 0x9e3779b1u ^ crs_mix(uint(b + 1048576) + seed));
	return float(h >> 8u) * (1.0 / 16777216.0);
}

// the fraction of the window [x - w/2, x + w/2] that lies in a joint: joints of width j centred on the multiples of the
// period p (box-filtered; w is the pixel's footprint, fwidth). w -> 0 is the plain step.
float crs_joint(float x, float p, float j, float w) {
	float y0 = x - 0.5 * w + 0.5 * j;
	float a = y0 - floor(y0 / p) * p;   // in [0, p): the window's start past the last joint's start
	if (w < 1e-6) return a < j ? 1.0 : 0.0;
	float b = a + w;
	float ib = floor(b / p) * j + min(b - floor(b / p) * p, j);
	float ia = min(a, j);
	return clamp((ib - ia) / w, 0.0, 1.0);
}

// (joint 0..1, the block's tone factor, course index, block index) at uv (m) with pixel footprint fw (fwidth(uv))
vec4 coursing(vec2 uv, vec2 fw, float course_h, float block_w, float slide, float joint, float tone, uint seed) {
	float ch = max(course_h, 1e-3), bw = max(block_w, 1e-3);
	int c = int(floor(uv.y / ch));
	float off = slide < 0.0 ? float(c - 2 * (c / 2) != 0 ? 1 : 0) * -slide * bw : crs_h(c, 0, seed ^ 0x51u) * slide * bw;
	float u = uv.x + off;
	int b = int(floor(u / bw));
	float jv = crs_joint(uv.y, ch, joint, fw.y);
	float ju = crs_joint(u, bw, joint, fw.x);
	float jm = 1.0 - (1.0 - jv) * (1.0 - ju);
	float tn = 1.0 + tone * (crs_h(c, b, seed) * 2.0 - 1.0);
	return vec4(jm, tn, float(c), float(b));
}
#endif
