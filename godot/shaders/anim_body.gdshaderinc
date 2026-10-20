// The animated fauna body's uniforms and vertex stage, shared by shaders/anim.gdshader (lit: BIO.animMat's Lambert) and
// shaders/anim_add.gdshader (o.basic + o.additive: glowing motes). The maths is shaders/lib/anim.gdshaderinc.
// Instance data, packed by krator/biome_import.gd and krator/gltf_instancing.gd (biomes/GODOT.md, "In Godot"):
//   COLOR           = (r, g, b, aP0.w)   the instance colour (times the vertex colour), alpha the path's radius
//   INSTANCE_CUSTOM = aP1                (speed, phase, vertical amplitude, eccentricity)
// skip_vertex_transform: the vertex is placed in world space, as three places it in the InstancedMesh's object space
// (a biome's meshes stand at the world origin; a node here is only translated, to its LOD cell).

#include "res://shaders/atmos.gdshaderinc"
#include "res://shaders/kcolour.gdshaderinc"
#include "res://shaders/lib/anim.gdshaderinc"

uniform int mode = 0;                     // o.mode: 0 orbit, 1 flit, 2 walk
uniform bool billboard = false;           // o.billboard: a camera-facing card at the moving centre
uniform bool flap_on = false;             // o.flap
uniform float flap_rate = 6.0;
uniform float flap_amp = 0.35;
uniform float flap_root = 0.12;
uniform bool legs_on = false;             // o.legs
uniform float legs_top = 0.5;
uniform float legs_amp = 0.18;
uniform float legs_lift = 0.063;          // three writes amp * 0.35 to three decimals
uniform sampler2D albedo_tex : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform bool has_tex = false;
uniform vec3 colour = vec3(1.0);
uniform vec2 uv_repeat = vec2(1.0);
uniform vec2 uv_offset = vec2(0.0);
uniform bool flip_v = true;
uniform float alpha_test = 0.0;

void vertex() {
	vec4 p1 = INSTANCE_CUSTOM;
	float rad = COLOR.a;
	vec3 tr = VERTEX;
	if (flap_on) {
		tr = anm_flap(VERTEX, tr, atm_time, p1, mode == 2, flap_rate, flap_amp, flap_root);
	}
	if (legs_on) {
		tr = anm_legs(VERTEX, tr, p1, legs_top, legs_amp, legs_lift);
	}
	mat3 M;
	vec3 P;
	anm_pose(mode, rad, p1, atm_time, M, P);
	vec3 c = MODEL_MATRIX[3].xyz;
	vec3 lp = (MODEL_MATRIX * vec4(tr, 1.0)).xyz - c;
	if (billboard) {
		VERTEX = (VIEW_MATRIX * vec4(c + P, 1.0)).xyz + vec3(lp.x, lp.y, 0.0);
		NORMAL = vec3(0.0, 0.0, 1.0);
	} else {
		VERTEX = (VIEW_MATRIX * vec4(c + P + M * lp, 1.0)).xyz;
		vec3 n = M * normalize(transpose(inverse(mat3(MODEL_MATRIX))) * NORMAL);
		NORMAL = normalize((VIEW_MATRIX * vec4(n, 0.0)).xyz);
	}
}

vec4 anm_texel(vec2 uv) {
	vec2 tuv = uv * uv_repeat + uv_offset;   // three's uv transform, then its flipY
	return has_tex ? texture(albedo_tex, vec2(tuv.x, flip_v ? 1.0 - tuv.y : tuv.y)) : vec4(1.0);
}
