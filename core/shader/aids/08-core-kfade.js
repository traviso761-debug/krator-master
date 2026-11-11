/* core/shader/aids/08-core-kfade.js — KFADE: the dither fade and the x-ray (core/host/UNDERGROUND.md; kits/tungang/PLAN.md 6.3, aids 1
   and 2). OPT-IN BY FILE AND BY MATERIAL: this folder is a subfolder so the builds that read core/shader/ whole do not take it; a build
   lists it (core/host/host.py UNDERGROUND) and a material takes the fade only through KFADE.add. A page without it is unchanged.

   KFADE.add(material, o) -> material   a KHOOK layer 'kfade' (screen-door, not alpha: the surface stays opaque, unsorted and in the
     shadow pass, which keeps three's own depth material): o {occluder: true, band: true}. Fragments within r of the segment from the
     camera to the target, and short of the target, dither out (at most `max`, .85, so a ghost of the occluder stays); with a band
     set, fragments over its y dither out over `soft` metres. The cell is one screen pixel (a 4x4 Bayer matrix: no shimmer in motion
     beyond the pattern's own).
   KFADE.addAll(root, match(mesh, material) -> bool, o)   every material under root that match accepts (thin things, a room's walls)
   KFADE.track(a: Vector3 | [x,y,z] | null, b, r = .7, max = .85)   the segment: the follow camera calls it each frame (null: off)
   KFADE.band(y | null, soft = 1)   the soft cut over y (core/host 99b's band calls it)
   KFADE.xray(object, {color: '#8fd4ff', opacity: .55}) -> the silhouette's meshes   the object (the player, a picked NPC) drawn as a
     flat silhouette where something hides it: a pre-pass marks its visible pixels in the stencil (depth LessEqual, no colour), then a
     pass with the depth test inverted (GreaterDepth) draws only where it is hidden and not already marked. Skinned meshes are bound to
     the source's skeleton. KFADE.unxray(object) takes it off.
   KFADE.GLSL   the dither chunk's text (the Godot side ports it: UNDERGROUND.md)
   KFADE.U      the shared uniforms (one write a frame reaches every material) */
(function(root){'use strict';
 if(!root.KHOOK)throw new Error('core/shader/aids/08-core-kfade.js: load core/shader/06-core-khook.js first');
 var T=function(){return root.THREE;};
 var U=null;
 function uniforms(){if(U)return U;var THREE=T();
  U={uKFadeA:{value:new THREE.Vector3()},uKFadeB:{value:new THREE.Vector3()},uKFadeR:{value:.7},uKFadeM:{value:.85},uKFadeOn:{value:0},uKBand:{value:new THREE.Vector3(0,1,0)}};return U;}
 var BAYER='float kBayer4(vec2 p){vec2 q=mod(floor(p),4.);vec2 a=mod(q,2.),c=floor(q/2.);return (4.*mod(2.*a.x+3.*a.y,4.)+mod(2.*c.x+3.*c.y,4.)+.5)/16.;}\n';
 var HEADV='varying vec3 vKFadeW;\n';
 var HEADF='varying vec3 vKFadeW;uniform vec3 uKFadeA;uniform vec3 uKFadeB;uniform float uKFadeR;uniform float uKFadeM;uniform float uKFadeOn;uniform vec3 uKBand;\n'+BAYER;
 var VTX='{vec4 kfw=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nkfw=instanceMatrix*kfw;\n#endif\nvKFadeW=(modelMatrix*kfw).xyz;}';
 function frag(o){var s='{float kfa=0.;';
  if(o.occluder!==false)s+='if(uKFadeOn>.5){vec3 ab=uKFadeB-uKFadeA;float L2=max(dot(ab,ab),1e-4),t=dot(vKFadeW-uKFadeA,ab)/L2;'+
   'float dd=length(vKFadeW-(uKFadeA+ab*clamp(t,0.,1.)));float near=1.-clamp((t*sqrt(L2)-(sqrt(L2)-.45))/.3,0.,1.);'+
   'kfa=(1.-smoothstep(uKFadeR*.55,uKFadeR,dd))*step(0.,t)*near*uKFadeM;}';
  if(o.band!==false)s+='if(uKBand.z>.5)kfa=max(kfa,clamp((vKFadeW.y-uKBand.x)/max(uKBand.y,1e-3),0.,1.));';
  return s+'if(kfa>.001&&kfa>=kBayer4(gl_FragCoord.xy))discard;}';}
 var K={GLSL:{bayer:BAYER,vertex:VTX,fragment:frag({})}};
 Object.defineProperty(K,'U',{get:uniforms});
 K.add=function(m,o){o=o||{};if(!m)return m;var name='kfade'+(o.occluder===false?'-noocc':'')+(o.band===false?'-noband':'');
  return root.KHOOK.add(m,name,{uniforms:function(){return uniforms();},
   vertex:{head:HEADV,at:[{at:'project_vertex',after:VTX}]},
   fragment:{head:HEADF,at:[{at:'clipping_planes_fragment',after:frag(o)}]}});};
 K.addAll=function(r,match,o){var n=0,seen=new Set();r.traverse(function(q){if(!q.isMesh||(q.userData&&q.userData.khost))return;var ms=Array.isArray(q.material)?q.material:[q.material];
  ms.forEach(function(m){if(!m||seen.has(m)||m.isShaderMaterial)return;seen.add(m);if(match&&!match(q,m))return;K.add(m,o);n++;});});return n;};
 var v3=function(dst,a){if(a.isVector3)dst.copy(a);else dst.set(a[0],a[1],a[2]);};
 K.track=function(a,b,r,max){var u=uniforms();if(!a||!b){u.uKFadeOn.value=0;return;}v3(u.uKFadeA.value,a);v3(u.uKFadeB.value,b);
  u.uKFadeR.value=r==null?.7:r;u.uKFadeM.value=max==null?.85:max;u.uKFadeOn.value=1;};
 K.band=function(y,soft){var u=uniforms();if(y==null){u.uKBand.value.z=0;return;}u.uKBand.value.set(y,soft==null?1:soft,1);};
 // ---------------------------------------------------------------- the x-ray
 K.xray=function(obj,o){o=o||{};var THREE=T(),out=[],src=[];if(!obj)return out;K.unxray(obj);
  obj.traverse(function(q){if(q.isMesh&&!(q.userData&&q.userData.kxray))src.push(q);});
  var pre=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false,depthFunc:THREE.LessEqualDepth,stencilWrite:true,stencilRef:1,
   stencilFunc:THREE.AlwaysStencilFunc,stencilZPass:THREE.ReplaceStencilOp});
  var sil=new THREE.MeshBasicMaterial({color:new THREE.Color(o.color||'#8fd4ff'),transparent:true,opacity:o.opacity==null?.55:o.opacity,depthWrite:false,
   depthFunc:THREE.GreaterDepth,stencilWrite:true,stencilRef:1,stencilFunc:THREE.NotEqualStencilFunc,stencilZPass:THREE.ReplaceStencilOp});
  pre.name='kxray-mark';sil.name='kxray-silhouette';
  src.forEach(function(q){[[pre,990],[sil,991]].forEach(function(pm){var m;
    if(q.isSkinnedMesh){m=new THREE.SkinnedMesh(q.geometry,pm[0]);m.bind(q.skeleton,q.bindMatrix);}
    else if(q.isInstancedMesh){m=new THREE.InstancedMesh(q.geometry,pm[0],q.count);m.instanceMatrix=q.instanceMatrix;}
    else m=new THREE.Mesh(q.geometry,pm[0]);
    m.renderOrder=pm[1];m.castShadow=false;m.receiveShadow=false;m.frustumCulled=q.frustumCulled;m.userData.kxray=true;m.userData.khost='xray';m.userData.probeSkip=true;
    m.name=pm[0].name+' of '+(q.name||'mesh');q.add(m);out.push(m);});});
  obj.userData.kxrayParts=out;return out;};
 K.unxray=function(obj){var L=obj&&obj.userData&&obj.userData.kxrayParts;if(!L)return;L.forEach(function(m){if(m.parent)m.parent.remove(m);});obj.userData.kxrayParts=null;};
 root.KFADE=K;
})(typeof window!=='undefined'?window:globalThis);
