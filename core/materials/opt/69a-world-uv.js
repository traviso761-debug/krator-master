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
// THE PROGRAM KEY. three.js keys a compiled program on customProgramCacheKey(), which defaults to
// onBeforeCompile.toString(). K is a uniform (uWuvK, set per material: sh.uniforms is the material's own), so the GLSL
// is the same for every K and every world-UV material shares one program (K1, GRAPHICS-TERRAIN-PROPOSAL.md 12d; it was
// one program per K). The hook is still built with Function(), K in its SOURCE TEXT, because the uniform's value must
// reach the hook without `this` (pages wrap hooks and call them bare) and survive Material.clone() (kbake clones every
// kdef material and carries onBeforeCompile across; clone() drops customProgramCacheKey). The hook carries its key as
// fn._pck, which three.js's default key reads (kmPckInstall below), so a clone shares the program too. A material whose
// hook was wrapped after this one keeps a program of its own: its key names the K and the wrapper's text, as before.
// uWuvK holds K and Kv to 4 places, the numbers the text used to print, so a page draws the same pixels.
// Used by: Iziz, Highlands, Xanadu, the Ancients kit (77z-iziz-style). Each build opts in through CORE_OPT_FILES.
function kmPckInstall(){const P=THREE.Material.prototype;if(P._kmPck)return;const o=P.customProgramCacheKey;
 P.customProgramCacheKey=function(){const f=this.onBeforeCompile;return f&&f._pck?f._pck:o.call(this);};P._kmPck=1;}
function vWorldUV(mat,K,Kv){mat.userData.uvK=K;kmPckInstall();
 const ku=+K.toFixed(4),kv=(Kv===undefined||Kv===K)?ku:+Kv.toFixed(4),k=(Kv===undefined||Kv===K)?K.toFixed(4):'vec2('+K.toFixed(4)+','+Kv.toFixed(4)+')';
 const glsl='#ifdef USE_UV\n#ifdef USE_INSTANCING\nmat4 _im=instanceMatrix;\nvec3 _sc=vec3(length(_im[0].xyz),length(_im[1].xyz),length(_im[2].xyz));\nvec3 _an=abs(normal);\nvec2 _sw=(_an.y>0.5)?vec2(_sc.x,_sc.z):((_an.x>0.5)?vec2(_sc.z,_sc.y):vec2(_sc.x,_sc.y));\nvUv=uv*_sw*uWuvK;\n#else\nvUv=uv;\n#endif\n#endif';
 const fn=new Function('sh','sh.uniforms=sh.uniforms||{};sh.uniforms.uWuvK={value:new THREE.Vector2('+ku+','+kv+')};\n'+
  'sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\\nuniform vec2 uWuvK;").replace("#include <uv_vertex>",'+JSON.stringify(glsl)+');');
 fn._pck='wuv|u';mat.onBeforeCompile=fn;
 const own='wuv|u',old='wuv|'+k;mat.customProgramCacheKey=function(){const f=this.onBeforeCompile;return f===fn?own:old+'|'+f.toString();};return mat;}
