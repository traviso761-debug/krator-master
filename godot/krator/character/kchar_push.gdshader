// Every top and every pair of trousers or skirt (the twin of pushOut in kits/characters/src/50-figure.js): the
// garment's own look (albedo texture and colour, alpha cutoff, normal map, roughness, metallic, from the imported
// material: kchar_figure.gd _garment) plus two moves after skinning.
// - kcL 1 (kit item 'loose'): every vertex pushed out of the thighs, shins and feet, so no knee comes through between
//   two cloth chains. A soft shell: d from the bone within r + 0.04 lands at r + d * 0.04 / (r + 0.04), so two tiers
//   of one skirt keep their order; inside a leg a vertex leaves on the side away from the body's axis (kcH), never
//   behind the knee. The arms' capsules (kcB.w 1) are hard: only what is inside moves, so a raised arm lifts a
//   mantle's hem. kcA / kcB: the capsules' ends in the skeleton's space, kcA.w the radius (_leg_caps).
// - kcT > 0 (trousers or a skirt under a top that closes round the waist, kit item 'tucks'): the band above the hips
//   drawn in toward the body's axis by up to kcT, so a waistband stays under the top in any pose.
shader_type spatial;
render_mode cull_disabled;

uniform sampler2D tex : source_color, hint_default_white, filter_linear_mipmap, repeat_enable;
uniform vec4 albedo : source_color = vec4(1.0);
uniform float alpha_cut = 0.0;
uniform sampler2D ntex : hint_normal, filter_linear_mipmap, repeat_enable;
uniform float nscale = 0.0;
uniform float rough = 0.85;
uniform float metal = 0.0;
uniform vec4 kcA[10];
uniform vec4 kcB[10];
uniform vec3 kcH;
// 1.2 cm more for a loose top (a robe's hem lies over the skirt it covers), 3.2 cm over trousers
uniform float kcP = 0.0;
uniform float kcL = 0.0;
uniform float kcT = 0.0;

void vertex() {
	if (kcL > 0.5) {
		for (int i = 0; i < 10; i++) {
			if (kcA[i].w <= 0.0) {
				continue;
			}
			vec3 a = kcA[i].xyz;
			vec3 ab = kcB[i].xyz - a;
			float sh = kcB[i].w > 0.5 ? 0.0 : 0.04;
			float r = kcA[i].w + (sh > 0.0 ? kcP : 0.0);
			float R = r + sh;
			float t = clamp(dot(VERTEX - a, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
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
				}
				VERTEX = q + normalize(d) * (r + l * sh / R);
			}
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
