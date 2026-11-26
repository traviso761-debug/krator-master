// The ground shader's layer kinds (core/terrain/43-core-ground.js, KGROUND's 'clast', 'sand' and 'polygon'; core/README.md,
// "Adopting KGROUND"): the functions the kinds are made of, the same maths as KGROUND.kindsGlsl(), and the recipes of the
// three kinds as functions of their numbers (the page's GLSL has them inline, with the numbers written in). Twins:
// KGROUND.fn.hash3, vor2, vor3, vnoise, ripple (tests/shaders/kground_kinds_gpu_check.gd holds this file to them).
// Behind: KGROUND itself (the hex tiling, the distance scale, the height blend) has no Godot shader yet; ground.gdshader is
// the world-uv ground. A ground that takes the kinds includes this and blends their kg_* colour and height as the page does
// (kgHL: core/terrain/43-core-ground.js).
#ifndef K_KGROUND_KINDS
#define K_KGROUND_KINDS

// ---- Hoskins' hash33 (no sine): a cell's integer corner and the layer's seed to three numbers in [0, 1)
vec3 kg_hash3(vec3 p) { p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }

// ---- Voronoi: (distance to the nearest point, distance to the bisector with the second nearest); the nearest's cell and
// offset from x. Points at 0.5 + jit * (hash - 0.5) in each cell.
vec2 kg_vor2(vec2 x, float jit, float sd, out vec2 cid, out vec2 rel) {
	vec2 n = floor(x); vec2 f = x - n; vec2 r1 = vec2(0.0); vec2 r2 = vec2(1.0, 0.0); float d1 = 8.0; float d2 = 8.0; cid = n;
	for (int j = -1; j <= 1; j++) { for (int i = -1; i <= 1; i++) {
		vec2 g = vec2(float(i), float(j)); vec2 r = g + 0.5 + jit * (kg_hash3(vec3(n + g, sd)).xy - 0.5) - f; float d = dot(r, r);
		if (d < d1) { d2 = d1; r2 = r1; d1 = d; r1 = r; cid = n + g; } else if (d < d2) { d2 = d; r2 = r; } } }
	rel = r1; vec2 u = r2 - r1; return vec2(sqrt(d1), dot(0.5 * (r1 + r2), u) / max(length(u), 1e-6));
}
vec2 kg_vor3(vec3 x, float jit, float sd, out vec3 cid, out vec3 rel) {
	vec3 n = floor(x); vec3 f = x - n; vec3 r1 = vec3(0.0); vec3 r2 = vec3(1.0, 0.0, 0.0); vec3 s = sd * vec3(1.0, 1.7, 2.3);
	float d1 = 8.0; float d2 = 8.0; cid = n;
	for (int k = -1; k <= 1; k++) { for (int j = -1; j <= 1; j++) { for (int i = -1; i <= 1; i++) {
		vec3 g = vec3(float(i), float(j), float(k)); vec3 r = g + 0.5 + jit * (kg_hash3(n + g + s) - 0.5) - f; float d = dot(r, r);
		if (d < d1) { d2 = d1; r2 = r1; d1 = d; r1 = r; cid = n + g; } else if (d < d2) { d2 = d; r2 = r; } } } }
	rel = r1; vec3 u = r2 - r1; return vec2(sqrt(d1), dot(0.5 * (r1 + r2), u) / max(length(u), 1e-6));
}

// ---- value noise on the plane (0..1) and a wind ripple's profile (0 trough, 1 crest; a the stoss share)
float kg_vn(vec2 p, float sd) {
	vec2 i = floor(p); vec2 f = p - i; vec2 u = f * f * (3.0 - 2.0 * f);
	float a = kg_hash3(vec3(i, sd)).x; float b = kg_hash3(vec3(i + vec2(1.0, 0.0), sd)).x;
	float c = kg_hash3(vec3(i + vec2(0.0, 1.0), sd)).x; float d = kg_hash3(vec3(i + 1.0, sd)).x;
	return a + (b - a) * u.x + (c - a) * u.y + (a - b - c + d) * u.x * u.y;
}
float kg_ripple(float u, float a) { float f = fract(u); return f < a ? f / a : (1.0 - f) / (1.0 - a); }

// ---- the polygon kind's pattern: (trough 0..1, rim 0..1, the cell's hash) at wp (world xz), as the page's code. k:
// (1 / size, width, warp, jitter); rim the rim band's width (0 none); fp the pixel's footprint in metres; sd the seed
vec3 kg_polygon(vec2 wp, vec4 k, float rim, float fp, float sd, out vec3 q) {
	vec2 p = wp * k.x; p += k.z * (vec2(kg_vn(p * 3.0, sd + 2.0), kg_vn(p * 3.0 + vec2(5.2, 1.3), sd + 2.0)) * 2.0 - 1.0);
	float wv = k.y * (0.55 + 0.9 * kg_vn(p * 4.0, sd + 6.0)); vec2 id; vec2 rl; vec2 v = kg_vor2(p, k.w, sd, id, rl);
	float f = fp * k.x; q = kg_hash3(vec3(id, sd + 5.1));
	float tr = 1.0 - smoothstep(wv - f, wv + f, v.y);
	float rm = rim > 0.0 ? (1.0 - smoothstep(wv + rim - f, wv + rim + f, v.y)) * (1.0 - tr) : 0.0;
	return vec3(tr, rm, 0.0);
}

// ---- the sand kind's ripple (shade factor, height offset) and a grain's glint, as the page's code
vec2 kg_sand_ripple(vec2 wp, vec2 dir, float lam, float meander, float warp, float a, float steep, vec3 sun, float fp, float sd) {
	vec2 p = wp / (lam * meander);
	float u = dot(wp, dir) / lam + warp * (kg_vn(p, sd) * 2.0 - 1.0);
	float rb = smoothstep(0.25, 0.55, kg_vn(p * 0.6 + vec2(17.3, 4.1), sd + 11.0));
	float fr = fract(u); float rh = kg_ripple(u, a); float rf = (1.0 - smoothstep(0.15 * lam, 0.5 * lam, fp)) * rb;
	float sl = (fr < a ? 1.0 / a : -1.0 / (1.0 - a)) * steep; vec3 rn = normalize(vec3(-dir.x * sl, 1.0, -dir.y * sl));
	return vec2(mix(1.0, clamp(dot(rn, sun) / max(sun.y, 0.15), 0.3, 1.8), rf), (rh - 0.5) * rf);
}
float kg_glint(vec3 wp, vec3 cam, vec3 sun, float gs, float spread, float sharp, float dens, float fp, float sd) {
	vec2 c = wp.xz / gs; vec2 ci = floor(c); vec3 h = kg_hash3(vec3(ci, sd + 3.7)); vec3 h2 = kg_hash3(vec3(ci.yx, sd + 8.9));
	float d = length(fract(c) - 0.25 - 0.5 * h.xy);
	vec3 n = normalize(vec3((h2.x - 0.5) * spread, 1.0, (h2.y - 0.5) * spread));
	return pow(max(dot(reflect(-normalize(cam - wp), n), sun), 0.0), sharp) * step(h.z, dens) * (1.0 - smoothstep(0.15, 0.3, d))
		* (1.0 - smoothstep(0.5 * gs, 1.5 * gs, fp));
}
#endif
