// The shader library: hook 'world-uv' (godot/README.md, "The shader library"; GODOT-PLAN.md Phase 3).
// Maps that tile in world metres, whatever the mesh's own UVs. Three forms, each the twin of a three.js hook:
//   wuv_box       vWorldUV (core/materials/opt/69a-world-uv.js): an instanced unit box keeps one tile per 1/K metres,
//                 the two instance-scale axes its face spans times K; wuv_box_offset is Girder's per-instance start
//                 (applyWorldUV, settlements/girder/src/45-kit.js; Voth's and Locus's world-uv the same)
//   wuv_planar    a world-xz projection: a ground's layers (core/export's EXPORT.groundLayers: the biome hosts' detail
//                 and crack maps, biomes/*/src/45-host-stage.js), uv = xz * scale + offset, three's flipY applied
//   wuv_triplanar Godot's uv1_triplanar written out, for a mesh with no UVs (the catalog furniture's merged batches)
// and wuv_layer: one multiply term of a ground's layers, colour * mix(1, gain * sample, amount * weight).
// Pure functions of their arguments: include anywhere (spatial or canvas_item), any number of times.
#ifndef K_WORLD_UV
#define K_WORLD_UV

// the instance's scale along its three basis columns (MODEL_MATRIX of a MultiMesh instance, as instanceMatrix in three)
vec3 wuv_instance_scale(mat4 m) {
	return vec3(length(m[0].xyz), length(m[1].xyz), length(m[2].xyz));
}

// vWorldUV: uv * (the two scale axes the face spans) * k, k = (K, Kv) tiles per metre. n is the local normal.
vec2 wuv_box(vec2 uv, vec3 n, vec3 isc, vec2 k) {
	vec3 an = abs(n);
	vec2 sw = an.y > 0.5 ? isc.xz : (an.x > 0.5 ? isc.zy : isc.xy);
	return uv * sw * k;
}

// Girder's per-instance start of the tiling: a hash of the instance's xz (its matrix column 3), in [0, 1)^2
vec2 wuv_box_offset(vec2 o) {
	return fract(sin(vec2(dot(o, vec2(12.9898, 78.233)), dot(o, vec2(39.3468, 11.1352)))) * vec2(43758.5453, 24634.6345));
}

// a world-xz projection: uv = xz * scale + offset. flip_y: three's flipY (the image's top row at v = 1), so Godot,
// whose v runs down the image, samples 1 - v
vec2 wuv_planar(vec3 wp, vec2 scale, vec2 offset, bool flip_y) {
	vec2 uv = wp.xz * scale + offset;
	return flip_y ? vec2(uv.x, 1.0 - uv.y) : uv;
}

// triplanar blend weights from a world normal; sharp >= 1 narrows the blend
vec3 wuv_tri_weights(vec3 n, float sharp) {
	vec3 w = pow(max(abs(n), vec3(0.0)), vec3(max(sharp, 1.0)));
	return w / max(w.x + w.y + w.z, 1e-5);
}

// a map sampled on the three world planes, k tiles per metre
vec4 wuv_triplanar(sampler2D t, vec3 wp, vec3 n, float k, float sharp) {
	vec3 w = wuv_tri_weights(n, sharp);
	return texture(t, wp.zy * k) * w.x + texture(t, wp.xz * k) * w.y + texture(t, wp.xy * k) * w.z;
}

// one term of a ground's layers (EXPORT.groundLayers): colour *= mix(1, gain * s, aw), aw = amount * weight. s is the
// product of the term's map samples, their bytes as stored (three reads them in its own uniform: no sRGB decode)
vec3 wuv_layer(vec3 c, vec3 s, float gain, float aw) {
	return c * mix(vec3(1.0), s * gain, clamp(aw, 0.0, 1.0));
}
#endif
