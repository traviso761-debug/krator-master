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
//   drawn in toward the trunk's axis (kcH up kcU) by up to kcT, so a waistband stays under the top in any pose.
// - kcS > 0 (trousers under a loose top; to its hem, kcSH, unless it reaches below the knees, kit item 'long'): below the hips drawn in to
//   within kcS of the legs' capsules (the first six: thighs, shins, feet), so wide ones stay under the robe.
//
// The push itself, kc_push(VERTEX, NORMAL) in a vertex(): kchar_push.gdshader draws the garment with it, kchar_fur.gdshader
// its fur shells (they stand on the cloth where it is pushed to).
uniform vec4 kcA[16];
uniform vec4 kcB[16];
// the radius at b (kcA.w is at a): a limb tapers (make_mpfb.py colliders ra, rb)
uniform float kcR[16];
uniform vec3 kcH;
// the trunk's up (the hips to Spine1, turned from its rest way, applied to +y): +y standing as at rest
uniform vec3 kcU = vec3(0.0, 1.0, 0.0);
// 2 cm more for a loose top (a robe's hem lies over the skirt it covers), 4 cm over a skirt
uniform float kcP = 0.0;
// 3.5 cm more over trousers (PAD_OVER), as much of it as the stride asks: kcM, from none standing to all in a walk
uniform float kcPO = 0.0;
uniform float kcM = 0.0;
// a slit's top above the knee (kit part slit; -1 none), and the knee at rest: below it the legs do not push (pushOut in 50-figure.js)
uniform float kcSl = -1.0;
uniform float kcK = 0.0;
uniform float kcL = 0.0;
uniform float kcT = 0.0;
const float BACK_DEPTH = 0.01;
uniform float kcS = 0.0;
uniform float kcSH = 1000.0;   // the top's hem, of the hip-to-ankle length: the squeeze stops there (1000: all the way)
// how far a fully bent knee's corner stands out of its two capsules
const float KNEE = 0.04;
// the hull (pushOut in 50-figure.js): the leg's six points each (mid-thigh, knee, mid-shin, ankle, heel, toes), the lowest
// hem worn, 1 for a garment with no chains (the hull in place of the legs' capsules, at rest too), and what stands its pelvis back up
uniform vec4 kcE[12];
uniform float kcHm = 0.0;
uniform float kcEO = 0.0;
uniform mat3 kcTl = mat3(1.0);

// kv the skinned vertex, kn its normal, ry and rr its rest height and its rest distance from the axis (CUSTOM1)
void kc_push(inout vec3 kv, vec3 kn, float ry, float rr) {
	// behind the hips: the seat's capsules (14, 15) lie behind them
	vec3 bk = (kcA[14].xyz + kcA[15].xyz) * 0.5 - kcH;
	bk.y = 0.0;
	bk *= kcA[14].w > 0.0 ? 1.0 / max(length(bk), 1e-5) : 0.0;
	vec3 clat = vec3(bk.z, 0.0, -bk.x);
	float cflap = kcL > 0.1 && kcL < 0.5 && kcS > 0.0 && kcSH < 1.0 && rr > 0.142 && ry > 0.45 && abs(dot(kv - kcH, bk)) > abs(dot(kv - kcH, clat)) * 1.1 ? 1.0 : 0.0;
	float cloose = (kcL > 0.5 && !(kcS > 0.0 && kcSH > 10.0)) || cflap > 0.5 ? 1.0 : 0.0;
	float ceo = kcEO > 0.5 && cloose > 0.5 && (rr < 0.22 || ry < 0.88) ? 1.0 : 0.0;
	float cshort = smoothstep(0.32, 0.44, kcHm);
	if (cloose > 0.5) {
		float ctier = clamp(rr - (0.24 - 0.12 * clamp(ry, 0.0, 0.80)), 0.0, 0.16) * smoothstep(0.15, 0.32, ry) * (1.0 - smoothstep(0.82, 1.04, ry));
		for (int i = 0; i < 16; i++) {
			// a chainless garment (ceo) takes the hull in place of every limb's capsule; the arms' hard capsules (kcB.w 1) push
			// only what hangs out near them at rest (pushOut in 50-figure.js: |x| there, the rest distance from the axis here)
			if (kcA[i].w <= 0.0 || (ceo > 0.5 && i < 14) || (kcB[i].w > 0.5 && (kcEO > 0.5 || rr < 0.20 || ry < 1.05))) {
				continue;
			}
			vec3 a = kcA[i].xyz;
			vec3 ab = kcB[i].xyz - a;
			float sh = kcB[i].w > 0.5 ? 0.0 : 0.015;
			float sl = kcSl > -0.5 && i < 6 ? smoothstep(kcK + kcSl - 0.08, kcK + kcSl + 0.02, ry) : 1.0;
			if (sl <= 0.0) {
				continue;
			}
			float t = dot(kv - a, ab) / max(dot(ab, ab), 1e-8);
			// how far the limb has left hanging (a shin takes its thigh's too): deep is measured from the bare limb on a
			// hanging leg, or the mirror below folds ordinary cloth round it (pushOut in 50-figure.js)
			int tl = i < 2 ? i : i - 2;
			vec3 td = i < 4 ? kcB[tl].xyz - kcA[tl].xyz : ab;
			float lift = smoothstep(0.12, 0.4, 1.0 - abs(td.y) / max(length(td), 1e-5));
			if (i >= 2 && i < 4) {
				lift = max(lift, smoothstep(0.3, 0.6, 1.0 - abs(ab.y) / max(length(ab), 1e-5)));
			}
			// a thigh's top, behind: its capsule took in the buttock (faded, as pushOut in 50-figure.js)
			float cu = 1.0;
			if (i < 2) {
				cu = kcA[14].w <= 0.0 ? 0.0 : 1.0 - smoothstep(-0.05, 0.0, dot(kv - a, bk));
				cu = max(cu, smoothstep(0.3, 0.4, t));
				if (cu <= 0.0) {
					continue;
				}
			}
			t = clamp(t, 0.0, 1.0);
			vec3 q = a + ab * t;
			vec3 d = kv - q;
			float l = length(d);
			float ccr = i < 2 ? smoothstep(0.42, 0.68, 1.0 - abs(ab.y) / max(length(ab), 1e-5)) * smoothstep(-0.04, 0.03, d.y) : (i >= 10 && kcB[i].w < 0.5 ? smoothstep(-0.02, 0.04, ry - 0.88) : 0.0);
			float pd = sh > 0.0 ? kcP + cflap * 0.035 + kcPO * kcM + (i >= 14 ? (ctier + cflap * 0.035) * 0.9 * kcM : 0.0) + smoothstep(0.03, 0.04, kcP) * 0.075 * ccr : 0.0;
			float r = mix(kcA[i].w, kcR[i] > 0.0 ? kcR[i] : kcA[i].w, t) + pd;
			if (i < 4 && sh > 0.0) {
				// a bent knee's corner, which the thigh's and the shin's capsules leave uncovered (pushOut in 50-figure.js)
				int th = i < 2 ? i : i - 2;
				float bend = clamp(1.0 - dot(normalize(kcB[th].xyz - kcA[th].xyz), normalize(kcB[th + 2].xyz - kcA[th + 2].xyz)), 0.0, 1.0);
				r += KNEE * bend * (i < 2 ? smoothstep(0.7, 1.0, t) : 1.0 - smoothstep(0.0, 0.3, t));
			}
			float R = r + sh;
			if (l < R && l > 1e-5) {
				float cmid = i < 6 ? 1.0 - smoothstep(0.03, 0.11, abs(dot(kv - kcH, clat))) : 0.0;
				vec3 o = vec3(q.x - kcH.x, 0.0, q.z - kcH.z);
				o -= clat * dot(o, clat) * cmid * 0.85;
				float ol = length(o);
				float r0 = r - pd * (1.0 - lift);
				if (l < r0 && sh > 0.0 && ol > 1e-4) {
					o = normalize(mix(o / ol, vec3(0.0, 1.0, 0.0), ccr));
					if (i < 14 && dot(kn, o) < 0.0 && ccr < 0.5) {
						o = -o;          // the side the cloth faces (pushOut in 50-figure.js)
					}
					float s = dot(d, o);
					if (s < 0.0) {
						d -= 2.0 * s * o;
					}
					float w = 1.0 - l / r0;  // deep in the limb, straight out that side (pushOut in 50-figure.js)
					w *= w;
					d = normalize(d) * (1.0 - w) + o * w;
				}
				// a thin band: [0, r + sh] into [r - sh, r + sh]; the legs' capsules stay active on chain-equipped garments (ceo < 0.5)
				// (the legs' capsules hand over to the hull in a stride: held at full strength beside it they put a shin through a skirt)
				kv = mix(kv, q + normalize(d) * (r - sh + l * 2.0 * sh / R), sl * cu * (i < 6 ? 1.0 - max(kcM, ceo) : 1.0));
			}
		}
		if (ceo > 0.5) {
			kv = mix(kv, kcH + kcTl * (kv - kcH), smoothstep(0.06, 0.58, kcH.y - kv.y));
		}
		// the hull (pushOut in 50-figure.js): the legs' points (kcE: six a leg, and the six midpoints between the two
		// legs' pairs) set how far out from the body's axis the cloth must reach at their bearing, as a ray from the axis
		// against a circle round each point; every loose garment takes it, a chainless one (ceo) at rest too
		if (rr < 0.22 || ry < 0.88) {
			vec2 ep = kv.xz - kcH.xz;
			float er = length(ep);
			float ew = 0.0;
			float ehy = kcH.y + (ceo > 0.5 ? 0.06 : 0.12);
			if (er > 1e-4 && kv.y < ehy) {
				vec2 eu = ep / er;
				for (int i = 0; i < 18; i++) {
					vec4 es = i < 12 ? kcE[i] : 0.5 * (kcE[i - 12] + kcE[i - 6]);
					if (es.w <= 0.0) {
						continue;
					}
					vec2 esp = es.xz - kcH.xz;
					float esR = es.w + kcP + (ceo > 0.5 ? 0.020 : 0.022) + cflap * 0.035 + kcPO * max(kcM, 0.45);
					float erpad = esR + 0.055;
					float eproj = dot(esp, eu);
					float eperp2 = max(0.0, dot(esp, esp) - eproj * eproj);
					if (eperp2 >= erpad * erpad) {
						continue;
					}
					float ehit = max(0.0, eproj + sqrt(max(0.0, erpad * erpad - eperp2)) - 0.055) * (1.0 - smoothstep(esR * esR * 0.65, erpad * erpad, eperp2));
					int ej = i >= 12 ? i - 12 : (i >= 6 ? i - 6 : i);
					float eytop = ceo > 0.5 && ej == 0 ? es.y + 0.42 * es.w : es.y + (1.0 - ceo * cshort) * es.w;
					float ewy = 1.0 - smoothstep(0.0, max(ehy - eytop, 0.14), kv.y - eytop);
					float eh0 = kcHm - (ej == 0 ? 0.08 : 0.04);
					ew = max(ew, smoothstep(eh0, eh0 + 0.08, es.y + es.w) * ewy * ehit);
				}
				if (ew > 0.0) {
					float elayer = clamp(rr - 0.165, -0.045, 0.045) * 0.25;
					float ed = (ew + elayer) - er;
					kv.xz = kcH.xz + eu * (er + 0.5 * (ed + sqrt(ed * ed + 0.00025)));
				}
			}
		}
	}
	if (kcS > 0.0 && cflap < 0.5 && kv.y < max(kcH.y + 0.08, max(kcB[0].y, kcB[1].y) + 0.08)) {
		// to the nearest capsule only (to all six, a shin was pulled into a ball round the knee)
		float best = 1e9;
		vec3 bq = vec3(0.0);
		float br = 0.0;
		float bt = 0.0;
		int bi = 0;
		for (int i = 0; i < 6; i++) {
			if (kcA[i].w <= 0.0) {
				continue;
			}
			vec3 a = kcA[i].xyz;
			vec3 ab = kcB[i].xyz - a;
			float st = clamp(dot(kv - a, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
			float r = (mix(kcA[i].w, kcR[i] > 0.0 ? kcR[i] : kcA[i].w, st) - (kcSH > 10.0 ? 0.01 : 0.0)) * (i >= 4 && kcSH > 10.0 && kcM > 0.3 ? 0.72 : (kcSH > 10.0 ? 0.92 : 1.0)) + kcS;
			vec3 q = a + ab * st;
			float l = length(kv - q);
			if (l - r < best) {
				best = l - r;
				bq = q;
				br = r;
				bt = st;
				bi = i;
			}
		}
		// how far down the leg (thigh, then shin, then foot), against the top's hem (pushOut in 50-figure.js)
		int di = bi < 2 ? bi : bi < 4 ? bi - 2 : bi - 4;
		float lt = length(kcB[di].xyz - kcA[di].xyz);
		float ls = length(kcB[di + 2].xyz - kcA[di + 2].xyz);
		float slift = bi < 2 && kcSH < 1.0 ? smoothstep(0.1, 0.5, 1.0 - abs(kcB[di].y - kcA[di].y) / max(lt, 1e-5)) : 0.0;
		float dd = bi < 2 ? bt * lt : bi < 4 ? lt + bt * ls : lt + ls + bt * 0.1;
		float hm = (kcSH + slift * 0.28) * (lt + ls);
		float f = 1.0 - smoothstep(hm - 0.02, hm + 0.02, dd);
		if (best > 0.0 && best < 0.6) {
			vec3 d = kv - bq;
			kv = mix(kv, bq + d * (br / length(d)), f);
		}
	}
	if (kcT > 0.0 && cflap < 0.5) {
		// the way in is the trunk's (kcU), the height above the hips the greater of the trunk's and the world's
		vec3 tr = kv - kcH;
		float th = dot(tr, kcU);
		vec3 tq = tr - th * kcU;
		float tf = smoothstep(-0.02, 0.06, max(th, tr.y));
		float tl = length(tq);
		if (tf > 0.0 && tl > 1e-4) {
			kv = kcH + th * kcU + tq * (max(tl - kcT * tf, 0.5 * tl) / tl);
		}
	}
}
