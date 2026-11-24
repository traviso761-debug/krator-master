// The valley mist (GODOT-LOOK-PLAN.md section 7, F2; krator/kair.gd). One full-screen pass over what the frame has
// drawn: an exponential layer of mist that is densest at the floor of the country round the camera and thins upward,
// integrated along each view ray. So mist seen from a ridge lies in the valley below, and mist the camera stands in
// thickens with distance and leaves the ground at its feet clear.
// The engine's own height fog (Environment.fog_height) does not do that: it is a function of a fragment's height
// alone, measured on 4.7.2: with the camera 2 m up and the fog's top 10 m up, the ground 3 m away and the ground at
// the horizon take the same fog.
// The sky is left alone, as the distance fog leaves it (fog_sky_affect 0): the sky draws its own horizon haze.
shader_type spatial;
render_mode unshaded, depth_test_disabled, depth_draw_never, cull_disabled, blend_mix, fog_disabled, shadows_disabled;

#include "res://shaders/kcolour.gdshaderinc"

uniform sampler2D depth_tex : hint_depth_texture, filter_nearest, repeat_disable;
uniform vec4 mist = vec4(0.0, 0.0, 40.0, 0.9);   // x: density at the floor, 1/m (0: off); y: the floor's height (this scene's y); z: scale height, m; w: the most it hides
uniform vec3 mist_colour : source_color = vec3(0.6, 0.65, 0.7);   // the distance fog's colour (the colour script's)
uniform vec4 sun = vec4(0.0, 1.0, 0.0, 0.0);     // xyz: towards the sun (world); w: how much its light scatters forward through the mist
uniform vec3 sun_colour : source_color = vec3(1.0, 0.9, 0.8);
uniform float reach = 30000.0;                   // metres: the path is not counted past this

void vertex() {
	POSITION = vec4(VERTEX.xy, 1.0, 1.0);
}

void fragment() {
	float depth = texture(depth_tex, SCREEN_UV).x;
#if CURRENT_RENDERER == RENDERER_COMPATIBILITY
	vec3 ndc = vec3(SCREEN_UV, depth) * 2.0 - 1.0;
#else
	vec3 ndc = vec3(SCREEN_UV * 2.0 - 1.0, depth);
#endif
	bool is_sky = depth <= 0.000001;   // the far plane: the depth runs from 1 at the camera to 0 there in every renderer
	vec4 vp = INV_PROJECTION_MATRIX * vec4(ndc, 1.0);
	vec3 view_pos = vp.xyz / vp.w;
	float amount = 0.0;
	vec3 colour = mist_colour;
	if (!is_sky && mist.x > 0.0) {
		vec3 world_pos = (INV_VIEW_MATRIX * vec4(view_pos, 1.0)).xyz;
		vec3 cam = INV_VIEW_MATRIX[3].xyz;
		float dist = min(length(view_pos), reach);
		float scale_h = max(mist.z, 1.0);
		// the density at the camera's height (no denser than three scale heights below the floor), and the mean of the
		// layer's falloff along the ray: (1 - e^-t) / t, t the ray's climb in scale heights
		float at_cam = exp(clamp((mist.y - cam.y) / scale_h, -30.0, 3.0));
		float t = clamp((world_pos.y - cam.y) / scale_h, -30.0, 30.0);
		float mean = abs(t) > 0.001 ? (1.0 - exp(-t)) / t : 1.0 - 0.5 * t;
		float depth_optical = mist.x * at_cam * mean * dist;
		amount = (1.0 - exp(-depth_optical)) * mist.w;
		// towards the sun the mist glows with it
		vec3 ray = normalize(world_pos - cam);
		float fwd = pow(max(dot(ray, normalize(sun.xyz)), 0.0), 6.0);
		colour = mix(mist_colour, sun_colour, clamp(fwd * sun.w, 0.0, 1.0));
	}
	ALBEDO = k_albedo(colour);
	ALPHA = amount;
}
