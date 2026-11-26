// The Catch and the Bowl's ground, at 2 km a sample (krator/catch_bowl.gd). A PREVIEW shader, not the open world's:
// shaders/terrain.gdshader is the 1:1 one and wants 64 m chunks with their own normal, crease and PBR array textures,
// which this host has none of -- it reads the scale model's own rasters and nothing else. When the region is cut this
// file goes with the rest of the preview host.
//
// WHAT IT IS FOR. The mesh has no detail below 2 km, so the floor came out as one flat wash of colour: true to the
// data and useless to look at. Everything here is NEAR-FIELD relief that the data cannot carry and the country would
// really have -- dune lines on the sand, scree on the scarps, and a general breakup of the tint bands -- faded out
// before it can alias, so a flyover still sees the honest shape of the land and a low camera sees ground.
//
// THE NOISE IS THE CORE'S. km_n from lib/breakup.gdshaderinc, the twin of KMAT.breakupHook and the same expression as
// three's kmH: sine-free, because fract(sin(large)) differs between GPUs. No new hash is written here.
//
// THE DUNES ARE TRANSVERSE AND ASYMMETRIC, which is the whole reason they read as dunes. A sine wave reads as
// corrugated iron. A real transverse dune runs across the wind with a long gentle windward rise and a short slipface
// at the angle of repose on the lee side, so the profile is a sawtooth, and its crest wanders rather than ruling a
// straight line across the basin. Spacing, height and the wind's bearing are uniforms the host sets.
shader_type spatial;

#include "res://shaders/lib/breakup.gdshaderinc"
#include "res://shaders/lib/hextile.gdshaderinc"
#include "res://shaders/lib/kground_kinds.gdshaderinc"

// THE GROUND'S OWN TEXTURE, hex-tiled (Mikkelsen 2022) out of core/materials/library through
// godot/tools/pack_ground_layers.py --set catch-bowl. Six layers in the roles terrain.gdshader gives the indices,
// so the set drops into the 1:1 shader when the region is cut. Two are sampled a fragment -- a base chosen by the
// province, and the rock -- and blended by slope: six taps, where blending all six would be eighteen.
uniform sampler2DArray gl_albedo : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2DArray gl_nr : filter_linear_mipmap_anisotropic, repeat_enable;
uniform bool has_layers = false;
uniform float tile_m[6];     // metres a tile per layer, set from layers.json (a uniform array cannot carry defaults)
uniform float tex_fade_m = 2600.0;   // the texture's own fade: 2.4 m grain is noise past this
uniform float tex_strength = 1.0;

uniform vec2 wind_dir = vec2(0.94, 0.34);   // unit, the prevailing wind the dunes lie across
uniform vec3 sun_dir = vec3(0.51, 0.56, 0.65);   // unit vector toward the sun, for quartz & salt micro-glints
uniform float glint_strength = 1.0;         // mineral micro-facet glints on sand and salt, 0..1.5
uniform float dune_spacing = 260.0;         // metres crest to crest
uniform float dune_height = 7.0;            // metres crest to trough
// EACH LAYER FADES AT ITS OWN SIZE, which the first pass got wrong by sharing one distance. A feature has to be
// several pixels across to read as relief and not as noise, so the 26 m scree must be gone within a kilometre while
// the 260 m dunes carry to nine and the 420 m breakup to twenty. Sharing the dunes' nine kilometres with the scree
// made the Bowl's rim look like soft grey cloud from 600 m up: that was the scree aliasing, not ground.
uniform float dune_fade_m = 9000.0;         // 260 m features
uniform float scree_fade_m = 1300.0;        // 26 m features
uniform float ripple_fade_m = 420.0;        // 0.5 m features: wind ripples, gone by a few hundred metres
uniform float ripple_m = 0.52;              // crest to crest, which is what a sand ripple actually measures
// 4.5 cm, at the deep end of the real range (2-6 cm). At 2 cm the shading under a sun 34 degrees up is almost
// nothing, and the reference photographs that make ripples the dominant texture of a dune field are all taken at a
// low sun that rakes them. Rather than fake the hour, the amplitude sits at the top of what sand really does.
uniform float ripple_h = 0.045;
uniform float swell_fade_m = 5000.0;        // 130 m features: the band between the scree and the dunes
uniform float breakup_fade_m = 20000.0;     // 420 m features
uniform float sand_top = 2600.0;            // above this the ground is rock, and rock does not drift
uniform float sand_flat = 0.055;            // the slope above which sand does not lie in sheets
uniform float scree_from = 0.10;            // the slope below which there is no scree
uniform float breakup = 0.16;               // how much the flat tint bands are allowed to vary
uniform float province = 1.0;               // the erg/reg mosaic, 0..1
uniform float detail = 1.0;                 // the whole near-field layer, 0..1

// a detail ratio made safe: mostly value, a third of the hue, and never more than a half stop either way
vec3 kh_tame(vec3 d) {
	float l = dot(d, vec3(0.3333));
	return clamp(mix(vec3(l), d, 0.34), vec3(0.62), vec3(1.55));
}

varying vec3 v_wpos;
varying vec3 v_wnorm;

void vertex() {
	v_wpos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	v_wnorm = normalize((MODEL_MATRIX * vec4(NORMAL, 0.0)).xyz);
}

// the dune field's height in metres at a world point, and its gradient along the wind.
// u runs along the wind in dune widths; the crest line wanders with a slow noise so it is not ruled straight.
float dune_u(vec2 xz) {
	float t = dot(xz, normalize(wind_dir)) / max(dune_spacing, 1.0);
	float wander = (km_n(vec3(xz * 0.00022, 11.0)) - 0.5) * 1.6;
	return t + wander;
}

// the asymmetric profile over one dune: 0.72 of it is the windward rise, 0.28 the slipface
float dune_prof(float u) {
	float f = fract(u);
	return f < 0.72 ? smoothstep(0.0, 1.0, f / 0.72) : 1.0 - smoothstep(0.0, 1.0, (f - 0.72) / 0.28);
}

void fragment() {
	vec3 wp = v_wpos;
	vec3 n = normalize(v_wnorm);
	float dist = length(wp - CAMERA_POSITION_WORLD);
	vec2 dpx = dFdx(wp.xz);
	vec2 dpy = dFdy(wp.xz);
	float px_fp = max(max(length(dpx), length(dpy)), dist * 0.0018);

	float d = clamp(detail, 0.0, 1.0);
	float near = (1.0 - smoothstep(0.0, dune_fade_m, dist)) * d;
	float nearS = (1.0 - smoothstep(scree_fade_m * 0.3, scree_fade_m, dist)) * d;
	float nearR = (1.0 - smoothstep(ripple_fade_m * 0.35, ripple_fade_m, dist)) * d;
	float nearW = (1.0 - smoothstep(swell_fade_m * 0.25, swell_fade_m, dist)) * d;
	float nearB = (1.0 - smoothstep(0.0, breakup_fade_m, dist)) * d;
	float slope = clamp(1.0 - n.y, 0.0, 1.0);

	vec3 col = COLOR.rgb;
	float rough = 0.95;
	float spec_amt = 0.20;

	// --- THE PROVINCES, and the only layer with no distance fade.
	float pv = km_n(vec3(wp.xz / 9000.0, 21.0)) * 0.65 + km_n(vec3(wp.xz / 31000.0, 23.0)) * 0.35;
	float low = (1.0 - smoothstep(sand_top - 400.0, sand_top + 900.0, wp.y))
		* (1.0 - smoothstep(0.08, 0.18, slope));
	float erg = smoothstep(0.50, 0.66, pv) * low * province;
	float reg = smoothstep(0.46, 0.30, pv) * low * province;
	float salty = (1.0 - smoothstep(-900.0, -300.0, wp.y)) * (1.0 - smoothstep(0.02, 0.06, slope));
	col *= mix(vec3(1.0), vec3(1.10, 1.03, 0.86), erg);      // sand sea: warmer and paler
	col *= mix(vec3(1.0), vec3(0.76, 0.78, 0.82), reg);      // gravel plain: darker and greyer
	rough += 0.03 * reg;

	float sand_mask = 0.0;
	if (nearB > 0.001) {
		// --- the tint bands break up, so a kilometre of floor is not one value
		float m1 = km_n(vec3(wp.xz / 420.0, 3.0)) - 0.5;
		float m2 = km_n(vec3(wp.xz / 85.0, 5.0)) - 0.5;
		col *= 1.0 + breakup * (m1 * 1.4 * nearB + m2 * 0.7 * nearS);

		// --- DUNES: sand, lying flat, below the rock line
		float sand = (1.0 - smoothstep(sand_top - 500.0, sand_top, wp.y))
			* (1.0 - smoothstep(sand_flat * 0.6, sand_flat, slope))
			* smoothstep(0.42, 0.62, pv)                                 // only in an erg: no dunes on a gravel plain
			* smoothstep(0.25, 0.6, km_n(vec3(wp.xz / 5200.0, 2.0)));   // and in patches within it
		sand_mask = sand;
		if (sand > 0.001) {
			vec2 w = normalize(wind_dir);
			vec2 perp = vec2(-w.y, w.x);
			float du = max(dune_spacing * 0.05, 4.5);
			float u0 = dune_u(wp.xz);
			float u_frac = fract(u0);
			float hc = dune_prof(u0);
			// BRINK SPLIT: 0..0.72 is the wind-packed stoss slope; 0.72..1.0 is the 33-degree leeward slipface
			float slip = smoothstep(0.705, 0.735, u_frac) * (1.0 - smoothstep(0.955, 0.995, u_frac));
			float brink = exp(-pow((u_frac - 0.72) / 0.028, 2.0));
			float hp = dune_prof(dune_u(wp.xz + w * du));
			float hm = dune_prof(dune_u(wp.xz - w * du));
			float g = (hp - hm) * dune_height / (2.0 * du);
			// sharpen the crest brink normal discontinuity so raking sun draws a crisp shadow edge along the dune crest
			g += (u_frac < 0.72 ? 0.08 : -0.22) * brink * (dune_height / 7.0);
			float cross_g = (km_n(vec3((wp.xz + perp * du) / 310.0, 8.0))
				- km_n(vec3((wp.xz - perp * du) / 310.0, 8.0))) * dune_height * 0.25 / (2.0 * du);
			vec2 slopev = -(w * g + perp * cross_g) * sand * near;
			n = normalize(n + vec3(slopev.x, 0.0, slopev.y));

			// --- WIND RIPPLES on the windward stoss only (the leeward slipface is smooth grainflow sand)
			float nearR_stoss = nearR * (1.0 - slip * 0.92);
			if (nearR_stoss > 0.002) {
				float ru = dot(wp.xz, w) / max(ripple_m, 0.05);
				ru += (km_n(vec3(wp.xz / 3.1, 31.0)) - 0.5) * 1.3;
				float rf = fract(ru);
				float rprof = rf < 0.68 ? smoothstep(0.0, 1.0, rf / 0.68) : 1.0 - smoothstep(0.0, 1.0, (rf - 0.68) / 0.32);
				float rd = 0.08;
				float rp = dot(wp.xz + w * rd, w) / max(ripple_m, 0.05) + (km_n(vec3((wp.xz + w * rd) / 3.1, 31.0)) - 0.5) * 1.3;
				float rm = dot(wp.xz - w * rd, w) / max(ripple_m, 0.05) + (km_n(vec3((wp.xz - w * rd) / 3.1, 31.0)) - 0.5) * 1.3;
				float pf = fract(rp);
				float mf = fract(rm);
				float pp = pf < 0.68 ? smoothstep(0.0, 1.0, pf / 0.68) : 1.0 - smoothstep(0.0, 1.0, (pf - 0.68) / 0.32);
				float mm2 = mf < 0.68 ? smoothstep(0.0, 1.0, mf / 0.68) : 1.0 - smoothstep(0.0, 1.0, (mf - 0.68) / 0.32);
				float rg = (pp - mm2) * ripple_h / (2.0 * rd);
				n = normalize(n + vec3(-w.x * rg, 0.0, -w.y * rg) * sand * nearR_stoss);
				col *= 1.0 + sand * nearR_stoss * 0.05 * (rprof - 0.5) * 2.0;
			}

			// --- GRAINFLOW / AVALANCHE TONGUES on the leeward slipface
			float slip_near = slip * sand * (1.0 - smoothstep(250.0, 1400.0, dist)) * d;
			if (slip_near > 0.005) {
				float av = km_n(vec3(dot(wp.xz, perp) / 3.8, dot(wp.xz, w) / 28.0, 41.0)) - 0.5;
				col *= 1.0 + slip_near * av * 0.11;
			}

			// windward stoss is wind-packed (paler, lower roughness ~0.79); slipface is loose & matte (~0.96)
			col *= 1.0 + sand * near * (0.12 * (hc - 0.5) * 2.0 - 0.045 * slip + 0.03 * brink);
			col *= mix(vec3(1.0), vec3(1.03, 0.99, 0.94), slip * sand * near);
			float dune_rough = mix(0.79, 0.96, slip);
			rough = mix(rough, dune_rough, sand * near * 0.85);
			spec_amt = mix(spec_amt, mix(0.28, 0.14, slip), sand * near);
		}

		// --- POLYGONAL SALT-PAN THRUST RIDGES (Bowl playa & sabkhas)
		float salt_near = salty * (1.0 - smoothstep(140.0, 520.0, dist)) * d;
		if (salt_near > 0.004) {
			vec3 q_id;
			vec4 poly_k = vec4(1.0 / 3.4, 0.055, 0.22, 0.82);
			vec3 poly = kg_polygon(wp.xz, poly_k, 0.075, px_fp, 19.0, q_id);
			vec3 q_dx; vec3 q_dz;
			float e_step = 0.14;
			float rim_x = kg_polygon(wp.xz + vec2(e_step, 0.0), poly_k, 0.075, px_fp, 19.0, q_dx).y
				- kg_polygon(wp.xz - vec2(e_step, 0.0), poly_k, 0.075, px_fp, 19.0, q_dx).y;
			float rim_z = kg_polygon(wp.xz + vec2(0.0, e_step), poly_k, 0.075, px_fp, 19.0, q_dz).y
				- kg_polygon(wp.xz - vec2(0.0, e_step), poly_k, 0.075, px_fp, 19.0, q_dz).y;
			n = normalize(n + vec3(-rim_x, 0.0, -rim_z) * (0.55 * salt_near));
			// silt-stained crack trough, bright efflorescent thrust lip, subtle cell-to-cell brine variation
			col *= 1.0 + salt_near * ((q_id.x - 0.5) * 0.06 + poly.y * 0.07 - poly.x * 0.18);
			col = mix(col, col * vec3(0.86, 0.80, 0.70), poly.x * salt_near * 0.65);
			rough = mix(rough, 0.72 + 0.18 * poly.x, salt_near * 0.75);
			spec_amt = mix(spec_amt, 0.34, salt_near * (1.0 - poly.x * 0.5));
		}

		// --- THE SWELL: bedrock rolling under the surface, 130 m across, everywhere the sand is not.
		float stony = (1.0 - smoothstep(0.30, 0.55, pv)) * 0.6 + smoothstep(0.06, 0.16, slope) * 0.8
			+ smoothstep(sand_top, sand_top + 900.0, wp.y) * 0.7;
		float swell = clamp(stony, 0.0, 1.0) * nearW;
		if (swell > 0.001) {
			float q = 65.0;
			float qx = km_n(vec3((wp.xz + vec2(q, 0.0)) / 130.0, 17.0)) - km_n(vec3((wp.xz - vec2(q, 0.0)) / 130.0, 17.0))
				+ 0.34 * (km_n(vec3((wp.xz + vec2(q * 0.33, 0.0)) / 44.0, 29.0)) - km_n(vec3((wp.xz - vec2(q * 0.33, 0.0)) / 44.0, 29.0)));
			float qz = km_n(vec3((wp.xz + vec2(0.0, q)) / 130.0, 17.0)) - km_n(vec3((wp.xz - vec2(0.0, q)) / 130.0, 17.0))
				+ 0.34 * (km_n(vec3((wp.xz + vec2(0.0, q * 0.33)) / 44.0, 29.0)) - km_n(vec3((wp.xz - vec2(0.0, q * 0.33)) / 44.0, 29.0)));
			n = normalize(n + vec3(qx, 0.0, qz) * 1.15 * swell);
			col *= 1.0 + 0.07 * swell * (km_n(vec3(wp.xz / 130.0, 17.0)) - 0.5) * 2.0;
		}

		// --- SCREE on the scarps: finer, harder relief, and darker than the bench above it
		float scree = smoothstep(scree_from, scree_from * 2.6, slope) * nearS;
		if (scree > 0.001) {
			float s = 14.0;
			float sx = km_n(vec3((wp.xz + vec2(s, 0.0)) / 26.0, 13.0)) - km_n(vec3((wp.xz - vec2(s, 0.0)) / 26.0, 13.0));
			float sz = km_n(vec3((wp.xz + vec2(0.0, s)) / 26.0, 13.0)) - km_n(vec3((wp.xz - vec2(0.0, s)) / 26.0, 13.0));
			n = normalize(n + vec3(sx, 0.0, sz) * 2.4 * scree);
			col *= 1.0 - 0.10 * scree;
			rough = min(1.0, rough + 0.04 * scree);
		}
	}

	// --- THE GRAIN.
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
			kh_sample(gl_albedo, gl_nr, base_fl, wp.xz / tile_m[bi], dpx / tile_m[bi], dpy / tile_m[bi], ab, nb);
			vec3 ar; vec4 nr2;
			kh_sample(gl_albedo, gl_nr, rock_fl, wp.xz / tile_m[ri], dpx / tile_m[ri], dpy / tile_m[ri], ar, nr2);
			// THE MEAN IS THE TEXTURE'S TOP MIP (lod 9), never an external table
			vec3 mb = textureLod(gl_albedo, vec3(0.5, 0.5, base_fl), 9.0).rgb;
			vec3 mr = textureLod(gl_albedo, vec3(0.5, 0.5, rock_fl), 9.0).rgb;
			vec3 ab_d = kh_tame(ab / max(mb, vec3(0.02)));
			vec3 ar_d = kh_tame(ar / max(mr, vec3(0.02)));
			vec3 grain = mix(ab_d, ar_d, rockw);
			vec4 gnr = mix(nb, nr2, rockw);

			vec3 tinted = col * mix(vec3(1.0), grain, 0.80);
			col = mix(col, tinted, tnear * tex_strength);
			vec2 tn = (gnr.rg * 2.0 - 1.0) * tnear * tex_strength;
			n = normalize(n + vec3(tn.x, 0.0, tn.y) * 0.5);
			rough = clamp(mix(rough, 0.82 + 0.16 * gnr.b, tnear * 0.6 * tex_strength), 0.72, 1.0);
		}
	}

	// --- MINERAL QUARTZ & HALITE MICRO-GLINTS (kg_glint, footprint-clamped so distant ground never shimmers)
	float glint_carrier = clamp(max(max(sand_mask, erg * 0.7), salty * 1.15), 0.0, 1.0) * glint_strength * d;
	if (glint_carrier > 0.01 && px_fp < 1.1) {
		vec3 sdir = normalize(sun_dir);
		float sun_up = smoothstep(0.02, 0.20, sdir.y);
		float g_fine = kg_glint(wp, CAMERA_POSITION_WORLD, sdir, 0.22, 0.52, 42.0, 0.42, px_fp, 17.0);
		float g_coarse = kg_glint(wp, CAMERA_POSITION_WORLD, sdir, 0.68, 0.44, 28.0, 0.28, px_fp, 53.0);
		float glint = (g_fine * 0.75 + g_coarse * 0.55) * glint_carrier * sun_up;
		vec3 glint_tint = mix(vec3(1.0, 0.92, 0.74), vec3(1.0, 0.98, 0.96), clamp(salty, 0.0, 1.0));
		col += glint_tint * glint * 0.42;
		spec_amt = clamp(spec_amt + glint * 0.45, 0.0, 0.85);
	}

	ALBEDO = col;
	NORMAL = (VIEW_MATRIX * vec4(n, 0.0)).xyz;
	ROUGHNESS = clamp(rough, 0.0, 1.0);
	SPECULAR = spec_amt;
}
