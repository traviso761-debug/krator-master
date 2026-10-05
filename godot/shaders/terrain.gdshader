// The spike's stand-in ground under a tile: slope and height shading only. A real ground needs the land-cover map
// (TODO.md, Godot order item 2) and the material library.
shader_type spatial;
render_mode diffuse_lambert, specular_disabled;

#include "res://shaders/kcolour.gdshaderinc"

uniform vec3 low = vec3(0.16, 0.13, 0.08);
uniform vec3 high = vec3(0.10, 0.14, 0.06);
uniform vec3 steep = vec3(0.22, 0.20, 0.17);
varying vec3 v_n;

void vertex() { v_n = NORMAL; }

void fragment() {
	float s = 1.0 - clamp(v_n.y, 0.0, 1.0);
	ALBEDO = k_albedo(mix(mix(low, high, 0.5), steep, smoothstep(0.25, 0.6, s)));
}
