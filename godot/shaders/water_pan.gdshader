// A salt pan (core/water/ext/54, WATER.pan; drawn as WATER.drawPan draws it, 54b's wtrPan): crust in polygon cells whose cracks wet first after
// rain and whose low cells flood with brine by the wetness (the weather's W.wet: `wet`, set each frame by the port). Twin: KWater.pan_at.
// krator/water_import.gd builds the flat mesh `lift` over the level and sets the uniforms from the record.
shader_type spatial;
render_mode blend_mix, cull_back, depth_draw_opaque;

#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/water_cells.gdshaderinc"
#include "res://shaders/lib/kground_kinds.gdshaderinc"

global uniform vec3 atm_sun_dir;

uniform float cell = 3.0;
uniform float jitter = 0.85;
uniform float crack = 0.07;
uniform float flood = 0.55;
uniform vec3 salt = vec3(0.937, 0.918, 0.878);    // the record's colours as the page writes them (display values used as three uses them)
uniform vec3 crack_colour = vec3(0.722, 0.643, 0.529);
uniform float damp_k = 0.7;
uniform vec3 brine = vec3(0.17, 0.61, 0.57);
uniform vec2 rough = vec2(0.85, 0.08);
uniform float wet = 0.0;

varying vec3 v_wp;

void vertex() {
	v_wp = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	NORMAL = vec3(0.0, 1.0, 0.0);
}

// raised polygonal pressure-ridge profile around each salt crust cell's crack border
float pan_ridge(vec2 p, float cell_sz, float jit, float cr) {
	vec4 cc = wc_cells(p, cell_sz, jit);
	float d = cc.y - cc.x;
	float lip = (1.0 - smoothstep(cr, cr * 3.2, d)) * smoothstep(0.0, cr * 0.85, d);
	return lip - 0.35 * wc_crack(cc, cr);
}

void fragment() {
	vec2 v_w = v_wp.xz;
	vec2 dpx = dFdx(v_w);
	vec2 dpy = dFdy(v_w);
	float fp = max(max(length(dpx), length(dpy)), length(v_wp - CAMERA_POSITION_WORLD) * 0.0018);
	float near_lip = 1.0 - smoothstep(0.12 * cell, 0.45 * cell, fp);

	vec4 C = wc_cells(v_w, cell, jitter);
	float c = wc_crack(C, crack);
	float low = wc_h(C.zw + vec2(3.1, 11.7));
	float w = clamp(wet, 0.0, 1.0);
	float film = max(c * smoothstep(0.0, 0.3, w), smoothstep(low, low + 0.12, w * flood));
	float damp = smoothstep(0.0, 0.5, w);

	// polygonal thrust-ridge normals (flattened where standing brine submerges the crust)
	vec3 wn = vec3(0.0, 1.0, 0.0);
	if (near_lip > 0.01 && film < 0.92) {
		float eps = max(0.04, cell * 0.02);
		float rx = pan_ridge(v_w + vec2(eps, 0.0), cell, jitter, crack) - pan_ridge(v_w - vec2(eps, 0.0), cell, jitter, crack);
		float rz = pan_ridge(v_w + vec2(0.0, eps), cell, jitter, crack) - pan_ridge(v_w - vec2(0.0, eps), cell, jitter, crack);
		float k_lip = near_lip * (1.0 - film * 0.9) * 0.55;
		wn = normalize(vec3(-rx * k_lip, 1.0, -rz * k_lip));
	}

	float rim_bright = smoothstep(crack * 0.8, crack * 1.8, C.y - C.x) * (1.0 - smoothstep(crack * 1.8, crack * 3.6, C.y - C.x));
	vec3 col = mix(salt * (1.0 + 0.04 * rim_bright), crack_colour, c);
	col = mix(col, col * damp_k, damp);
	col = mix(col, brine, film * 0.9);

	// halite crystal micro-glints on dry/unflooded salt crust
	float dry_crust = (1.0 - film) * (1.0 - damp * 0.6);
	float glint = 0.0;
	if (dry_crust > 0.05 && fp < 0.9) {
		vec3 sdir = length(atm_sun_dir) > 1e-3 ? normalize(atm_sun_dir) : vec3(0.45, 0.72, -0.52);
		glint = kg_glint(v_wp, CAMERA_POSITION_WORLD, sdir, 0.18, 0.48, 36.0, 0.45, fp, 29.0) * dry_crust * smoothstep(0.02, 0.2, sdir.y);
		col += vec3(0.32, 0.31, 0.29) * glint;
	}

	ALBEDO = k_albedo(col);
	NORMAL = normalize((VIEW_MATRIX * vec4(wn, 0.0)).xyz);
	ROUGHNESS = mix(rough.x, rough.y, max(film, damp * 0.3));
	SPECULAR = clamp(mix(0.30, 0.65, film) + glint * 0.35, 0.0, 0.9);
	METALLIC = 0.0;
}
