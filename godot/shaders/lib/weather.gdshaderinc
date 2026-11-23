// The weathering stack (GODOT-LOOK-PLAN.md section 8, M7): what makes a wall a wall that has stood outside, computed
// from what the shader already knows (where the point is in the world and which way it faces) and one shared noise
// texture. It runs on today's exports; the vertex fields of the plan's section 13 (height above the plot, edges,
// openings) will sharpen it, they do not gate it. The layers, in order:
//   drift     two slow world-space noises (32 m and 8 m to a tile): warm and cool patches, about 10 % of value
//   run-off   noise stretched down steep faces: dark streaks
//   under     faces that look down: darker and damp
//   top       faces that look up: bleached and dusty
//   moss      up-facing and ledges, in patches: green to lichen grey, rough
//   gloss     roughness moves with all of the above, so no surface has one value
//   wet       k_weather.y: darker and glossier, less under an overhang
// Amounts come per surface class (krator/kweather.gd reads the record's library family: plaster streaks, glazed tile
// barely changes): `amt` = (drift, run-off and under, moss, top). The whole stack is scaled by the global k_weather.x:
// 0 is off (the default, so a scene that never set a look draws as before, and the ablation switch VISUAL-BAR.md asks
// of every fix); krator/look.gd sets it by tier.
// World position is the point in the scene plus k_world_origin, the stream's origin modulo 4096 m: the noise's periods
// (0.5 to 32 m, powers of two) and the lookup axes (eighths) all divide it, so the pattern stays put when the stream
// rebases. Colours are linear. Four fetches of one 256 px texture.
#ifndef K_WEATHER_INC
#define K_WEATHER_INC

global uniform sampler2D k_weather_noise : repeat_enable, filter_linear_mipmap;
global uniform vec4 k_weather;        // x: strength 0..1.5 (0: off); y: wet 0..1; z, w: spare
global uniform vec3 k_world_origin;   // the stream's origin modulo 4096 m (krator/kweather.gd set_origin)

// the two lookup axes: no wall or floor lies along their cross product, so a plane varies both ways across it
const vec3 KW_A = vec3(0.75, 0.375, 0.5);
const vec3 KW_B = vec3(-0.5, 0.875, 0.25);

// wp: the point, in the scene's metres; wn: the surface's world normal (the mesh's, before any normal map);
// amt: (drift, run-off and under, moss, top). c is linear albedo, rough the roughness.
void kw_weather(vec3 wp, vec3 wn, vec4 amt, inout vec3 c, inout float rough) {
	float k = k_weather.x;
	if (k <= 0.0) {
		return;
	}
	vec3 p = wp + k_world_origin;
	vec2 u = vec2(dot(p, KW_A), dot(p, KW_B));
	vec4 n1 = texture(k_weather_noise, u / 32.0);
	vec4 n2 = texture(k_weather_noise, u.yx / 8.0 + vec2(0.375, 0.125));

	// drift: value, then hue (warm where the second field is high, cool where it is low)
	float a_d = amt.x * k;
	float drift = (n1.r - 0.5) * 0.7 + (n2.r - 0.5) * 0.3;
	c *= 1.0 + drift * 0.36 * a_d;
	c *= mix(vec3(1.0), mix(vec3(0.94, 0.985, 1.06), vec3(1.065, 1.0, 0.925), n1.g), 0.7 * a_d);
	rough = clamp(rough + (n2.a - 0.5) * 0.18 * a_d, 0.04, 1.0);

	float up = wn.y;
	float steep = 1.0 - smoothstep(0.3, 0.65, abs(up));
	float a_r = amt.y * k;

	// run-off: two metres across and thirty-two down. The wall's own horizontal axis would shift at a rebase unless the
	// wall is square to the world, so there are two fields, one along x and one along z, weighed by how the wall runs
	vec2 td = vec2(-wn.z, wn.x);
	td = td / max(length(td), 1e-3);
	float sx = texture(k_weather_noise, vec2(p.x / 2.0, p.y / 32.0)).b;
	float sz = texture(k_weather_noise, vec2(p.z / 2.0 + 0.5, p.y / 32.0 + 0.25)).b;
	float s = mix(sz, sx, td.x * td.x);
	float streak = smoothstep(0.50, 0.78, s * 0.75 + n2.b * 0.25) * steep;
	c = mix(c, c * vec3(0.60, 0.565, 0.51), streak * 0.6 * a_r);
	rough = mix(rough, min(rough + 0.10, 1.0), streak * a_r);

	// under: dark and damp
	float under = smoothstep(0.3, 0.8, -up);
	c *= 1.0 - 0.30 * under * a_r;

	// top: bleach and dust
	float top = smoothstep(0.55, 0.9, up);
	float a_t = amt.w * k;
	c = mix(c, c * 1.14 + vec3(0.012, 0.011, 0.008), top * 0.55 * a_t);
	rough = mix(rough, min(rough + 0.10, 1.0), top * 0.6 * a_t);

	// moss and lichen: where water sits, in patches
	float patch = smoothstep(0.54, 0.74, n1.g * 0.55 + n2.g * 0.45);
	float sits = max(smoothstep(0.15, 0.7, up), 0.22 * steep * smoothstep(0.55, 0.8, n1.a));
	float moss = patch * sits * amt.z * k;
	vec3 moss_c = mix(vec3(0.040, 0.062, 0.018), vec3(0.150, 0.160, 0.105), smoothstep(0.35, 0.75, n2.a));
	c = mix(c, moss_c, clamp(moss, 0.0, 0.85));
	rough = mix(rough, 0.96, clamp(moss, 0.0, 1.0));

	// wet: darker and glossier (as core/atmos wets the ground and the plants), less where rain does not reach
	float wet = clamp(k_weather.y, 0.0, 1.0) * (1.0 - 0.7 * under) * min(k, 1.0);
	c *= 1.0 - 0.32 * wet;
	rough *= 1.0 - 0.5 * wet;
}

#endif
