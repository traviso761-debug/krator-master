// ================================================================= HOST - the sun's shadows (core/shadow, KSHADOW), for the stations built since the rebuild
// BACKPORT.md's universal set (the owner, 2026-11-03): one view-following box, TOGGLEABLE AND OFF AT LOAD (KSHADOW.attach turns nothing
// on: the panel's `shadows` button, ?shadow=1 or KSHADOW.host.set(true) does; while off there is no shadow pass and no shadow variant).
// After the build (88), the atmosphere (89a: rain cover and wet ground on the ground's material), the water (89w) and a station's own
// layers (89x), so the count below sees every sampler the ground reads. In three r128 the shadow map's sampler is declared in every lit
// material once the shadow map is on, so a ground that already reads all of the GPU's texture units cannot take it (station 1's ground
// reads 16 of 16, KNOWN_ISSUES.md): window._shadow says what was decided and why. As biomes/nhighlands/src/89zz-host-shadow.js.
window._shadow=null;
const SHADOW=(function(){const Q=new URLSearchParams(location.search);
 if(typeof KSHADOW==='undefined'||!KSHADOW.attach||typeof sun==='undefined'||!sun||!sun.isDirectionalLight||Q.get('shadow')==='0'||(typeof STATION_SHADOW!=='undefined'&&STATION_SHADOW===false)){window._shadow='off';return null;}
 const LIBOF={MeshLambertMaterial:'lambert',MeshStandardMaterial:'standard',MeshPhysicalMaterial:'physical',MeshPhongMaterial:'phong'};
 /* a dry run of a material's onBeforeCompile on its ShaderLib text: the samplers its fragment shader declares (the Throne's samplersOf) */
 const samplersOf=m=>{try{const L=THREE.ShaderLib[LIBOF[m.type]],sh=L?{uniforms:{},vertexShader:L.vertexShader,fragmentShader:L.fragmentShader}:{uniforms:{},vertexShader:m.vertexShader||'',fragmentShader:m.fragmentShader||''};
   const f0=typeof KHOOK!=='undefined'?KHOOK.failures.length:0;
   try{if(m.onBeforeCompile)m.onBeforeCompile(sh,renderer);}finally{if(typeof KHOOK!=='undefined')KHOOK.failures.length=f0;}let n=(m.map?1:0)+(m.emissiveMap?1:0)+(m.alphaMap?1:0)+(m.normalMap?1:0)+(m.roughnessMap?1:0);
   sh.fragmentShader.replace(/uniform\s+sampler(?:2D|Cube)\s+([^;]+);/g,(a,b)=>{n+=b.split(',').length;return a;});return n;}catch(e){return 99;}};
 const GM=[GROUND&&GROUND.material].concat((typeof GROUND_INSETS!=='undefined'?GROUND_INSETS:[]).map(m=>m&&m.material),typeof STATION_GROUNDS!=='undefined'?STATION_GROUNDS:[]).filter((m,i,a)=>m&&a.indexOf(m)===i);
 const MAXT=renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures,worst=GM.length?Math.max(...GM.map(samplersOf)):0;
 if(worst+1>MAXT){window._shadow='skipped: the ground reads '+worst+' of '+MAXT+' texture units';return null;}
 try{const S=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  scene.children.forEach(c=>{if(c.userData&&c.userData.farField)return;if(c.isMesh&&GM.indexOf(c.material)>=0){S.cast(c,{cast:false});return;}S.cast(c);});
  if(typeof FAR!=='undefined'&&FAR&&FAR.mesh)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;
  window._shadow={grounds:GM.length,worst:worst+1,of:MAXT};return S;}catch(e){reportErr('shadow: '+e.stack);return null;}})();
