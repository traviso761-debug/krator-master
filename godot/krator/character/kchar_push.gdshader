// Every top and every pair of trousers or skirt (the twin of pushOut in core/charactermodels/src/50-figure.js): the
// garment's own look (albedo texture and colour, alpha cutoff, normal map, roughness, metallic, from the imported
// material: kchar_figure.gd _garment) plus two moves after skinning.
// - kcL 1 (kit item 'loose'): every vertex pushed out of the thighs, shins and feet, so no knee comes through between
//   two cloth chains. A thin band: d from the bone within r + 0.015 lands at r - 0.015 + d * 0.03 / (r + 0.015), so
//   two tiers of one skirt keep their order and cloth that lies right barely moves (a 4 cm shell outside r crumpled
//   flaps and a robe's back at rest); a thigh's top third pushes nothing behind it (the buttock: the seat covers it); inside a leg a vertex leaves on the side
//   away from the body's axis (kcH), never behind the knee. kcS draws each vertex to its nearest capsule only. The arms' capsules (kcB.w 1) are hard: only what is inside moves, so a raised arm lifts a
//   mantle's hem (and a giant's lower arms, 10-13; the seat, 14-15). kcA / kcB: the capsules' ends in the skeleton's space, kcA.w the radius (_leg_caps).
// - kcT > 0 (trousers or a skirt under a top that closes round the waist, kit item 'tucks'): the band above the hips
//   drawn in toward the body's axis by up to kcT, so a waistband stays under the top in any pose.
// - kcS > 0 (trousers under a loose top that reaches below the knees, kit item 'long'): below the hips drawn in to
//   within kcS of the legs' capsules (the first six: thighs, shins, feet), so wide ones stay under the robe.
shader_type spatial;
render_mode cull_disabled;

uniform sampler2D tex : source_color, hint_default_white, filter_linear_mipmap, repeat_enable;
uniform vec4 albedo : source_color = vec4(1.0);
uniform float alpha_cut = 0.0;
uniform sampler2D ntex : hint_normal, filter_linear_mipmap, repeat_enable;
uniform float nscale = 0.0;
uniform float rough = 0.85;
uniform float metal = 0.0;
uniform vec4 kcA[16];
uniform vec4 kcB[16];
// the radius at b (kcA.w is at a): a limb tapers (make_mpfb.py colliders ra, rb)
uniform float kcR[16];
uniform vec3 kcH;
// 2 cm more for a loose top (a robe's hem lies over the skirt it covers), 5.5 cm over trousers
uniform float kcP = 0.0;
uniform float kcL = 0.0;
uniform float kcT = 0.0;
uniform float kcS = 0.0;
// how far a fully bent knee's corner stands out of its two capsules
const float KNEE = 0.04;

void vertex() {
	if (kcL > 0.5) {
		// behind the hips: the seat's capsules (14, 15) lie behind them
		vec3 bk = (kcA[14].xyz + kcA[15].xyz) * 0.5 - kcH;
		bk.y = 0.0;
		bk *= kcA[14].w > 0.0 ? 1.0 / max(length(bk), 1e-5) : 0.0;
		for (int i = 0; i < 16; i++) {
			if (kcA[i].w <= 0.0) {
				continue;
			}
			vec3 a = kcA[i].xyz;
			vec3 ab = kcB[i].xyz - a;
			float sh = kcB[i].w > 0.5 ? 0.0 : 0.015;
			float t = dot(VERTEX - a, ab) / max(dot(ab, ab), 1e-8);
			if (i < 2 && t < 0.3 && (dot(VERTEX - a, bk) > 0.0 || kcA[14].w <= 0.0)) {
				continue;                // a thigh's top third, behind: its capsule took in the buttock
			}
			t = clamp(t, 0.0, 1.0);
			float r = mix(kcA[i].w, kcR[i] > 0.0 ? kcR[i] : kcA[i].w, t) + (sh > 0.0 ? kcP : 0.0);
			if (i < 4 && sh > 0.0) {
				// a bent knee's corner, which the thigh's and the shin's capsules leave uncovered (pushOut in 50-figure.js)
				int th = i < 2 ? i : i - 2;
				float bend = clamp(1.0 - dot(normalize(kcB[th].xyz - kcA[th].xyz), normalize(kcB[th + 2].xyz - kcA[th + 2].xyz)), 0.0, 1.0);
				r += KNEE * bend * (i < 2 ? smoothstep(0.7, 1.0, t) : 1.0 - smoothstep(0.0, 0.3, t));
			}
			float R = r + sh;
			vec3 q = a + ab * t;
			vec3 d = VERTEX - q;
			float l = length(d);
			if (l < R && l > 1e-5) {
				vec3 o = vec3(q.x - kcH.x, 0.0, q.z - kcH.z);
				float ol = length(o);
				if (l < r && sh > 0.0 && ol > 1e-4) {
					o /= ol;
					float s = dot(d, o);
					if (s < 0.0) {
						d -= 2.0 * s * o;
					}
					float w = 1.0 - l / r;   // deep in the limb, straight out that side (pushOut in 50-figure.js)
					w *= w;
					d = normalize(d) * (1.0 - w) + o * w;
				}
				VERTEX = q + normalize(d) * (r - sh + l * 2.0 * sh / R);   // a thin band: [0, r + sh] into [r - sh, r + sh]
			}
		}
	}
	if (kcS > 0.0 && VERTEX.y < kcH.y) {
		// to the nearest capsule only (to all six, a shin was pulled into a ball round the knee)
		float best = 1e9;
		vec3 bq = vec3(0.0);
		float br = 0.0;
		for (int i = 0; i < 6; i++) {
			if (kcA[i].w <= 0.0) {
				continue;
			}
			vec3 a = kcA[i].xyz;
			vec3 ab = kcB[i].xyz - a;
			float st = clamp(dot(VERTEX - a, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
			float r = mix(kcA[i].w, kcR[i] > 0.0 ? kcR[i] : kcA[i].w, st) + kcS;
			vec3 q = a + ab * st;
			float l = length(VERTEX - q);
			if (l - r < best) {
				best = l - r;
				bq = q;
				br = r;
			}
		}
		if (best > 0.0 && best < 0.15) {
			vec3 d = VERTEX - bq;
			VERTEX = bq + d * (br / length(d));
		}
	}
	if (kcT > 0.0) {
		float tf = smoothstep(kcH.y - 0.02, kcH.y + 0.06, VERTEX.y);
		vec2 td = VERTEX.xz - kcH.xz;
		float tl = length(td);
		if (tf > 0.0 && tl > 1e-4) {
			VERTEX.xz = kcH.xz + td * (max(tl - kcT * tf, 0.5 * tl) / tl);
		}
	}
}

void fragment() {
	vec4 c = texture(tex, UV) * albedo;
	ALBEDO = c.rgb;
	ALPHA = c.a;
	ALPHA_SCISSOR_THRESHOLD = alpha_cut;
	NORMAL_MAP = texture(ntex, UV).rgb;
	NORMAL_MAP_DEPTH = nscale;
	ROUGHNESS = rough;
	METALLIC = metal;
}
