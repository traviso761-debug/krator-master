// ================================================================= WIND
// Ported from Girder's foliage sway (60-trees.js). Every leaf, frond, vine and
// trunk in the scene moves, and it costs nothing per frame but one uniform:
// the displacement is done in the vertex shader from a per-instance phase, so
// 30 000 plants animate without a single matrix being rewritten on the CPU.
//
// Three things this depends on, all verified in this kit before now:
//   - r128's project_vertex chunk is exactly the four lines replaced below;
//     the hook has to rebuild it rather than append, because the instance
//     matrix has to be applied BEFORE the displacement or every plant in a
//     cluster sways in lockstep.
//   - the phase comes from instanceMatrix[3].xyz -- the instance's own
//     translation -- so neighbours are out of step without any extra attribute.
//   - Material.clone() does NOT carry onBeforeCompile in r128, so these hooks
//     are applied to the shared materials themselves, not to copies.
//
// Amplitude scales with the instance's own scale (length of instanceMatrix[0]),
// or a 40 m canopy blob and a 3 m fern would move the same distance.
const WIND={t:{value:0}};
// `axis` picks which column of the instance matrix sets the amplitude. A crown
// clump is scaled evenly, so column 0 is its size; a hanging curtain is scaled
// thin in x and long in y, and reading its width would leave a 20 m vine
// trembling like a 1 m one. Hanging things pass 1.
// FOLIAGE HOOK (Lambert materials only). Three things ported from Girder's
// treeFoliageHook, all of which are about a leaf card being a card:
//   - the vertex normal is bent toward world up, so a clump of randomly
//     rotated cards shades like a lit mass instead of a heap of shards;
//   - the back face gets most of the front face's light: a leaf is
//     translucent, and seen from below it is still a lit green leaf, not the
//     ground-hemisphere shadow the flipped normal would give it;
//   - alpha is boosted with distance, or mipmapping thins the rosette to
//     nothing by 600 m and the far canopy turns to lace.
// Standard materials keep a 4% specular at any roughness and go white at
// grazing angles, which is what the underside of the forest looked like; the
// foliage materials in 71b-flora.js are Lambert so that this hook applies.
function foliageHook(sh){
 sh.vertexShader=sh.vertexShader
  .replace('#include <defaultnormal_vertex>',
   '#include <defaultnormal_vertex>\n'+
   '{vec3 _up=normalize(normalMatrix*vec3(0.0,1.0,0.0));'+
   ' transformedNormal=normalize(mix(normalize(transformedNormal),_up,0.45));}');
 sh.fragmentShader=sh.fragmentShader
  .replace('#include <common>','#include <common>\nvarying float vFlD;')
  .replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.a *= 1.0 + clamp(vFlD/650.0, 0.0, 1.1);')
  .replace('reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;',
           'reflectedLight.indirectDiffuse += 0.72*vIndirectFront + 0.28*vIndirectBack;')
  .replace('reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;',
           'reflectedLight.directDiffuse = vLightFront + 0.30*vLightBack;');
}
function windHook(mat,swayW,swayA,name,axis){
 if(!mat)return;
 const fol=mat.isMeshLambertMaterial;
 mat.onBeforeCompile=function(sh){
  sh.uniforms.uWindT=WIND.t;
  sh.vertexShader=sh.vertexShader
   .replace('#include <common>','#include <common>\nuniform float uWindT;varying float vFlD;')
   .replace('#include <project_vertex>',[
    'vec4 mvPosition = vec4( transformed, 1.0 );',
    'float _sc = 1.0; float _ph = 0.0;',
    '#ifdef USE_INSTANCING',
    '  mvPosition = instanceMatrix * mvPosition;',
    '  _ph = dot(instanceMatrix[3].xyz, vec3(0.131,0.073,0.117));',
    '  _sc = length(instanceMatrix['+(axis||0)+'].xyz);',
    '#endif',
    'float _wg = '+swayW+';',
    'mvPosition.xyz += _wg * _sc * vec3(',
    '   sin(uWindT*0.9+_ph) + 0.45*sin(uWindT*2.3+_ph*1.7+position.x*5.0),',
    '   0.40*sin(uWindT*1.6+_ph*0.6+position.z*5.0),',
    '   cos(uWindT*0.7+_ph*1.3) + 0.45*sin(uWindT*2.9+_ph+position.y*5.0) ) * '+swayA.toFixed(3)+';',
    'mvPosition = modelViewMatrix * mvPosition;',
    'vFlD = -mvPosition.z;',
    'gl_Position = projectionMatrix * mvPosition;'].join('\n'));
  if(fol)foliageHook(sh);
 };
 // different hooks on different materials need different cache keys, or three
 // will silently share one compiled program
 mat.customProgramCacheKey=function(){return 'wind_'+name+(fol?'_fol':'');};
 mat.needsUpdate=true;
}
// MAT.vine backs both 'vine' (hangs from y=0 down to y=-1) and 'trunk' (stands
// from y=0 up to y=1). One weight of -position.y is correct for both: zero at
// the attached end, full at the free one.
windHook(MAT.vine,'(-position.y)',.085,'vine');
windHook(MAT.turf,'1.0',.050,'turf');
windHook(MAT.moss,'1.0',.022,'moss');
windHook(MAT.leaf,'1.0',.060,'leaf');
// the other three species textures are three more materials (one texture per
// material, so one card cannot show two species), and each needs its own hook
windHook(MAT.leaf1,'1.0',.060,'leaf1');
windHook(MAT.leaf2,'1.0',.060,'leaf2');
windHook(MAT.leaf3,'1.0',.060,'leaf3');
// FLORA's three foliage materials (71b-flora.js). Each carries a different
// weight because each is pinned at a different place: a curtain, a strand and
// an aerial root hang from y=0, a fern frond is clamped at its base and free
// at the tip, a flower is small and just trembles.
windHook(MAT.hang,'(-position.y)',.055,'hang',1);
windHook(MAT.frond,'(position.x)',.075,'frond');
windHook(MAT.bloom,'1.0',.050,'bloom');
tick(function(dt){WIND.t.value+=dt;});
