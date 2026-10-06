// Light halos (ATMOS.export().glow): a billboard quad per light on a MultiMesh, lit by its hours.
// COLOR = the light's colour (sRGB in the export, converted to linear by the importer); INSTANCE_CUSTOM.xy = [on, off] hours.
shader_type spatial;
render_mode blend_add, depth_draw_never, unshaded, cull_disabled, fog_disabled, skip_vertex_transform;

#include "res://shaders/atmos.gdshaderinc"

uniform float gain = 1.0;                // three uses 1.7 with no tonemapper: retune here, then put it in the preset
varying float v_lit;

void vertex() {
	// billboard: keep the instance's origin and scale, face the camera
	vec3 origin = (MODELVIEW_MATRIX * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
	float s = length(MODEL_MATRIX[0].xyz);
	VERTEX = origin + vec3(VERTEX.xy * s, 0.0);
	v_lit = atm_glow_lit(atm_hour, INSTANCE_CUSTOM.xy);
}

void fragment() {
	float r = length(UV - 0.5) * 2.0;
	float a = pow(max(0.0, 1.0 - r), 2.2) * v_lit * gain;
	ALBEDO = COLOR.rgb * a;
	ALPHA = a;
}
