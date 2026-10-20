// The shader library: hook 'triplanar' (godot/README.md, "The shader library"). The twin of the Iziz court finishes
// (settlements/iziz/src/95i-iziz-interiors.js courtFinish, COURT_TRI): the catalog furniture's batch has no UVs, so a court
// set (marquetry, brocade, opus sectile; gold leaf and velvet) is projected from three sides, one tile per `tile` metres,
// weighted by the normal to the 4th power. The page projects in world space (its batch is merged in the world); a piece
// here is an instanced item in its own frame, so the projection is the piece's: a cabinet keeps its marquetry when it
// moves. Mode `detail` multiplies the set into the vertex colour times `gain` (1 / mean^2.2 of the packed set, so the
// palette colour keeps its brightness); otherwise the set is the surface and the vertex colour is not used (tint off).
// Pure functions: include anywhere.
#ifndef K_TRIPLANAR
#define K_TRIPLANAR

#include "res://shaders/lib/world-uv.gdshaderinc"

// the set at local position p (metres) on a surface of local normal n, `per_m` tiles per metre
vec4 tri_sample(sampler2D t, vec3 p, vec3 n, float per_m) {
	return wuv_triplanar(t, p, n, per_m, 4.0);
}

#endif
