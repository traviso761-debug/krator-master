/* core/shader/07-core-kwarp.js — KWARP: one vertex warp on every material a scene draws (the Bend; biomes/ancientsvalley/PLAN-ANOMALIES.md).
   Opt-in: a page that bends takes this fragment after 06-core-khook.js. Nothing here runs until install, so a page without a warp
   (and every material before install) keeps its shader text and its program key: no material needs converting ahead of time.
   KWARP.install({key, glsl, uniforms, scene, skip}) -> W
     glsl: 'vec3 kWarp(vec3 p){...}', world position in, world position out (KHOOK.EYE's kEye() is in scope: the eye for a view-centred
     warp). uniforms: {name: {value}} shared by every program; declare them in glsl. skip(material, object) -> a reason, or nothing.
     It fills the slot KHOOK.warp and gives every material in the scene a KHOOK layer, so the warp runs last, after the material's own
     hook and its layers, whichever way each one projects.
   W.sweep()    again for what was added since (a chunk built later, a lazy load): each call walks the scene. Call it after a load
   W.report()   -> {warped, left: [{material, type, object, reason}], depth}   after a frame has compiled them. depth: meshes casting a
     shadow with three's default depth material, which no hook reaches (their shadows stay true: the plan allows that at modest strength)
   W.remove()   empties the slot and recompiles
   KWARP.text(vs, glsl) -> the vertex text with the warp in, or null when it has no world projection to bend (a screen quad, atmQuad).
     Pure: three shapes. <project_vertex>; a hook that wrote its own 'gl_Position = projectionMatrix * mvPosition' (the sway, the anim,
     the impostors, the lava); any other 'gl_Position = projectionMatrix * <expression>'. mvPosition is rewritten too, so fog and
     vViewPosition follow. Normals are not bent. Culling is three's, on the unbent bounds: a far chunk the warp lifts into view vanishes early */
(function(root){'use strict';
 var W={},K=function(){if(root.KHOOK)return root.KHOOK;throw new Error('KWARP: core/shader/06-core-khook.js is not on this page');};
 var VIEW='vec4 kWarpV(vec4 mv){vec3 w=transpose(mat3(viewMatrix))*(mv.xyz-viewMatrix[3].xyz);return viewMatrix*vec4(kWarp(w),mv.w);}\n';
 var EYE='\n#ifndef KHOOK_EYE\n#define KHOOK_EYE\nvec3 kEye(){return -(viewMatrix[3].xyz*mat3(viewMatrix));}\n#endif\n';
 var PROJ=/gl_Position\s*=\s*projectionMatrix\s*\*\s*([^;]+);/g;
 var CHUNK='#include <project_vertex>';
 W.text=function(vs,glsl){var head=EYE+glsl+'\n'+VIEW,fix='mvPosition=kWarpV(mvPosition);gl_Position=projectionMatrix*mvPosition;';
  if(vs.indexOf(CHUNK)>=0)return head+vs.replace(CHUNK,function(){return CHUNK+'\n'+fix;});
  var hit=false,out=vs.replace(PROJ,function(m,e){hit=true;return /^mvPosition\s*$/.test(e)?fix:'gl_Position=projectionMatrix*kWarpV('+e.trim()+');';});
  return hit?head+out:null;};
 W.install=function(o){var H=K(),seen=new Map(),left=new Map(),scene=o.scene,warped=new Set();
  var skip=o.skip||function(m){if(m.isRawShaderMaterial)return 'a raw shader: no viewMatrix to bend by';
   if(m.side===1&&m.depthWrite===false)return 'the sky dome';};
  H.warp={key:o.key,run:function(sh){if(o.uniforms)for(var k in o.uniforms)sh.uniforms[k]=o.uniforms[k];
   var t=W.text(sh.vertexShader,o.glsl);if(t==null){left.set(this,'no world projection in its vertex shader');return;}sh.vertexShader=t;warped.add(this);}};
  var one=function(m,ob){if(!m||seen.has(m))return;var why=skip(m,ob);seen.set(m,ob);if(why){left.set(m,why);return;}H.add(m,'kwarp',function(){},{order:1e9});};
  var api={};
  api.sweep=function(){scene.traverse(function(ob){var ms=ob.material?(Array.isArray(ob.material)?ob.material:[ob.material]):[];ms.forEach(function(m){one(m,ob);});
    one(ob.customDepthMaterial,ob);one(ob.customDistanceMaterial,ob);});return api;};
  api.report=function(){var r={warped:warped.size,left:[],depth:0};left.forEach(function(why,m){var ob=seen.get(m);r.left.push({material:m.name||m.type,type:m.type,object:ob&&ob.name||'',reason:why});});
   seen.forEach(function(ob,m){if(!left.has(m)&&!warped.has(m))r.left.push({material:m.name||m.type,type:m.type,object:ob&&ob.name||'',reason:'not compiled yet: not drawn'});});
   scene.traverse(function(ob){if(ob.isMesh&&ob.castShadow&&!ob.customDepthMaterial)r.depth++;});return r;};
  api.remove=function(){H.warp=null;seen.forEach(function(ob,m){m.needsUpdate=true;});};
  return api.sweep();};
 root.KWARP=W;
})(typeof window!=='undefined'?window:globalThis);
