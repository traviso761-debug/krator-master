// ================================================================= HOST — the universal set, after the bake and the sea (the final rebuild, pair 8, 2026-11-03)
// BACKPORT.md section 1 in the order the modules' "Adopting it" lines give; the Throne's 89zz (its isle has the same sixteen-unit ground) with this page's
// names. Each reads what the page has and does nothing where there is nothing to do:
//   the cards                BIO.setA2C (R7: alpha to coverage); the wind is bound in 89a (R8)
//   the far trees            BIO.impostorLook and BIO.bakeImpostors: the borrowed kits' octahedral impostors (the Throne's, swbay's, eastabyss', sedesert's,
//                            the Rift's, nwlowlands'), on now that 34-core-impostor.js is on the page; this kit's own far canopy keeps its icosahedra (55)
//   the air                  height fog (ATMOS_AIR, 89a), the rain's occlusion map
//   the sun's shadows        KSHADOW, where the ground keeps a texture unit for its map
//   the horizon              KHORIZON over the island: the mountain's shadow on the lee at a low sun, on the ground where it keeps two units, and the flora
// ?hfog=0 the plain fog; ?shadow=0 no shadows; ?hz=0 no horizon; ?impgain= ?impwrap= the impostors' light.
const CORE_Q=new URLSearchParams(location.search);
const IMP_GAIN=2.2;   /* the impostors' gain: the Throne's (most of the borrowed far trees are its), set against the near crowns on 'The island from above' */
(function(){
 BIO.setA2C(renderer);
 if(CORE_Q.has('nobake'))return;
 if(BIO.impostorLook)BIO.impostorLook({gain:+(CORE_Q.get('impgain')||IMP_GAIN),wrap:(CORE_Q.has('impwrap')?+CORE_Q.get('impwrap'):1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
})();
if(typeof ATMOS!=='undefined'&&ATMOS.heightFog&&!ATMOS.fog&&CORE_Q.get('hfog')!=='0'){
 try{ATMOS.heightFog(ATMOS_AIR);if(typeof STATION!=='undefined'&&STATION.belt&&ATMOS.fogBelt)window._belt=ATMOS.fogBelt(STATION.belt());   /* a station's fog belt (the high isle's cloud on the crest) */
  ATMOS.heightFogScene(scene);}catch(e){reportErr('height fog: '+e.stack);}}
const GROUND_MATS_ALL=[MAT_GROUND];
// a material's texture units, counted from a dry run of its onBeforeCompile on its ShaderLib (the Throne's samplersOf), +1 for the sun's shadow map once on
const LIBOF={MeshLambertMaterial:'lambert',MeshStandardMaterial:'standard',MeshPhysicalMaterial:'physical',MeshPhongMaterial:'phong',MeshBasicMaterial:'basic',MeshToonMaterial:'toon'};
let SHADOW_ON=false;
// +1 for the fog belt's field (a station's fog belt: core/atmos's height fog adds its sampler to every fogged material at compile, which a dry run of
// the material's own hook cannot see)
const samplersOf=m=>{try{const L=THREE.ShaderLib[LIBOF[m.type]],sh=L?{uniforms:{},vertexShader:L.vertexShader,fragmentShader:L.fragmentShader}:{uniforms:{},vertexShader:m.vertexShader||'',fragmentShader:m.fragmentShader||''};
  const f0=typeof KHOOK!=='undefined'?KHOOK.failures.length:0;
  try{if(m.onBeforeCompile)m.onBeforeCompile(sh,renderer);}finally{if(typeof KHOOK!=='undefined')KHOOK.failures.length=f0;}let n=(m.map?1:0)+(m.emissiveMap?1:0)+(m.alphaMap?1:0)+(m.lightMap?1:0)+(m.aoMap?1:0);
  sh.fragmentShader.replace(/uniform\s+sampler(?:2D|Cube)\s+([^;]+);/g,(a,b)=>{n+=b.split(',').length;return a;});return n+(SHADOW_ON&&!(m.isShaderMaterial)?1:0)+(typeof ATMOS!=='undefined'&&ATMOS.fogBeltOn&&m.fog!==false?1:0);}catch(e){return 99;}};
const MAXT=renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures;
window._units={ground:samplersOf(MAT_GROUND),max:MAXT};
// THE SUN'S SHADOWS (core/shadow, KSHADOW): one box that follows the view, every placed mesh casting and receiving. r128 declares the shadow map's sampler
// in every lit material once the renderer's shadow map is on, so the ground must keep a unit for it; decided before the rain cover and the horizon
window._shadow=null;
const SHADOW=(function(){if(typeof KSHADOW==='undefined'||!sun||!sun.isDirectionalLight||CORE_Q.get('shadow')==='0'||CORE_Q.has('nobake')){window._shadow='off';return null;}
 const worst=Math.max(0,...GROUND_MATS_ALL.map(samplersOf));
 if(worst+1>MAXT){window._shadow='skipped: the ground reads '+worst+' of '+MAXT+' texture units';return null;}
 try{const S=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});GROUND_MATS_ALL.forEach(m=>{m.userData.twShadow=true;});
  scene.traverse(o=>{if(o.isMesh&&GROUND_MATS_ALL.indexOf(o.material)>=0)o.receiveShadow=true;});
  scene.children.forEach(c=>{if(!(c.userData&&c.userData.farField)&&!(c.isMesh&&GROUND_MATS_ALL.indexOf(c.material)>=0)&&c!==SEA_DRAW.mesh)S.cast(c);});
  SHADOW_ON=true;window._shadow={grounds:GROUND_MATS_ALL.length,worst:worst+1};return S;}catch(e){reportErr('shadow: '+e.stack);return null;}})();
// the rain's occlusion map (no rain under the crowns) adds a unit to every lit material: a ground at the limit keeps the rain everywhere, as before
window._rainCover=null;
if(typeof ATMOS!=='undefined'&&ATMOS.rainCover&&!ATMOS.raincover){const full=GROUND_MATS_ALL.filter(m=>samplersOf(m)+1>MAXT);
 if(full.length)window._rainCover='skipped: the ground reads '+Math.max(...full.map(samplersOf))+' of '+MAXT+' texture units';
 else{try{ATMOS.rainCover({renderer});window._rainCover='on';}catch(e){reportErr('rain cover: '+e.stack);}}}
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the map (256 a side, ~17 m); the ground where it keeps two units, then the flora
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||CORE_Q.get('hz')==='0'||CORE_Q.has('nobake'))return null;
 try{const t0=performance.now(),H=KHORIZON.bake({box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],n:256,h:terrainH}),skip=[];
  window._horizon={ms:Math.round(performance.now()-t0),n:H.n};GROUND_MATS_ALL.forEach(m=>{if(samplersOf(m)+2<=MAXT)KHORIZON.shade(m,H);else skip.push(m.name||'the ground');});
  window._horizon.mats=KHORIZON.shadeScene(scene,H,{filter:o=>!o.userData.farField&&(Array.isArray(o.material)?o.material:[o.material]).every(m=>m&&GROUND_MATS_ALL.indexOf(m)<0&&samplersOf(m)+2<=MAXT)});
  window._horizon.skipped=skip;return H;}
 catch(e){reportErr('horizon: '+e.stack);return null;}})();
