// Detail at arm's length (GODOT-LOOK-PLAN.md section 8, M9): one shared array of detail normals, a layer a surface
// class (stone, plaster, wood grain, metal, cloth, earth: krator/kdetail.gd makes it, from noise, once), tiled at about
// a third of a metre and gone by six metres. A 512 px map over 2 m is 256 texels a metre: enough at three metres, soft
// at half a metre; this is what is under it. One sampler for every material; a surface names its layer and how many
// detail tiles one tile of its own uv holds. Off until a look turns it on (k_surface.x is 0 by default).
#ifndef K_DETAIL_INC
#define K_DETAIL_INC

global uniform sampler2DArray k_detail_arr : repeat_enable, filter_linear_mipmap_anisotropic;
global uniform vec4 k_surface;   // x: detail strength 0..1 (0: off); y: 1 where the mesh's own tangents frame the normal map (M10)

// the detail normal's tangent-space xy at uv (in detail tiles), faded by the eye's distance in metres; scale by k_surface.x
vec2 kd_detail(vec2 uv, float layer, float dist) {
	vec2 d = texture(k_detail_arr, vec3(uv, layer)).rg * 2.0 - 1.0;
	return d * (1.0 - smoothstep(3.0, 6.0, dist));
}

#endif
