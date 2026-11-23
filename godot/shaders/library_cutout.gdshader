// A cut-out material-library surface (alpha_test > 0), library.gdshader's twin (K5): the same body, scissored on the
// albedo's alpha. A material-library surface (core/materials/record: KMAT; Girder is the pilot). The pack (tools/textures/pack.py)
// has already baked the tint, brightness and roughness lift into the maps, so this shader adds what three.js did in
// its hooks (core/materials/record/25-matlib-host.js): the vertex or instance colour (tint), Godot's `specular`, and
// the repetition break-up: a world-space value noise of `cell` metres blends every map with a copy shifted by
// KM_OFF (up to `mix`), and a slower noise varies the brightness by +-`macro`. Maps keep their own UVs (and the
// glTF texture transform, uv_scale and uv_offset), except on instances with `world_uv` (below). The break-up and the
// world-unit tiling are the shader library's (shaders/lib/breakup.gdshaderinc, lib/world-uv.gdshaderinc: hooks
// 'breakup' and 'world-uv').
shader_type spatial;
render_mode cull_disabled;

#define KLIB_CUTOUT
#include "res://shaders/kcolour.gdshaderinc"   // three draws most library surfaces front-only; a few are double-sided, and glTF carries the flag per material
#include "res://shaders/lib/breakup.gdshaderinc"
#include "res://shaders/lib/world-uv.gdshaderinc"
#include "res://shaders/lib/triplanar.gdshaderinc"

#include "res://shaders/lib/library_body.gdshaderinc"
