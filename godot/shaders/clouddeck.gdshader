// The cloud deck (core/atmos/89-atmos-d-clouddeck.js; core/atmos/GODOT.md, "The cloud deck"): the same field as the
// web page's, from the generated include. The mesh is a grid round the camera (krator/clouddeck.gd moves it); the vertex
// shader lifts each vertex to the deck's top at its world position, the fragment shades it as the page does (its own
// lambert from the record's sun, unshaded) and thins it where the ground rises through it (clear_tex: the ground's
// height round the camera, one byte over [clear_lo, clear_lo + clear_range]).
// Colours: top_col and shade_col are the presets' display-sRGB colours (source_color). The page writes them untonemapped;
// under Godot's ACES the deck comes out a little greyer: re-tune in the presets if it matters (GODOT.md, "Tonemapping").
shader_type spatial;
render_mode blend_mix, depth_draw_never, cull_disabled, unshaded;

#include "res://shaders/atmos_clouddeck.gdshaderinc"

uniform float deck_y = 1120.0;
uniform vec3 sun_dir = vec3(-0.6, 0.55, -0.4);
uniform vec3 top_col : source_color = vec3(0.99, 0.985, 0.97);
uniform vec3 shade_col : source_color = vec3(0.49, 0.56, 0.66);
uniform sampler2D clear_tex : filter_linear, repeat_disable;
uniform vec4 clear_win = vec4(0.0, 0.0, 0.0002, 0.0);   // x0, z0, 1/span
uniform float clear_lo = 0.0;
uniform float clear_range = 160.0;
uniform vec2 ground_fade = vec2(-6.0, 45.0);
uniform bool has_clear = false;

varying vec3 wp;

void vertex() {
	vec3 w = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	w.y = atm_deck_height(w.xz, deck_y);
	wp = w;
	VERTEX.y = w.y - MODEL_MATRIX[3].y;
}

void fragment() {
	vec3 cam = INV_VIEW_MATRIX[3].xyz;
	float d = distance(cam, wp);
	vec4 s = atm_deck_slope(wp.xz, d);
	vec3 n = atm_deck_normal(s);
	// lit from the sun's side, blue-grey in the hollows between the heaps, bright on their tops
	float l = clamp(dot(n, normalize(sun_dir)) * 0.55 + 0.5, 0.0, 1.0);
	vec3 col = mix(shade_col, top_col, smoothstep(0.15, 0.95, l * 0.75 + s.z * 0.55 + s.w * 0.25 - 0.3));
	col += vec3(0.05, 0.05, 0.04) * pow(1.0 - abs(dot(n, normalize(cam - wp))), 3.0);
	// where the ground rises through the deck: its clearance under the deck's top thins it, ragged at the edge
	vec2 cu = (wp.xz - clear_win.xy) * clear_win.z;
	float g = (!has_clear || cu.x < 0.0 || cu.y < 0.0 || cu.x > 1.0 || cu.y > 1.0) ? -1e4 : clear_lo + clear_range * texture(clear_tex, cu).r;
	float m = smoothstep(ground_fade.x, ground_fade.y, wp.y - g);
	ALBEDO = col;
	// the edge frays into puffs (the billows' own crests decide where it thins), not a uniform translucent sheet
	ALPHA = smoothstep(0.38, 0.62, m + (s.z + s.w - 1.0) * 0.55);
}
