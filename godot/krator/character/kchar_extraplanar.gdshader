// Godot 4 Spatial Shader Twin for `core/charactermodels/src/75-extraplanar.js` (`culture: "extraplanar"`).
// Supports all 5 Extraplanar material modes over `kchar_push.gdshaderinc` (`mode` uniform or `UV.y` zone `[kxV0, kxV1]`):
//   mode 1 (`nebula_rift`):    deep 3D view-ray parallax pocket universe, spiral galaxy arms & twinkling starfields
//   mode 2 (`fresnel_ghost`):  translucent astral/crystal shell (`depth_draw_never` / alpha blend), Fresnel rim, prism & constellations
//   mode 3 (`alpha_erosion`):  scrolling 3D FBM vertical-tatter & vortex smoke-dissolve with glowing ember/violet erosion edge
//   mode 4 (`accretion_disc`): differential-swirl incandescent plasma & stardust orbital ring shader
//   mode 5 (`emissive_blaze`): high-gain pulsing celestial starburst, lantern spirit-flame, Cyclopean eye & Noh mask gaze
//   mode 6 (`smoke_emitter`):  camera-billboarded multi-puff FBM volumetric chimney-smoke & wisp plume
shader_type spatial;
render_mode cull_disabled, depth_prepass_alpha;

uniform sampler2D tex : source_color, hint_default_white, filter_linear_mipmap, repeat_enable;
uniform int kx_mode = 1;
uniform float kx_time = 0.0;
uniform vec3 kx_col_a : source_color = vec3(1.0, 0.96, 0.85);
uniform vec3 kx_col_b : source_color = vec3(0.48, 0.95, 1.0);
uniform vec3 kx_col_c : source_color = vec3(0.36, 0.17, 1.0);
uniform vec3 kx_col_d : source_color = vec3(1.0, 0.72, 0.29);
uniform vec3 kx_void  : source_color = vec3(0.008, 0.004, 0.035);
uniform float kx_center_y = 1.02;
uniform float kx_scale = 2.8;
uniform float kx_mirror = 0.0;
uniform float kx_opacity = 0.62;
uniform float kx_power = 2.2;
uniform float kx_gain = 1.85;
uniform float kx_prism = 0.0;
uniform float kx_constellation = 0.0;
uniform float kx_y_top = 0.62;
uniform float kx_y_bot = 0.04;
uniform float kx_swirl = 0.0;

#include "res://krator/character/kchar_push.gdshaderinc"

varying vec3 v_kx_fig;
varying vec3 v_kx_world;

float kx_hash12(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * 0.1031);
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.x + p3.y) * p3.z);
}

float kx_hash13(vec3 p3) {
	p3 = fract(p3 * 0.1031);
	p3 += dot(p3, p3.zyx + 31.32);
	return fract((p3.x + p3.y) * p3.z);
}

float kx_noise2(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	return mix(
		mix(kx_hash12(i), kx_hash12(i + vec2(1.0, 0.0)), f.x),
		mix(kx_hash12(i + vec2(0.0, 1.0)), kx_hash12(i + vec2(1.0, 1.0)), f.x),
		f.y
	);
}

float kx_noise3(vec3 p) {
	vec3 i = floor(p);
	vec3 f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	return mix(
		mix(mix(kx_hash13(i), kx_hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
		    mix(kx_hash13(i + vec3(0.0, 1.0, 0.0)), kx_hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
		mix(mix(kx_hash13(i + vec3(0.0, 0.0, 1.0)), kx_hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
		    mix(kx_hash13(i + vec3(0.0, 1.0, 1.0)), kx_hash13(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
		f.z
	);
}

float kx_fbm2(vec2 p) {
	float v = 0.0;
	float a = 0.5;
	mat2 rot = mat2(vec2(0.80, 0.60), vec2(-0.60, 0.80));
	for (int i = 0; i < 4; i++) {
		v += a * kx_noise2(p);
		p = rot * p * 2.03 + vec2(17.1, 31.7);
		a *= 0.5;
	}
	return v;
}

float kx_fbm3(vec3 p) {
	float v = 0.0;
	float a = 0.5;
	for (int i = 0; i < 3; i++) {
		v += a * kx_noise3(p);
		p = p * 2.07 + vec3(13.7, 29.3, 7.9);
		a *= 0.5;
	}
	return v;
}

float kx_star_layer(vec2 p, float scale, float density, float t) {
	vec2 gv = fract(p * scale) - 0.5;
	vec2 id = floor(p * scale);
	float h = kx_hash12(id);
	if (h < 1.0 - density) {
		return 0.0;
	}
	vec2 off = vec2(fract(h * 19.31), fract(h * 47.73)) - 0.5;
	float d = length(gv - off * 0.68);
	float tw = 0.68 + 0.32 * sin(t * (2.2 + 4.0 * fract(h * 11.7)) + h * 62.8);
	return exp(-d * 26.0) * tw;
}

void vertex() {
	kc_push(VERTEX, NORMAL, CUSTOM1.x, CUSTOM1.y);
	if (kx_mode == 3 && abs(kx_swirl) > 0.001) {
		float prog_v = clamp((kx_y_top - VERTEX.y) / max(kx_y_top - kx_y_bot, 0.05), 0.0, 1.0);
		if (prog_v > 0.0) {
			float ang_s = kx_swirl * pow(prog_v, 1.35) + sin(kx_time * 2.4 - prog_v * 4.2) * 0.34 * prog_v;
			float cs = cos(ang_s);
			float sn = sin(ang_s);
			vec2 xz = mat2(vec2(cs, sn), vec2(-sn, cs)) * VERTEX.xz;
			VERTEX.x = xz.x + sin(kx_time * 2.1 + VERTEX.y * 5.0) * 0.042 * prog_v;
			VERTEX.z = xz.y + cos(kx_time * 1.7 + VERTEX.y * 4.5) * 0.036 * prog_v;
		}
	}
	v_kx_fig = VERTEX;
	v_kx_world = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
	vec3 base_tex = texture(tex, UV).rgb;
	float ndv = clamp(abs(dot(normalize(NORMAL), normalize(VIEW))), 0.0, 1.0);

	if (kx_mode == 1) {
		// Deep 3D view-parallax spiral galaxy & cosmic pocket-universe interior (`nebula_rift`)
		vec3 vw = normalize(CAMERA_POSITION_WORLD - v_kx_world);
		vec2 base_p = kx_mirror > 0.5 ? (UV - 0.5) * 0.34 : vec2(v_kx_fig.x, v_kx_fig.y - kx_center_y);
		vec2 par = -vw.xy / max(0.38, abs(vw.z) + 0.35);
		vec2 p_near = base_p + par * 0.055;
		vec2 p_mid  = base_p + par * 0.135;
		vec2 p_deep = base_p + par * 0.240;
		float ca = cos(0.32);
		float sa = sin(0.32);
		vec2 gp = mat2(vec2(ca, sa), vec2(-sa, ca)) * (p_deep * kx_scale);
		gp.y *= 1.32;
		float r = length(gp);
		float th = atan(gp.y, gp.x) - kx_time * 0.38;
		float log_r = log(max(r, 0.018));
		float sw1 = cos(th * 2.0 - log_r * 4.4 + kx_fbm2(gp * 2.8 + kx_time * 0.08) * 2.4);
		float arm1 = pow(max(0.0, sw1 * 0.5 + 0.5), 3.2) * exp(-r * 1.45) * smoothstep(0.02, 0.16, r);
		float bulge = exp(-r * 7.8) + 0.55 * exp(-r * 2.8);
		float neb = kx_fbm2(p_mid * 6.2 + vec2(0.0, -kx_time * 0.06));
		vec3 col = kx_void + kx_col_c * pow(neb, 2.2) * 0.85 + kx_col_b * arm1 * (1.45 + 0.7 * neb);
		col += mix(kx_col_d, kx_col_a, smoothstep(0.25, 0.95, bulge)) * bulge * 1.55;
		col += kx_col_a * (kx_star_layer(p_deep, 34.0, 0.20, kx_time) + kx_star_layer(p_mid, 21.0, 0.14, kx_time * 1.25));
		col += kx_col_b * kx_star_layer(p_near, 13.0, 0.08, kx_time * 1.6) * 1.65;
		ALBEDO = vec3(0.0);
		EMISSION = col;
		ALPHA = 1.0;
	} else if (kx_mode == 2) {
		// Translucent Fresnel astral/crystal shell (`fresnel_ghost`)
		float fres = pow(1.0 - ndv, kx_power);
		vec3 rim_c = kx_col_b;
		if (kx_prism > 0.01) {
			vec3 spec = 0.5 + 0.5 * cos(ndv * 6.5 + v_kx_fig.y * 16.0 - kx_time * 1.4 + vec3(0.0, 2.09, 4.18));
			rim_c = mix(rim_c, mix(kx_col_b, kx_col_c, spec.r) * (0.75 + 0.75 * spec), kx_prism);
		}
		vec3 body_c = mix(base_tex * 0.45, kx_col_a, 0.72);
		if (kx_constellation > 0.01) {
			vec2 cp = vec2(atan(v_kx_fig.x, v_kx_fig.z) * 2.4, v_kx_fig.y * 7.5);
			float line_m = 1.0 - smoothstep(0.035, 0.095, abs(sin(cp.x * 3.0 + kx_fbm2(cp * 1.4) * 4.2)));
			body_c += (kx_col_c * line_m * 0.55 + kx_col_b * kx_star_layer(cp, 3.2, 0.28, kx_time) * 1.35) * kx_constellation;
		}
		ALBEDO = body_c;
		EMISSION = rim_c * fres * kx_gain;
		ROUGHNESS = 0.22;
		ALPHA = clamp(mix(kx_opacity, min(1.0, kx_opacity + 0.52), fres), 0.08, 0.99);
	} else if (kx_mode == 3) {
		// Scrolling 3D noise vertical-tatter & vortex hem dissolve (`alpha_erosion`)
		float prog = clamp((kx_y_top - v_kx_fig.y) / max(kx_y_top - kx_y_bot, 0.05), 0.0, 1.0);
		float az = atan(v_kx_fig.x, v_kx_fig.z);
		float streak = 0.5 + 0.5 * sin(az * 13.0 + kx_noise2(vec2(az * 3.0, v_kx_fig.y * 6.0 - kx_time * 1.4)) * 5.0);
		float n3 = kx_fbm3(vec3(v_kx_fig.x * 8.5, v_kx_fig.y * 5.0 - kx_time * 1.35, v_kx_fig.z * 8.5));
		float er = mix(n3, streak, 0.42) - pow(prog, 1.12) * 0.96;
		if (prog > 0.01 && er < -0.02) {
			discard;
		}
		float edge_band = 1.0 - smoothstep(0.0, 0.14, er);
		ALBEDO = mix(base_tex, kx_void, smoothstep(0.15, 0.85, prog) * 0.78);
		EMISSION = kx_col_c * edge_band * 1.65 * smoothstep(0.05, 0.35, prog);
		ALPHA = prog > 0.01 ? clamp(smoothstep(-0.02, 0.16, er) * (1.0 - 0.52 * prog * prog), 0.0, 1.0) : 1.0;
	} else if (kx_mode == 4) {
		// Orbiting cosmic accretion-disc plasma & stardust (`accretion_disc`)
		float fres = pow(1.0 - ndv, 2.0);
		float band = sin(UV.x * 37.699 - kx_time * 3.2 + kx_fbm2(vec2(UV.x * 12.0 - kx_time * 0.5, UV.y * 8.0)) * 4.5);
		float plasma = pow(max(0.0, band * 0.5 + 0.5), 2.4);
		ALBEDO = base_tex * 0.65;
		EMISSION = mix(kx_col_d, kx_col_c, fres) * (0.45 + 0.85 * plasma) + kx_col_a * pow(plasma, 4.0) * 0.75;
		METALLIC = 0.72;
		ROUGHNESS = 0.26;
	} else if (kx_mode == 7) {
		// Quantum flavor-oscillating Neutrino Phantom phase-shell & Cherenkov Mach rim (`neutrino_phase`)
		float fres = pow(1.0 - ndv, kx_power);
		float az = atan(v_kx_fig.x, v_kx_fig.z);
		float w_e  = 0.5 + 0.5 * sin(v_kx_fig.y * 14.0 - kx_time * 3.8 + az * 2.0);
		float w_mu = 0.5 + 0.5 * sin(v_kx_fig.y * 19.5 - kx_time * 5.1 - az * 3.0 + 2.094);
		float w_ta = 0.5 + 0.5 * sin(v_kx_fig.y * 11.0 + kx_time * 2.9 + kx_fbm2(vec2(az * 2.2, v_kx_fig.y * 5.5 - kx_time * 0.9)) * 4.2);
		vec3 flavor_c = normalize(vec3(0.001) + kx_col_b * (0.45 + w_e) + kx_col_c * (0.35 + w_mu) + kx_col_d * (0.35 * w_ta * w_ta)) * (0.85 + 0.55 * w_e);
		vec2 trk_uv = vec2(az * 7.64, v_kx_fig.y * 3.4 - kx_time * 3.6);
		float trk_h = kx_hash12(vec2(floor(trk_uv.x), floor(trk_uv.y)));
		float trk_x = abs(fract(trk_uv.x) - (0.2 + 0.6 * fract(trk_h * 17.3)));
		float trk_y = smoothstep(0.95, 0.15, fract(trk_uv.y + fract(trk_h * 31.7)));
		float streak = trk_h > 0.58 ? exp(-trk_x * 36.0) * trk_y : 0.0;
		float v_spark = kx_star_layer(vec2(az * 2.2, v_kx_fig.y * 6.0 - kx_time * 0.5), 4.0, 0.30, kx_time * 3.2);
		float tunnel = 0.72 + 0.28 * sin(v_kx_fig.y * 24.0 - kx_time * 6.2 + kx_noise2(vec2(az * 3.0, kx_time * 1.8)) * 3.5);
		ALBEDO = mix(base_tex * 0.30, kx_col_a, 0.76) + flavor_c * 0.32;
		EMISSION = mix(kx_col_b, flavor_c, 0.38) * fres * kx_gain * (0.88 + 0.22 * w_e) + kx_col_b * (streak * 1.85 + v_spark * 1.55);
		ROUGHNESS = 0.16;
		ALPHA = clamp(mix(kx_opacity * tunnel, min(0.98, kx_opacity + 0.54), fres) + streak * 0.35, 0.12, 0.98);
	} else if (kx_mode == 8) {
		// Pure-light pulsing, counter-rotating silhouette array (`light_array`)
		vec2 p = (UV - 0.5) * 2.0;
		float r = length(p);
		if (r > 1.0 || r < 0.24) {
			discard;
		}
		float ang = atan(p.y, p.x);
		float spin = kx_swirl != 0.0 ? kx_swirl : 1.0;
		float pulse = 0.5 + 0.5 * sin(kx_time * 3.4 + spin * 1.1);
		float r_b = r / (0.955 + 0.045 * pulse);
		float a1 = ang - kx_time * 0.72 * spin;
		float idx1 = floor(a1 * 24.0 / 6.2831853);
		float sec1 = (fract(a1 * 24.0 / 6.2831853 + 0.5) - 0.5) * (6.2831853 / 24.0) * r_b;
		float d_bead1 = length(vec2(sec1, r_b - 0.50));
		float wv1 = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(idx1 * 0.7854 - kx_time * 5.4), 2.0);
		float beads1 = (exp(-d_bead1 * 105.0) * 2.1 + exp(-d_bead1 * 28.0) * 0.42) * wv1;
		float a2 = ang + kx_time * 0.52 * spin;
		float arcs = exp(-abs(r_b - 0.63) * 115.0) * smoothstep(0.05, 0.28, sin(a2 * 8.0)) * (0.75 + 0.45 * pulse);
		float ticks = exp(-abs(r_b - 0.58) * 85.0) * pow(max(0.0, cos(a2 * 48.0)), 20.0) * (0.55 + 0.45 * pulse);
		float a3 = ang - kx_time * 0.42 * spin;
		float idx3 = floor(a3 * 16.0 / 6.2831853);
		float sec3 = (fract(a3 * 16.0 / 6.2831853 + 0.5) - 0.5) * (6.2831853 / 16.0) * r_b;
		float d_bead3 = length(vec2(sec3, r_b - 0.76));
		float wv3 = 0.40 + 0.60 * pow(0.5 + 0.5 * cos(idx3 * 1.178 - kx_time * 4.2), 2.0);
		float beads3 = (exp(-d_bead3 * 95.0) * 1.75 + exp(-d_bead3 * 26.0) * 0.38) * wv3;
		float len_mod = 0.84 + 0.11 * sin(a3 * 4.0 + kx_time * 4.4);
		float fine_rays = exp(-abs(sin(a3 * 16.0)) * 46.0 * r_b) * smoothstep(0.44, 0.54, r_b) * (1.0 - smoothstep(len_mod - 0.14, len_mod, r_b)) * (0.55 + 0.45 * wv3);
		float main_rays = exp(-abs(sin(a2 * 4.0)) * 62.0 * r_b) * smoothstep(0.40, 0.52, r_b) * (1.0 - smoothstep(0.82, 0.97, r_b)) * (0.65 + 0.55 * pulse);
		float edge_fade = smoothstep(0.26, 0.42, r) * (1.0 - smoothstep(0.88, 0.99, r));
		vec3 col = (kx_col_b * (arcs * 1.15 + ticks * 0.95 + fine_rays * 1.05) + kx_col_c * beads3 * 0.55 + kx_col_a * (beads1 * 1.10 + beads3 * 0.85 + main_rays * 1.15)) * edge_fade * kx_gain;
		float lum = max(col.r, max(col.g, col.b));
		if (lum < 0.004) {
			discard;
		}
		ALBEDO = vec3(0.0);
		EMISSION = col;
		ALPHA = clamp(lum, 0.0, 1.0);
	} else {
		// Pulsing celestial starburst / Cyclopean eye / lantern core (`emissive_blaze`)
		float p = 1.0 + 0.18 * sin(kx_time * 3.6 + UV.x * 6.283);
		ALBEDO = vec3(0.0);
		EMISSION = mix(base_tex, kx_col_a, 0.78) * kx_gain * p;
	}
}
