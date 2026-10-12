// A garment that hangs loose over the legs (kit item 'loose'): every vertex pushed out of the thighs and shins after
// skinning, so no knee comes through between two cloth chains. A soft shell: d from the bone within r + 0.04
// lands at r + d * 0.04 / (r + 0.04), so two tiers of one skirt keep their order (the twin of pushOut in kits/characters/src/50-figure.js).
// kcA / kcB: the capsules' ends in the skeleton's space, kcA.w the radius (kchar_figure.gd _leg_caps)
shader_type spatial;
render_mode cull_disabled;

uniform sampler2D tex : source_color, filter_linear_mipmap;
uniform vec4 albedo : source_color = vec4(1.0);
uniform vec4 kcA[6];
uniform vec4 kcB[6];
uniform vec3 kcH;
// 1.2 cm more for a torso garment (kchar_figure.gd): a robe's hem lies over the skirt it covers
uniform float kcP = 0.0;

void vertex() {
	for (int i = 0; i < 6; i++) {
		if (kcA[i].w <= 0.0) {
			continue;
		}
		vec3 a = kcA[i].xyz;
		vec3 ab = kcB[i].xyz - a;
		float r = kcA[i].w + kcP;
		float R = r + 0.04;
		float t = clamp(dot(VERTEX - a, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
		vec3 q = a + ab * t;
		vec3 d = VERTEX - q;
		float l = length(d);
		if (l < R && l > 1e-5) {
			// out the side away from the body's axis (kcH): never behind the knee
			vec3 o = vec3(q.x - kcH.x, 0.0, q.z - kcH.z);
			float ol = length(o);
			if (l < r && ol > 1e-4) {
				o /= ol;
				float s = dot(d, o);
				if (s < 0.0) {
					d -= 2.0 * s * o;
				}
			}
			VERTEX = q + normalize(d) * (r + l * 0.04 / R);
		}
	}
}

void fragment() {
	ALBEDO = texture(tex, UV).rgb * albedo.rgb;
	ROUGHNESS = 0.85;
}
