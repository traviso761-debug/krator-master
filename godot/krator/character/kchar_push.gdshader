// A garment that hangs loose over the legs (kit item 'loose'): every vertex pushed out of the thighs and shins after
// skinning, so no knee comes through between two cloth chains (the twin of pushOut in kits/characters/src/50-figure.js).
// kcA / kcB: the capsules' ends in the skeleton's space, kcA.w the radius (kchar_figure.gd _leg_caps)
shader_type spatial;
render_mode cull_disabled;

uniform sampler2D tex : source_color, filter_linear_mipmap;
uniform vec4 albedo : source_color = vec4(1.0);
uniform vec4 kcA[4];
uniform vec4 kcB[4];

void vertex() {
	for (int i = 0; i < 4; i++) {
		vec3 a = kcA[i].xyz;
		vec3 ab = kcB[i].xyz - a;
		float r = kcA[i].w;
		float t = clamp(dot(VERTEX - a, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
		vec3 q = a + ab * t;
		vec3 d = VERTEX - q;
		float l = length(d);
		if (l < r && l > 1e-5) {
			VERTEX = q + d * (r / l);
		}
	}
}

void fragment() {
	ALBEDO = texture(tex, UV).rgb * albedo.rgb;
	ROUGHNESS = 0.85;
}
