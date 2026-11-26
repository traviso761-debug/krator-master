// The Catch and the Bowl's ground, at 2 km a sample (krator/catch_bowl.gd). A PREVIEW shader, not the open world's:
// shaders/terrain.gdshader is the 1:1 one and wants 64 m chunks with their own normal, crease and PBR array textures,
// which this host has none of -- it reads the scale model's own rasters and nothing else. When the region is cut this
// file goes with the rest of the preview host.
//
// WHAT IT IS FOR. The mesh has no detail below 2 km, so the floor came out as one flat wash of colour: true to the
// data and useless to look at. Everything here is NEAR-FIELD relief that the data cannot carry and the country would
// really have -- sinuous barchanoid dune lines on the sand, polygonal halite crust on the salt, scree on the scarps,
// and an organic breakup of the elevation bands -- faded out before it can alias, so a flyover still sees the honest
// shape of the land and a low camera sees ground.
//
// THE NOISE IS THE CORE'S. km_n from lib/breakup.gdshaderinc, the twin of KMAT.breakupHook and the same expression as
// three's kmH: sine-free, because fract(sin(large)) differs between GPUs. No new hash is written here.
shader_type spatial;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/breakup.gdshaderinc"
#include "res://shaders/lib/hextile.gdshaderinc"
#include "res://shaders/lib/kground_kinds.gdshaderinc"

uniform sampler2DArray gl_albedo : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2DArray gl_nr : filter_linear_mipmap_anisotropic, repeat_enable;
uniform bool has_layers = false;
uniform float tile_m[6];     // metres a tile per layer, set from layers.json
uniform float tex_fade_m = 2600.0;
uniform float tex_strength = 1.0;

uniform vec2 wind_dir = vec2(0.80, -0.60);  // unit, prevailing wind the dunes lie across
uniform vec3 sun_dir = vec3(0.51, 0.56, 0.65);
uniform float glint_strength = 1.0;
uniform float dune_spacing = 260.0;         // metres crest to crest
uniform float dune_height = 7.0;            // metres crest to trough
uniform float dune_fade_m = 9000.0;
uniform float scree_fade_m = 1300.0;
uniform float ripple_fade_m = 420.0;
uniform float ripple_m = 0.52;
uniform float ripple_h = 0.045;
uniform float swell_fade_m = 5000.0;
uniform float breakup_fade_m = 20000.0;
uniform float sand_top = 2600.0;
uniform float sand_flat = 0.055;
uniform float scree_from = 0.10;
uniform float breakup = 0.16;
uniform float province = 1.0;
uniform float detail = 1.0;

// Detail ratio clamped around neutral so hex-tiled textures carry value & grain without bleaching
vec3 kh_tame(vec3 d) {
	float l = dot(d, vec3(0.3333));
	return clamp(mix(vec3(l), d, 0.42), vec3(0.58), vec3(1.48));
}

varying vec3 v_wpos;
varying vec3 v_wnorm;
varying vec2 v_near_xz;    // camera-snapped (8192 m quantum) for sub-mm float32 precision up to 1,284 km
varying float v_vshade;    // smooth macro slope darkening from vertex color without 2 km contour steps

void vertex() {
	vec3 wp = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	v_wpos = wp;
	v_wnorm = normalize((MODEL_MATRIX * vec4(NORMAL, 0.0)).xyz);
	vec2 near_org = floor(CAMERA_POSITION_WORLD.xz / 8192.0) * 8192.0;
	v_near_xz = wp.xz - near_org;
	v_vshade = dot(COLOR.rgb, vec3(0.3333));
}

// Per-fragment sRGB desert elevation palette (converted to linear via k_s2l): eliminates 2 km Gouraud vertex banding
vec3 desert_hypsometric_srgb(float h) {
	vec3 c_salt  = vec3(0.84, 0.80, 0.72);   // <-850 m: Bowl halite playa & sabkha crust (bright warm ivory)
	vec3 c_floor = vec3(0.73, 0.57, 0.37);   // -850..600 m: Catch & Bowl sand/silt floor (sunlit golden ochre)
	vec3 c_fan   = vec3(0.56, 0.43, 0.31);   // 600..2600 m: alluvial fans, bajadas & pediment benches
	vec3 c_rock  = vec3(0.40, 0.33, 0.29);   // 2600..4600 m: dark ironstone & canyon bedrock
	vec3 c_high  = vec3(0.50, 0.49, 0.51);   // 4600..6800 m: cold wind-scoured outer wall
	vec3 c_crest = vec3(0.88, 0.90, 0.94);   // >6800 m: rime & high neve crests

	vec3 c = mix(c_salt, c_floor, smoothstep(-1080.0, -560.0, h));
	c = mix(c, c_fan, smoothstep(320.0, 980.0, h));
	c = mix(c, c_rock, smoothstep(2150.0, 3050.0, h));
	c = mix(c, c_high, smoothstep(4200.0, 5100.0, h));
	c = mix(c, c_crest, smoothstep(6400.0, 7500.0, h));
	return k_s2l(max(c, vec3(0.0)));
}

// Sinuous barchanoid / akle dune phase: multi-octave domain-warped meander so crests curve into organic crescents
// and anastomosing lobes rather than ruling straight 4.5 km lines down the basin.
float dune_u(vec2 xz) {
	vec2 w = normalize(wind_dir);
	vec2 perp = vec2(-w.y, w.x);
	float sp = max(dune_spacing, 1.0);
	// Broad domain warp breaks parallel railroad-track lock between neighbouring ridges
	vec2 warp = vec2(
		km_n(vec3(xz / 1350.0, 4.3)) - 0.5,
		km_n(vec3(xz / 1350.0, 9.7)) - 0.5
	) * (sp * 1.15);
	vec2 xzw = xz + warp;
	float along_w = dot(xzw, w);
	float along_c = dot(xzw, perp);
	float t = along_w / sp;
	// 3-scale sinuosity: 4.5 km regional drift + 480 m barchanoid crescent lobes + 170 m horn scallops
	float m_macro = (km_n(vec3(xz * 0.00022, 11.0)) - 0.5) * 1.35;
	float m_lobe = (km_n(vec3(along_c / 460.0, along_w / 340.0, 15.0)) - 0.5) * 0.92;
	float m_horn = (km_n(vec3(along_c / 168.0, along_w / 145.0, 25.0)) - 0.5) * 0.34;
	return t + m_macro + m_lobe + m_horn;
}

// Asymmetric profile over one dune: 0.72 of it is the windward rise, 0.28 the leeward slipface
float dune_prof(float u) {
	float f = fract(u);
	return f < 0.72 ? smoothstep(0.0, 1.0, f / 0.72) : 1.0 - smoothstep(0.0, 1.0, (f - 0.72) / 0.28);
}

// Smooth analytic derivative d(dune_prof)/du with C1-rounded brink & toe rollover (zero discontinuous step or boxcar facets)
float dune_dp_du(float u) {
	float f = fract(u);
	float ts = clamp(f / 0.72, 0.0, 1.0);
	float d_stoss = (6.0 * ts * (1.0 - ts)) / 0.72;
	float tl = clamp((f - 0.72) / 0.28, 0.0, 1.0);
	float d_lee = -(6.0 * tl * (1.0 - tl)) / 0.28;
	float w_lee = smoothstep(0.685, 0.755, f) * (1.0 - smoothstep(0.955, 1.0, f));
	return mix(d_stoss, d_lee, w_lee);
}

void fragment() {
	vec3 wp = v_wpos;
	vec2 np = v_near_xz;
	vec3 n = normalize(v_wnorm);
	float dist = length(wp - CAMERA_POSITION_WORLD);
	vec2 dpx = dFdx(np);
	vec2 dpy = dFdy(np);
	float px_fp = max(max(length(dpx), length(dpy)), dist * 0.0018);

	float d = clamp(detail, 0.0, 1.0);
	float near = (1.0 - smoothstep(0.0, dune_fade_m, dist)) * d;
	float nearS = (1.0 - smoothstep(scree_fade_m * 0.3, scree_fade_m, dist)) * d;
	float nearR = (1.0 - smoothstep(ripple_fade_m * 0.35, ripple_fade_m, dist)) * d;
	float nearW = (1.0 - smoothstep(swell_fade_m * 0.25, swell_fade_m, dist)) * d;
	float nearB = (1.0 - smoothstep(0.0, breakup_fade_m, dist)) * d;
	float slope = clamp(1.0 - n.y, 0.0, 1.0);

	// Organic contour breakup on elevation before looking up hypsometric linear color: zero 2 km vertex stripes
	float h_break = (km_n(vec3(wp.xz / 1200.0, 6.0)) - 0.5) * 210.0 + (km_n(vec3(wp.xz / 290.0, 14.0)) - 0.5) * 55.0;
	vec3 col = desert_hypsometric_srgb(wp.y + h_break);
	// Smooth macro slope darkening from mesh normal (continuous across faces rather than vertex-stepped)
	col *= 1.0 - clamp(slope * 1.35, 0.0, 0.48);
	float rough = 0.94;
	float spec_amt = 0.18;
	float ao = 1.0;

	// --- THE PROVINCES (erg sand seas, dark reg lag gravel, Bowl salt playa)
	float pv = km_n(vec3(wp.xz / 9000.0, 21.0)) * 0.65 + km_n(vec3(wp.xz / 31000.0, 23.0)) * 0.35;
	float low = (1.0 - smoothstep(sand_top - 400.0, sand_top + 900.0, wp.y))
		* (1.0 - smoothstep(0.08, 0.18, slope));
	float erg = smoothstep(0.48, 0.66, pv) * low * province;
	float reg = smoothstep(0.46, 0.28, pv) * low * province;
	float salty = (1.0 - smoothstep(-980.0, -480.0, wp.y + h_break * 0.45)) * (1.0 - smoothstep(0.02, 0.06, slope));
	col = mix(col, col * vec3(1.14, 0.96, 0.72), erg);       // erg: deeper warm golden sand
	col = mix(col, col * vec3(0.62, 0.60, 0.62), reg);       // reg: dark desert-varnished lag gravel
	rough += 0.03 * reg;

	float sand_mask = 0.0;
	if (nearB > 0.001) {
		float m1 = km_n(vec3(wp.xz / 420.0, 3.0)) - 0.5;
		float m2 = km_n(vec3(wp.xz / 85.0, 5.0)) - 0.5;
		col *= 1.0 + breakup * (m1 * 1.35 * nearB + m2 * 0.75 * nearS);

		// --- DUNES: sinuous barchanoid ridges with variable summit/saddle height along the crest
		float sand = (1.0 - smoothstep(sand_top - 500.0, sand_top, wp.y))
			* (1.0 - smoothstep(sand_flat * 0.6, sand_flat, slope))
			* smoothstep(0.40, 0.62, pv)
			* smoothstep(0.24, 0.60, km_n(vec3(wp.xz / 5200.0, 2.0)))
			* (1.0 - salty * 0.85);   // dry salt flats carry scattered low sheets, not tall dunes
		sand_mask = sand;
		if (sand > 0.001) {
			vec2 w = normalize(wind_dir);
			vec2 perp = vec2(-w.y, w.x);
			float u0 = dune_u(wp.xz);
			float u_frac = fract(u0);
			float hc = dune_prof(u0);
			// Variable barchanoid height along the ridge: rises at crescent summits, drops in inter-barchan cols
			float crest_mod = 0.34 + 0.82 * smoothstep(0.18, 0.84,
				km_n(vec3(wp.xz / 330.0, 27.0)) * 0.62 + km_n(vec3(wp.xz / 860.0, 33.0)) * 0.38);

			float slip = smoothstep(0.70, 0.75, u_frac) * (1.0 - smoothstep(0.94, 0.995, u_frac));
			float db = (u_frac - 0.72) / 0.042;
			float brink = exp(-db * db);

			// Exact smooth gradient: d(prof)/du * grad(dune_u) at fine 2.2 m step (no 13 m boxcar facets or ternary jumps)
			float du_step = 2.2;
			vec2 grad_u = vec2(
				dune_u(wp.xz + vec2(du_step, 0.0)) - dune_u(wp.xz - vec2(du_step, 0.0)),
				dune_u(wp.xz + vec2(0.0, du_step)) - dune_u(wp.xz - vec2(0.0, du_step))
			) / (2.0 * du_step);
			float dp = dune_dp_du(u0) * dune_height * crest_mod;

			// Soften flat-mesh normal exaggeration when a low grazing ray looks nearly parallel to the local crest line
			vec3 view_vec = wp - CAMERA_POSITION_WORLD;
			vec2 view_xz = length(view_vec.xz) > 1e-3 ? normalize(view_vec.xz) : w;
			vec2 grad_dir = length(grad_u) > 1e-5 ? normalize(grad_u) : w;
			float graze_flat = 1.0 - smoothstep(0.04, 0.22, abs(view_vec.y) / max(dist, 1.0));
			float parallel_crest = clamp(1.0 - abs(dot(view_xz, grad_dir)), 0.0, 1.0);
			float flat_guard = 1.0 - 0.48 * graze_flat * (parallel_crest * parallel_crest);

			vec2 slopev = -(grad_u * dp) * sand * near * flat_guard;
			n = normalize(n + vec3(slopev.x, 0.0, slopev.y));

			// --- WIND RIPPLES on windward stoss (evaluated on sub-mm v_near_xz so 0.52 m waves never quantize)
			float nearR_stoss = nearR * (1.0 - slip * 0.92);
			if (nearR_stoss > 0.002) {
				vec2 near_org = wp.xz - np;
				float phase0 = mod(dot(near_org, w) / max(ripple_m, 0.05), 1.0);
				float ru = phase0 + dot(np, w) / max(ripple_m, 0.05);
				ru += (km_n(vec3(wp.xz / 3.4, 31.0)) - 0.5) * 1.45;
				float rf = fract(ru);
				float rprof = rf < 0.68 ? smoothstep(0.0, 1.0, rf / 0.68) : 1.0 - smoothstep(0.0, 1.0, (rf - 0.68) / 0.32);
				float r_dp = (rf < 0.68 ? (6.0 * (rf / 0.68) * (1.0 - rf / 0.68)) / 0.68 : -(6.0 * ((rf - 0.68) / 0.32) * (1.0 - (rf - 0.68) / 0.32)) / 0.32);
				float rg = (r_dp * ripple_h / max(ripple_m, 0.05)) * (1.0 - smoothstep(0.10, 0.28, px_fp));
				n = normalize(n + vec3(-w.x * rg, 0.0, -w.y * rg) * sand * nearR_stoss);
				col *= 1.0 + sand * nearR_stoss * 0.06 * (rprof - 0.5) * 2.0;
			}

			// --- GRAINFLOW / AVALANCHE TONGUES on the leeward slipface
			float slip_near = slip * sand * (1.0 - smoothstep(250.0, 1400.0, dist)) * d;
			if (slip_near > 0.005) {
				float av = km_n(vec3(dot(wp.xz, perp) / 4.2, dot(wp.xz, w) / 26.0, 41.0)) - 0.5;
				col *= 1.0 + slip_near * av * 0.12;
			}

			// Warm golden crest & wind-packed stoss (~0.79 rough) vs deeper ochre loose slipface (~0.96 rough)
			float amp_k = sand * near * crest_mod;
			col *= 1.0 + amp_k * (0.11 * (hc - 0.5) * 2.0 - 0.07 * slip + 0.025 * brink);
			col = mix(col, col * vec3(1.04, 0.94, 0.82), slip * amp_k * 0.75);
			ao *= 1.0 - 0.14 * (1.0 - hc) * amp_k;
			float dune_rough = mix(0.79, 0.96, slip);
			rough = mix(rough, dune_rough, sand * near * 0.85);
			spec_amt = mix(spec_amt, mix(0.28, 0.13, slip), sand * near);
		}

		// --- POLYGONAL SALT-PAN THRUST RIDGES (evaluated on sub-mm v_near_xz so 3.4 m Voronoi cells stay crisp)
		float salt_near = salty * (1.0 - smoothstep(140.0, 560.0, dist)) * d;
		if (salt_near > 0.004) {
			vec3 q_id;
			vec4 poly_k = vec4(1.0 / 3.4, 0.055, 0.22, 0.82);
			vec3 poly = kg_polygon(np, poly_k, 0.075, px_fp, 19.0, q_id);
			vec3 q_dx; vec3 q_dz;
			float e_step = 0.12;
			float rim_x = kg_polygon(np + vec2(e_step, 0.0), poly_k, 0.075, px_fp, 19.0, q_dx).y
				- kg_polygon(np - vec2(e_step, 0.0), poly_k, 0.075, px_fp, 19.0, q_dx).y;
			float rim_z = kg_polygon(np + vec2(0.0, e_step), poly_k, 0.075, px_fp, 19.0, q_dz).y
				- kg_polygon(np - vec2(0.0, e_step), poly_k, 0.075, px_fp, 19.0, q_dz).y;
			n = normalize(n + vec3(-rim_x, 0.0, -rim_z) * (0.58 * salt_near));
			col *= 1.0 + salt_near * ((q_id.x - 0.5) * 0.09 + poly.y * 0.08 - poly.x * 0.26);
			col = mix(col, col * vec3(0.76, 0.64, 0.48), poly.x * salt_near * 0.80);   // warm silt-stained polygon crack
			ao *= 1.0 - 0.22 * poly.x * salt_near;
			rough = mix(rough, 0.68 + 0.22 * poly.x, salt_near * 0.80);
			spec_amt = mix(spec_amt, 0.36, salt_near * (1.0 - poly.x * 0.5));
		}

		// --- THE SWELL: rolling pediment & sabkha micro-undulation where dunes thin out
		float stony = (1.0 - smoothstep(0.30, 0.55, pv)) * 0.55 + smoothstep(0.06, 0.16, slope) * 0.80
			+ smoothstep(sand_top, sand_top + 900.0, wp.y) * 0.70;
		float swell = clamp(stony, 0.0, 1.0) * nearW * (1.0 - salty * 0.55);
		if (swell > 0.001) {
			float q = 65.0;
			float qx = km_n(vec3((wp.xz + vec2(q, 0.0)) / 130.0, 17.0)) - km_n(vec3((wp.xz - vec2(q, 0.0)) / 130.0, 17.0))
				+ 0.34 * (km_n(vec3((wp.xz + vec2(q * 0.33, 0.0)) / 44.0, 29.0)) - km_n(vec3((wp.xz - vec2(q * 0.33, 0.0)) / 44.0, 29.0)));
			float qz = km_n(vec3((wp.xz + vec2(0.0, q)) / 130.0, 17.0)) - km_n(vec3((wp.xz - vec2(0.0, q)) / 130.0, 17.0))
				+ 0.34 * (km_n(vec3((wp.xz + vec2(0.0, q * 0.33)) / 44.0, 29.0)) - km_n(vec3((wp.xz - vec2(0.0, q * 0.33)) / 44.0, 29.0)));
			n = normalize(n + vec3(qx, 0.0, qz) * 0.92 * swell);
			col *= 1.0 + 0.07 * swell * (km_n(vec3(wp.xz / 130.0, 17.0)) - 0.5) * 2.0;
		}

		// --- SCREE on the scarps
		float scree = smoothstep(scree_from, scree_from * 2.6, slope) * nearS;
		if (scree > 0.001) {
			float s = 14.0;
			float sx = km_n(vec3((wp.xz + vec2(s, 0.0)) / 26.0, 13.0)) - km_n(vec3((wp.xz - vec2(s, 0.0)) / 26.0, 13.0));
			float sz = km_n(vec3((wp.xz + vec2(0.0, s)) / 26.0, 13.0)) - km_n(vec3((wp.xz - vec2(0.0, s)) / 26.0, 13.0));
			n = normalize(n + vec3(sx, 0.0, sz) * 2.2 * scree);
			col *= 1.0 - 0.14 * scree;
			ao *= 1.0 - 0.18 * scree;
			rough = min(1.0, rough + 0.04 * scree);
		}
	}

	// --- THE GRAIN (sampled on camera-snapped v_near_xz so 1.4..4.2 m hex tiles never quantize at 1,000 km)
	if (has_layers) {
		float tnear = 1.0 - smoothstep(tex_fade_m * 0.45, tex_fade_m, dist);
		if (tnear > 0.002) {
			float highy = smoothstep(sand_top, sand_top + 1200.0, wp.y) * (1.0 - smoothstep(0.10, 0.22, slope));
			float base_fl = 0.0;
			float best = max(erg, 0.08);
			if (reg > best) { best = reg; base_fl = 3.0; }
			if (salty > best) { best = salty; base_fl = 1.0; }
			if (highy > best) { best = highy; base_fl = 2.0; }
			float rock_fl = slope > scree_from * 2.2 ? 4.0 : 5.0;
			float rockw = smoothstep(scree_from * 0.8, scree_from * 2.4, slope);

			int bi = int(base_fl);
			int ri = int(rock_fl);
			vec3 ab; vec4 nb;
			kh_sample(gl_albedo, gl_nr, base_fl, np / tile_m[bi], dpx / tile_m[bi], dpy / tile_m[bi], ab, nb);
			vec3 ar; vec4 nr2;
			kh_sample(gl_albedo, gl_nr, rock_fl, np / tile_m[ri], dpx / tile_m[ri], dpy / tile_m[ri], ar, nr2);
			// THE MEAN IS THE TEXTURE'S TOP MIP (lod 9), never an external table
			vec3 mb = k_tex(textureLod(gl_albedo, vec3(0.5, 0.5, base_fl), 9.0).rgb);
			vec3 mr = k_tex(textureLod(gl_albedo, vec3(0.5, 0.5, rock_fl), 9.0).rgb);
			vec3 ab_d = kh_tame(k_tex(ab) / max(mb, vec3(0.02)));
			vec3 ar_d = kh_tame(k_tex(ar) / max(mr, vec3(0.02)));
			vec3 grain = mix(ab_d, ar_d, rockw);
			vec4 gnr = mix(nb, nr2, rockw);

			vec3 tinted = col * mix(vec3(1.0), grain, 0.85);
			col = mix(col, tinted, tnear * tex_strength);
			vec2 tn = (gnr.rg * 2.0 - 1.0) * tnear * tex_strength;
			n = normalize(n + vec3(tn.x, 0.0, tn.y) * 0.62);
			rough = clamp(mix(rough, 0.78 + 0.18 * gnr.b, tnear * 0.65 * tex_strength), 0.68, 1.0);
		}
	}

	// --- MINERAL QUARTZ & HALITE MICRO-GLINTS (evaluated on camera-local 3D position for sub-mm precision)
	float glint_carrier = clamp(max(max(sand_mask, erg * 0.7), salty * 1.15), 0.0, 1.0) * glint_strength * d;
	if (glint_carrier > 0.01 && px_fp < 1.1) {
		vec3 sdir = normalize(sun_dir);
		float sun_up = smoothstep(0.02, 0.20, sdir.y);
		vec3 p_loc = vec3(np.x, wp.y, np.y);
		vec3 cam_loc = p_loc - (wp - CAMERA_POSITION_WORLD);
		float g_fine = kg_glint(p_loc, cam_loc, sdir, 0.22, 0.52, 42.0, 0.42, px_fp, 17.0);
		float g_coarse = kg_glint(p_loc, cam_loc, sdir, 0.68, 0.44, 28.0, 0.28, px_fp, 53.0);
		float glint = (g_fine * 0.75 + g_coarse * 0.55) * glint_carrier * sun_up;
		vec3 glint_tint = mix(vec3(0.95, 0.78, 0.48), vec3(0.95, 0.92, 0.86), clamp(salty, 0.0, 1.0));
		col += glint_tint * glint * 0.28;
		spec_amt = clamp(spec_amt + glint * 0.40, 0.0, 0.85);
	}

	ALBEDO = k_albedo(col);
	NORMAL = normalize((VIEW_MATRIX * vec4(n, 0.0)).xyz);
	ROUGHNESS = clamp(rough, 0.0, 1.0);
	SPECULAR = spec_amt;
	AO = clamp(ao, 0.35, 1.0);
	AO_LIGHT_AFFECT = 0.35;
}
