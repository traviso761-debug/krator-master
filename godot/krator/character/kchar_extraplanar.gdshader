// Godot 4 Spatial Shader Twin for `core/charactermodels/src/75-extraplanar.js` (`culture: "extraplanar"`).
// Supports all Extraplanar material & aura modes over `kchar_push.gdshaderinc`:
//   mode 1 (`nebula_rift`):     deep 3D view-ray parallax pocket universe, spiral galaxy arms & twinkling starfields
//   mode 2 (`fresnel_ghost`):   translucent astral/crystal shell (`depth_draw_never` / alpha blend), Fresnel rim, prism & constellations
//   mode 3 (`alpha_erosion`):   scrolling 3D FBM vertical-tatter & vortex smoke-dissolve with glowing ember/violet erosion edge
//   mode 4 (`accretion_disc`):  differential-swirl incandescent plasma & stardust orbital ring shader
//   mode 5 (`emissive_blaze`):  high-gain pulsing celestial starburst, lantern spirit-flame, Cyclopean eye & Noh mask gaze
//   mode 6 (`smoke_emitter`):   camera-billboarded multi-puff FBM volumetric chimney-smoke & wisp plume
//   mode 7 (`neutrino_phase`):  quantum flavor-oscillating Neutrino Phantom phase-shell & Cherenkov Mach rim
//   mode 8 (`light_array`):     pure-light pulsing, counter-rotating silhouette array
//   mode 9 (`rainbow_aura`):    full-spectrum rainbow dispersion corona & stained-glass caustic rays (`prism_matriarch`)
//   mode 10 (`seraph_glyphs`):  solar-gold halo & fading sacred celestial sigil glyphs (`ophanim_seraph`)
//   mode 11 (`shifting_masks`): shifting translucent porcelain/jade Noh/Oni/Oracle apparition masks (`chorus_of_masks`)
//   mode 12 (`gravity_lens`):   Schwarzschild gravitational light-bending & Doppler Einstein ring (`singularity_archon`, scaled by `kx_power_use`)
//   mode 13 (`chrono_trail`):   chronometric golden/cyan Fresnel afterimage & escapement gear trail (`clockwork_aeon`)
//   mode 14 (`brimstone_aura`): crimson-red brimstone flame corona, sulfurous smoke & magma fissures (`ashen_calamity`)
shader_type spatial;
render_mode cull_disabled, depth_prepass_alpha;

uniform sampler2D tex : source_color, hint_default_white, filter_linear_mipmap, repeat_enable;
uniform int kx_mode = 1;
uniform float kx_time = 0.0;
uniform float kx_power_use = 0.0;
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

vec3 kx_spectrum(float h) {
	return clamp(0.54 + 0.46 * cos(6.2831853 * (h + vec3(0.0, 0.33333, 0.66667))), 0.0, 1.0);
}

float kx_sd_seg(vec2 p, vec2 a, vec2 b) {
	vec2 pa = p - a, ba = b - a;
	float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
	return length(pa - ba * h);
}

float kx_sd_glyph(vec2 p, float gid) {
	float r = length(p);
	float d = 10.0;
	int g = int(mod(gid, 6.0));
	if (g == 0) {
		d = min(abs(r - 0.56), min(kx_sd_seg(p, vec2(-0.62, 0.0), vec2(0.62, 0.0)), kx_sd_seg(p, vec2(0.0, -0.62), vec2(0.0, 0.62))));
	} else if (g == 1) {
		float a1 = abs(length(p - vec2(0.0, 0.24)) - 0.50);
		float a2 = abs(length(p + vec2(0.0, 0.24)) - 0.50);
		d = min(max(a1, p.y - 0.26), max(a2, -p.y - 0.26));
		d = min(d, abs(r - 0.16));
	} else if (g == 2) {
		d = min(abs(abs(p.x) + abs(p.y) - 0.60), abs(max(abs(p.x), abs(p.y)) - 0.42));
	} else if (g == 3) {
		d = min(abs(length(p - vec2(0.14, 0.0)) - 0.46), abs(r - 0.62));
	} else if (g == 4) {
		d = min(kx_sd_seg(p, vec2(-0.55, -0.35), vec2(0.0, 0.58)), kx_sd_seg(p, vec2(0.55, -0.35), vec2(0.0, 0.58)));
		d = min(d, kx_sd_seg(p, vec2(-0.55, -0.35), vec2(0.55, -0.35)));
	} else {
		d = min(abs(r - 0.52), min(kx_sd_seg(p, vec2(-0.48, -0.48), vec2(0.48, 0.48)), kx_sd_seg(p, vec2(-0.48, 0.48), vec2(0.48, -0.48))));
	}
	return d;
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
	} else if (kx_mode == 9) {
		// Full-spectrum rainbow dispersion corona & stained-glass caustic rays (`rainbow_aura`)
		vec2 p = (UV - 0.5) * 2.0;
		float r = length(p);
		if (r > 1.0) { discard; }
		float ang = atan(p.y, p.x);
		float hue = fract(ang / 6.2831853 + r * 0.65 - kx_time * 0.24);
		vec3 spec = kx_spectrum(hue);
		float rays = pow(0.5 + 0.5 * sin(ang * 9.0 - kx_time * 1.6 + kx_fbm2(p * 2.4) * 2.6), 3.0);
		float corona = exp(-abs(r - 0.52) * 5.2) * (0.55 + 0.75 * rays) * (1.0 - smoothstep(0.75, 1.0, r));
		vec3 col = mix(spec, vec3(1.0), 0.22 * rays) * corona * kx_gain;
		if (corona < 0.01) { discard; }
		ALBEDO = vec3(0.0);
		EMISSION = col;
		ALPHA = clamp(corona, 0.0, 1.0);
	} else if (kx_mode == 10) {
		// Solar-gold halo & sacred celestial sigil glyphs fading in and out (`seraph_glyphs`)
		vec2 p = (UV - 0.5) * 2.0;
		float r = length(p);
		if (r > 1.0) { discard; }
		vec2 gp = fract(UV * 6.0) * 2.0 - 1.0;
		vec2 gid2 = floor(UV * 6.0);
		float h = kx_hash12(gid2);
		float fade = pow(0.5 + 0.5 * sin(kx_time * (1.3 + 1.4 * h) + h * 31.4), 2.8);
		float sd = kx_sd_glyph(gp * 1.15, floor(h * 16.0));
		float sigil = (exp(-sd * 22.0) * 1.6 + exp(-sd * 6.5) * 0.45) * fade * smoothstep(0.18, 0.35, r) * (1.0 - smoothstep(0.78, 0.98, r));
		float halo = (exp(-abs(r - 0.58) * 32.0) * 0.85 + exp(-r * 3.0) * 0.35) * (1.0 - smoothstep(0.80, 1.0, r));
		vec3 col = (vec3(1.0, 0.80, 0.28) * (halo + sigil) + vec3(1.0, 0.97, 0.86) * sigil * 0.75) * kx_gain;
		float lum = max(col.r, max(col.g, col.b));
		if (lum < 0.005) { discard; }
		ALBEDO = vec3(0.0);
		EMISSION = col;
		ALPHA = clamp(lum, 0.0, 1.0);
	} else if (kx_mode == 11) {
		// Shifting translucent Noh / Oni / Oracle apparition masks (`shifting_masks`)
		vec2 p = (UV - 0.5) * 2.0;
		p.x *= 1.18;
		float d_face = length(vec2(p.x * (1.0 + 0.24 * max(0.0, -p.y)), p.y * 0.88)) - 0.72;
		if (d_face > 0.05) { discard; }
		float m_blend = 0.5 + 0.5 * sin(kx_time * 1.35);
		vec2 ep = vec2(abs(p.x) - 0.26, p.y - 0.12);
		float d_eye = mix(length(vec2(ep.x * 0.9, ep.y * 1.7)) - 0.11, abs(ep.y - 0.08 * ep.x) - 0.035, m_blend);
		float d_mouth = abs(p.y + 0.28 - mix(0.10, -0.10, m_blend) * (1.0 - min(1.0, p.x * p.x * 8.0))) - 0.04;
		float shell = smoothstep(0.04, -0.04, d_face) * smoothstep(-0.02, 0.03, min(d_eye, d_mouth));
		float rim = exp(-abs(d_face) * 26.0) * 0.9 + exp(-max(0.0, min(d_eye, d_mouth)) * 32.0) * 0.8;
		float fade = 0.35 + 0.45 * (0.5 + 0.5 * sin(kx_time * 1.8 + kx_swirl));
		ALBEDO = mix(vec3(0.86, 0.84, 0.92), vec3(0.56, 0.88, 0.82), m_blend) * 0.45;
		EMISSION = (vec3(0.72, 0.90, 1.0) * shell * 0.42 + vec3(1.0, 0.84, 0.46) * rim) * kx_gain * fade;
		ALPHA = clamp((shell * 0.46 + rim * 0.34) * fade, 0.0, 0.82);
	} else if (kx_mode == 12) {
		// Schwarzschild gravitational light-bending & Doppler Einstein ring (`gravity_lens`, intensifies with `kx_power_use`)
		vec2 p = (UV - 0.5) * 2.0;
		float r = length(p);
		if (r > 1.0) { discard; }
		float pwr = clamp(kx_power_use, 0.0, 1.5);
		float rs = 0.22 + 0.14 * pwr;
		float defl = (rs * rs) / max(r * r, 0.035);
		float sw_a = (0.35 + 0.85 * pwr) / max(r, 0.18);
		vec2 p_lens = mat2(vec2(cos(sw_a), sin(sw_a)), vec2(-sin(sw_a), cos(sw_a))) * (p * (1.0 - defl));
		vec2 gp = p_lens * (5.5 + 2.0 * pwr);
		float grid = ((1.0 - smoothstep(0.02, 0.09, abs(fract(gp.x) - 0.5))) + (1.0 - smoothstep(0.02, 0.09, abs(fract(gp.y) - 0.5))))
			* smoothstep(0.24, 0.48, r) * (1.0 - smoothstep(0.72, 0.98, r)) * (0.28 + 0.55 * pwr);
		float ang = atan(p.y, p.x);
		float disp = 0.012 + 0.028 * pwr;
		float r_e = 0.47 + 0.03 * sin(ang * 2.0 - kx_time * (1.8 + 3.2 * pwr));
		vec3 einstein = vec3(
			exp(-abs(r - (r_e + disp)) * (44.0 - 12.0 * pwr)) * 0.95,
			exp(-abs(r - r_e) * (54.0 - 16.0 * pwr)) * 0.88,
			exp(-abs(r - (r_e - disp)) * (48.0 - 14.0 * pwr)) * 1.25
		) * (0.68 + 0.32 * sin(ang - kx_time * (1.5 + 2.5 * pwr)));
		float moat = smoothstep(0.16, 0.36, r) * (1.0 - smoothstep(0.46, 0.74, r));
		float gain_p = (0.88 + 2.15 * pwr) * kx_gain;
		ALBEDO = vec3(0.01, 0.005, 0.03) * moat;
		EMISSION = (einstein * 1.15 + vec3(0.48, 0.86, 1.0) * grid) * gain_p;
		ALPHA = clamp(moat * (0.42 + 0.34 * pwr) + max(einstein.b, grid), 0.0, 0.92);
	} else if (kx_mode == 13) {
		// Chronometric golden/cyan Fresnel afterimage trail (`chrono_trail`)
		float fres = pow(1.0 - ndv, 1.55);
		vec3 tint = mix(vec3(1.0, 0.82, 0.39), vec3(0.28, 0.86, 1.0), clamp(kx_prism, 0.0, 1.0));
		ALBEDO = vec3(0.0);
		EMISSION = tint * (0.35 + 1.35 * fres) * kx_gain;
		ALPHA = clamp(kx_opacity * (0.38 + 0.85 * fres), 0.04, 0.85);
	} else if (kx_mode == 14) {
		// Roaring crimson-red brimstone flame corona & sulfurous smoke (`brimstone_aura`)
		vec2 p = (UV - 0.5) * 2.0;
		p.x *= 1.25 + 0.55 * (p.y * 0.5 + 0.5);
		float r = length(p);
		if (r > 1.0) { discard; }
		float n = kx_fbm2(vec2(p.x * 2.5, p.y * 2.2 - kx_time * 2.8));
		float tongue = smoothstep(0.92, 0.12, r + (n - 0.5) * 0.72);
		if (tongue < 0.01) { discard; }
		vec3 col = mix(vec3(0.88, 0.02, 0.01), mix(vec3(1.0, 0.16, 0.03), vec3(1.0, 0.58, 0.08), clamp(tongue * 0.9, 0.0, 1.0)), clamp(tongue * 1.2, 0.0, 1.0)) * tongue * kx_gain;
		ALBEDO = vec3(0.08, 0.01, 0.01);
		EMISSION = col;
		ALPHA = clamp(tongue * 0.92, 0.0, 0.96);
	} else if (kx_mode == 15) {
		// Vox Solus shimmering interference mirage & phase-fade (`vox_shimmer`)
		vec2 p = (UV - 0.5) * 2.0;
		p.x *= 1.35;
		float r = length(p);
		if (r > 1.0) { discard; }
		float phase_vis = 0.09 + 0.91 * (0.5 + 0.5 * sin(kx_time * 1.55) * cos(kx_time * 0.42));
		float scan = 0.5 + 0.5 * sin(p.y * 42.0 - kx_time * 9.5 + kx_noise2(p * 4.0 + kx_time) * 4.0);
		float ripple = exp(-abs(r - (0.36 + 0.38 * fract(kx_time * 0.55))) * 26.0);
		float mirage = (exp(-r * 2.6) * 0.42 * scan * scan + ripple * 0.85) * (1.0 - smoothstep(0.68, 1.0, r));
		vec3 spec_c = kx_spectrum(fract(p.y * 0.85 - kx_time * 0.35 + r * 0.4));
		vec3 col = mix(vec3(0.55, 0.94, 1.0), spec_c, 0.58) * mirage * (0.55 + 1.15 * (1.0 - phase_vis)) * kx_gain;
		if (mirage < 0.01) { discard; }
		ALBEDO = vec3(0.0);
		EMISSION = col;
		ALPHA = clamp(mirage, 0.0, 0.92);
	} else if (kx_mode == 16) {
		// Censer Revenant area-projecting obscuring dark fog (`obscuring_fog`)
		vec2 p = (UV - 0.5) * 2.0;
		float r = length(p);
		if (r > 1.0) { discard; }
		float n1 = kx_fbm2(p * 2.6 + vec2(kx_time * 0.14, -kx_time * 0.11));
		float n2 = kx_fbm2(p * 4.8 - vec2(kx_time * 0.09, kx_time * 0.13));
		float dens = smoothstep(1.0, 0.15, r + (n1 - 0.5) * 0.48) * (0.65 + 0.35 * n2);
		float a = clamp(dens * 0.78, 0.0, 0.82);
		if (a < 0.008) { discard; }
		ALBEDO = mix(vec3(0.018, 0.016, 0.028), vec3(0.075, 0.068, 0.115), n2 * 0.65);
		EMISSION = vec3(0.0);
		ALPHA = a;
	} else if (kx_mode == 17) {
		// Ocular Umbra light-devouring ink-shadow & crow/fleck swarm (`shadow_swarm`)
		vec2 p = (UV - 0.5) * 2.0;
		float r = length(vec2(p.x * 1.35, p.y * 0.92));
		if (r > 1.0) { discard; }
		float ang = atan(p.y, p.x);
		float tendrils = pow(0.5 + 0.5 * sin(ang * 19.0 + kx_fbm2(p * 3.6 - kx_time * 0.7) * 5.2), 2.4);
		float splatter = kx_star_layer(p * 0.75 + vec2(0.0, -kx_time * 0.08), 16.0, 0.45, kx_time * 1.8);
		float shroud = smoothstep(0.96, 0.24, r - tendrils * 0.24) + splatter * smoothstep(0.98, 0.42, r) * 0.65;
		float a = clamp(shroud * 0.85, 0.0, 0.90);
		if (a < 0.008) { discard; }
		ALBEDO = vec3(0.006, 0.005, 0.010);
		EMISSION = vec3(0.0);
		ALPHA = a;
	} else if (kx_mode == 18) {
		// Astral Pyre whip-curling pure incandescent white flame/smoke tendrils (`white_tendril_flame`)
		vec2 p = (UV - 0.5) * 2.0;
		float u_up = p.y * 0.5 + 0.5;
		float curl = sin(u_up * 5.2 - kx_time * 2.8) * 0.42 * u_up;
		float taper = max(0.05, 0.38 * (1.0 - 0.78 * u_up * u_up));
		float dx = abs(p.x - curl) / taper;
		float n = kx_fbm2(vec2(p.x * 2.5, p.y * 2.4 - kx_time * 2.4));
		float wisp = smoothstep(1.15, 0.15, dx + (n - 0.5) * 0.55) * smoothstep(-1.0, -0.55, p.y) * (1.0 - smoothstep(0.65, 1.0, p.y));
		if (wisp < 0.01) { discard; }
		vec3 col = mix(vec3(0.68, 0.78, 0.98), vec3(1.0), clamp(wisp * 1.35, 0.0, 1.0)) * wisp * kx_gain;
		ALBEDO = vec3(1.0);
		EMISSION = col;
		ALPHA = clamp(wisp, 0.0, 0.96);
	} else if (kx_mode == 19) {
		// Nightmare Urchin crimson-backlit multi-tiered pitch-black needle starburst (`spiky_dark_array`)
		vec2 p = (UV - 0.5) * 2.0;
		float r = length(p);
		if (r > 1.0) { discard; }
		float ang = atan(p.y, p.x);
		float tremor = sin(kx_time * 11.0 + sin(ang * 9.0) * 4.0) * 0.006;
		float u1 = (ang + tremor + 3.14159265) / 6.2831853 * 26.0;
		float h1 = kx_hash12(vec2(mod(floor(u1), 26.0), 3.7));
		float max_r1 = 0.54 + 0.44 * pow(h1, 0.65);
		float w1 = max(0.035, 0.68 * pow(clamp(1.0 - (r - 0.08) / max(max_r1 - 0.08, 0.05), 0.0, 1.0), 1.35));
		float s1 = step(r, max_r1) * smoothstep(w1, w1 * 0.18, abs(fract(u1) - 0.5) * 2.0);
		float u2 = (ang - tremor * 0.8 + 0.075 + 3.14159265) / 6.2831853 * 42.0;
		float h2 = kx_hash12(vec2(mod(floor(u2), 42.0), 11.3));
		float max_r2 = 0.36 + 0.42 * pow(h2, 0.65);
		float w2 = max(0.035, 0.56 * pow(clamp(1.0 - (r - 0.08) / max(max_r2 - 0.08, 0.05), 0.0, 1.0), 1.35));
		float s2 = step(r, max_r2) * smoothstep(w2, w2 * 0.18, abs(fract(u2) - 0.5) * 2.0);
		float inner_core = smoothstep(0.24, 0.12, r);
		float spikes = max(inner_core, max(s1, s2));
		float red_glow = exp(-max(0.0, r - 0.16) * 3.8) * (1.0 - smoothstep(0.62, 0.96, r));
		float vig = smoothstep(1.0, 0.22, r);
		float a = clamp(max(spikes * 0.98, vig * 0.72 + red_glow * 0.42), 0.0, 0.99);
		if (a < 0.008) { discard; }
		vec3 bg_col = mix(vec3(0.012, 0.004, 0.008), vec3(0.68, 0.055, 0.095), clamp(red_glow * 1.15, 0.0, 0.82));
		ALBEDO = mix(bg_col, vec3(0.003, 0.002, 0.005), spikes);
		EMISSION = vec3(0.42, 0.03, 0.06) * red_glow * (1.0 - spikes);
		ALPHA = a;
	} else if (kx_mode == 20) {
		// DMT Chrysanthemum counter-phased rainbow petal pinwheel optical illusion (`dmt_chrysanthemum`)
		vec2 p = (UV - 0.5) * 2.0;
		float r = length(p);
		if (r > 1.0) { discard; }
		float ang = atan(p.y, p.x);
		float r_sc = r * 13.5 - kx_time * 0.45;
		float shell = floor(r_sc);
		float f_sh = fract(r_sc);
		float alt = mod(shell, 2.0) > 0.5 ? 1.0 : -1.0;
		float u_ang = (ang / 6.2831853) * 28.0 + alt * (0.28 * sin(f_sh * 3.14159265) + kx_time * 0.22);
		float petal = sin(fract(u_ang) * 3.14159265) * sin(f_sh * 3.14159265);
		float hue = fract(shell * 0.14 + fract(fract(u_ang) + f_sh * 0.5 * alt) * 0.85 - kx_time * 0.16);
		vec3 col = mix(vec3(0.02, 0.01, 0.05), kx_spectrum(hue) * 1.22, smoothstep(0.02, 0.22, petal));
		float a = clamp(smoothstep(0.08, 0.24, r) * (1.0 - smoothstep(0.76, 1.0, r)) * 0.90, 0.0, 0.92);
		if (a < 0.008) { discard; }
		ALBEDO = col;
		EMISSION = col * 0.75;
		ALPHA = a;
	} else if (kx_mode == 21) {
		// Op-Art tessellated geometric starburst lattice illusion (`op_art_starburst`)
		vec2 p = (UV - 0.5) * 2.0;
		float r = length(p);
		if (r > 1.0) { discard; }
		vec2 gp = p * 2.35;
		vec2 cid = floor(gp + 0.5);
		vec2 gv = fract(gp + 0.5) - 0.5;
		float cheb = max(abs(gv.x), abs(gv.y)) * 2.0;
		float par = mod(cid.x + cid.y, 2.0) > 0.5 ? 1.0 : -1.0;
		float bw = smoothstep(-0.14, 0.14, cos(atan(gv.y, gv.x) * 14.0 + kx_time * 1.15 * par + cheb * 2.2 * par));
		float hub = length(gv) * 2.0;
		vec3 col = mix(vec3(0.015, 0.010, 0.030), mix(vec3(0.98), vec3(0.86, 0.44, 1.0), exp(-hub * 1.9) * 0.75), max(bw, smoothstep(0.92, 0.98, cheb)));
		col = mix(col, vec3(0.76, 0.34, 1.0), smoothstep(0.24, 0.04, hub) * 0.90);
		float a = clamp(smoothstep(0.06, 0.22, r) * (1.0 - smoothstep(0.76, 1.0, r)) * 0.88, 0.0, 0.90);
		if (a < 0.008) { discard; }
		ALBEDO = col;
		EMISSION = col * 0.55;
		ALPHA = a;
	} else if (kx_mode == 22) {
		// Infinite 3D Chebyshev perspective hyperspace corridor illusion (`hyperspace_tunnel`)
		vec2 p = (UV - 0.5) * 2.0;
		float r = length(p);
		if (r > 1.0) { discard; }
		vec2 bp = vec2(p.x * 1.06, p.y * 0.94);
		float box_d = max(abs(bp.x), abs(bp.y));
		float z_dep = 0.34 / max(box_d, 0.028) - kx_time * 0.72;
		float wall_u = abs(bp.x) > abs(bp.y) ? (bp.y / max(abs(bp.x), 0.028)) : (bp.x / max(abs(bp.y), 0.028));
		vec2 p_uv = vec2(fract(wall_u * 1.5 + 0.5) - 0.5, fract(z_dep) - 0.5) * 2.0;
		float hex_d = max(abs(p_uv.x) * 0.866 + abs(p_uv.y) * 0.5, abs(p_uv.y));
		float ridge = max(smoothstep(-0.15, 0.25, sin(hex_d * 22.0 - kx_time * 2.6)), smoothstep(0.86, 0.98, max(abs(p_uv.x), abs(p_uv.y))));
		vec3 col = mix(vec3(0.015, 0.012, 0.025), kx_spectrum(fract(hex_d * 1.35 + floor(z_dep) * 0.19 - kx_time * 0.14)) * 1.18, ridge) * exp(-0.14 / max(box_d, 0.02));
		col = mix(col, vec3(0.25, 0.92, 1.0) * 1.35, clamp(exp(-box_d * 11.0) * 1.25, 0.0, 1.0));
		float a = clamp((1.0 - smoothstep(0.76, 1.0, r)) * 0.90, 0.0, 0.92);
		if (a < 0.008) { discard; }
		ALBEDO = col;
		EMISSION = col * 0.72;
		ALPHA = a;
	} else if (kx_mode == 23) {
		// Hypnotic black & gold/magenta 6-star op-art warped-stripe illusion (`op_art_wave_star`)
		vec2 p = (UV - 0.5) * 2.0;
		float r = length(p);
		if (r > 1.0) { discard; }
		float ang = atan(p.y, p.x);
		float star_w = r * (1.0 - 0.32 * cos(ang * 6.0) * smoothstep(0.04, 0.55, r));
		float stripe = smoothstep(-0.16, 0.16, sin((star_w * 24.0 - kx_time * 2.1) * 3.14159265));
		vec3 lit = mix(vec3(1.0, 0.76, 0.18), vec3(1.0, 0.12, 0.74), 0.25 * smoothstep(0.35, 0.85, r)) * (0.78 + 0.32 * sin(ang * 6.0 + 1.1)) * 1.15;
		vec3 col = mix(vec3(0.012, 0.008, 0.018), lit, stripe);
		float a = clamp(smoothstep(0.06, 0.20, r) * (1.0 - smoothstep(0.76, 1.0, r)) * 0.90, 0.0, 0.92);
		if (a < 0.008) { discard; }
		ALBEDO = col;
		EMISSION = col * 0.65;
		ALPHA = a;
	} else if (kx_mode == 24) {
		// Thin-film liquid rainbow & baroque gold filigree / neon hex endoskeleton (`psychedelic_surface`)
		float swirl = kx_fbm2(UV * 6.5 + vec2(kx_time * 0.12, -kx_time * 0.09));
		vec3 film = kx_spectrum(fract((1.0 - ndv) * 1.65 + v_kx_fig.y * 2.2 + swirl * 1.35 - kx_time * 0.22));
		float fil = smoothstep(0.08, 0.015, abs(sin(UV.x * 18.0 + swirl * 5.0) * cos(UV.y * 18.0 - swirl * 4.0)));
		ALBEDO = mix(film * 0.4, kx_col_d, fil * 0.85);
		EMISSION = mix(film * kx_gain, kx_col_d * 1.2, fil * 0.85);
		METALLIC = 0.65;
		ROUGHNESS = 0.22;
	} else {
		// Pulsing celestial starburst / Cyclopean eye / lantern core (`emissive_blaze`)
		float p = 1.0 + 0.18 * sin(kx_time * 3.6 + UV.x * 6.283);
		ALBEDO = vec3(0.0);
		EMISSION = mix(base_tex, kx_col_a, 0.78) * kx_gain * p;
	}
}
