// Mikkelsen (2022), Practical Real-Time Hex-Tiling (JCGT 11(3)): a texture tiled over ground without the grid
// repetition reading as a grid. The lattice is equilateral triangles; each fragment falls in three hex cells, each
// cell gets a seeded offset and rotation, and the three taps are blended by a steep weight so the seams between them
// disappear. Mikkelsen's adaptation drops Heitz and Neyret's histogram preservation, which is what lets it sample the
// source texture directly instead of a precomputed transform -- so it drops into a material that already exists.
//
// THE SAMPLERS ARE ARGUMENTS, not globals, which is the only difference from the copy in shaders/terrain.gdshader
// that this was lifted from. terrain.gdshader reads the global kgd_* arrays because it is on the open world's chunk
// pipeline and every region's ground shares them; a preview host that is not on that pipeline has its own arrays and
// could not call it. Godot's shading language takes a sampler as a parameter, so one implementation serves both.
//
// NOT YET SHARED BOTH WAYS. terrain.gdshader still carries its own hex_hash2/sample_hex_layer. Moving it onto this
// include is textual and behaviour-preserving, but it is the 1:1 shader for every cut region and a shader only
// reports its errors when something renders it, which this container cannot do for those regions. So it is left for
// a session that can see them -- TODO.md, "Ride along with the next all-builds rebuild".
#ifndef K_HEXTILE_INC
#define K_HEXTILE_INC

vec2 kh_hash2(vec2 p) {
	vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
	q += dot(q, q.yzx + 33.33);
	return fract((q.xx + q.yz) * q.zy);
}

// One layer of a Texture2DArray pair (albedo, and normal-xy + roughness + luminance detail), hex-tiled at p.
// dpdx/dpdy are p's screen derivatives, taken in uniform control flow by the caller so the mips stay right.
void kh_sample(sampler2DArray alb_arr, sampler2DArray nr_arr, float fl, vec2 p, vec2 dpdx, vec2 dpdy,
		out vec3 out_alb, out vec4 out_nr) {
	vec2 skew = vec2(p.x - 0.57735027 * p.y, 1.15470054 * p.y);
	vec2 base_i = floor(skew);
	vec2 f = fract(skew);
	float upper = step(1.0, f.x + f.y);
	vec2 v1 = base_i + vec2(upper, upper);
	vec2 v2 = base_i + vec2(1.0, 0.0);
	vec2 v3 = base_i + vec2(0.0, 1.0);

	float w1 = abs(1.0 - f.x - f.y);
	float w2 = upper > 0.5 ? (1.0 - f.y) : f.x;
	float w3 = upper > 0.5 ? (1.0 - f.x) : f.y;
	vec3 w = pow(max(vec3(w1, w2, w3), vec3(1e-4)), vec3(5.0));
	w /= (w.x + w.y + w.z);

	vec2 vs[3] = vec2[3](v1, v2, v3);
	float ws[3] = float[3](w.x, w.y, w.z);
	out_alb = vec3(0.0);
	out_nr = vec4(0.0);

	for (int k = 0; k < 3; k++) {
		if (ws[k] < 0.008) {
			continue;
		}
		vec2 h = kh_hash2(vs[k] + vec2(fl * 13.0, fl * 7.0));
		float ang = floor(h.x * 6.0) * 1.04719755 + (h.y - 0.5) * 0.25;
		float cs = cos(ang);
		float sn = sin(ang);
		vec2 vc = vec2(vs[k].x + 0.5 * vs[k].y, 0.8660254 * vs[k].y);
		vec2 rel = p - vc;
		vec2 ruv = vec2(cs * rel.x - sn * rel.y, sn * rel.x + cs * rel.y) + h;
		vec2 gdx = vec2(cs * dpdx.x - sn * dpdx.y, sn * dpdx.x + cs * dpdx.y);
		vec2 gdy = vec2(cs * dpdy.x - sn * dpdy.y, sn * dpdy.x + cs * dpdy.y);
		out_alb += textureGrad(alb_arr, vec3(ruv, fl), gdx, gdy).rgb * ws[k];
		out_nr += textureGrad(nr_arr, vec3(ruv, fl), gdx, gdy) * ws[k];
	}
}

#endif
