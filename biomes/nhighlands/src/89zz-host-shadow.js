// ================================================================= HOST - the sun's shadows (core/shadow, KSHADOW; the final rebuild, pair 7, 2026-11-03)
// BACKPORT.md's universal set: "KSHADOW: measure its cost and skip it where it is unaffordable" (the owner, 2026-11-03). One 4096 box that follows the
// view (90-600 m by the eye's height); the flora, the tower, the pillars and the ground cast and receive; the far field, the water, the impostors and
// every shader material draw their own light (KSHADOW.cast skips them). After the build (88), the atmosphere's binding (89a: the rain cover and the wet
// ground are already on the ground's material) and the water (89w), so the count below sees every layer the ground reads.
// In three r128 the shadow map's sampler is declared in EVERY lit material once the renderer's shadow map is on, so a ground that already reads all of
// the GPU's texture units cannot take it (the Throne's isle and vents): window._shadow says what was decided and why.
// ?shadow=0 none of it (its cost: KNOWN_ISSUES.md, "The sun's shadows"); a station that sets STATION_SHADOW=false keeps its plain light.
window._shadow=null;
const SHADOW=(function(){const Q=new URLSearchParams(location.search);
 if(typeof KSHADOW==='undefined'||!KSHADOW.attach||typeof sun==='undefined'||!sun||!sun.isDirectionalLight||Q.get('shadow')==='0'||(typeof STATION_SHADOW!=='undefined'&&STATION_SHADOW===false)){window._shadow='off';return null;}
 /* a dry run of a material's onBeforeCompile on its ShaderLib text: the samplers its fragment shader declares (the Throne's samplersOf) */
 const samplersOf=m=>KSHADOW.units(m,renderer,scene);   /* core/shadow (2026-11-09): read samplers only, the scene's environment, the 3D forms */
 const GM=[GROUND&&GROUND.material].concat(typeof STATION_GROUNDS!=='undefined'?STATION_GROUNDS:[]).filter(Boolean);
 const MAXT=KSHADOW.maxUnits(renderer),worst=GM.length?Math.max(...GM.map(samplersOf)):0;
 if(worst+1>MAXT){window._shadow='skipped: the ground reads '+worst+' of '+MAXT+' texture units';return null;}
 try{const S=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  scene.children.forEach(c=>{if(c.userData&&c.userData.farField)return;if(c.isMesh&&GM.indexOf(c.material)>=0){S.cast(c,{cast:false});return;}S.cast(c);});
  if(typeof FAR!=='undefined'&&FAR&&FAR.mesh)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;
  window._shadow={grounds:GM.length,worst:worst+1,of:MAXT};return S;}catch(e){reportErr('shadow: '+e.stack);return null;}})();
