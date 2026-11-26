// The per-row LOD of a chunked item or bucket: the twin of core/biome's BIO.LODFADE_GLSL with BIO.LOD.cull
// (20-core-kit.js, "the LOD cross-fade"). krator/world_import.gd sets the four instance uniforms on each chunk node
// (KratorWorld._lod_rows): the chunk's box, the ranges its rows are drawn to (longest first) and the row each range ends
// at, as three's aLodA/aLodB/aLodC do. A row is measured from the chunk box (mode 1, as three's lodTick switches a chunk)
// or, when no tree owns any of the node's rows (the export's lod.loose), from its own origin (mode 2); past its range it
// collapses to a point and is never rasterized, and over the last `fade` of the range it dithers out. Mode 0 (the default:
// a node the importer did not set, every unchunked mesh) draws as before.
instance uniform vec4 lod_box = vec4(0.0);    // x0, z0, x1, z1 of the chunk, world metres
instance uniform vec4 lod_y = vec4(0.0);      // y0, y1 (the rows' heights), fade (a fraction of the range), mode
instance uniform vec4 lod_r = vec4(1e9);      // the ranges, longest first
instance uniform vec4 lod_e = vec4(1e9);      // the row (INSTANCE_ID) each range ends at

// 0: drawn whole; 0..1: how far it has faded; 2: culled
float klod(vec3 origin, vec3 cam, int row) {
	if (lod_y.w < 0.5) {
		return 0.0;
	}
	float d;
	if (lod_y.w > 1.5) {
		d = length(origin - cam);
	} else {
		vec3 q = max(max(vec3(lod_box.x, lod_y.x, lod_box.y) - cam, vec3(0.0)), cam - vec3(lod_box.z, lod_y.y, lod_box.w));
		d = length(q);
	}
	float f = float(row);
	float r = f < lod_e.x ? lod_r.x : (f < lod_e.y ? lod_r.y : (f < lod_e.z ? lod_r.z : lod_r.w));
	if (d > r) {
		return 2.0;
	}
	return lod_y.z > 0.0 ? smoothstep(r * (1.0 - lod_y.z), r, d) : 0.0;
}

// three's interleaved-gradient dither (fragmentMain of BIO.LODFADE_GLSL): true where a pixel of a fading row is dropped
bool klod_drop(float k, vec2 frag) {
	return k > 0.0 && fract(52.9829189 * fract(dot(frag, vec2(0.06711056, 0.00583715)))) < k;
}
