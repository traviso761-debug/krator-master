// The atmosphere's shared state (core/atmos/GODOT.md): global shader parameters declared in project.godot and set
// every frame by the Atmos autoload (krator/atmos.gd). Use atm_time, never TIME, so pause and time-lapse work.
global uniform float atm_time;
global uniform float atm_hour;
global uniform float atm_night;
global uniform float atm_light;
global uniform vec2 atm_wind;
global uniform float atm_gust_amp;
global uniform vec3 atm_sun_dir;

float atm_gust(float t, vec2 xz, vec2 w) {               // presets.wind.gust
	float s = t - dot(xz, w) / max(length(w), 1e-3) / 12.0;   // presets.wind.frontSpeed
	return 0.5 * sin(s * 0.31) + 0.3 * sin(s * 0.73 + 1.3) + 0.2 * sin(s * 1.9 + 4.1);
}
vec2 atm_wind_at(vec2 xz) { return atm_wind * (1.0 + atm_gust_amp * atm_gust(atm_time, xz, atm_wind)); }
float atm_lit(float h, vec2 t) {                          // a light's [on, off] hours (moths, lamps)
	float hh = h < 12.0 ? h + 24.0 : h;
	return smoothstep(t.x, t.x + 0.3, hh) * (1.0 - smoothstep(t.y - 0.3, t.y, hh));
}
float atm_glow_lit(float h, vec2 t) {                     // a halo's hours: on<0 dims by day, on=0 always lit
	return t.x < 0.0 ? 0.25 + 0.75 * atm_night : (t.x == 0.0 ? 1.0 : atm_lit(h, t));
}

// the octahedral decoding of a unit vector packed into two floats (biomes/GODOT.md, INSTANCE_CUSTOM)
vec3 oct_decode(vec2 e) {
	vec3 v = vec3(e.x, e.y, 1.0 - abs(e.x) - abs(e.y));
	if (v.z < 0.0) v.xy = (1.0 - abs(v.yx)) * vec2(v.x >= 0.0 ? 1.0 : -1.0, v.y >= 0.0 ? 1.0 : -1.0);
	return normalize(v);
}
