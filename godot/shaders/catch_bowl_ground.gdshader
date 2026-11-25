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

uniform vec2 wind_dir = vec2(0.94, 0.34);   // unit, the prevailing wind the dunes lie across
uniform float dune_spacing = 260.0;         // metres crest to crest
uniform float dune_height = 7.0;            // metres crest to trough
// EACH LAYER FADES AT ITS OWN SIZE, which the first pass got wrong by sharing one distance. A feature has to be
// several pixels across to read as relief and not as noise, so the 26 m scree must be gone within a kilometre while
// the 260 m dunes carry to nine and the 420 m breakup to twenty. Sharing the dunes' nine kilometres with the scree
// made the Bowl's rim look like soft grey cloud from 600 m up: that was the scree aliasing, not ground.
uniform float dune_fade_m = 9000.0;         // 260 m features
uniform float scree_fade_m = 1300.0;        // 26 m features
uniform float swell_fade_m = 5000.0;        // 130 m features: the band between the scree and the dunes
uniform float breakup_fade_m = 20000.0;     // 420 m features
uniform float sand_top = 2600.0;            // above this the ground is rock, and rock does not drift
uniform float sand_flat = 0.055;            // the slope above which sand does not lie in sheets
uniform float scree_from = 0.10;            // the slope below which there is no scree
uniform float breakup = 0.16;               // how much the flat tint bands are allowed to vary
uniform float province = 1.0;               // the erg/reg mosaic, 0..1
uniform float detail = 1.0;                 // the whole near-field layer, 0..1

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
	float d = clamp(detail, 0.0, 1.0);
	float near = (1.0 - smoothstep(0.0, dune_fade_m, dist)) * d;
	float nearS = (1.0 - smoothstep(scree_fade_m * 0.3, scree_fade_m, dist)) * d;
	float nearW = (1.0 - smoothstep(swell_fade_m * 0.25, swell_fade_m, dist)) * d;
	float nearB = (1.0 - smoothstep(0.0, breakup_fade_m, dist)) * d;
	float slope = clamp(1.0 - n.y, 0.0, 1.0);

	vec3 col = COLOR.rgb;
	float rough = 0.95;

	// --- THE PROVINCES, and the only layer with no distance fade.
	// Everything else here is arm's-length or near-field relief, so from eight kilometres up the floor fell back to
	// one flat wash -- which is what "flat and samey" was really about. A desert basin is not one surface: it is a
	// mosaic of ergs (sand seas: pale, warm, and the only place dunes form), reg or serir (gravel plains swept clean
	// of sand: darker, greyer, flatter in tone) and stone pavement. That mosaic is kilometres across, so it reads
	// from any height, and gating the dunes by it means the sand seas are visibly sand seas from the air.
	float pv = km_n(vec3(wp.xz / 9000.0, 21.0)) * 0.65 + km_n(vec3(wp.xz / 31000.0, 23.0)) * 0.35;
	float low = (1.0 - smoothstep(sand_top - 400.0, sand_top + 900.0, wp.y))
		* (1.0 - smoothstep(0.08, 0.18, slope));
	float erg = smoothstep(0.50, 0.66, pv) * low * province;
	float reg = smoothstep(0.46, 0.30, pv) * low * province;
	col *= mix(vec3(1.0), vec3(1.10, 1.03, 0.86), erg);      // sand sea: warmer and paler
	col *= mix(vec3(1.0), vec3(0.76, 0.78, 0.82), reg);      // gravel plain: darker and greyer
	rough += 0.03 * reg;

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
		if (sand > 0.001) {
			vec2 w = normalize(wind_dir);
			float du = max(dune_spacing * 0.08, 6.0);
			float u0 = dune_u(wp.xz);
			float hc = dune_prof(u0);
			// the gradient by a step along the wind: the profile is piecewise, so a difference is honest and an
			// analytic derivative would be wrong at the brink of the slipface
			float hp = dune_prof(dune_u(wp.xz + w * du));
			float hm = dune_prof(dune_u(wp.xz - w * du));
			float g = (hp - hm) * dune_height / (2.0 * du);
			// a cross-wind break so the crests are barchan-ish rather than endless ridges
			float cross_g = (km_n(vec3((wp.xz + vec2(-w.y, w.x) * du) / 310.0, 8.0))
				- km_n(vec3((wp.xz - vec2(-w.y, w.x) * du) / 310.0, 8.0))) * dune_height * 0.25 / (2.0 * du);
			vec2 perp = vec2(-w.y, w.x);
			vec2 slopev = -(w * g + perp * cross_g) * sand * near;
			n = normalize(n + vec3(slopev.x, 0.0, slopev.y));
			// the crest is scoured pale, the trough holds the coarse dark grains
			col *= 1.0 + sand * near * 0.12 * (hc - 0.5) * 2.0;
			rough -= sand * near * 0.08;
		}

		// --- THE SWELL: bedrock rolling under the surface, 130 m across, everywhere the sand is not.
		// Without it the stony ground went smooth between about a kilometre (where the scree fades) and nine
		// (where the dunes do), which is most of what a camera a few hundred metres up is looking at.
		float stony = (1.0 - smoothstep(0.30, 0.55, pv)) * 0.6 + smoothstep(0.06, 0.16, slope) * 0.8
			+ smoothstep(sand_top, sand_top + 900.0, wp.y) * 0.7;
		float swell = clamp(stony, 0.0, 1.0) * nearW;
		if (swell > 0.001) {
			// TWO SCALES, not one. A single 130 m frequency made the near ground look like brain coral: every
			// swell the same size and the same distance from the next. The second octave at a third of the size
			// and a third of the weight breaks that up, which is what real weathered bedrock does.
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

	ALBEDO = col;
	NORMAL = (VIEW_MATRIX * vec4(n, 0.0)).xyz;
	ROUGHNESS = clamp(rough, 0.0, 1.0);
	SPECULAR = 0.2;
}
