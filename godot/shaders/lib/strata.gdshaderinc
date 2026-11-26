// core/terrain's strata in Godot (STRATA-PLAN S5): host/35-core-strata-shade.js's strataColor, line for line, on the bytes and
// parameters kstrata.gd bakes (KStrata.apply(material, res, opts) fills every ks_* uniform). The bed a pixel shows is the
// bed KStrata.surface reports (tests/terrain/kstrata_gpu_check.gd reads it back).
//   #include "res://shaders/lib/strata.gdshaderinc"
//   ks_strata_color(world_pos, world_normal)  linear colour with the effects (cross-bedding, varnish, iridescence, Liesegang,
//                                             colonnades, flecks, the ledge line, cap, dust and cover): ALBEDO in Forward+
//                                             (the Compatibility renderer: through kcolour.gdshaderinc's k_albedo)
//   ks_strata_raw(world_pos, world_normal)    the bed's own colour, sRGB, no effects (the check against KStrata.surface)
#ifndef K_STRATA_INC
#define K_STRATA_INC
uniform sampler2D ks_col : filter_nearest;
uniform sampler2D ks_bed : filter_nearest;
uniform sampler2D ks_alt : filter_nearest;
uniform sampler2D ks_nz : filter_nearest;
uniform sampler2D ks_bt : filter_nearest;
uniform vec4 ks_cr;
uniform vec4 ks_lb;
uniform vec4 ks_lat;
uniform vec4 ks_lat2 = vec4(0.0, 1.0, 6.0, 0.0);
uniform vec4 ks_wash = vec4(0.0, 0.55, 0.9, 0.0);
uniform vec4 ks_rep;
uniform vec4 ks_repb;
uniform float ks_n = 1.0;
uniform float ks_aln;
uniform float ks_bn = 1.0;
uniform vec3 ks_dip;
uniform vec2 ks_warp;
uniform vec2 ks_wf;
uniform vec4 ks_fold = vec4(0.0, 0.0, 1.0, 0.0);
uniform vec4 ks_fold2;
uniform vec4 ks_fa[4];
uniform vec4 ks_fb[4];
uniform float ks_fn;
uniform vec4 ks_al[4];
uniform vec4 ks_bk[4];
uniform vec4 ks_bm[4];
uniform vec4 ks_bw[8];
uniform vec2 ks_cap = vec2(100000.0, 100001.0);
uniform float ks_foot = -100000.0;
uniform vec3 ks_dust = vec3(0.788, 0.635, 0.494);
uniform vec4 ks_fx;
uniform vec3 ks_vc = vec3(0.36, 0.3, 0.28);

vec4 ks_t4(float i, float j) { return texelFetch(ks_nz, ivec2(int(mod(i, 64.0)), int(mod(j, 64.0))), 0); }
vec4 ks_fetch(sampler2D s, float i, float j) { return texelFetch(s, ivec2(int(i), int(j)), 0); }

float ks_noise(vec4 m, float x, float z) {
	float xi = floor(x); float zi = floor(z); float fx = x - xi; float fz = z - zi;
	float u = fx * fx * (3.0 - 2.0 * fx); float v = fz * fz * (3.0 - 2.0 * fz);
	float a = dot(ks_t4(xi, zi), m); float b = dot(ks_t4(xi + 1.0, zi), m);
	float d = dot(ks_t4(xi, zi + 1.0), m); float e = dot(ks_t4(xi + 1.0, zi + 1.0), m);
	float p = a + (b - a) * u; float q = d + (e - d) * u;
	return p + (q - p) * v;
}

float ks_yy(vec3 wp, out float w1) {
	w1 = ks_noise(vec4(1.0, 0.0, 0.0, 0.0), wp.x * ks_wf.x, wp.z * ks_wf.x) - 0.5;
	float v = wp.y + w1 * ks_warp.x + (ks_noise(vec4(0.0, 1.0, 0.0, 0.0), wp.x * ks_wf.y + 0.37, wp.z * ks_wf.y + 0.37) - 0.5) * ks_warp.y
		+ (wp.x * ks_dip.x + wp.z * ks_dip.y) * ks_dip.z;
	if (ks_fold.w != 0.0) {
		float t = fract(((wp.x - ks_fold2.z) * ks_fold.x + (wp.z - ks_fold2.w) * ks_fold.y) / ks_fold.z + ks_fold2.x);
		float s = 1.0 - 32.0 * t * t * (1.0 - t) * (1.0 - t); float tri = 4.0 * abs(t - 0.5) - 1.0;
		v -= ks_fold.w * (s + (tri - s) * ks_fold2.y);
	}
	for (int i = 0; i < 4; i++) {
		if (float(i) >= ks_fn) { break; }
		vec4 A = ks_fa[i]; vec4 B = ks_fb[i];
		float dx = A.z - A.x; float dz = A.w - A.y; float L = sqrt(dx * dx + dz * dz);
		float s = (dz * (wp.x - A.x) - dx * (wp.z - A.y)) / L; float m = 1.0;
		if (B.z > 0.0) { float t = ((wp.x - A.x) * dx + (wp.z - A.y) * dz) / (L * L); m = clamp(1.0 + min(t, 1.0 - t) * L / B.z, 0.0, 1.0); }
		v += B.x * smoothstep(-B.y, B.y, s) * m;
	}
	return v;
}

vec4 ks_cell(vec3 q, float off) { return ks_t4(q.x + 7.0 * q.z + off, q.y + 13.0 * q.z + off * 3.0); }

vec2 ks_worley(vec3 p, float size, float off, out vec3 bc, out vec4 bv) {
	vec3 c = floor(p / size); float d1 = 1.0e30; float d2 = 1.0e30; bc = c; bv = vec4(0.0);
	for (int a = -1; a <= 1; a++) { for (int b = -1; b <= 1; b++) { for (int e = -1; e <= 1; e++) {
		vec3 q = c + vec3(float(a), float(b), float(e)); vec4 v = ks_cell(q, off);
		float d = length((q + 0.15 + 0.7 * v.xyz) * size - p);
		if (d < d1) { d2 = d1; d1 = d; bc = q; bv = v; } else if (d < d2) { d2 = d; }
	} } }
	return vec2(d1, d2);
}

float ks_pick(float u, vec4 wa, vec4 wb, float nc) {
	float tot = dot(wa, vec4(1.0)) + dot(wb, vec4(1.0)); float a = u * tot; float id = nc - 1.0; bool got = false;
	for (int i = 0; i < 8; i++) {
		float w = i < 4 ? (i == 0 ? wa.x : i == 1 ? wa.y : i == 2 ? wa.z : wa.w) : (i == 4 ? wb.x : i == 5 ? wb.y : i == 6 ? wb.z : wb.w);
		if (!got && float(i) < nc) { if (a < w) { id = float(i); got = true; } else { a -= w; } }
	}
	return id;
}

vec3 ks_clast(float ib, float id, float u) {
	float c0 = id < 0.0 ? 32.0 : id * 4.0;
	float n = floor(ks_fetch(ks_bt, c0, ib).a * 255.0 + 0.5);
	return ks_fetch(ks_bt, c0 + mod(floor(u * n), n), ib).rgb;
}

vec3 ks_block(vec3 p, float ib, out float mat) {
	vec4 bk = ks_bk[0]; vec4 bm = ks_bm[0]; vec4 wa = ks_bw[0]; vec4 wb = ks_bw[1];
	for (int i = 1; i < 4; i++) { if (float(i) == ib) { bk = ks_bk[i]; bm = ks_bm[i]; wa = ks_bw[2 * i]; wb = ks_bw[2 * i + 1]; } }
	vec3 bc = vec3(0.0); vec4 bv = vec4(0.0); vec2 dd = ks_worley(p, bk.x, 11.0, bc, bv); mat = 0.0;
	if (dd.y - dd.x < bk.y * bk.x) { mat = 1.0; return ks_clast(ib, -1.0, bv.w); }
	float id = ks_pick(bv.w, wa, wb, bm.y);
	if (id == bm.x) {
		dd = ks_worley(p, bk.z, 29.0, bc, bv);
		if (dd.y - dd.x < bk.y * bk.z) { mat = 1.0; return ks_fetch(ks_bt, 32.0, ib).rgb; }
		id = ks_pick(bv.w, wa, wb, bm.y);
		if (id == bm.x) { id = -1.0; mat = 1.0; }
	}
	vec4 vv = ks_cell(bc, 23.0); vec3 n = vv.xyz - 0.5; float nl = length(n);
	if (nl < 1e-6) { n = vec3(0.0, 1.0, 0.0); nl = 1.0; }
	float band = floor(dot(p, n) / nl / bk.w); float odd = band - 2.0 * floor(band / 2.0);
	return ks_clast(ib, id, vv.w) * (odd > 0.5 ? 0.9 : 1.0);
}

vec3 ks_strata(vec3 wp, vec3 wn, bool raw_only) {
	wn = normalize(wn); float w1;
	float wsh = ks_wash.x * smoothstep(ks_wash.y, ks_wash.z, wn.y);
	float yy = ks_yy(wp, w1) + wsh; float wy = wp.y + wsh; float steep = 1.0 - abs(wn.y); float side = 0.0;
	if (ks_lb.w > 0.5) {
		float w = smoothstep(ks_lat2.x, ks_lat2.y, (wp.x - ks_lat.z) * ks_lat.x + (wp.z - ks_lat.w) * ks_lat.y);
		if (w >= 1.0) { side = 1.0; }
		else if (w > 0.0) { side = w > ks_noise(vec4(0.0, 0.0, 1.0, 0.0), yy / ks_lat2.z, ((wp.z - ks_lat.w) * ks_lat.x - (wp.x - ks_lat.z) * ks_lat.y) / 500.0) ? 1.0 : 0.0; }
	}
	float y0 = side > 0.5 ? ks_lb.x : ks_cr.x; float yl = yy; vec4 rp = side > 0.5 ? ks_repb : ks_rep;
	if (rp.x > 0.0 && yl < y0) { yl = y0 + mod(yl - y0, rp.x); }
	if (rp.y > 0.0 && yl >= rp.w) { yl = rp.z + mod(yl - rp.z, rp.y); }
	float idx = side > 0.5 ? ks_lb.z + clamp(floor((yl - ks_lb.x) / ks_cr.y), 0.0, ks_lb.y - 1.0) : clamp(floor((yl - ks_cr.x) / ks_cr.y), 0.0, ks_n - 1.0);
	float ci = mod(idx, ks_cr.z); float cj = floor(idx / ks_cr.z);
	vec4 bed = ks_fetch(ks_col, ci, cj); vec4 bi = ks_fetch(ks_bed, ci, cj);
	vec2 fp = abs(wn.x) > abs(wn.z) ? vec2(wp.z, wp.y) : vec2(wp.x, wp.y);
	vec3 c; vec3 raw;
	if (bi.a > 0.9) {
		float mat = 0.0; raw = ks_block(vec3(wp.x, yy, wp.z), floor(bi.r * 255.0 + 0.5), mat);
		if (raw_only) { return raw; }
		c = pow(raw, vec3(2.2));
		float fl = ks_noise(vec4(0.0, 0.0, 0.0, 1.0), fp.x * 0.9 + wp.y * 0.37, wp.y * 0.9 + fp.x * 0.21);
		c = mix(c, fl > 0.93 ? vec3(0.012, 0.04, 0.02) : vec3(0.008), mat * ks_fx.w * smoothstep(0.86, 0.9, fl));
	} else {
		for (int s = 0; s < 4; s++) {
			if (float(s) >= ks_aln) { break; }
			vec4 al = ks_fetch(ks_alt, ci, cj + float(s) * ks_cr.w);
			if (al.a > 0.5 && wy < ks_al[s].x + ks_al[s].y * 2.0 * w1) { bed.rgb = al.rgb; break; }
		}
		raw = bed.rgb;
		if (raw_only) { return raw; }
		c = pow(raw, vec3(2.2));
		float lam = 0.95 + 0.05 * sin(yy * 5.1 + w1 * 31.0);
		float xb = ks_noise(vec4(0.0, 0.0, 1.0, 0.0), fp.x * 0.48 + yy * 0.72, yy * 4.4);
		xb = mix(1.0, 0.9 + 0.18 * smoothstep(0.3, 0.8, fract(xb * 4.0)), bed.a);
		c *= lam * xb;
		if (bi.a > 0.3 && bi.a < 0.7) { float h = fract(fp.x * 0.031 + yy * 0.37 + w1 * 2.0); vec3 rb = 0.5 + 0.5 * cos(6.2832 * (h + vec3(0.0, 0.33, 0.67))); c = mix(c, c * (0.6 + 0.8 * rb), 0.45); }
		if (ks_fx.z > 0.0 && bi.b > 0.8) {
			float ls = fract((fp.x + yy) * 0.045 + ks_noise(vec4(0.0, 0.0, 0.0, 1.0), fp.x * 0.02, yy * 0.02) * 3.0);
			c = mix(c, c * vec3(0.62, 0.38, 0.26), smoothstep(0.9, 0.97, ls) * 0.6 * ks_fx.z);
		}
		if (ks_fx.y > 0.0 && bi.b > 0.92) {
			float up = step(0.62, bi.r); float cw = mix(1.4, 0.7, up);
			float jx = fract(fp.x / cw + ks_noise(vec4(0.0, 0.0, 1.0, 0.0), fp.x * 0.4, yy * mix(0.05, 0.6, up)) * mix(0.5, 2.0, up));
			c *= 1.0 - ks_fx.y * 0.35 * smoothstep(0.07, 0.0, min(jx, 1.0 - jx));
		}
		if (bi.b > 0.7) { c *= 1.0 - 0.25 * smoothstep(0.88, 0.98, bi.r) * steep * (bi.b - 0.7) / 0.3; }
	}
	float iv = ks_noise(vec4(0.0, 0.0, 1.0, 0.0), dot(wp.xz, vec2(0.0488, 0.0344)), yy * 0.11);
	float ibn = ks_noise(vec4(0.0, 0.0, 0.0, 1.0), dot(wp.xz, vec2(-0.0376, 0.0552)) + 4.0, yy * 0.232);
	c *= mix(vec3(1.09, 0.97, 0.88), vec3(0.92, 0.98, 1.07), smoothstep(0.3, 0.7, iv)) * (0.9 + 0.2 * ibn);
	float cp = smoothstep(ks_cap.x, ks_cap.y, yy); c = mix(c, c * vec3(1.2, 1.14, 1.06) + vec3(0.05, 0.042, 0.03), cp * 0.6);
	float s1 = ks_noise(vec4(0.0, 0.0, 0.0, 1.0), fp.x * 1.68, wp.y * 0.032 + w1 * 1.2);
	float s2 = ks_noise(vec4(0.0, 0.0, 1.0, 0.0), fp.x * 0.568 + 2.4, wp.y * 0.016);
	float hang = mix(0.3, 1.0, bi.r * bi.r) * bi.g * (bi.a > 0.9 ? 0.0 : 1.0);
	float vn = max(smoothstep(0.6, 0.78, s1) * 0.8, smoothstep(0.62, 0.85, s2)) * hang * steep * steep;
	c = mix(c, c * ks_vc + vec3(0.012, 0.009, 0.008), vn * 0.62 * ks_fx.x);
	vec3 dust = pow(mix(ks_dust, raw * 0.85 + 0.12, ks_wash.w), vec3(2.2));
	float up = smoothstep(0.62, 0.93, wn.y); float ft = smoothstep(ks_foot + 5.0, ks_foot + 0.5, wp.y);
	c = mix(c, c * 1.08 + vec3(0.02), up * 0.35); c = mix(c, dust, clamp(up * 0.38 + ft * 0.45 * (1.0 + 0.8 * w1), 0.0, 0.75));
	return c;
}

vec3 ks_strata_color(vec3 wp, vec3 wn) { return ks_strata(wp, wn, false); }
vec3 ks_strata_raw(vec3 wp, vec3 wn) { return ks_strata(wp, wn, true); }
#endif
