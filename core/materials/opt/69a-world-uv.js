// ---------------------------------------------------------------- world-unit UVs (core/materials/opt: the one shared copy)
// Instances share one geometry, so a box's 0..1 UVs would stretch one texture
// tile over a 20 m wall and squash it on a 0.2 m beam. This hook reads the
// instance scale in the vertex shader and picks, per face normal, the two axes
// that face spans, so every map tiles in metres whatever the instance size.
// K = 1 / (metres per texture tile); Kv (optional) gives v its own tile size for
// maps that are not square (Xanadu's bands and valances).
// A plain mesh keeps the UVs its geometry carries (the kit's lathes and grids are drawn in 8 m tile units, the
// vernacular ones in the material's own tile); only INSTANCES are re-tiled by their scale.
//
// THE PROGRAM KEY. three.js keys a compiled program on onBeforeCompile.toString() (plus customProgramCacheKey()).
// The old hook was a closure, which prints the same source whatever K it captured, so every world-UV material
// shared the program of whichever compiled first and rendered at that K. The hook is now built with Function(), so
// K is in its SOURCE TEXT: each K gets its own program, and the key survives Material.clone() (kbake clones every
// kdef material and carries onBeforeCompile across; clone() drops customProgramCacheKey, which is set as well for
// the uncloned material). Used by: Iziz, Highlands, Xanadu, the Ancients kit (77z-iziz-style). Each build opts in
// through CORE_OPT_FILES in its build.py.
function vWorldUV(mat,K,Kv){mat.userData.uvK=K;
 const k=(Kv===undefined||Kv===K)?K.toFixed(4):'vec2('+K.toFixed(4)+','+Kv.toFixed(4)+')';
 const glsl='#ifdef USE_UV\n#ifdef USE_INSTANCING\nmat4 _im=instanceMatrix;\nvec3 _sc=vec3(length(_im[0].xyz),length(_im[1].xyz),length(_im[2].xyz));\nvec3 _an=abs(normal);\nvec2 _sw=(_an.y>0.5)?vec2(_sc.x,_sc.z):((_an.x>0.5)?vec2(_sc.z,_sc.y):vec2(_sc.x,_sc.y));\nvUv=uv*_sw*'+k+';\n#else\nvUv=uv;\n#endif\n#endif';
 mat.onBeforeCompile=new Function('sh','sh.vertexShader=sh.vertexShader.replace("#include <uv_vertex>",'+JSON.stringify(glsl)+');');
 const key='wuv|'+k;mat.customProgramCacheKey=()=>key;return mat;}
