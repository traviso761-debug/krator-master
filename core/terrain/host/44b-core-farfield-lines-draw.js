// ================================================================= CORE — far lines on a three.js page (KFAR.streakMesh)  [G shader]
// A KFAR.streaks set (44b-core-farfield-lines.js) as one instanced draw: each line a quad from a to b, turned about its own
// axis to face the eye (a ribbon), its width and darkness on the kit's value (KFAR.streakAt's numbers), faded by the range,
// fogged by the page's fog. Opt-in (subfolder); needs THREE and 44b-core-farfield-lines.js.
//   KFAR.streakMesh(S, o)  o.k {value} (or a number): the kit's value; o.name, o.label, o.fog (true) -> THREE.Mesh, added to nothing,
//                          with the same flags as KFAR.mesh (farField, noSnow, not frustum-culled)
(function(root){
  'use strict';
  var K=root.KFAR;
  if(!K||!K.streaks)throw new Error('core/terrain host/44b-core-farfield-lines-draw.js: load 44b-core-farfield-lines.js first (KFAR.streaks)');
  var LV=['attribute vec3 aA;attribute vec3 aB;attribute float aW;attribute float aAlpha;attribute float aLag;attribute vec3 aTint;',
    'uniform float uK;uniform vec2 uRange;varying float vA;varying vec3 vTint;varying float vU;','#include <fog_pars_vertex>',
    'void main(){float g=clamp((uK-aLag)/max(1.0-aLag,0.001),0.0,1.0);vec3 P=mix(aA,aB,position.y+0.5);vec3 ax=aB-aA;',
    'vec3 side=normalize(cross(ax,P-cameraPosition));P+=side*position.x*aW*(0.5+0.5*g);',
    'vec4 mvPosition=viewMatrix*vec4(P,1.0);float r=length(mvPosition.xyz),w=(uRange.y-uRange.x)*0.1,f=1.0;',
    'if(uRange.y>uRange.x)f=smoothstep(uRange.x,uRange.x+w,r)*(1.0-smoothstep(uRange.y-w,uRange.y,r));',
    'vA=aAlpha*(0.33+0.67*g)*f;vTint=aTint;vU=position.x*2.0;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
  var LF=['varying float vA;varying vec3 vTint;varying float vU;','#include <fog_pars_fragment>',
    'void main(){float a=vA*(1.0-smoothstep(0.55,1.0,abs(vU)));if(a<0.004)discard;gl_FragColor=vec4(vTint,a);','#include <encodings_fragment>','#include <fog_fragment>','}'].join('\n');
  function streakMesh(S,o){o=o||{};var T=root.THREE;if(!T)throw new Error('KFAR.streakMesh: needs THREE');
    var g=new T.InstancedBufferGeometry(),P=new T.PlaneGeometry(1,1),A=function(n,a,sz){g.setAttribute(n,new T.InstancedBufferAttribute(a,sz));};
    g.setAttribute('position',P.attributes.position);g.setIndex(P.index);g.instanceCount=S.count;
    A('aA',S.a,3);A('aB',S.b,3);A('aW',S.w,1);A('aAlpha',S.alpha,1);A('aLag',S.lag,1);A('aTint',S.tint,3);
    var fog=o.fog==null?true:!!o.fog,U={uK:o.k&&o.k.value!=null?o.k:{value:o.k==null?1:o.k},uRange:{value:new T.Vector2(S.range?S.range[0]:0,S.range?S.range[1]:0)}};
    if(fog)Object.assign(U,T.UniformsUtils.clone(T.UniformsLib.fog));
    var m=new T.ShaderMaterial({uniforms:U,vertexShader:LV,fragmentShader:LF,transparent:true,depthWrite:false,fog:fog,side:T.DoubleSide});
    var M=new T.Mesh(g,m);M.frustumCulled=false;M.userData.farField=true;M.userData.noSnow=true;if(o.name)M.name=o.name;if(o.label)M.userData.inspectLabel=o.label;return M;}
  K.streakMesh=streakMesh;
})(typeof globalThis!=='undefined'?globalThis:this);
