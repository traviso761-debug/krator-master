// Polygon cells (core/water/ext/54b, WATER.cellsGLSL): cells of `cell` m, each centre jittered by `jit` with the shaders' hash (WATER.hash2);
// (f1, f2, the nearest cell's index) and the crack where f2 - f1 is small. Twins: KWater.cells_at, crack_of (krator/water.gd).
#ifndef K_WATER_CELLS
#define K_WATER_CELLS
float wc_h(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec4 wc_cells(vec2 p, float cell, float jit) {
	vec2 q = p / cell; vec2 i = floor(q); float f1 = 9.0; float f2 = 9.0; vec2 id = vec2(0.0);
	for (int dy = -1; dy <= 1; dy++) {
		for (int dx = -1; dx <= 1; dx++) {
			vec2 c = i + vec2(float(dx), float(dy));
			vec2 o = c + vec2(0.5) + jit * (vec2(wc_h(c), wc_h(c + vec2(19.1, 7.3))) - vec2(0.5));
			float d = length(q - o);
			if (d < f1) { f2 = f1; f1 = d; id = c; } else if (d < f2) { f2 = d; }
		}
	}
	return vec4(f1, f2, id.x, id.y);
}
float wc_crack(vec4 c, float w) { return 1.0 - smoothstep(0.0, w, c.y - c.x); }
#endif
