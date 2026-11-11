// The season on a leaf (biomes/hyperjungle/PLAN-LANDS.md section 11, H7): the twin of core/biome/30-core-foliage.js's season
// step (BIO.foliageHook, "THE SEASON") and 30s-core-season-flush.js's flush. Two page-wide values, as global uniforms
// (project.godot's shader_globals; KSeason.set_globals sets both from a world day and hour):
//   season_dry    0..1, how far into the dry season (KCLOCK.season(...).dry; three: BIO.SEASON.value)
//   season_flush  0..1, the copper flush at the start of the rains (KCLOCK.flush(...).flush; three: BIO.FLUSH.value)
// Per material (krator/biome_import.gd from the leaf's options): sn_k = (drop, k, stagger, 0) and sn_c (linear), fl_k =
// (k, stagger) and fl_c. With k and drop 0 a leaf draws exactly what it drew without. The hash is Dave Hoskins' hash13, the
// same text as BIO.GLSL_SEASON_HASH: no sine, the same on every GPU.
global uniform float season_dry;
global uniform float season_flush;

float sn_hash(vec3 p) {
	vec3 q = fract(p * 0.1031);
	q += dot(q, q.zyx + 31.32);
	return fract((q.x + q.y) * q.z);
}

// how far the colour gives way to the dry colour: the page's dry staggered by the instance's hash, times k
float sn_dry_k(float dry, vec4 k, float h) {
	return clamp(dry * (1.0 + k.z * (2.0 * h - 1.0)), 0.0, 1.0) * k.y;
}

// the share of an instance's cards gone: the lowest hashes first, over a band of .15
float sn_gone(float dry, vec4 k, float h) {
	return clamp((dry * k.x * 1.15 - h) / 0.15, 0.0, 1.0);
}

// how far the colour gives way to the flush colour
float sn_flush_k(float fl, vec2 k, float h) {
	return clamp(fl * (1.0 + k.y * (2.0 * h - 1.0)), 0.0, 1.0) * k.x;
}

// three's diffuseColor.rgb *= mix(vec3(1.0), C / max(vColor, vec3(0.004)), d): the instance-and-vertex colour vcol (Godot's
// COLOR.rgb) gives way to the target, which the hash shades by +-12%
vec3 sn_tint(vec3 c, vec3 vcol, vec3 target, float h, float d) {
	return c * mix(vec3(1.0), target * (0.88 + 0.24 * h) / max(vcol, vec3(0.004)), d);
}

// a card stippled away in 12 cm cells of the unswayed card (p_local: the vertex in the model's space)
bool sn_discard(vec3 p_local, float h, float gone) {
	return gone > 0.0 && sn_hash(floor(p_local * 8.0) + h * 17.0) < gone;
}
