// ================================================================= HOST - the sun's shadows (core/shadow, KSHADOW; the final rebuild, pair 10, 2026-11-04)
// [web] BACKPORT.md's universal set: KSHADOW toggleable and OFF by default (the owner, 2026-11-03). Since 2026-11-08 the page takes core/shadow's own
// switch (the Throne's way): attached always and off at load, the panel's 'shadows' button or ?shadow=1 turns it on, ?shadow=0 none of it (the cost
// is the coordinator's to time on the GPU). Then one
// 4096 box follows the view (90-600 m by the eye's height); the flora, the camp, the face and the ground cast and receive; the far bowl, the water and
// every shader material draw their own light (KSHADOW.cast skips them). In three r128 the shadow map's sampler is declared in every lit material once the
// renderer's shadow map is on, so a ground that already reads all of the GPU's texture units cannot take it (the Throne's rule): window._shadow says
// what was decided and why. After the build (88), the atmosphere (89a, 89t: the rain cover and the wet ground on the ground's material) and the water.
window._shadow=null;
const SHADOW=(function(){const Q=new URLSearchParams(location.search);
 if(typeof KSHADOW==='undefined'||!KSHADOW.attach||!sun||!sun.isDirectionalLight){window._shadow='off: no core/shadow';return null;}
 if(Q.get('shadow')==='0'){window._shadow='off: ?shadow=0';return null;}
 const LIBOF={MeshLambertMaterial:'lambert',MeshStandardMaterial:'standard',MeshPhysicalMaterial:'physical',MeshPhongMaterial:'phong'};
 /* a dry run of a material's onBeforeCompile on its ShaderLib text: the samplers its fragment shader declares (the Throne's samplersOf) */
 const samplersOf=m=>{try{const L=THREE.ShaderLib[LIBOF[m.type]],sh=L?{uniforms:{},vertexShader:L.vertexShader,fragmentShader:L.fragmentShader}:{uniforms:{},vertexShader:m.vertexShader||'',fragmentShader:m.fragmentShader||''};
   const f0=typeof KHOOK!=='undefined'?KHOOK.failures.length:0;
   try{if(m.onBeforeCompile)m.onBeforeCompile(sh,renderer);}finally{if(typeof KHOOK!=='undefined')KHOOK.failures.length=f0;}let n=(m.map?1:0)+(m.emissiveMap?1:0)+(m.alphaMap?1:0)+(m.normalMap?1:0)+(m.roughnessMap?1:0);
   sh.fragmentShader.replace(/uniform\s+sampler(?:2D|Cube)\s+([^;]+);/g,(a,b)=>{n+=b.split(',').length;return a;});return n;}catch(e){return 99;}};
 const GM=[GROUND.mat].concat(typeof FACE_MESH!=='undefined'&&FACE_MESH?[FACE_MESH.mat]:[]);
 const MAXT=renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures,worst=Math.max(...GM.map(samplersOf));
 if(worst+1>MAXT){window._shadow='skipped: the ground reads '+worst+' of '+MAXT+' texture units';return null;}
 try{const S=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  scene.children.forEach(c=>{if(c===FAR_GROUND||(c.userData&&c.userData.farField))return;if(c.isMesh&&GM.indexOf(c.material)>=0){S.cast(c,{cast:false});return;}S.cast(c);});
  FAR_GROUND.castShadow=FAR_GROUND.receiveShadow=false;
  window._shadow={grounds:GM.length,worst:worst+1,of:MAXT,on:S.enabled};return S;}catch(e){reportErr('shadow: '+e.stack);return null;}})();
